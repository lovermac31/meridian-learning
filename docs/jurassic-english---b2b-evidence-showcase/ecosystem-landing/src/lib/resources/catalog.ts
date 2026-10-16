import type { Lang } from "./i18n";

// Public catalogue data for the resource store. Nothing in this file is paid
// content: titles, descriptions, contents lists and the free excerpt only.
// Full paid files are server-only (src/server/resources) and are reachable
// solely through the entitlement-checked file route.
//
// Level names and CEFR bands use the customer-facing terms already published
// on /student-academy. The Drive source folders use other names (see
// JE_RESOURCE_COPYRIGHT_AND_PUBLICATION_AUDIT.md §Terminology).
//
// Prices are pilot hypotheses from JE_RESOURCE_PRICING_AND_MARGIN_MODEL.md.
// None is an approved price.

export type ResourceKind = "free-sample" | "activity-pack" | "level-bundle";
export type Availability = "preview" | "in-review";

type L = Record<Lang, string>;
type LL = Record<Lang, string[]>;

export interface Product {
  slug: string;
  kind: ResourceKind;
  level: 1 | 2 | 3 | 4 | 5;
  levelName: L;
  cefr: string;
  ages: string;
  title: L;
  summary: L;
  contents: LL;
  outcomes: LL;
  prerequisites: L;
  format: L;
  priceVnd: number;
  availability: Availability;
  cover: string;
  coverAlt: L;
  sample?: { title: L; html: L };
  reviewNote?: L;
  keywords: string;
}

export const LEVEL_NAMES: Record<number, L> = {
  1: { en: "Level 1 · Foundation", vi: "Cấp độ 1 · Nền tảng" },
  2: { en: "Level 2 · Early Reasoner", vi: "Cấp độ 2 · Lập luận Sơ khởi" },
  3: { en: "Level 3 · Developing Analyst", vi: "Cấp độ 3 · Phân tích Đang phát triển" },
  4: { en: "Level 4 · Academic Builder", vi: "Cấp độ 4 · Xây dựng Học thuật" },
  5: { en: "Level 5 · Advanced Thinker", vi: "Cấp độ 5 · Tư duy Nâng cao" },
};

export const LEVEL_CEFR: Record<number, string> = {
  1: "Pre-A1 / A1",
  2: "A1 / A2",
  3: "A2 / B1",
  4: "B1 / B2",
  5: "B2 / C1",
};

export const LICENCE: L = {
  en: "Personal and family licence. One household or one learner may use and print the file for home study. You may not resell it, upload it, share it in groups or use it to teach paid classes. Schools and tutors need a separate teaching licence (not sold in this store).",
  vi: "Giấy phép cá nhân và gia đình. Một hộ gia đình hoặc một học viên được dùng và in tệp để học tại nhà. Không được bán lại, tải lên mạng, chia sẻ trong nhóm hoặc dùng để dạy lớp có thu phí. Trường học và gia sư cần giấy phép giảng dạy riêng (không bán ở cửa hàng này).",
};

export const FAQ: { q: L; a: L }[] = [
  {
    q: { en: "Which level should I choose?", vi: "Tôi nên chọn cấp độ nào?" },
    a: {
      en: "Read the free sample with your child. If the passage feels easy to read aloud but the “why” questions are hard, that level is a good fit. For a written recommendation, book a Student Thinking Diagnostic.",
      vi: "Hãy đọc bài mẫu miễn phí cùng con. Nếu con đọc to đoạn văn dễ dàng nhưng các câu hỏi “vì sao” còn khó, cấp độ đó là phù hợp. Để có khuyến nghị bằng văn bản, hãy đặt lịch Đánh giá Tư duy Học sinh.",
    },
  },
  {
    q: { en: "How fast do I get access?", vi: "Bao lâu thì tôi được truy cập?" },
    a: {
      en: "With VietQR bank transfer, access opens when the bank confirms the transfer, usually within a few minutes. If a transfer needs checking by hand (for example a missing reference), we reply within one business day.",
      vi: "Với chuyển khoản VietQR, quyền truy cập mở khi ngân hàng xác nhận, thường trong vài phút. Nếu cần kiểm tra thủ công (ví dụ thiếu mã đơn), chúng tôi trả lời trong một ngày làm việc.",
    },
  },
  {
    q: { en: "Can I get a refund?", vi: "Tôi có được hoàn tiền không?" },
    a: {
      en: "Yes, within 7 days if the file will not open or the pack is not what the product page described. Write to us with your order reference. A refund removes access to the pack.",
      vi: "Có, trong 7 ngày nếu tệp không mở được hoặc bộ tài liệu không đúng mô tả. Hãy viết cho chúng tôi kèm mã đơn. Khi hoàn tiền, quyền truy cập bộ tài liệu sẽ bị gỡ.",
    },
  },
  {
    q: { en: "Are answer keys included?", vi: "Có kèm đáp án không?" },
    a: {
      en: "Packs include a short parent guide with example answers for the practice questions. Open-ended thinking questions have no single right answer; the guide shows what a well-supported answer looks like.",
      vi: "Mỗi bộ có hướng dẫn ngắn cho phụ huynh với câu trả lời mẫu cho phần luyện tập. Câu hỏi tư duy mở không có một đáp án duy nhất; hướng dẫn cho thấy thế nào là một câu trả lời có lập luận tốt.",
    },
  },
  {
    q: { en: "Does this replace classes?", vi: "Tài liệu này có thay thế lớp học không?" },
    a: {
      en: "No. The packs are for practice at home. They do not include teacher feedback, placement or a certificate.",
      vi: "Không. Các bộ tài liệu dùng để luyện tập tại nhà. Không bao gồm nhận xét của giáo viên, xếp lớp hay chứng chỉ.",
    },
  },
];

