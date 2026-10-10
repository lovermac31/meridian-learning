# One Change: customer-acquisition pilot

Owner: Mr. Jay / Jurassic English. Implemented 10 October 2026.

## Commercial decision

Host the free sample on Jurassic English; use social and consented email to distribute an interesting question and bring learners to the sample. The sample demonstrates a small part of the teaching approach. It is not a free personalised assessment, a listening product or an IELTS score predictor.

Audience: adults 18+, initially English/Vietnamese learners. Search intent hypothesis: learners looking for IELTS Speaking practice and help developing vague answers. Search demand and keyword volumes are unknown; do not treat this as a validated keyword opportunity.

Journey: homepage/resource invitation → example → evidence → independent written practice → self-check → existing paid lesson options or Zalo conversation. No email gate. No fabricated results, scarcity, qualification badges, offers or discounts.

## Implemented release

- Static page: /challenges/one-change, plus validated case/lang query state.
- Homepage invitation, invitations on existing Speaking articles, footer link.
- Indexable canonical HTML, default example and no-JavaScript teaching fallback.
- Sitemap entry; 1200 × 630 PNG social preview; six 1080 × 1350 EN/VI question cards.
- Existing lesson flow: /ai-speaking/solutions. Zalo: 0396085076.
- Attribution source allowlist: facebook, linkedin, email, homepage, insights, learner_share; unrecognised values become direct.
- Share URLs intentionally use learner_share; inbound attribution remains in memory before URL cleanup.
- No changes to the separate AI Speaking application, its frozen release, voice features, payments, lesson pricing, databases or account permissions.

## Measurement: distinguish instrumentation from evidence

Custom events are sent through existing Vercel Web Analytics when available. The observer also emits a DOM CustomEvent named je:challenge-event; adding debug=1 logs a structured, privacy-safe event to the browser console. Events are deduplicated per case/language during a page visit. DNT and Global Privacy Control disable analytics transmission.

Events: one_change_challenge_start, one_change_reasoning_view, one_change_practice_self_check_open, one_change_lesson_cta_click, one_change_zalo_cta_click, one_change_share_caption_click, one_change_share_link_click, one_change_social_card_export_attempt, one_change_social_card_download.

Payload: case_id, language, source, version only. No learner text, name, email or phone. No persistent identifiers or user-answer storage added.

Vercel custom-event reporting requires an existing Pro or Enterprise plan: https://vercel.com/docs/analytics/custom-events. Account entitlement and durable event receipt must be verified in the dashboard. Installing these hooks is NOT proof that the dashboard collects them. No upgrade or paid purchase is authorised by this package.

Self-check opening is engagement, not assessed learning. A Zalo click is not an enquiry. A lesson CTA click is not a sale. The sample does not currently implement automatic booking/revenue reconciliation with the separate lesson application.

Use the existing CRM/booking records for qualified enquiries, paid bookings, refunds and revenue. Ask new enquiries “How did you find us?” and record ONE CHANGE when volunteered. This manual bridge is necessary until an approved cross-application attribution implementation is verified.

## 14-day execution sequence

Day 0: verify public page, mobile layout, actual PNG download, language switching, lesson navigation and analytics receipt. Update any old local-file links and email URL tokens.

Days 1–3: publish the first Vietnamese question card on an owned social account and, where promotion is explicitly permitted, one relevant IELTS community. Publish an English version on an owned LinkedIn account. Use a different source-tagged URL for each channel. Do not mass post duplicate promotional content or send unsolicited bulk email.

Days 4–7: publish a short Mr. Jay explanation video, demonstrating why a concrete detail develops a reason. End with the free practice link. Only use a real recorded/approved Mr. Jay video; no fabricated likeness or learner testimonial.

Days 8–10: distribute the second exercise: show a learning difficulty and the change caused by practice. Reply to genuine comments with useful teaching. Do not represent replies or posts as completed unless publication is confirmed.

Days 11–14: review traffic, starts, self-check opens, qualified enquiries and paid bookings by channel. Compare with existing resource pages. Keep channels that create qualified interest at an acceptable cost; adjust the offer where engagement does not become enquiries.

External publications are operational actions requiring logged-in account access and compliance with group rules. This document is not evidence that a post or email was sent.

## Profitability worksheet

