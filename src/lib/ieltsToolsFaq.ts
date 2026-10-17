import type { Locale } from '../i18n/locales';

/**
 * Band-calculator FAQs. One source for the visible FAQ on the page (IeltsToolsPage) and the FAQPage JSON-LD
 * (routeMetadata), so the markup always matches what the page shows.
 */
export const ieltsCalculatorFaqs: Record<Locale, ReadonlyArray<readonly [string, string]>> = {
  en: [
    ['How is my IELTS overall band calculated?', 'Add Listening, Reading, Writing and Speaking bands, divide by four, then round to the nearest half or whole band using IELTS rules.'],
    ['Does 6.25 round to 6.5?', 'Yes. IELTS rounds an average ending in .25 to the next half band. An average ending in .75 rounds to the next whole band.'],
    ['Does 6.125 round down to 6.0?', 'Yes. An average below .25 rounds down to the whole band, so 6.125 becomes 6.0. An average from .5 up to .625 stays at the half band, so 6.625 becomes 6.5.'],
    ['What Speaking band do I need for 6.5 overall?', 'It depends on your other three bands. With Listening 7.0, Reading 6.5 and Writing 6.0, a Speaking band of 5.5 is enough: the average is 6.25, which rounds up to 6.5, while 5.0 gives 6.125, which rounds down to 6.0. Use the target planner on this page with your own bands.'],
    ['Can one low skill pull my overall band down?', 'Yes. Each skill counts for a quarter of the average, so half a band lower in one skill moves the average by 0.125, which can cross a rounding boundary. Universities and visa authorities may also set a minimum for each skill.'],
    ['Is this an official IELTS result?', 'No. Only an authorised IELTS test can issue an official score. This tool calculates an estimate from the bands you enter.'],
  ],
  vi: [
    ['Điểm IELTS overall được tính thế nào?', 'Cộng điểm Listening, Reading, Writing và Speaking, chia cho bốn, rồi làm tròn theo quy tắc IELTS.'],
    ['6,25 có được làm tròn thành 6,5 không?', 'Có. IELTS làm tròn trung bình kết thúc bằng ,25 lên nửa band tiếp theo; ,75 lên band nguyên tiếp theo.'],
    ['6,125 có bị làm tròn xuống 6,0 không?', 'Có. Trung bình có phần thập phân nhỏ hơn ,25 được làm tròn xuống band nguyên, nên 6,125 thành 6,0. Trung bình từ ,5 đến ,625 giữ ở nửa band, nên 6,625 thành 6,5.'],
    ['Cần bao nhiêu điểm Speaking để đạt overall 6,5?', 'Tùy vào ba kỹ năng còn lại. Ví dụ Listening 7,0, Reading 6,5 và Writing 6,0: chỉ cần Speaking 5,5, vì trung bình 6,25 được làm tròn lên 6,5, còn Speaking 5,0 cho 6,125 và bị làm tròn xuống 6,0. Hãy dùng công cụ tính điểm mục tiêu trên trang này với điểm của bạn.'],
    ['Một kỹ năng thấp có kéo điểm overall xuống không?', 'Có. Mỗi kỹ năng chiếm một phần tư điểm trung bình, nên thấp hơn nửa band ở một kỹ năng làm trung bình giảm 0,125 và có thể vượt qua ngưỡng làm tròn. Trường học hoặc cơ quan thị thực cũng có thể yêu cầu điểm tối thiểu cho từng kỹ năng.'],
    ['Đây có phải điểm IELTS chính thức không?', 'Không. Chỉ kỳ thi IELTS được ủy quyền mới cấp điểm chính thức. Công cụ này ước tính từ điểm bạn nhập.'],
  ],
};
