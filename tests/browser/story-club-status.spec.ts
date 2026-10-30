import { expect, test } from '@playwright/test';

for (const item of [
  { locale: 'en', path: '/en/story-club/reserve', pending: 'We’re checking your payment. This can take a moment.', received: 'Payment received. Please send your contact details below to confirm your place.' },
  { locale: 'vi', path: '/story-club/reserve', pending: 'Đang kiểm tra thanh toán. Vui lòng chờ trong giây lát.', received: 'Đã nhận thanh toán. Vui lòng gửi thông tin liên hệ bên dưới để xác nhận chỗ.' },
]) {
  test(`shows paid confirmation in ${item.locale} after mocked status polling`, async ({ page }) => {
    let statusRequests = 0;
    let paymentReceived = false;
    await page.route('https://qr.sepay.vn/**', route => route.abort());
    await page.addInitScript(() => {
      const originalSetInterval = window.setInterval.bind(window);
      window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
        originalSetInterval(handler, timeout === 20_000 ? 50 : timeout, ...args)) as typeof window.setInterval;
    });
    await page.route('**/api/event', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
    await page.route('**/api/sample-pack', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, submissionId: 'JE-SC-11111111-1111-4111-8111-111111111111', memo: 'SC-AB12CD' }) }));
    await page.route('**/api/story-club/status**', route => {
      expect(route.request().url()).toContain('memo=SC-AB12CD');
      statusRequests += 1;
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ paid: paymentReceived }) });
    });

    await page.goto(item.path);
    const reject = page.getByRole('button', { name: /reject analytics|từ chối phân tích/i });
    if (await reject.isVisible().catch(() => false)) await reject.click();
    const paymentStatus = page.locator('[data-payment-status]');
    await expect(paymentStatus).toHaveText(item.pending);
    await expect.poll(() => statusRequests, { timeout: 3_000, intervals: [50, 100, 250] }).toBeGreaterThan(0);
    paymentReceived = true;
    await expect.poll(() => statusRequests, { timeout: 3_000, intervals: [50, 100, 250] }).toBeGreaterThan(1);
    await expect(paymentStatus).toHaveText(item.received);
    await expect(page.locator('[data-reserve-form]')).toBeVisible();
  });
}
