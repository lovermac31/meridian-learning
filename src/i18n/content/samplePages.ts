// Full sample page sets for the view-only sample viewer on /products (Jay, 27 Oct 2026: no PDF download, no print).
// Each stem has public/samples/pages/<stem>-pg01.webp … -pgNN.webp: watermarked 1200×1699 page images from factory B
// (Sale Team/sellable-products-pdf/<id>/samples/pages/pages.json). A stem not listed here shows its three card
// thumbnails in the viewer until its page set lands. A test keeps this list and the files in sync.
export const SAMPLE_PAGE_COUNTS: Record<string, number> = {
  'baseline': 8,
  'centre-licence': 19,
  'curriculum-overview': 11,
  'holiday-challenge': 11,
  'ielts-cue-card-bank': 11,
  'ielts-essay-bank-task2': 10,
  'ielts-one-to-one-starter': 8,
  'ielts-speaking-ladder': 10,
  'ielts-writing-ladder-task2': 9,
  'ielts-writing-task1-method': 9,
  'ielts-writing-teacher-pack': 10,
  'one-to-one': 7,
  'parent-pack-l1': 10,
  'parent-pack-l2': 10,
  'parent-pack-l3': 10,
  'pilot-class-kit': 11,
  'printable-pack-l1': 16,
  'reasoning-assessment-kit': 10,
  'story-club': 8,
  'student-workbook-l1': 10,
  'student-workbook-l2': 10,
  'student-workbook-l3': 10,
  'student-workbook-l4': 10,
  'student-workbook-l5': 10,
  'teacher-bundle': 16,
  'teacher-pack-l1': 12,
  'teacher-pack-l2': 11,
  'teacher-pack-l3': 11,
  'teacher-pack-l4': 11,
  'teacher-pack-l5': 11,
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
};
