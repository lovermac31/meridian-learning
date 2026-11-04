## Story Club: lead with the free try-it, summary before payment, and no auto-prepared payment

Decided by Jay on 4 Nov 2026 (final): Sat 7 Nov 9:00 Hanoi is a FREE 30-minute Story Time for new families (Google Meet, at most 6 children, parent beside the child, not recorded, link sent to registered parents at 8:00). Register by Zalo message before Fri 6 Nov 20:00. Fewer than 2 children: the try-it moves to Sat 14 Nov. The paid round is 4 weeks at 590.000 VND from Sat 14 Nov; parents decide after trying. Full refund on request before the first paid session (within 24 hours of paying); a session cancelled by Mr. Jay is made up or 147.500 VND is returned. Cap 6. No promised scores or results.

### What changed

**`/story-club` and `/vi/story-club`**
- The hero now leads with the free try-it and a primary Zalo registration button (existing `/go/zalo` mechanism, new `utm_content=try-it-register`, no hard-coded number). The paid-round button stays in the hero as a white-outline secondary action (white on dark green), so the money path is still one tap away.
- New try-it card (when, how long, where, who, rules, register, what happens if fewer than 2 register), then the paid-round card (590.000 VND for 4 weeks, starts Sat 14 Nov, "you decide after the free try-it"), then a refund card. FAQ gains three answers (free first session, fewer than 2 children, refund). "Try a free story first" is now "Or read a free story at home first" so it is not confused with the live Story Time.

**`/story-club/reserve` (EN) and `/story-club/reserve` with lang vi (VI)**; `/vi/story-club/reserve` was not created
- New written summary section (what, when, who, rules, refund) placed above any payment instruction. A shorter refund reminder is repeated directly under the "Pay now" heading.
- The page no longer scrolls itself down to the payment section for Story Club (that jump skipped the summary).
- **PAYMENT-PATH CHANGE FOR JAY'S REVIEW (master's addition):** the page used to POST `/api/sample-pack` with `intent: prepare_payment` about 2 s after load with no user action. For Story Club it now does this only after a click on "Get my payment code" (VI: "Lấy mã thanh toán của tôi"), a button that sits after the summary and before "Pay now". Request payload, endpoint, amount (590000) and memo format (`SC-XXXXXX`) are unchanged; `PayStep`, the status polling, the contact form and the webhook are untouched. Other products' checkouts (`?checkout=1`) still prepare automatically after 2 s; this PR does not change them.

New shared files: `src/i18n/content/storyClubTryIt.ts` (facts, EN and VI, dates in one place), `src/components/StoryClubSummary.tsx`.
Unchanged: header, payment amounts, memo format, endpoints, webhook code, route metadata (titles and descriptions), GA4 events `reserve_click`, `zalo_click`, `buy_click` (still driven by link hrefs in `src/lib/conversionEvents.ts`).

### Evidence (all run locally in `meridian-storyclub-tryit`, branch `feat/story-club-tryit`)

| Check | Result |
|---|---|
| `npm run lint` (`tsc --noEmit`) | exit 0 (`evidence/lint.txt`) |
| `npm test` (full node test suite) | 650 pass, 0 fail, 0 skipped (`evidence/test-full-summary.txt`); baseline on main before the change was 643 pass |
| `npm run build` (production, incl. prerender, sitemap) | exit 0 (`evidence/build-tail.txt`) |
| Test: summary precedes "Pay now", EN and VI, amount stays 590000 | `tests/story-club-tryit.test.ts` (server render, payment-ready state): summary index < Pay now heading < payment instructions < pay step < QR < memo; `data-payment-amount` = 590,000₫ / 590.000₫; QR URL `amount=590000`, `des=SC-AB12CD`; `STORY_CLUB_PRICE_VND` and `paidOffer('story-club').amount` = 590000 |
| Browser test: no request on load, request only after the click, EN and VI at 375 and 1440 | `tests/browser/story-club-reserve.spec.ts`: after waiting 3.5 s (past the old 2 s timer) the only non-GET is the existing `POST /api/event` analytics beacon; no `/api/sample-pack` call and no payment section. After the click, exactly one `POST /api/sample-pack` with `intent: prepare_payment`, `product: story-club`; summary is above "Pay now"; amount 590000; axe color-contrast, label, link-name, button-name clean. 3/3 pass (`evidence/pw-reserve.txt`) |
| Other Playwright suites touching Story Club | story-club-status 2/2 (`pw-status.txt`); zalo-float 6/6; pay-everywhere 173 of 177 on the first full run. The 4 failures were non-Story products (story-workbooks-l5 vi 375, ielts-writing-task1-method vi 1440, story-workbooks-l2 en 375, teacher-pack-l2 en 1440) timing out at the 5 s QR wait while 4 workers ran, on the unchanged 2 s auto-prepare path; the same 4 pass on rerun (4/4, `pw-pay-rerun.txt`). I treat them as load flakes, not proven. |
| Screenshots | 375, 768, 1024, 1440 px x EN, VI x landing, reserve (after the click, plus before-click gate state): `evidence/*.jpg` (compressed; full-resolution PNGs kept in the run folder). `evidence/results.json`: 16/16 captures with no horizontal overflow, 0 axe violations (color-contrast, label, link-name, button-name, image-alt, select-name), summary before payment, no non-GET request before the click. I also looked at the 375 hero and reserve flow, the 768 reserve and the 1440 VI landing by eye: no overlap or clipped text. The analytics consent banner, the Zalo float and the sticky header appear over content in full-page captures; they are existing site chrome. |

