# Vietnamese copy for native review

All new Vietnamese user-facing strings in T3–T5 are flagged for native review. Route slugs are omitted because they are URLs, not displayed copy.

## src/components/IeltsToolsPage.tsx

- Tính điểm IELTS overall
- Đồng hồ IELTS Speaking Part 2
- Thông tin chính
- Điểm overall
- Tính điểm overall
- Nhập điểm từ 0 đến 9, theo bước 0,5 cho cả bốn kỹ năng.
- Đây là kết quả ước tính, không phải điểm IELTS chính thức.
- Jurassic English hoạt động độc lập với IELTS, British Council, IDP và Cambridge.
- Quy tắc tính điểm IELTS (nguồn chính thức)
- Nhập điểm của bốn kỹ năng. Công cụ cộng các điểm, chia cho bốn và áp dụng quy tắc làm tròn của IELTS. Dữ liệu nhập chỉ ở trong phiên trình duyệt này và không được gửi cho chúng tôi.
- Cách tính điểm IELTS overall
- Bảng điểm IELTS thể hiện điểm của bốn kỹ năng: Listening, Reading, Writing và Speaking. Điểm overall là trung bình cộng của bốn điểm này, được làm tròn tới band nguyên hoặc nửa band gần nhất. Mỗi kỹ năng có trọng số như nhau. Vì vậy, overall là bản tóm tắt các điểm kỹ năng, không phải một bài đánh giá thứ năm có tiêu chí chấm riêng.
- Để tự tính, hãy cộng bốn điểm và chia cho bốn. Ví dụ: Listening 7,0; Reading 6,5; Writing 6,0; Speaking 6,5. Tổng là 26,0 và trung bình là 6,5, nên điểm overall là 6,5. Bạn có thể thay đổi từng ô ở trên để xem một điểm kỹ năng khác tác động đến trung bình như thế nào. Kết quả giúp lập kế hoạch luyện tập, nhưng không dự đoán điểm giám khảo sẽ chấm.
- Theo IELTS, trung bình kết thúc bằng ,25 được làm tròn lên nửa band tiếp theo; trung bình kết thúc bằng ,75 được làm tròn lên band nguyên tiếp theo. Do đó 6,25 thành 6,5 và 6,75 thành 7,0. Nếu phần thập phân thấp hơn ,25 thì làm tròn về band nguyên trước đó; nếu nằm từ ,5 đến dưới ,75 thì làm tròn về nửa band trước đó. Công cụ tính bằng đơn vị nửa band nguyên để tránh sai số thập phân tại ranh giới.
- Nếu muốn kiểm tra lại điểm overall chính thức, hãy nhập đúng bốn điểm trên bảng điểm IELTS thật. Điểm bài thi thử, ước tính của giáo viên hoặc công cụ trực tuyến có thể hỗ trợ học tập, nhưng độ chính xác phụ thuộc vào cách đánh giá. Riêng Writing và Speaking cần được đánh giá theo tiêu chí công khai; nhập điểm mong muốn không biến điểm đó thành kết quả đã đạt.
- Listening và Reading dựa trên số câu trả lời đúng, nhưng việc quy đổi sang band có thể thay đổi theo đề. Chúng tôi không đưa bảng quy đổi số câu đúng chung vì bảng đó có thể tạo cảm giác chính xác sai lệch. Hãy dùng bốn điểm kỹ năng đã được báo cáo. Với Writing và Speaking, nên tập trung vào tiêu chí và phản hồi chỉ rõ bước cải thiện tiếp theo, thay vì chỉ nhìn vào overall.
- Một kỹ năng cao hơn có thể bù cho kỹ năng thấp hơn trong phép tính overall. Tuy nhiên, trường học, nhà tuyển dụng hoặc cơ quan cấp thị thực có thể yêu cầu điểm tối thiểu riêng cho từng kỹ năng. Hãy kiểm tra yêu cầu hiện hành trực tiếp với nơi nhận hồ sơ. Điểm overall không thay thế các yêu cầu riêng đó. Trước quyết định quan trọng, hãy đọc giải thích chính thức của IELTS ở liên kết bên dưới.
- Speaking là kỹ năng thí sinh Việt Nam thường đạt điểm thấp nhất
- Dữ liệu IELTS 2024–25 ghi nhận điểm Speaking trung bình 5,61 so với overall trung bình 6,20 của thí sinh Việt Nam. Đây là số liệu nhóm, không dự đoán điểm cá nhân.
- Đặt lịch Speaking Baseline để được đánh giá
- Câu hỏi thường gặp
- Điểm IELTS overall được tính thế nào?
- Cộng điểm Listening, Reading, Writing và Speaking, chia cho bốn, rồi làm tròn theo quy tắc IELTS.
- 6,25 có được làm tròn thành 6,5 không?
- Có. IELTS làm tròn trung bình kết thúc bằng ,25 lên nửa band tiếp theo; ,75 lên band nguyên tiếp theo.
- Đây có phải điểm IELTS chính thức không?
- Không. Chỉ kỳ thi IELTS được ủy quyền mới cấp điểm chính thức. Công cụ này ước tính từ điểm bạn nhập.
- Luyện tập với một phút chuẩn bị và hai phút nói. Các thẻ chủ đề do chúng tôi tự viết để luyện tập, không phải câu hỏi của đề thi thật.
- Chủ đề luyện tập
- Chuẩn bị
- Nói
- Sẵn sàng
- Hoàn thành
- Bắt đầu
- Đặt lại đồng hồ
- Chủ đề tiếp theo
- Trả lời → lý do → ví dụ → mở rộng
- Bắt đầu bằng câu trả lời trực tiếp. Giải thích lý do, đưa ví dụ cụ thể, rồi phát triển câu chuyện hoặc nêu tác động. Trong phút chuẩn bị, hãy ghi từ khóa thay vì viết cả bài.
- Ghi âm
- Dừng ghi âm
- Đang ghi âm trên thiết bị này
- Nghe lại bản ghi
- Không thể truy cập micro hoặc quyền đã bị từ chối. Bạn vẫn có thể dùng đồng hồ.
- Ghi âm là tùy chọn. Âm thanh chỉ ở trên thiết bị này, chỉ được giữ trong tab trình duyệt và không bao giờ được Jurassic English tải lên hoặc lưu trữ. Đặt lại hoặc rời trang để xóa bản ghi.
- Khám phá AI Speaking dành cho người lớn
- Âm báo nhẹ đánh dấu lúc chuyển sang phần nói và khi kết thúc.
- Hãy kể về {chủ đề}. Bạn nên nói đó là gì, vì sao bạn nhớ và điều bạn học được.
- một nơi bạn thích suy nghĩ
- một người đã dạy bạn kỹ năng hữu ích
- một chuyến đi thay đổi góc nhìn của bạn
- một đồ vật bạn đã sửa hoặc tái sử dụng
- một cuốn sách gợi ra cuộc trò chuyện
- một truyền thống địa phương bạn trân trọng
- một quyết định khó khăn bạn đã đưa ra
- một nơi yên tĩnh trong cộng đồng của bạn
- một lần bạn giúp ai đó học điều mới
- một mục tiêu bạn đã thay đổi và lý do

## src/lib/routeMetadata.ts

- Tính điểm IELTS overall: công cụ quy đổi band
- Tính điểm IELTS overall từ bốn kỹ năng theo quy tắc làm tròn của IELTS.
- Đồng hồ IELTS Speaking Part 2 | Jurassic English™
- Luyện nói với một phút chuẩn bị, hai phút trình bày và ghi âm tùy chọn chỉ trên thiết bị.

## src/yl/i18n.vi.json

- Công cụ miễn phí
- Luyện tập và lập kế hoạch với các công cụ IELTS miễn phí.
