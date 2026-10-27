// Full sample page sets for the view-only sample viewer on /products (Jay, 27 Oct 2026: no PDF download, no print).
// Each stem has public/samples/pages/<stem>-pg01.webp … -pgNN.webp: watermarked 1200×1699 page images from factory B
// (Sale Team/sellable-products-pdf/<id>/samples/pages/pages.json). A stem not listed here shows its three card
// thumbnails in the viewer until its page set lands. A test keeps this list and the files in sync.
export const SAMPLE_PAGE_COUNTS: Record<string, number> = {
  'baseline': 8,
  'centre-licence': 16,
  'curriculum-overview': 11,
  'ielts-speaking-ladder': 10,
  'one-to-one': 7,
  'parent-pack-l1': 10,
  'parent-pack-l2': 10,
  'pilot-class-kit': 11,
  'printable-pack-l1': 16,
  'reasoning-assessment-kit': 10,
  'story-club': 8,
  'student-workbook-l1': 10,
  'teacher-bundle': 16,
  'teacher-pack-l1': 12,
  'teacher-pack-l2': 11,
  'teacher-pack-l3': 11,
  'teacher-pack-l4': 11,
  'teacher-pack-l5': 11,
  'teacher-training-course': 9,
  'thinking-cycle-set': 10,
};

export const SAMPLE_PAGE_WIDTH = 1200;
export const SAMPLE_PAGE_HEIGHT = 1699;
