import test from 'node:test';
import assert from 'node:assert/strict';
import { contactCopy } from '../src/components/GlobalContactPanel';

const isImage = (href: string) => /\.(jpe?g|png|webp|svg)$/i.test(href);

for (const [locale, copy] of Object.entries(contactCopy)) {
  test(`contact panel (${locale}): image actions are never labelled as opening an app`, () => {
    for (const [channel, detail] of Object.entries(copy.channels)) {
      for (const action of detail.actions as Array<{ label: string; href: string }>) {
        if (isImage(action.href)) {
          assert.doesNotMatch(action.label, /^(open|mở)\b/i, `${locale}/${channel}: "${action.label}" points at an image`);
          assert.doesNotMatch(action.label, /whatsapp|wechat/i, `${locale}/${channel}: "${action.label}" names an app but points at an image`);
        }
      }
    }
  });

  test(`contact panel (${locale}): app actions use platform destinations`, () => {
    const whatsapp = copy.channels.whatsapp.actions[0];
    assert.equal(whatsapp.href, 'https://wa.me/qr/GGEQLLXJBTWEK1');
    assert.ok(copy.channels.wechat.actions.every((action) => isImage(action.href)), 'WeChat offers QR image actions only');
    assert.match(copy.channels.zalo.actions[0].href, /^https:\/\/zalo\.me\//);
  });
}

test('contact panel: Vietnamese and English expose the same channels and action counts', () => {
  for (const channel of Object.keys(contactCopy.en.channels) as Array<keyof typeof contactCopy.en.channels>) {
    assert.equal(contactCopy.vi.channels[channel].actions.length, contactCopy.en.channels[channel].actions.length, channel);
  }
});