For each channel record: unique visitors (analytics definition), challenge starts, self-check opens, lesson clicks, Zalo clicks, qualified enquiries, paid new customers, collected revenue, refunds, teacher delivery cost, payment fees, marketing hours, internal hourly marketing cost and other campaign costs.

Qualified enquiry: a genuine learner discussing lesson fit, availability or price—not a comment, like, bot or generic contact.

Acquisition cost = (marketing hours × internal hourly cost + channel spend + allocated campaign production cost) / paid new customers. If paid customers = 0, CAC is undefined, not zero.

Contribution after acquisition = collected revenue − refunds − delivery costs − payment fees − campaign costs. This is not company net profit: tax, fixed overhead and other operating costs may still apply.

No prices, margins, booking results or break-even rate have been invented. Set a maximum acceptable CAC from actual contribution per customer before buying ads. Do not purchase ads or services under this pilot.

Decision rules are directional, not statistical proof: little traffic → fix distribution; starts without self-check → simplify the experience; completion without enquiries → inspect lesson relevance/CTA; enquiries without bookings → inspect price, availability and sales follow-up. Avoid changing everything at once. Review a small pilot rather than declaring success from a handful of clicks.

## Launch captions

### Facebook — Vietnamese, exercise 1

Bạn luyện IELTS Speaking nhưng chưa biết nên cải thiện điều gì trước?

“I like my neighbourhood because it is good. There are many things and I like it very much.”

Bạn sẽ chọn thay đổi nào?
A. Dùng một tính từ ấn tượng hơn.
B. Nêu một đặc điểm cụ thể và giải thích vì sao nó có ý nghĩa.
C. Nhắc lại ý kiến để câu trả lời dài hơn.

Thử một bài luyện tập miễn phí cùng Mr. Jay: chọn ưu tiên, xem lý do, rồi áp dụng vào chủ đề mới bằng lời của bạn. Không cần tài khoản.

https://jurassicenglish.com/challenges/one-change?case=specific-reason&lang=vi&utm_source=facebook&utm_medium=social&utm_campaign=one_change_pilot

Đây là bài luyện tập minh họa, không phải chấm điểm IELTS.
#IELTSSpeaking #HocTiengAnh #JurassicEnglish

Image: /challenges/one-change/specific-reason-vi.png

### LinkedIn — English, exercise 1

“Use better vocabulary” is not always the most useful first piece of feedback.

Consider: “I like my neighbourhood because it is good.”

Would you replace “good”—or help the learner explain one concrete feature and why it matters?

Our free One Change Challenge lets you choose a coaching priority, inspect the reasoning and apply it independently to another topic. It is a small sample of Jurassic English's practice approach, not a personalised assessment or an IELTS score.

Try it:
https://jurassicenglish.com/challenges/one-change?case=specific-reason&lang=en&utm_source=linkedin&utm_medium=social&utm_campaign=one_change_pilot

#IELTSSpeaking #EnglishLearning #JurassicEnglish

Image: /challenges/one-change/specific-reason-en.png

### Consented email

Subject: One answer. What would you improve first?

If you practise Speaking but struggle to choose a useful next step, try this free example challenge. Choose one change, inspect the evidence, then practise on a fresh topic in your own words.

https://jurassicenglish.com/challenges/one-change?lang=en&utm_source=email&utm_medium=email&utm_campaign=one_change_pilot

Want help applying that approach to your own spoken answer? The exercise links to current lesson options with Mr. Jay & the teaching team.

Add your existing sender identity, mailing address and unsubscribe mechanism before sending through your normal consented-list provider. No new mailing list or automated email collection is implemented.

## Verification, limitations and rollback

Run npm run lint; npm test; npm run build; npm run validate:prerender.

Regression tests cover 18 challenge/language/choice paths, input allowlists, attribution, share privacy, CTA reveal/reset, deduplication, privacy signals and analytics failure.

Remaining evidence: actual traffic, event dashboard receipt, qualified enquiries and paid customer contribution. Do not claim guaranteed traffic, unique invention or profitability.

Rollback: revert this feature's merged commit through a new Git revert PR and redeploy. Do not reset other work. Remove public links with the page so visitors do not encounter a dead campaign route. No data migration is required.

Sources: Google people-first content guidance https://developers.google.com/search/docs/fundamentals/creating-helpful-content ; Vercel custom events https://vercel.com/docs/analytics/custom-events. Recommendations are proposals; actual acquisition outcomes are unknown.
