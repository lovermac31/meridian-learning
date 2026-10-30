/** Generate a machine-readable catalogue from the website's product source. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCTS } from '../src/i18n/content/products.ts';
import { PRODUCT_SEO } from '../src/i18n/content/productSeo.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = 'https://jurassicenglish.com';
const products = PRODUCTS.filter((product) => product.live && PRODUCT_SEO[product.id]);
const lines = [
  '# Jurassic English product catalogue', '',
  '> Machine-readable index of live product pages. Names, descriptions, prices and availability are generated from the website source.', '',
  '## Purchase notes', '',
  '- Vietnam buyers: the page shows the VND price and VietQR/Zalo ordering instructions.',
  '- International buyers: products marked PayPal can be paid for in USD; digital files are delivered after payment is matched.',
  '- Services such as Baseline and one-to-one lessons use their own booking or enquiry route.',
  '- Jurassic English is independent and is not affiliated with IELTS, Cambridge University Press & Assessment, the British Council or IDP.', '',
  '## Products', '',
];
for (const product of products) {
  const seo = PRODUCT_SEO[product.id].en;
  const vi = PRODUCT_SEO[product.id].vi;
  lines.push(`### ${product.en.title}`);
  lines.push(`- ID: \`${product.id}\``);
  lines.push(`- English: ${site}/products/${product.id}`);
  lines.push(`- Vietnamese: ${site}/vi/products/${product.id}`);
  lines.push(`- English description: ${seo.description}`);
  lines.push(`- Vietnamese title: ${vi.title}`);
  lines.push(`- VND price: ${product.price.replace(/₫/g, ' VND')}`);
  lines.push(`- PayPal USD: ${product.paypal ? 'available on the product page' : 'not listed'}`);
  lines.push(`- Sample: ${product.sample ? 'view-only pages on the product page' : 'none listed'}`, '');
}
await fs.writeFile(path.join(root, 'public/llms-products.md'), `${lines.join('\n')}\n`, 'utf8');
