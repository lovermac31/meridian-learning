# One Change: transparent brand integration

Scope: challenge header, seven published marketing images, local portable HTML and email template. No payment, database, or Speaking application changes.

The original transparent emblem is reused, not regenerated. The HTML embeds the existing 192×187 WebP directly (approximately 13 KB) and displays it at 96×94 desktop / 76×74 mobile. No extra logo request is needed. The downloaded canvas card keeps the same proportions, without a white plaque. The seven static images use the existing PNG equivalent because the SVG renderer does not render embedded WebP reliably.

These are transparent raster assets. No bitmap-in-SVG wrapper is represented as genuine vector artwork. Obtain the original SVG/AI/EPS source for unlimited-resolution vector reproduction.

Verification: 172 automated tests including 18 exercise paths; TypeScript lint; production build and post-build prerender validation; visual desktop/mobile and download smoke checks. An initial validation run before the build completed reported missing output; rerun after build. PNG previews were visually inspected after correcting the renderer incompatibility.

Safety: preserve accessible name and homepage link, fixed dimensions, keyboard focus, EN/VI, private answers staying in memory, existing analytics opt-out, download timeout and fallback. No new external dependencies or trackers.

Rollback: revert this brand integration commit through a reviewed PR and redeploy the previous production release. Do not reset unrelated user work.
