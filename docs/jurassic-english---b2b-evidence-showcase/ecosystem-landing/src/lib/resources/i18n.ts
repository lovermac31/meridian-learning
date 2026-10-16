// UI strings for the resource store. English is the source.
// Vietnamese is machine-translated and must be reviewed by a native speaker
// before any public release; the store shows a notice saying so on every VI
// page (viReviewNotice).

export type Lang = "en" | "vi";

export const STRINGS = {
  en: {
    eyebrow: "Student Academy · Resource Library",
    heroTitle: "Printable reading and thinking packs from the Jurassic English™ curriculum",
    heroBody:
      "Each pack follows the same lesson routine your child uses in class: read a short passage, then Analyze, Evaluate, Justify and Reflect. Start with the free sample. Every paid pack shows a real excerpt before you buy.",
    heroFree: "Open the free sample",
    heroDiagnostic: "Not sure which level? Book a Student Thinking Diagnostic",
    backToAcademy: "Back to the Student Academy",
    library: "My library",
    previewBanner:
      "Preview build. No real payments are taken. Purchases here are simulated and the paid files are placeholder text.",
    viReviewNotice: "",
    filters: "Filter resources",
    search: "Search by title or skill",
    level: "Level",
    allLevels: "All levels",
    type: "Type",
    allTypes: "All types",
    kinds: { "free-sample": "Free sample", "activity-pack": "Activity pack", "level-bundle": "Level bundle" },
    results: (n: number) => `${n} ${n === 1 ? "resource" : "resources"}`,
    noResults: "No resources match. Clear the search or choose All levels.",
    ages: "Ages",
    free: "Free",
    proposedPrice: "Proposed pilot price, not yet approved",
    inReview: "In review: not for sale yet",
    viewDetails: "View details",
    contents: "What's inside",
    outcomes: "What your child practises",
    prerequisites: "Before you start",
    format: "Format",
    licence: "Licence",
    sampleTitle: "Read the sample",
    sampleNote: "This excerpt is free to read. It is part of the full pack.",
    lockedTitle: "The rest of this pack is locked",
    lockedBody: "Buy the pack to open every page in the reader and download the printable file.",
    buy: "Buy this pack",
    openReader: "Open in reader",
    download: "Download printable file",
    owned: "In your library",
    faq: "Questions parents ask",
    support: "Need help with a purchase? Email info@jurassicenglish.com or message us on Zalo. Include your order reference (it starts with JERS).",
    checkoutTitle: "Checkout",
    guardianLabel: "I am the parent or guardian, or an adult buying for my own study (18+).",
    termsLabel: "I have read the licence terms: one family or one learner, printing for home use, no resharing.",
    emailNote:
      "In the live store you will enter a parent email for the receipt and your private access link. This preview stores no personal details.",
    startPayment: "Continue to payment",
    payTitle: "Pay by bank transfer (VietQR)",
    payBody: (ref: string) =>
      `Scan the QR code in your banking app and keep the reference ${ref} in the transfer message. Access opens when the bank confirms the transfer, usually within a few minutes.`,
    sandboxQr: "Sandbox: no real QR code. Use the simulation buttons below.",
    waiting: "Waiting for the bank to confirm your transfer…",
    paid: "Payment confirmed. The pack is in your library.",
    underpaid:
      "The transfer was less than the price, so access is not open yet. We will contact you to settle the difference or refund it.",
    failed: "This payment did not go through. No access was granted. You can start a new order.",
    expired: "This order expired before a transfer arrived. If you already paid, keep your reference and contact us.",
    refunded: "This order was refunded and access was removed.",
    review: "We are checking this order by hand and will email you.",
    sandboxTools: "Sandbox simulation (preview only)",
    simConfirm: "Simulate bank confirmation",
    simDuplicate: "Resend the same notification",
    simUnder: "Simulate underpayment",
    simFail: "Simulate failed payment",
    simRefund: "Simulate refund",
    simReset: "Clear sandbox purchases",
    libraryTitle: "My library",
    libraryEmpty: "No purchases yet. Free samples open without buying.",
    history: "Purchase history",
    orderRef: "Reference",
    amount: "Amount",
    status: "Status",
    statusNames: {
      pending: "Waiting for payment",
      paid: "Paid",
      underpaid: "Underpaid, under review",
      failed: "Failed",
      expired: "Expired",
      refunded: "Refunded",
    },
    readerTitle: "Reader",
    readerDenied: "You need to buy this pack to read it. Open the product page to see the free sample.",
    readerLoading: "Loading your pack…",
    copyNote:
      "Your file carries your order reference. Please do not share it; no file format can fully prevent copying, so we rely on your good faith.",
    langSwitch: "Tiếng Việt",
  },
  vi: {
    eyebrow: "Học viện Học sinh · Thư viện Tài liệu",
    heroTitle: "Bộ tài liệu đọc hiểu và tư duy có thể in từ chương trình Jurassic English™",
    heroBody:
      "Mỗi bộ theo đúng quy trình bài học con bạn dùng trên lớp: đọc một đoạn ngắn, rồi Phân tích, Đánh giá, Lập luận và Suy ngẫm. Hãy bắt đầu với bài mẫu miễn phí. Mỗi bộ trả phí đều cho xem trích đoạn thật trước khi mua.",
    heroFree: "Mở bài mẫu miễn phí",
    heroDiagnostic: "Chưa chắc chọn cấp độ nào? Đặt lịch Đánh giá Tư duy Học sinh",
    backToAcademy: "Quay lại Học viện Học sinh",
    library: "Thư viện của tôi",
    previewBanner:
      "Bản xem trước. Không thu tiền thật. Việc mua ở đây là mô phỏng và tệp trả phí chỉ là văn bản giữ chỗ.",
    viReviewNotice:
      "Bản tiếng Việt được dịch máy và đang chờ người bản ngữ duyệt lại. Nếu có chỗ chưa rõ, bản tiếng Anh là bản chuẩn.",
    filters: "Lọc tài liệu",
    search: "Tìm theo tên hoặc kỹ năng",
    level: "Cấp độ",
    allLevels: "Tất cả cấp độ",
    type: "Loại",
    allTypes: "Tất cả loại",
    kinds: { "free-sample": "Bài mẫu miễn phí", "activity-pack": "Bộ hoạt động", "level-bundle": "Trọn bộ cấp độ" },
    results: (n: number) => `${n} tài liệu`,
    noResults: "Không có tài liệu phù hợp. Hãy xoá từ khoá hoặc chọn Tất cả cấp độ.",
    ages: "Độ tuổi",
    free: "Miễn phí",
    proposedPrice: "Giá thí điểm đề xuất, chưa được duyệt",
    inReview: "Đang duyệt: chưa mở bán",
    viewDetails: "Xem chi tiết",
    contents: "Bên trong có gì",
    outcomes: "Con bạn sẽ luyện tập",
    prerequisites: "Trước khi bắt đầu",
    format: "Định dạng",
    licence: "Giấy phép sử dụng",
    sampleTitle: "Đọc bài mẫu",
    sampleNote: "Trích đoạn này được đọc miễn phí. Đây là một phần của bộ đầy đủ.",
    lockedTitle: "Phần còn lại của bộ đang khoá",
    lockedBody: "Mua bộ tài liệu để mở mọi trang trong trình đọc và tải tệp in.",
    buy: "Mua bộ này",
    openReader: "Mở trong trình đọc",
    download: "Tải tệp in",
    owned: "Đã có trong thư viện",
    faq: "Câu hỏi phụ huynh thường hỏi",
    support:
      "Cần hỗ trợ về đơn hàng? Email info@jurassicenglish.com hoặc nhắn Zalo. Vui lòng ghi mã đơn (bắt đầu bằng JERS).",
    checkoutTitle: "Thanh toán",
    guardianLabel: "Tôi là cha mẹ hoặc người giám hộ, hoặc người lớn (18+) mua cho việc học của chính mình.",
    termsLabel: "Tôi đã đọc điều khoản: dùng cho một gia đình hoặc một học viên, in để dùng tại nhà, không chia sẻ lại.",
    emailNote:
      "Ở cửa hàng chính thức, bạn sẽ nhập email phụ huynh để nhận biên nhận và đường dẫn truy cập riêng. Bản xem trước này không lưu thông tin cá nhân.",
    startPayment: "Tiếp tục thanh toán",
    payTitle: "Chuyển khoản ngân hàng (VietQR)",
    payBody: (ref: string) =>
      `Quét mã QR trong ứng dụng ngân hàng và giữ mã ${ref} trong nội dung chuyển khoản. Quyền truy cập mở khi ngân hàng xác nhận, thường trong vài phút.`,
    sandboxQr: "Mô phỏng: không có mã QR thật. Dùng các nút mô phỏng bên dưới.",
    waiting: "Đang chờ ngân hàng xác nhận chuyển khoản…",
    paid: "Đã xác nhận thanh toán. Bộ tài liệu đã có trong thư viện của bạn.",
    underpaid:
      "Số tiền chuyển thấp hơn giá nên chưa mở quyền truy cập. Chúng tôi sẽ liên hệ để bù phần thiếu hoặc hoàn tiền.",
    failed: "Thanh toán không thành công. Chưa mở quyền truy cập. Bạn có thể tạo đơn mới.",
    expired: "Đơn đã hết hạn trước khi nhận được chuyển khoản. Nếu bạn đã chuyển, hãy giữ mã đơn và liên hệ chúng tôi.",
    refunded: "Đơn này đã được hoàn tiền và quyền truy cập đã bị gỡ.",
    review: "Chúng tôi đang kiểm tra thủ công đơn này và sẽ email cho bạn.",
    sandboxTools: "Mô phỏng (chỉ ở bản xem trước)",
    simConfirm: "Mô phỏng ngân hàng xác nhận",
    simDuplicate: "Gửi lại cùng thông báo",
    simUnder: "Mô phỏng chuyển thiếu",
    simFail: "Mô phỏng thanh toán lỗi",
    simRefund: "Mô phỏng hoàn tiền",
    simReset: "Xoá đơn mô phỏng",
    libraryTitle: "Thư viện của tôi",
    libraryEmpty: "Chưa có đơn mua nào. Bài mẫu miễn phí mở được mà không cần mua.",
    history: "Lịch sử mua",
    orderRef: "Mã đơn",
    amount: "Số tiền",
    status: "Trạng thái",
    statusNames: {
      pending: "Chờ thanh toán",
      paid: "Đã thanh toán",
      underpaid: "Chuyển thiếu, đang kiểm tra",
      failed: "Không thành công",
      expired: "Hết hạn",
      refunded: "Đã hoàn tiền",
    },
    readerTitle: "Trình đọc",
    readerDenied: "Bạn cần mua bộ này để đọc. Mở trang sản phẩm để xem bài mẫu miễn phí.",
    readerLoading: "Đang tải bộ tài liệu…",
    copyNote:
      "Tệp của bạn có ghi mã đơn hàng. Vui lòng không chia sẻ; không định dạng tệp nào ngăn được hoàn toàn việc sao chép, nên chúng tôi tin vào thiện chí của bạn.",
    langSwitch: "English",
  },
} as const;

export type Strings = (typeof STRINGS)["en"] | (typeof STRINGS)["vi"];

export function t(lang: Lang): Strings {
  return STRINGS[lang];
}

export const BASE = "/student-academy/resources";

export function catalogueHref(lang: Lang): string {
  return lang === "vi" ? `${BASE}/vi` : BASE;
}

export function productHref(lang: Lang, slug: string): string {
  return lang === "vi" ? `${BASE}/vi/p/${slug}` : `${BASE}/p/${slug}`;
}

export function withLang(path: string, lang: Lang): string {
  return lang === "vi" ? `${path}?lang=vi` : path;
}

export function formatVnd(amount: number, lang: Lang): string {
  return `${new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US").format(amount)} ₫`;
}