// Ages follow the Level 1–5 Syllabus Pack (Drive D1). The Academy page says
// 6–14 overall; the difference is logged in the publication audit.
// The pilot (A, B, C) plus the next candidates, which are listed but not for
// sale. Pilot excerpts are synthetic preview text written for this build:
// no Drive source file is published here (see
// JE_RESOURCE_COPYRIGHT_AND_PUBLICATION_AUDIT.md for why each source is held).
const SYNTH_EN = '<p class="synthetic">Preview placeholder: synthetic text written for this preview, not final product content.</p>';
const SYNTH_VI = '<p class="synthetic">Nội dung giữ chỗ của bản xem trước: văn bản tổng hợp viết cho bản xem trước, không phải nội dung sản phẩm cuối cùng.</p>';

const lantern = {
  en: `${SYNTH_EN}
<blockquote><p><strong>The Lantern on the Bridge</strong></p><p>Every evening, Linh's grandfather hung a lantern on the old bridge so the fishing boats could find the river mouth. One night the wind was wild and the lantern kept blowing out. Linh could stay warm inside and finish her homework, or walk out in the rain to light it again. She took the matches and went.</p></blockquote>
<p><strong>Warm-up.</strong> Take three slow breaths. Read the story aloud twice and point to the word that tells you the weather.</p>
<h3>The four stages of the Jurassic Thinking Cycle</h3>
<ol>
<li><strong>Analyze.</strong> What does the story actually say? What two choices did Linh have?</li>
<li><strong>Evaluate.</strong> Which choice was harder? Why do you think so?</li>
<li><strong>Justify.</strong> Finish the sentence: “I think Linh chose well because the story says …”</li>
<li><strong>Reflect.</strong> When did you choose something hard to help someone?</li>
</ol>
<p><strong>Write it down.</strong> Write two sentences for your Growth Portfolio, then read them to a family member.</p>
<p>These are the same four stages your child uses in class: Analyze · Evaluate · Justify · Reflect.</p>`,
  vi: `${SYNTH_VI}
<blockquote><p><strong>Chiếc đèn trên cây cầu</strong></p><p>Mỗi tối, ông của Linh treo một chiếc đèn trên cây cầu cũ để thuyền đánh cá tìm được cửa sông. Một đêm gió rất to và đèn cứ bị tắt. Linh có thể ở trong nhà cho ấm và làm xong bài tập, hoặc đi ra ngoài mưa để thắp lại đèn. Em cầm hộp diêm và đi.</p></blockquote>
<p><strong>Khởi động.</strong> Hít thở chậm ba lần. Đọc to câu chuyện hai lần và chỉ vào từ cho biết thời tiết.</p>
<h3>Bốn bước của Chu trình Tư duy Jurassic</h3>
<ol>
<li><strong>Phân tích.</strong> Câu chuyện thực sự nói gì? Linh có hai lựa chọn nào?</li>
<li><strong>Đánh giá.</strong> Lựa chọn nào khó hơn? Vì sao em nghĩ vậy?</li>
<li><strong>Lập luận.</strong> Hoàn thành câu: “Em nghĩ Linh đã chọn đúng vì câu chuyện nói …”</li>
<li><strong>Suy ngẫm.</strong> Khi nào em đã chọn một việc khó để giúp ai đó?</li>
</ol>
<p><strong>Viết lại.</strong> Viết hai câu vào Hồ sơ Tiến bộ, rồi đọc cho người thân nghe.</p>
<p>Đây chính là bốn bước con bạn dùng trên lớp: Phân tích · Đánh giá · Lập luận · Suy ngẫm.</p>`,
};

