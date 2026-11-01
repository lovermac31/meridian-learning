// Regenerates public/images/zalo-qr.svg, the QR shown in the floating Zalo card (src/components/ZaloFloat.tsx).
// Build-time asset: the browser ships no QR library and no third-party script. Run `npm run qr:zalo` after
// changing ZALO_QR_TARGET in src/lib/zaloFloat.ts, then commit the SVG.
import { writeFile } from 'node:fs/promises';
import QRCode from 'qrcode';

const target = 'https://zalo.me/0396085076';
const svg = await QRCode.toString(target, { type: 'svg', errorCorrectionLevel: 'M', margin: 2, color: { dark: '#1c2526', light: '#ffffff' } });
// qrcode emits a viewBox only; explicit width/height keep the image's intrinsic size stable for the <img> element.
const sized = svg.replace('<svg ', '<svg width="320" height="320" role="img" aria-label="Zalo QR code" ');
await writeFile(new URL('../public/images/zalo-qr.svg', import.meta.url), sized);
console.log(`[zalo-qr] wrote public/images/zalo-qr.svg for ${target}`);
