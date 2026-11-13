// Full sample page sets for the view-only sample viewer on /products (Jay, 27 Oct 2026: no PDF download, no print).
// Each stem has public/samples/pages/<stem>-pg01.webp … -pgNN.webp: watermarked 1200×1699 page images from factory B
// (Sale Team/sellable-products-pdf/<id>/samples/pages/pages.json). A stem not listed here shows its three card
// thumbnails in the viewer until its page set lands. A test keeps this list and the files in sync.
// The three IELTS bundles (12 Nov 2026) show byte-identical copies of pages from the packs they contain: Writing and Speaking
// Band-Up pages 1, 3 and 5 of each of their 3 packs, Four-Skill Kit pages 1 and 3 of each of its 7 packs, in the order the
// bundle's product text names the packs. No new images.
export const SAMPLE_PAGE_COUNTS: Record<string, number> = {
  'baseline': 8,
  'centre-licence': 19,
  'curriculum-overview': 11,
  'holiday-challenge': 11,
  'ielts-cue-card-bank': 11,
  'ielts-diagnostic-mock': 10,
  'ielts-essay-bank-task2': 10,
  'ielts-four-skill-kit': 14,
  'ielts-listening-profiler': 11,
  'ielts-one-to-one-starter': 8,
  'ielts-reading-ladder': 10,
  'ielts-speaking-band-up': 9,
  'ielts-speaking-ladder': 10,
  'ielts-writing-band-up': 9,
  'ielts-writing-ladder-task2': 9,
  'ielts-writing-task1-method': 9,
  'ielts-writing-teacher-pack': 10,
  'mango-l2': 3,
  'one-to-one': 7,
  'parent-pack-l1': 10,
  'parent-pack-l2': 10,
  'parent-pack-l3': 10,
  'pilot-class-kit': 11,
  'printable-pack-l1': 16,
  'reasoning-assessment-kit': 10,
  'story-club': 8,
  'story-workbooks-l1-v2': 6,
  'story-workbooks-l2-v2': 6,
  'story-workbooks-l3-v2': 6,
  'story-workbooks-l4-v2': 6,
  'story-workbooks-l5-v2': 6,
  'student-workbook-l1-v2': 6,
  'student-workbook-l2-v2': 6,
  'student-workbook-l3-v2': 6,
  'student-workbook-l4-v2': 6,
  'student-workbook-l5-v2': 6,
  'teacher-bundle-v2': 10,
  'teacher-pack-l1-v2': 7,
  'teacher-pack-l2-v2': 7,
  'teacher-pack-l3-v2': 7,
  'teacher-pack-l4-v2': 7,
  'teacher-pack-l5-v2': 7,
  'teacher-training-course': 9,
  'thinking-cycle-posters': 8,
  'thinking-cycle-set': 10,
  'word-fossil-flashcards-l1': 7,
  'writing-baseline': 7,
};

export const SAMPLE_PAGE_WIDTH = 1200;
export const SAMPLE_PAGE_HEIGHT = 1699;

// Only the seven approved replacement images need new browser cache keys.
export const SAMPLE_PAGE_REVISIONS: Record<string, string> = {
  'ielts-writing-teacher-pack-pg01.webp': 'a75be50f744a',
  'parent-pack-l2-pg01.webp': 'e22b3db246a4',
  'parent-pack-l2-pg02.webp': 'ef4fe1b90d5d',
  'parent-pack-l2-pg03.webp': '13716452c15d',
  'parent-pack-l2-pg04.webp': '5dccb5eadaca',
  'parent-pack-l2-pg09.webp': '9c0ecd3eefa6',
  'parent-pack-l2-pg10.webp': 'ab39bf2332a0',
  // 11 Nov 2026: Printable Pack v2 (new Lina art; v2.1 credit and licence footer on the picture pages).
  'printable-pack-l1-pg05.webp': 'ceb0cef254cc',
  'printable-pack-l1-pg06.webp': 'dd04eb50ecd7',
  'printable-pack-l1-pg07.webp': '8306bb3206f2',
  'printable-pack-l1-pg08.webp': '1f3bc8d78f23',
  'printable-pack-l1-pg09.webp': '66bebd032859',
  'printable-pack-l1-pg10.webp': '2c8cd0a623d4',
  'printable-pack-l1-pg11.webp': '87998a3a8bac',
  'printable-pack-l1-pg13.webp': 'f879d611626b',
  'printable-pack-l1-pg15.webp': '9bd9b2748885',
  // 12 Nov 2026: Story Club sample: outdated "Founding price for the first group" line removed (pages 3 and 8).
  'story-club-pg03.webp': '483de8090686',
  'story-club-pg08.webp': '0e43f0dd640f',
};
