import { expect, test } from '@playwright/test';

// P5c (15 Nov 2026): the Story Club pay step uses the shared status line (src/lib/payStatus.ts) and JE's
// /api/story-club/status?code= intent, which answers only {status: waiting|received}. The first check runs 5 s after the memo;
// the init script shortens the 5 s poll delay (only the first 2 min poll at 5 s; 15 s is also the fetch timeout, so it stays).
for (const item of [
  { locale: 'en', path: '/en/story-club/reserve', pending: 'Waiting for your transfer… This page updates by itself. Keep it open.', received: 'Payment received. Thank you! Next step: please send your contact details below to confirm your place.' },
  { locale: 'vi', path: '/story-club/reserve', pending: 'Đang chờ bạn chuyển khoản… Trang sẽ tự cập nhật, vui lòng giữ trang mở.', received: 'Đã nhận thanh toán. Cảm ơn bạn! Bước tiếp theo: vui lòng gửi thông tin liên hệ bên dưới để xác nhận chỗ.' },
]) {
  test(`shows paid confirmation in ${item.locale} after mocked status polling`, async ({ page }) => {
    let statusRequests = 0;
    let paymentReceived = false;
    await page.route('https://qr.sepay.vn/**', route => route.abort());
    await page.addInitScript(() => {
      const originalSetTimeout = window.setTimeout.bind(window);
      window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
        originalSetTimeout(handler, timeout === 5_000 ? 50 : timeout, ...args)) as typeof window.setTimeout;
    });
    await page.route('**/api/event', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
    await page.route('**/api/sample-pack', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, submissionId: 'JE-SC-11111111-1111-4111-8111-111111111111', memo: 'SC-AB12CD' }) }));
    await page.route('**/ai-speaking/**', route => route.abort()); // SC is never sent to the AI Speaking status endpoint
    await page.route('**/api/story-club/status**', route => {
      expect(route.request().url()).toContain('code=SC-AB12CD');
      expect(route.request().url()).not.toContain('memo=');
      statusRequests += 1;
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: paymentReceived ? 'received' : 'waiting' }) });
    });

    await page.goto(item.path);
    const reject = page.getByRole('button', { name: /reject analytics|từ chối phân tích/i });
    if (await reject.isVisible().catch(() => false)) await reject.click();
    await page.locator('[data-get-payment-code]').click(); // the payment is prepared only after this click
    const paymentStatus = page.locator('[data-pay-status]');
    await expect(paymentStatus).toHaveText(item.pending);
    await expect(paymentStatus).toHaveAttribute('aria-live', 'polite');
    await expect(page.locator('[data-payment-instructions] [aria-live="polite"]')).toHaveCount(1);
    await expect.poll(() => statusRequests, { timeout: 3_000, intervals: [50, 100, 250] }).toBeGreaterThan(0);
    paymentReceived = true;
    await expect.poll(() => statusRequests, { timeout: 3_000, intervals: [50, 100, 250] }).toBeGreaterThan(1);
    await expect(paymentStatus).toHaveText(item.received);
    await expect(page.locator('[data-reserve-form]')).toBeVisible();
    await expect(page.locator('[data-payment-instructions] [aria-live="polite"]')).toHaveCount(1);
  });
}