All local runs used muted headless Chromium against a local preview. `/api/*` was mocked or aborted; nothing reached production and nothing was submitted.

### Risks and UNKNOWN items
- **Dates are time-bound** (7, 14 Nov; 6 Nov 20:00). After the first paid round starts, update `src/i18n/content/storyClubTryIt.ts` and `src/i18n/content/storyClub.ts` or remove the try-it blocks.
- **Refund wording** is taken literally from the decision: "full refund on request before the first paid session, within 24 hours of paying". I show it as one rule (request before the first paid session, within 24 hours of paying). Jay: confirm both conditions are meant to apply together.
- **`POST /api/event`**: the existing anonymous `reserve_view` analytics beacon still fires on load. It is not a payment call, so I left it; say if you want it deferred too.
- Other products' checkout pages still auto-prepare payments after 2 s (same bot/429 exposure). Not changed here.
- `/products/story-club` (product page and `products.ts` copy: "Saturdays 9:00", "Ask for a place"), the header Reserve CTA label ("Reserve Story Club · 590,000₫"), home and market pages were not edited. Route metadata descriptions were left alone on purpose (they would go stale).
- UNKNOWN: production GA4 receipt of the three events (verified only that the hrefs classify to them, in `tests/story-club-tryit.test.ts` and `tests/conversion-events.test.ts`); Firefox and WebKit not run; real-device Safari not run; the live Zalo registration flow not exercised (it is an external redirect).
- Not done by me: merge, ready-for-review, deploy.

### Vietnamese lines needing Jay's read (AI-written)
All Vietnamese is new and AI-written. Please read at least these, in `src/i18n/content/storyClubTryIt.ts` (`vi`), `src/i18n/content/storyClub.ts` (`vi`) and the `vi` copy block in `src/components/StoryClubReservePage.tsx`:
- Hero line: "Học thử miễn phí: thứ Bảy 7/11, 9:00 giờ Hà Nội · 30 phút · Google Meet · không bao giờ ghi âm, ghi hình"
- Try-it facts, esp. "Phụ huynh ngồi cạnh bé." and "Nếu có ít hơn 2 bé đăng ký, buổi học thử sẽ dời sang thứ Bảy 14/11."
- Paid round: "590.000₫ cho 4 buổi hằng tuần (147.500₫ mỗi buổi)." and "Chúng tôi không hứa trước điểm thi hay kết quả."
- Refund: "Hoàn tiền đầy đủ nếu bạn yêu cầu trước buổi học có phí đầu tiên, trong vòng 24 giờ kể từ khi thanh toán." and "Nếu thầy Jay hủy một buổi, buổi đó sẽ được học bù hoặc hoàn lại 147.500₫ cho buổi đó."
- Summary block: "Tóm tắt: vui lòng đọc trước khi thanh toán" and "Khi thanh toán, bạn đồng ý với các quy định và quy định hoàn tiền trong bản tóm tắt này."
- New payment gate: "Lấy mã thanh toán", "Lấy mã thanh toán của tôi", and "Bấm nút không bị trừ tiền, và trang này không bao giờ yêu cầu thông tin thẻ."
- The three new FAQ answers and the three rewritten "Cách đăng ký" steps on `/vi/story-club`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