const packExcerpt = {
  en: `${SYNTH_EN}
<h3>Activity 1 of 6: Find the clue</h3>
<blockquote><p>Minh found a small wet puppy under the market stall. It was shaking. He gave it half of his bánh mì and wrapped it in his scarf.</p></blockquote>
<p><strong>Claim:</strong> Minh is a caring boy.</p>
<p><strong>Evidence:</strong> Underline the two actions in the story that prove the claim.</p>
<p><strong>Say it:</strong> “Minh is caring because he …”</p>
<span class="write-line"></span><span class="write-line"></span>`,
  vi: `${SYNTH_VI}
<h3>Hoạt động 1/6: Tìm manh mối</h3>
<blockquote><p>Minh tìm thấy một chú chó con ướt sũng dưới quầy hàng ở chợ. Nó đang run. Em cho nó một nửa ổ bánh mì và quấn nó trong khăn của mình.</p></blockquote>
<p><strong>Nhận định:</strong> Minh là một cậu bé biết quan tâm.</p>
<p><strong>Bằng chứng:</strong> Gạch chân hai hành động trong truyện chứng minh nhận định này.</p>
<p><strong>Nói thành câu:</strong> “Minh biết quan tâm vì em …”</p>
<span class="write-line"></span><span class="write-line"></span>`,
};

const l2 = { levelName: LEVEL_NAMES[2], cefr: LEVEL_CEFR[2], ages: "7–9" };

function inReview(level: 1 | 3 | 4 | 5, slug: string, cover: string, title: L, summary: L, note: L, ages: string): Product {
  return {
    slug,
    kind: "activity-pack",
    level,
    levelName: LEVEL_NAMES[level],
    cefr: LEVEL_CEFR[level],
    ages,
    title,
    summary,
    contents: { en: ["Contents are being finalised."], vi: ["Nội dung đang được hoàn thiện."] },
    outcomes: { en: ["To be confirmed after editorial review."], vi: ["Sẽ xác nhận sau khi duyệt biên tập."] },
    prerequisites: { en: "To be confirmed.", vi: "Sẽ xác nhận." },
    format: { en: "Printable PDF (planned).", vi: "Tệp PDF để in (dự kiến)." },
    priceVnd: 0,
    availability: "in-review",
    cover,
    coverAlt: { en: `Storybook illustration for ${LEVEL_NAMES[level].en}`, vi: `Tranh minh hoạ cho ${LEVEL_NAMES[level].vi}` },
    reviewNote: note,
    keywords: "",
  };
}

