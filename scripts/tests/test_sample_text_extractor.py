"""Local authoring guard regression; deliberately does not require approved/private PDFs."""
import copy, hashlib, importlib.util, json, pathlib, tempfile, unittest, sys
sys.dont_write_bytecode = True
from unittest.mock import Mock, patch
spec = importlib.util.spec_from_file_location('extractor', pathlib.Path(__file__).parents[1] / 'extract-sample-text.py')
extractor = importlib.util.module_from_spec(spec); spec.loader.exec_module(extractor)
class SourceBoundaries(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(); self.addCleanup(self.temp.cleanup)
        self.root = pathlib.Path(self.temp.name); self.public = self.root / 'public'; self.public.mkdir()
        self.sample = self.root / 'approved/story-club/samples'; (self.sample / 'pages').mkdir(parents=True)
        (self.sample / 'story-club-sample.pdf').write_bytes(b'approved sample fixture')
        (self.sample / 'Story Club Licensed edition.pdf').write_bytes(b'PRIVATE FULL EDITION MUST NEVER BE READ')
        image = b'public image fixture'; (self.public / 'story-club-pg01.webp').write_bytes(image); (self.sample / 'pages/story-club-pg01.webp').write_bytes(image)
        self.manifest = {'id':'story-club','source':'story-club-sample.pdf','pageCount':1,'pages':[{'file':'story-club-pg01.webp','bytes':len(image)}]}
        self.config = [{'id':'story-club','stem':'story-club','count':1}]
        keys = [('centre-licence', n) for n in range(14,19)] + [('printable-pack-l1', n) for n in [5,6,7,8,9,10,11,13,15]]
        self.ocr = {'version':1,'pages':[{'stem':stem,'page':n,'imageSha256':'0'*64,'text':'reviewed public fixture','reviewed':True} for stem,n in keys]}
    def run_extract(self, manifest=None, reader=None):
        (self.sample / 'pages/pages.json').write_text(json.dumps(manifest or self.manifest))
        reader = reader or Mock(return_value=Mock(pages=[Mock(extract_text=lambda:'only approved public page text, explicitly bounded to the one published sample page and no private edition material')]))
        with patch.object(extractor, 'PdfReader', reader):
            return extractor.extract(self.root / 'approved', self.public, self.config, self.ocr)
    def test_only_named_sample_is_read(self):
        reader = Mock(return_value=Mock(pages=[Mock(extract_text=lambda:'only approved public page text, explicitly bounded to the one published sample page and no private edition material')]))
        result = self.run_extract(reader=reader)
        self.assertEqual(reader.call_args.args[0], self.sample / 'story-club-sample.pdf')
        self.assertEqual(result[0]['pages'][0]['text'], 'only approved public page text, explicitly bounded to the one published sample page and no private edition material')
        self.assertNotIn('PRIVATE', json.dumps(result))
    def test_full_edition_or_traversal_source_refused_before_read(self):
        for source in ['Story Club Licensed edition.pdf', '../story-club-sample.pdf']:
            manifest = copy.deepcopy(self.manifest); manifest['source'] = source; reader = Mock()
            with self.assertRaisesRegex(ValueError, 'manifest'): self.run_extract(manifest, reader)
            reader.assert_not_called()
    def test_ancestor_symlink_outside_approved_root_refused(self):
        import shutil
        target = self.root / 'outside'; shutil.move(str(self.sample.parent), str(target))
        self.sample.parent.symlink_to(target, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, 'escapes approved source root'): self.run_extract()
    def test_extra_pages_or_wrong_order_refused(self):
        manifest = copy.deepcopy(self.manifest); manifest['pages'].append({'file':'story-club-pg02.webp','bytes':1})
        with self.assertRaisesRegex(ValueError, 'manifest'): self.run_extract(manifest)
    def test_image_content_mismatch_refused(self):
        (self.public / 'story-club-pg01.webp').write_bytes(b'different public version')
        with self.assertRaisesRegex(ValueError, 'differs from approved export'): self.run_extract()
    def test_footer_only_unreviewed_page_refused(self):
        reader = Mock(return_value=Mock(pages=[Mock(extract_text=lambda:'SAMPLE · jurassicenglish.com')]))
        with self.assertRaisesRegex(ValueError, 'no meaningful text layer'): self.run_extract(reader=reader)
    def test_ocr_outside_approved_public_pages_refused(self):
        self.ocr['pages'][0]['page'] = 999
        with self.assertRaisesRegex(ValueError, 'Invalid reviewed OCR'): self.run_extract()
if __name__ == '__main__': unittest.main()