export const PRODUCTS: Product[] = [
  {
    slug: "thinking-cycle-free-sample",
    kind: "free-sample",
    level: 2,
    ...l2,
    title: { en: "Free sample: one story through the Jurassic Thinking Cycle", vi: "Bài mẫu miễn phí: một câu chuyện qua Chu trình Tư duy Jurassic" },
    summary: {
      en: "A short original story with a warm-up, one prompt for each of the four stages (Analyze, Evaluate, Justify, Reflect) and two sentences to write. About 20 minutes with a parent.",
      vi: "Một truyện ngắn nguyên bản với phần khởi động, một câu hỏi cho mỗi bước trong bốn bước (Phân tích, Đánh giá, Lập luận, Suy ngẫm) và hai câu để viết. Khoảng 20 phút cùng phụ huynh.",
    },
    contents: {
      en: ["1 original story (about 70 words)", "4 thinking prompts, one per stage, plus a warm-up", "A sentence starter for the Justify step"],
      vi: ["1 truyện nguyên bản (khoảng 70 từ)", "4 câu hỏi tư duy, mỗi bước một câu, kèm phần khởi động", "Mẫu câu cho bước Lập luận"],
    },
    outcomes: {
      en: ["Name two choices a character faces", "Give a reason that points back to the story", "Write two complete sentences about a choice"],
      vi: ["Nêu hai lựa chọn của nhân vật", "Đưa ra lý do dựa vào câu chuyện", "Viết hai câu hoàn chỉnh về một lựa chọn"],
    },
    prerequisites: { en: "Reads short sentences aloud with some help.", vi: "Đọc to được câu ngắn khi có hỗ trợ." },
    format: { en: "Read on screen, free. No sign-up.", vi: "Đọc trên màn hình, miễn phí. Không cần đăng ký." },
    priceVnd: 0,
    availability: "preview",
    cover: "thinking-cycle-storybook-map",
    coverAlt: { en: "Storybook map illustration of the thinking cycle", vi: "Tranh minh hoạ bản đồ chu trình tư duy" },
    sample: { title: { en: "The Lantern on the Bridge", vi: "Chiếc đèn trên cây cầu" }, html: lantern },
    keywords: "free sample thinking cycle analyze evaluate justify reflect story",
  },
  {
    slug: "level-2-claim-evidence-pack",
    kind: "activity-pack",
    level: 2,
    ...l2,
    title: { en: "Claim and Evidence Activity Pack", vi: "Bộ hoạt động Nhận định và Bằng chứng" },
    summary: {
      en: "Six one-page activities with short original stories. Each one asks your child to make a claim and find the words in the story that prove it. A parent guide shows example answers.",
      vi: "Sáu hoạt động một trang với truyện ngắn nguyên bản. Mỗi hoạt động yêu cầu con đưa ra nhận định và tìm từ ngữ trong truyện để chứng minh. Hướng dẫn cho phụ huynh có câu trả lời mẫu.",
    },
    contents: {
      en: ["6 activities, each with an original 40–60 word story", "Claim and Evidence frames from the Level 2 CEIW stage", "2-page parent guide with example answers", "Growth Portfolio page"],
      vi: ["6 hoạt động, mỗi hoạt động có một truyện nguyên bản 40–60 từ", "Khung Nhận định và Bằng chứng của bậc CEIW cấp độ 2", "Hướng dẫn phụ huynh 2 trang với câu trả lời mẫu", "Trang Hồ sơ Tiến bộ"],
    },
    outcomes: {
      en: ["State a claim about a character in one sentence", "Underline evidence that supports it", "Join claim and evidence with “because”"],
      vi: ["Nêu nhận định về nhân vật trong một câu", "Gạch chân bằng chứng ủng hộ nhận định", "Nối nhận định và bằng chứng bằng “vì”"],
    },
    prerequisites: {
      en: "Level 2 readers (CEFR A1/A2). If the free sample felt too hard, start with Level 1 materials when they open.",
      vi: "Học viên cấp độ 2 (CEFR A1/A2). Nếu bài mẫu miễn phí còn khó, hãy bắt đầu với tài liệu cấp độ 1 khi được mở bán.",
    },
    format: { en: "In-browser reader and a printable file, about 10 pages.", vi: "Trình đọc trên trình duyệt và tệp in, khoảng 10 trang." },
    priceVnd: 39000,
    availability: "preview",
    cover: "world-02-whispering-woods",
    coverAlt: { en: "Whispering Woods storybook illustration, Level 2", vi: "Tranh minh hoạ Khu rừng Thì thầm, cấp độ 2" },
    sample: { title: { en: "Free excerpt: Activity 1", vi: "Trích đoạn miễn phí: Hoạt động 1" }, html: packExcerpt },
    keywords: "level 2 claim evidence because worksheet activity pack early reasoner",
  },
  {
    slug: "level-2-home-practice-bundle",
    kind: "level-bundle",
    level: 2,
    ...l2,
    title: { en: "Level 2 Early Reasoner Home Practice Bundle", vi: "Trọn bộ Luyện tập tại nhà Cấp độ 2 Lập luận Sơ khởi" },
    summary: {
      en: "A term of home practice in nine short units. Each unit takes one original story through the full Thinking Cycle and ends with a short paragraph your child can keep in a Growth Portfolio.",
      vi: "Một học kỳ luyện tập tại nhà với chín bài ngắn. Mỗi bài đưa một truyện nguyên bản qua toàn bộ Chu trình Tư duy và kết thúc bằng một đoạn văn ngắn để con lưu vào Hồ sơ Tiến bộ.",
    },
    contents: {
      en: ["Scope: 9 units, about 30 minutes each", "9 original stories with Word Fossil vocabulary boxes", "Claim and Evidence frames, building to 3–4 sentence responses", "Parent guide with example answers for every unit", "Includes the Claim and Evidence Activity Pack"],
      vi: ["Phạm vi: 9 bài, mỗi bài khoảng 30 phút", "9 truyện nguyên bản kèm ô từ vựng Word Fossil", "Khung Nhận định và Bằng chứng, tiến tới câu trả lời 3–4 câu", "Hướng dẫn phụ huynh có câu trả lời mẫu cho mọi bài", "Bao gồm Bộ hoạt động Nhận định và Bằng chứng"],
    },
    outcomes: {
      en: ["Explain why a character makes a hard choice", "Support a claim with two pieces of evidence", "Write a clear 3–4 sentence story response", "Keep a Word Fossil notebook"],
      vi: ["Giải thích vì sao nhân vật đưa ra lựa chọn khó", "Hỗ trợ nhận định bằng hai bằng chứng", "Viết câu trả lời 3–4 câu rõ ràng", "Duy trì sổ từ vựng Word Fossil"],
    },
    prerequisites: {
      en: "Comfortable with the free sample and Activity 1 of the pack. For a written level recommendation, book a Student Thinking Diagnostic.",
      vi: "Làm tốt bài mẫu miễn phí và Hoạt động 1. Để có khuyến nghị cấp độ bằng văn bản, hãy đặt lịch Đánh giá Tư duy Học sinh.",
    },
    format: { en: "In-browser reader and a printable file, about 45 pages.", vi: "Trình đọc trên trình duyệt và tệp in, khoảng 45 trang." },
    priceVnd: 249000,
    availability: "preview",
    cover: "world-02-whispering-woods",
    coverAlt: { en: "Whispering Woods storybook illustration, Level 2", vi: "Tranh minh hoạ Khu rừng Thì thầm, cấp độ 2" },
    sample: { title: { en: "Free excerpt: Activity 1 from Unit 1", vi: "Trích đoạn miễn phí: Hoạt động 1 của Bài 1" }, html: packExcerpt },
    keywords: "level 2 bundle term units early reasoner claim evidence paragraph portfolio",
  },
  inReview(
    1,
    "level-1-first-stories-pack",
    "world-01-mistwood-harbor",
    { en: "Level 1 First Stories Pack", vi: "Bộ Truyện Đầu tiên Cấp độ 1" },
    { en: "Picture-story activities for linking an opinion to a story detail with a “Because Bridge.”", vi: "Hoạt động truyện tranh để nối ý kiến với chi tiết trong truyện bằng “Cầu Vì”." },
    { en: "Held: the current Level 1 handbooks are built on published picture books. This pack needs original stories before it can be sold.", vi: "Tạm giữ: sổ tay cấp độ 1 hiện dựa trên sách tranh đã xuất bản. Cần truyện nguyên bản trước khi bán." },
    "5–7",
  ),
  inReview(
    3,
    "level-3-interpretation-pack",
    "world-03-grand-archive",
    { en: "Level 3 From Opinion to Interpretation Pack", vi: "Bộ Từ Ý kiến đến Diễn giải Cấp độ 3" },
    { en: "Comparing two viewpoints and writing an analytical paragraph backed by quotes.", vi: "So sánh hai quan điểm và viết đoạn phân tích có trích dẫn." },
    { en: "Held: current Level 3 lessons are built on in-copyright novels. Needs original or licensed texts.", vi: "Tạm giữ: bài học cấp độ 3 hiện dựa trên tiểu thuyết còn bản quyền. Cần văn bản nguyên bản hoặc được cấp phép." },
    "10–12",
  ),
  inReview(
    4,
    "level-4-argument-pack",
    "world-04-cloudpeak-observatory",
    { en: "Level 4 Interpretation to Argument Pack", vi: "Bộ Từ Diễn giải đến Lập luận Cấp độ 4" },
    { en: "Multi-paragraph argument with Claim, Evidence, Interpretation and Warrant.", vi: "Lập luận nhiều đoạn với Nhận định, Bằng chứng, Diễn giải và Lý lẽ." },
    { en: "Held: current Level 4 lessons are built on novels with mixed copyright status by country. Needs a rights decision.", vi: "Tạm giữ: bài học cấp độ 4 dựa trên tiểu thuyết có tình trạng bản quyền khác nhau theo quốc gia. Cần quyết định về bản quyền." },
    "13–15",
  ),
  inReview(
    5,
    "level-5-ceiw-impact-pack",
    "hero-story-expedition",
    { en: "Level 5 CEIW and Impact Writing Frames", vi: "Khung viết CEIW và Tác động Cấp độ 5" },
    { en: "Counter-arguments and the Impact step for exam-style essays.", vi: "Phản biện và bước Tác động cho bài luận dạng đề thi." },
    { en: "Held: the frames are original, but the model essays need checking and the pack needs a student edition without assessor notes.", vi: "Tạm giữ: khung là nguyên bản nhưng bài mẫu cần kiểm tra và cần bản cho học viên không có ghi chú chấm điểm." },
    "15+",
  ),
];

export function productBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function isSellable(p: Product): boolean {
  return p.availability === "preview" && p.kind !== "free-sample" && p.priceVnd > 0;
}
