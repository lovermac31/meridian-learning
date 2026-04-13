import {
  legalDocuments,
  type ContentBlock,
  type LegalDocument,
  type LegalSection,
} from '../../lib/legalContent';
import type { Locale } from '../locales';

export { legalDocuments };

export type LegalContentModule = {
  legalDocuments: typeof legalDocuments;
};

const legalContentByLocale: Partial<Record<Locale, LegalContentModule>> = {
  en: {
    legalDocuments,
  },
};

export function getLegalContent(locale: Locale) {
  return legalContentByLocale[locale] ?? null;
}

function p(text: string): ContentBlock {
  return { type: 'paragraph', text };
}

function list(items: string[]): ContentBlock {
  return { type: 'list', items };
}

function table(headers: string[], rows: string[][]): ContentBlock {
  return { type: 'table', headers, rows };
}

function sub(heading: string, blocks: ContentBlock[]): ContentBlock {
  return { type: 'subsection', heading, blocks };
}

function section(number: string, heading: string, blocks: ContentBlock[]): LegalSection {
  return { number, heading, blocks };
}

const viLegalPageChrome = {
  backCta: 'Quay lại Jurassic English',
  eyebrow: 'Pháp lý',
  effectiveDate: 'Ngày hiệu lực',
  lastUpdated: 'Cập nhật lần cuối',
  copyright: '© 2026 World Wise Learning. Bảo lưu mọi quyền.',
} as const;

const termsVi: LegalDocument = {
  title: 'Điều khoản & Điều kiện',
  effectiveDate: 'Tháng 3 năm 2026',
  lastUpdated: '21 tháng 3 năm 2026',
  callout: {
    label: 'VUI LÒNG ĐỌC KỸ',
    body: 'Khi truy cập hoặc sử dụng bất kỳ tài liệu, nền tảng, chương trình hoặc dịch vụ nào của Jurassic English™ do World Wise Learning vận hành, bạn đồng ý chịu sự ràng buộc của các Điều khoản & Điều kiện này. Nếu bạn không đồng ý, bạn phải ngừng sử dụng ngay lập tức.',
  },
  sections: [
    section('1', 'Giới thiệu và chấp nhận', [
      p('Các Điều khoản và Điều kiện này ("Điều khoản") điều chỉnh việc bạn truy cập và sử dụng tất cả sản phẩm, dịch vụ, nền tảng số, tài liệu chương trình in ấn, thỏa thuận cấp phép và chương trình chuyên môn do World Wise Learning ("Chúng tôi", "Của chúng tôi") cung cấp dưới thương hiệu Jurassic English™.'),
      p('Khi truy cập Dịch vụ của Chúng tôi — dù với tư cách là giáo viên cá nhân, khách hàng tổ chức, phụ huynh, học sinh hay tổ chức đối tác — bạn xác nhận rằng mình đã đọc, hiểu và đồng ý chịu sự ràng buộc của các Điều khoản này cùng mọi chính sách bổ sung được viện dẫn trong đây, bao gồm Chính sách quyền riêng tư, Chính sách cookie và Tuyên bố miễn trừ trách nhiệm của Chúng tôi.'),
      p('Các Điều khoản này tạo thành một thỏa thuận có giá trị ràng buộc pháp lý giữa bạn và World Wise Learning. Chúng tôi có quyền cập nhật các Điều khoản này vào bất kỳ thời điểm nào. Việc tiếp tục sử dụng Dịch vụ của Chúng tôi sau khi được thông báo về thay đổi sẽ cấu thành sự chấp nhận của bạn đối với các Điều khoản đã được sửa đổi.'),
    ]),
    section('2', 'Định nghĩa', [
      p('Trong phạm vi các Điều khoản này, các định nghĩa sau được áp dụng:'),
      list([
        '"Dịch vụ" nghĩa là toàn bộ tài liệu chương trình Jurassic English™, nền tảng số, chương trình đào tạo giáo viên, thỏa thuận cấp phép, tư vấn học thuật và các thỏa thuận hợp tác tổ chức do World Wise Learning cung cấp.',
        '"Người dùng" nghĩa là bất kỳ cá nhân hoặc tổ chức nào truy cập Dịch vụ của Chúng tôi, bao gồm giáo viên, quản trị viên nhà trường, học sinh, phụ huynh, khách hàng tổ chức và bên được cấp phép.',
        '"Nội dung" nghĩa là toàn bộ văn bản, hình ảnh, âm thanh, video, bài đánh giá, khung chương trình, kế hoạch bài học, rubric và các tài liệu khác được cung cấp thông qua Dịch vụ của Chúng tôi.',
        '"Khách hàng tổ chức" nghĩa là bất kỳ trường học, học viện, tổ chức hoặc cơ quan giáo dục nào ký kết thỏa thuận cấp phép hoặc hợp tác chính thức với World Wise Learning.',
        '"Nền tảng" nghĩa là bất kỳ giao diện số, cổng thông tin, hệ thống quản lý học tập hoặc công cụ trực tuyến nào do World Wise Learning cung cấp liên quan đến Dịch vụ.',
        '"Quyền sở hữu trí tuệ" nghĩa là toàn bộ bằng sáng chế, nhãn hiệu (bao gồm Jurassic English™ và Jurassic Thinking Cycle™), kiểu dáng đã đăng ký, bản quyền, quyền cơ sở dữ liệu, bí mật thương mại và các quyền độc quyền khác do World Wise Learning sở hữu hoặc được cấp phép.',
      ]),
    ]),
    section('3', 'Điều kiện đủ tư cách và đăng ký tài khoản', [
      sub('3.1 Điều kiện đủ tư cách', [
        p('Dịch vụ của Chúng tôi dành cho các nhà giáo dục chuyên môn, tổ chức giáo dục và cá nhân từ 18 tuổi trở lên. Việc sử dụng Dịch vụ của Chúng tôi bởi hoặc thay mặt cho người chưa thành niên (dưới 18 tuổi) phải được giám sát bởi giáo viên có chuyên môn hoặc phụ huynh/người giám hộ. Khách hàng tổ chức chịu trách nhiệm bảo đảm việc giám sát phù hợp đối với người dùng chưa thành niên trong phạm vi cơ sở của mình.'),
      ]),
      sub('3.2 Đăng ký tài khoản', [
        p('Một số Dịch vụ có thể yêu cầu đăng ký tài khoản. Bạn đồng ý cung cấp thông tin chính xác, hiện hành và đầy đủ khi đăng ký, đồng thời duy trì cập nhật thông tin đó. Bạn chịu trách nhiệm bảo mật thông tin đăng nhập tài khoản của mình và đối với toàn bộ hoạt động diễn ra dưới tài khoản đó.'),
        p('Bạn phải thông báo ngay cho Chúng tôi qua legal@worldwiselearning.com nếu nghi ngờ có bất kỳ việc sử dụng trái phép nào đối với tài khoản của mình. Chúng tôi có quyền đình chỉ hoặc chấm dứt các tài khoản chứa thông tin sai lệch hoặc vi phạm các Điều khoản này.'),
      ]),
      sub('3.3 Quản trị tài khoản tổ chức', [
        p('Khách hàng tổ chức có thể chỉ định một hoặc nhiều quản trị viên chịu trách nhiệm quản lý quyền truy cập của người dùng trong tổ chức. Khách hàng tổ chức hoàn toàn chịu trách nhiệm đối với mọi hoạt động được thực hiện dưới tài khoản tổ chức của mình, bao gồm hành vi của từng người dùng mà họ cấp quyền truy cập.'),
      ]),
    ]),
    section('4', 'Mục đích sử dụng được phép và giấy phép', [
      sub('4.1 Cấp giấy phép', [
        p('Với điều kiện bạn tuân thủ các Điều khoản này và thanh toán mọi khoản phí áp dụng, World Wise Learning cấp cho bạn một giấy phép giới hạn, không độc quyền, không chuyển nhượng và có thể thu hồi để truy cập và sử dụng Dịch vụ của Chúng tôi chỉ cho mục đích giáo dục nội bộ của bạn.'),
      ]),
      sub('4.2 Các hình thức sử dụng được phép', [
        p('Theo giấy phép này, bạn có thể:'),
        list([
          'Triển khai chương trình Jurassic English™ cho học sinh đã ghi danh trong cơ sở giáo dục được cấp phép của bạn;',
          'Tham gia các chương trình đào tạo giáo viên và phát triển chuyên môn;',
          'Truy cập, in và phân phối tài liệu chương trình cho học sinh đã ghi danh nhằm phục vụ giảng dạy trong phạm vi được cấp phép;',
          'Tương tác với các nền tảng số để lập kế hoạch giảng dạy và đánh giá.',
        ]),
      ]),
      sub('4.3 Các hình thức sử dụng bị cấm', [
        p('Bạn không được, nếu không có sự đồng ý trước bằng văn bản của Chúng tôi:'),
        list([
          'Sao chép, phân phối, bán, cấp phép lại, dịch hoặc thương mại hóa dưới bất kỳ hình thức nào bất kỳ phần nào của Nội dung hoặc Dịch vụ của Chúng tôi;',
          'Chỉnh sửa, điều chỉnh hoặc tạo tác phẩm phái sinh dựa trên Nội dung của Chúng tôi khi chưa có sự cho phép rõ ràng bằng văn bản;',
          'Gỡ bỏ, thay đổi hoặc che khuất bất kỳ thông báo bản quyền, nhãn hiệu hoặc nhãn độc quyền nào trên tài liệu của Chúng tôi;',
          'Chia sẻ thông tin đăng nhập tài khoản, mã truy cập hoặc giấy phép số với cá nhân hoặc tổ chức nằm ngoài nhóm người dùng được cấp phép của bạn;',
          'Sử dụng Dịch vụ của Chúng tôi cho bất kỳ mục đích trái pháp luật nào hoặc vi phạm pháp luật hay quy định hiện hành;',
          'Sử dụng hệ thống tự động, bot, công cụ thu thập dữ liệu hoặc công cụ tương tự để truy cập, trích xuất hoặc lập chỉ mục Nội dung của Chúng tôi;',
          'Truyền mã độc, vi-rút hoặc phần mềm gây gián đoạn thông qua các nền tảng của Chúng tôi;',
          'Trình bày tài liệu của Chúng tôi như tác phẩm gốc của riêng bạn hoặc xuyên tạc mối quan hệ của bạn với World Wise Learning.',
        ]),
        p('Việc vi phạm các điều cấm này có thể dẫn đến việc chấm dứt giấy phép ngay lập tức và/hoặc hành động pháp lý.'),
      ]),
    ]),
    section('5', 'Quyền sở hữu trí tuệ', [
      p('Toàn bộ Nội dung, khung phương pháp, nhãn hiệu, logo và phương pháp luận — bao gồm Jurassic Thinking Cycle™, CEIW Structure, Four-Level Reasoning Rubric và mọi công cụ sư phạm liên quan — là tài sản sở hữu trí tuệ độc quyền của World Wise Learning và được bảo hộ theo pháp luật hiện hành về bản quyền, nhãn hiệu và các quyền sở hữu trí tuệ khác.'),
      p('Không có nội dung nào trong các Điều khoản này chuyển giao bất kỳ quyền sở hữu trí tuệ nào cho bạn. Giấy phép sử dụng Dịch vụ của Chúng tôi không cấu thành việc chuyển nhượng hay từ bỏ bất kỳ quyền sở hữu trí tuệ nào. Mọi thiện chí phát sinh từ việc sử dụng nhãn hiệu của Chúng tôi chỉ thuộc về World Wise Learning.'),
      p('Nếu bạn cho rằng bất kỳ Nội dung nào trên nền tảng của Chúng tôi xâm phạm quyền sở hữu trí tuệ của bạn, vui lòng liên hệ legal@worldwiselearning.com với đầy đủ thông tin chi tiết về hành vi bị cho là xâm phạm.'),
    ]),
    section('6', 'Phí và thanh toán', [
      sub('6.1 Giá', [
        p('Việc truy cập một số Dịch vụ nhất định phải chịu phí theo thỏa thuận cá nhân, hợp đồng cấp phép hoặc như được hiển thị trên trang web của Chúng tôi tại www.jurassicenglish.com. Phí được báo giá chưa bao gồm các loại thuế áp dụng trừ khi có nêu khác.'),
      ]),
      sub('6.2 Điều khoản thanh toán', [
        p('Điều khoản thanh toán được quy định trong từng thỏa thuận dịch vụ cụ thể. Khách hàng tổ chức chịu sự điều chỉnh của lịch thanh toán đã được thống nhất tại thời điểm ký kết. Việc không thanh toán đúng hạn có thể dẫn đến đình chỉ quyền truy cập vào Dịch vụ đã được cấp phép mà không ảnh hưởng đến bất kỳ nghĩa vụ còn tồn đọng nào.'),
      ]),
      sub('6.3 Chính sách hoàn tiền', [
        p('Các khoản hoàn tiền được xem xét theo từng trường hợp cụ thể phù hợp với điều khoản của thỏa thuận dịch vụ cá nhân của bạn. Tài liệu chương trình số và các tài nguyên đã tải xuống sẽ không được hoàn tiền sau khi đã được truy cập.'),
      ]),
    ]),
    section('7', 'Bảo mật thông tin', [
      p('Mỗi bên đồng ý giữ bí mật mọi thông tin không công khai, độc quyền hoặc nhạy cảm về mặt thương mại do bên kia tiết lộ liên quan đến các Điều khoản này ("Thông tin mật"). Thông tin mật không được tiết lộ cho bên thứ ba nếu không có sự đồng ý trước bằng văn bản, trừ trường hợp pháp luật hoặc quy định yêu cầu.'),
      p('Nghĩa vụ của điều khoản này tiếp tục có hiệu lực sau khi các Điều khoản này chấm dứt trong thời hạn ba (3) năm.'),
    ]),
    section('8', 'Cam đoan và bảo đảm', [
      p('World Wise Learning cam đoan rằng mình nắm giữ mọi quyền cần thiết để cung cấp Dịch vụ và Nội dung như mô tả trong đây. Trong phạm vi tối đa pháp luật cho phép, Dịch vụ và Nội dung của Chúng tôi được cung cấp theo cơ sở "NGUYÊN TRẠNG" và "TÙY THEO KHẢ NĂNG CUNG CẤP". Chúng tôi không bảo đảm rằng Dịch vụ của Chúng tôi sẽ không bị gián đoạn, không có lỗi hoặc không chứa thành phần gây hại.'),
      p('Bạn cam đoan rằng: (a) bạn có thẩm quyền tham gia các Điều khoản này; (b) việc bạn sử dụng Dịch vụ của Chúng tôi tuân thủ mọi luật và quy định hiện hành; và (c) thông tin bạn cung cấp cho Chúng tôi là chính xác và đầy đủ.'),
    ]),
    section('9', 'Giới hạn trách nhiệm', [
      p('Trong phạm vi tối đa pháp luật hiện hành cho phép, World Wise Learning sẽ không chịu trách nhiệm đối với bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, hệ quả hoặc mang tính trừng phạt nào, bao gồm mất lợi nhuận, dữ liệu hoặc thiện chí, phát sinh từ hoặc liên quan đến việc bạn sử dụng hoặc không thể sử dụng Dịch vụ của Chúng tôi.'),
      p('Tổng mức trách nhiệm cộng gộp của Chúng tôi đối với bạn cho bất kỳ thiệt hại trực tiếp nào sẽ không vượt quá tổng số phí mà bạn đã thanh toán cho Chúng tôi trong mười hai (12) tháng trước thời điểm phát sinh khiếu nại.'),
      p('Không có nội dung nào trong các Điều khoản này giới hạn trách nhiệm của Chúng tôi đối với: (a) tử vong hoặc thương tích cá nhân do sơ suất của Chúng tôi gây ra; (b) gian lận hoặc trình bày gian dối; hoặc (c) bất kỳ trách nhiệm nào khác mà pháp luật không cho phép loại trừ.'),
    ]),
    section('10', 'Bồi hoàn', [
      p('Bạn đồng ý bồi hoàn, bảo vệ và giữ cho World Wise Learning cùng các cán bộ, giám đốc, nhân viên, đại diện và bên cấp phép của mình không bị tổn hại trước mọi khiếu nại, thiệt hại, tổn thất, chi phí và khoản phát sinh (bao gồm phí luật sư hợp lý) phát sinh từ: (a) việc bạn sử dụng Dịch vụ của Chúng tôi; (b) việc bạn vi phạm các Điều khoản này; (c) việc bạn vi phạm quyền của bên thứ ba; hoặc (d) bất kỳ nội dung nào bạn gửi thông qua các nền tảng của Chúng tôi.'),
    ]),
    section('11', 'Thời hạn và chấm dứt', [
      p('Các Điều khoản này có hiệu lực trong suốt thời gian bạn sử dụng Dịch vụ của Chúng tôi. Mỗi bên có thể chấm dứt thỏa thuận này bằng thông báo bằng văn bản nếu bên kia vi phạm nghiêm trọng các Điều khoản này và không khắc phục vi phạm trong vòng ba mươi (30) ngày kể từ khi được thông báo.'),
      p('World Wise Learning có thể đình chỉ hoặc chấm dứt quyền truy cập của bạn ngay lập tức nếu bạn vi phạm các hình thức sử dụng bị cấm tại Mục 4.3, tham gia hoạt động gian lận hoặc nếu pháp luật yêu cầu như vậy.'),
      p('Khi chấm dứt, mọi giấy phép được cấp theo các Điều khoản này chấm dứt ngay lập tức. Các Mục 5 (Sở hữu trí tuệ), 7 (Bảo mật), 9 (Giới hạn trách nhiệm), 10 (Bồi hoàn) và 13 (Luật điều chỉnh) vẫn tiếp tục có hiệu lực sau khi chấm dứt.'),
    ]),
    section('12', 'Dịch vụ và liên kết bên thứ ba', [
      p('Dịch vụ của Chúng tôi có thể tích hợp hoặc chứa liên kết tới nền tảng, dịch vụ hoặc trang web của bên thứ ba. Chúng chỉ được cung cấp nhằm mục đích thuận tiện. World Wise Learning không bảo trợ, kiểm soát hay chịu trách nhiệm đối với nội dung, thực tiễn quyền riêng tư hay điều khoản của bất kỳ dịch vụ bên thứ ba nào. Bạn truy cập các dịch vụ bên thứ ba với rủi ro của riêng mình.'),
    ]),
    section('13', 'Luật điều chỉnh và giải quyết tranh chấp', [
      p('Các Điều khoản này được điều chỉnh và diễn giải theo pháp luật của khu vực tài phán nơi World Wise Learning được đăng ký. Mọi tranh chấp phát sinh từ hoặc liên quan đến các Điều khoản này trước hết phải được đưa ra thương lượng thiện chí giữa các bên.'),
      p('Nếu thương lượng không giải quyết được tranh chấp trong vòng sáu mươi (60) ngày, các bên đồng ý đưa tranh chấp ra hòa giải không ràng buộc trước khi bắt đầu bất kỳ thủ tục pháp lý nào.'),
    ]),
    section('14', 'Sự kiện bất khả kháng', [
      p('World Wise Learning sẽ không chịu trách nhiệm đối với bất kỳ sự thất bại hoặc chậm trễ nào trong việc thực hiện nghĩa vụ theo các Điều khoản này do các nguyên nhân nằm ngoài khả năng kiểm soát hợp lý của mình, bao gồm thiên tai, thảm họa tự nhiên, đại dịch, hành động của chính phủ, chiến tranh, bất ổn dân sự, sự cố hạ tầng hoặc gián đoạn dịch vụ của bên thứ ba.'),
    ]),
    section('15', 'Sửa đổi Điều khoản', [
      p('Chúng tôi có quyền sửa đổi các Điều khoản này vào bất kỳ thời điểm nào. Chúng tôi sẽ thông báo về những thay đổi trọng yếu qua email (tới địa chỉ gắn với tài khoản của bạn) hoặc bằng thông báo nổi bật trên trang web của Chúng tôi. Việc tiếp tục sử dụng Dịch vụ của Chúng tôi sau thông báo đó đồng nghĩa với việc bạn chấp nhận các Điều khoản đã được cập nhật.'),
    ]),
    section('16', 'Toàn bộ thỏa thuận', [
      p('Các Điều khoản này, cùng với Chính sách quyền riêng tư, Chính sách cookie, Tuyên bố miễn trừ trách nhiệm và mọi thỏa thuận dịch vụ chuyên biệt áp dụng, tạo thành toàn bộ thỏa thuận giữa bạn và World Wise Learning đối với vấn đề được đề cập trong đây, đồng thời thay thế mọi thỏa thuận và hiểu biết trước đó.'),
    ]),
    section('17', 'Thông tin liên hệ', [
      p('Nếu có câu hỏi liên quan đến Điều khoản & Điều kiện này, vui lòng liên hệ:'),
    ]),
  ],
  contact: [
    { label: 'Tổ chức', value: 'World Wise Learning' },
    { label: 'Thương hiệu', value: 'Jurassic English™' },
    { label: 'Website', value: 'www.jurassicenglish.com' },
    { label: 'Liên hệ pháp lý', value: 'legal@worldwiselearning.com' },
    { label: 'Ngày hiệu lực', value: 'Tháng 3 năm 2026' },
    { label: 'Cập nhật lần cuối', value: '21 tháng 3 năm 2026' },
  ],
};

const privacyVi: LegalDocument = {
  title: 'Chính sách quyền riêng tư',
  effectiveDate: 'Tháng 3 năm 2026',
  lastUpdated: '21 tháng 3 năm 2026',
  callout: {
    label: 'QUYỀN RIÊNG TƯ CỦA BẠN RẤT QUAN TRỌNG',
    body: 'World Wise Learning cam kết bảo vệ dữ liệu cá nhân của bạn. Chính sách quyền riêng tư này giải thích chúng tôi thu thập những dữ liệu nào, sử dụng chúng ra sao, và các quyền của bạn theo pháp luật bảo vệ dữ liệu hiện hành, bao gồm UK GDPR, EU GDPR và các quy định quốc tế tương đương.',
  },
  sections: [
    section('1', 'Chúng tôi là ai', [
      p('World Wise Learning ("Chúng tôi", "Của chúng tôi") là bên kiểm soát dữ liệu chịu trách nhiệm đối với dữ liệu cá nhân của bạn. Chúng tôi phát triển và cung cấp chương trình Jurassic English™, các chương trình phát triển chuyên môn và các dịch vụ giáo dục hỗ trợ cho trường học và nhà giáo dục trên phạm vi quốc tế.'),
      table(
        ['Chi tiết', 'Thông tin'],
        [
          ['Bên kiểm soát dữ liệu', 'World Wise Learning'],
          ['Thương hiệu', 'Jurassic English™'],
          ['Website', 'www.jurassicenglish.com'],
          ['Liên hệ', 'legal@worldwiselearning.com'],
        ],
      ),
    ]),
    section('2', 'Dữ liệu chúng tôi thu thập', [
      sub('2.1 Thông tin bạn cung cấp trực tiếp cho chúng tôi', [
        p('Chúng tôi thu thập dữ liệu cá nhân mà bạn trực tiếp cung cấp, bao gồm:'),
        list([
          'Họ tên đầy đủ và chức danh nghề nghiệp;',
          'Địa chỉ email cơ quan và thông tin liên hệ;',
          'Tên và địa chỉ trường học hoặc tổ chức;',
          'Vai trò và mức độ seniority (cho mục đích đào tạo giáo viên và cấp phép);',
          'Thông tin thanh toán và lập hóa đơn (được xử lý an toàn thông qua các đơn vị xử lý thanh toán bên thứ ba);',
          'Hồ sơ liên lạc, bao gồm email, biểu mẫu liên hệ và thư từ hỗ trợ;',
          'Thông tin đăng nhập tài khoản (tên người dùng và mật khẩu được mã hóa) dành cho người dùng nền tảng.',
        ]),
      ]),
      sub('2.2 Thông tin được thu thập tự động', [
        p('Khi bạn sử dụng các nền tảng số của Chúng tôi, Chúng tôi có thể thu thập:'),
        list([
          'Địa chỉ IP và loại trình duyệt;',
          'Loại thiết bị và hệ điều hành;',
          'Các trang đã truy cập, thời lượng phiên và hành vi nhấp chuột;',
          'Nguồn giới thiệu (bạn đến với trang của Chúng tôi bằng cách nào);',
          'Cookie và các công nghệ theo dõi tương tự (xem Chính sách cookie của Chúng tôi để biết đầy đủ chi tiết).',
        ]),
      ]),
      sub('2.3 Thông tin về học sinh', [
        p('Khi Dịch vụ của Chúng tôi được cung cấp cho người chưa thành niên thông qua một thỏa thuận với tổ chức, Chúng tôi chỉ xử lý dữ liệu học sinh thay mặt và theo chỉ dẫn của Khách hàng tổ chức (trường học hoặc tổ chức). Khách hàng tổ chức đóng vai trò bên kiểm soát dữ liệu đối với dữ liệu học sinh; Chúng tôi đóng vai trò bên xử lý dữ liệu. Dữ liệu học sinh chỉ được sử dụng cho mục đích triển khai chương trình và không bao giờ được dùng cho mục đích thương mại.'),
      ]),
      sub('2.4 Dữ liệu thuộc nhóm nhạy cảm đặc biệt', [
        p('Chúng tôi không cố ý thu thập dữ liệu thuộc nhóm nhạy cảm đặc biệt (như dữ liệu sức khỏe, dân tộc hoặc sinh trắc học), trừ khi được yêu cầu rõ ràng theo một thỏa thuận tổ chức cụ thể, với cơ sở pháp lý và biện pháp bảo vệ phù hợp được thiết lập.'),
      ]),
    ]),
    section('3', 'Cách chúng tôi sử dụng dữ liệu của bạn', [
      p('Chúng tôi sử dụng dữ liệu cá nhân của bạn cho các mục đích sau:'),
      list([
        'Cung cấp, duy trì và cải thiện Dịch vụ của Chúng tôi;',
        'Xử lý đăng ký tài khoản và quản lý quyền truy cập của người dùng;',
        'Xử lý thanh toán và quản lý các thỏa thuận hợp đồng;',
        'Liên lạc với bạn về cập nhật dịch vụ, đào tạo và thông tin tài khoản;',
        'Triển khai các chương trình đào tạo giáo viên và phát triển chuyên môn;',
        'Cung cấp hỗ trợ kỹ thuật và phản hồi các yêu cầu liên hệ;',
        'Tuân thủ các nghĩa vụ pháp lý và quy định;',
        'Thực hiện nghiên cứu giáo dục và cải thiện các khung sư phạm của Chúng tôi (chỉ sử dụng dữ liệu đã được ẩn danh hoặc tổng hợp);',
        'Gửi thông tin tiếp thị khi bạn đã cung cấp sự đồng ý rõ ràng (bạn có thể rút lại sự đồng ý bất cứ lúc nào mà không ảnh hưởng đến tính hợp pháp của việc xử lý trước đó).',
      ]),
    ]),
    section('4', 'Cơ sở pháp lý cho việc xử lý', [
      p('Chúng tôi xử lý dữ liệu cá nhân của bạn trên các cơ sở pháp lý sau:'),
      table(
        ['Cơ sở pháp lý', 'Khi nào áp dụng'],
        [
          ['Sự cần thiết theo hợp đồng', 'Việc xử lý là cần thiết để thực hiện hợp đồng với bạn hoặc với tổ chức của bạn.'],
          ['Lợi ích hợp pháp', 'Xử lý nhằm phòng chống gian lận, bảo mật và cải thiện Dịch vụ của Chúng tôi.'],
          ['Sự đồng ý', 'Xử lý dựa trên sự đồng ý tự nguyện, có hiểu biết và cụ thể của bạn (ví dụ: email tiếp thị).'],
          ['Nghĩa vụ pháp lý', 'Việc xử lý được yêu cầu bởi pháp luật hiện hành hoặc cơ quan quản lý.'],
        ],
      ),
    ]),
    section('5', 'Chia sẻ và tiết lộ dữ liệu', [
      p('Chúng tôi không bán dữ liệu cá nhân của bạn. Chúng tôi có thể chia sẻ dữ liệu của bạn với:'),
      list([
        'Nhà cung cấp dịch vụ: các nền tảng bên thứ ba (ví dụ: lưu trữ đám mây, bộ xử lý thanh toán, dịch vụ gửi email) được thuê để vận hành Dịch vụ của Chúng tôi theo các thỏa thuận xử lý dữ liệu;',
        'Khách hàng tổ chức: khi bạn là học sinh hoặc người dùng được đăng ký dưới một tài khoản tổ chức, dữ liệu liên quan có thể được chia sẻ với quản trị viên được chỉ định của tổ chức đó;',
        'Cố vấn chuyên môn: luật sư, kế toán và chuyên gia tuân thủ chịu ràng buộc bởi nghĩa vụ bảo mật nghề nghiệp;',
        'Cơ quan quản lý: khi được yêu cầu theo pháp luật, lệnh tòa hoặc chỉ thị của chính phủ.',
      ]),
      p('Tất cả các bên xử lý dữ liệu bên thứ ba đều bị ràng buộc theo hợp đồng chỉ được xử lý dữ liệu theo chỉ dẫn của Chúng tôi và tuân thủ pháp luật bảo vệ dữ liệu hiện hành.'),
    ]),
    section('6', 'Chuyển dữ liệu quốc tế', [
      p('Là một tổ chức hoạt động quốc tế, dữ liệu của bạn có thể được chuyển tới và xử lý tại các quốc gia ngoài quốc gia cư trú của bạn. Khi dữ liệu được chuyển ra ngoài UK/EU/EEA, Chúng tôi áp dụng các biện pháp bảo vệ phù hợp — bao gồm Standard Contractual Clauses được các cơ quan bảo vệ dữ liệu liên quan phê duyệt — để bảo đảm mức độ bảo vệ tương đương.'),
    ]),
    section('7', 'Lưu giữ dữ liệu', [
      p('Chúng tôi chỉ lưu giữ dữ liệu cá nhân trong thời gian cần thiết để thực hiện các mục đích thu thập, tuân thủ nghĩa vụ pháp lý, giải quyết tranh chấp và thực thi các thỏa thuận của Chúng tôi. Các thời hạn lưu giữ tiêu chuẩn bao gồm:'),
      table(
        ['Loại dữ liệu', 'Thời hạn lưu giữ'],
        [
          ['Dữ liệu tài khoản đang hoạt động', 'Trong thời gian tài khoản tồn tại và 24 tháng sau khi đóng'],
          ['Hồ sơ hợp đồng', '7 năm kể từ khi hợp đồng kết thúc (phục vụ mục đích pháp lý/kiểm toán)'],
          ['Nhật ký liên lạc', '3 năm kể từ lần tương tác cuối cùng'],
          ['Dữ liệu tiếp thị', 'Cho đến khi sự đồng ý bị rút lại'],
          ['Dữ liệu phân tích đã ẩn danh', 'Vô thời hạn (không còn là dữ liệu cá nhân)'],
        ],
      ),
    ]),
    section('8', 'Quyền bảo vệ dữ liệu của bạn', [
      p('Tùy theo pháp luật bảo vệ dữ liệu hiện hành, bạn có các quyền sau đối với dữ liệu cá nhân của mình:'),
      list([
        'Quyền truy cập: yêu cầu một bản sao dữ liệu cá nhân mà Chúng tôi đang nắm giữ về bạn;',
        'Quyền cải chính: yêu cầu sửa dữ liệu không chính xác hoặc chưa đầy đủ;',
        'Quyền xóa: yêu cầu xóa dữ liệu của bạn trong một số trường hợp nhất định;',
        'Quyền hạn chế xử lý: yêu cầu Chúng tôi hạn chế việc xử lý dữ liệu của bạn;',
        'Quyền di chuyển dữ liệu: nhận dữ liệu của bạn ở định dạng có cấu trúc, có thể đọc bằng máy;',
        'Quyền phản đối: phản đối việc xử lý dựa trên lợi ích hợp pháp hoặc cho mục đích tiếp thị trực tiếp;',
        'Quyền rút lại sự đồng ý: khi việc xử lý dựa trên sự đồng ý, rút lại sự đồng ý đó vào bất kỳ thời điểm nào.',
      ]),
      p('Để thực hiện bất kỳ quyền nào trong số này, vui lòng liên hệ legal@worldwiselearning.com. Chúng tôi sẽ phản hồi trong thời hạn pháp luật hiện hành yêu cầu (thông thường là 30 ngày). Chúng tôi có thể yêu cầu bằng chứng xác minh danh tính trước khi xử lý yêu cầu của bạn.'),
    ]),
    section('9', 'Quyền riêng tư của trẻ em', [
      p('Dịch vụ của Chúng tôi hướng tới các tổ chức giáo dục và nhà giáo dục chuyên môn. Khi chương trình của Chúng tôi được cung cấp cho học sinh dưới 18 tuổi, điều này diễn ra thông qua mối quan hệ với tổ chức, và Khách hàng tổ chức chịu trách nhiệm thu thập mọi sự đồng ý cần thiết từ phụ huynh hoặc người giám hộ.'),
      p('Chúng tôi không cố ý thu thập dữ liệu cá nhân trực tiếp từ trẻ em dưới 13 tuổi nếu không có sự đồng ý có thể xác minh được của phụ huynh. Nếu bạn cho rằng Chúng tôi đã vô tình thu thập dữ liệu như vậy, hãy liên hệ ngay với Chúng tôi qua legal@worldwiselearning.com.'),
    ]),
    section('10', 'Bảo mật', [
      p('Chúng tôi triển khai các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ dữ liệu cá nhân của bạn trước việc truy cập trái phép, mất mát ngẫu nhiên, phá hủy hoặc hư hỏng. Các biện pháp bao gồm: mã hóa dữ liệu trong quá trình truyền (TLS/SSL), kiểm soát truy cập, đánh giá an ninh định kỳ, và đào tạo nhân sự về nghĩa vụ bảo vệ dữ liệu.'),
      p('Không có phương thức truyền dữ liệu qua internet hoặc lưu trữ điện tử nào an toàn tuyệt đối. Dù Chúng tôi nỗ lực bảo vệ dữ liệu của bạn, Chúng tôi không thể bảo đảm an toàn tuyệt đối.'),
    ]),
    section('11', 'Cookie', [
      p('Chúng tôi sử dụng cookie và các công nghệ theo dõi tương tự trên các nền tảng của mình. Để biết thông tin chi tiết về các loại cookie mà Chúng tôi sử dụng và cách quản lý tùy chọn của bạn, vui lòng tham khảo Chính sách cookie của Chúng tôi tại www.jurassicenglish.com.'),
    ]),
    section('12', 'Liên kết bên thứ ba', [
      p('Các nền tảng của Chúng tôi có thể chứa liên kết đến các trang web bên thứ ba. Chính sách quyền riêng tư này chỉ áp dụng cho Dịch vụ của Chúng tôi. Chúng tôi khuyến khích bạn xem lại chính sách quyền riêng tư của bất kỳ trang web bên thứ ba nào mà bạn truy cập.'),
    ]),
    section('13', 'Thay đổi đối với Chính sách này', [
      p('Chúng tôi có thể cập nhật Chính sách quyền riêng tư này theo định kỳ. Chúng tôi sẽ thông báo về những thay đổi trọng yếu qua email hoặc bằng thông báo nổi bật trên nền tảng của Chúng tôi. Ngày "Cập nhật lần cuối" ở đầu chính sách phản ánh lần sửa đổi gần nhất.'),
    ]),
    section('14', 'Khiếu nại', [
      p('Nếu bạn có lo ngại về cách Chúng tôi xử lý dữ liệu cá nhân của bạn, vui lòng liên hệ legal@worldwiselearning.com. Bạn cũng có quyền gửi khiếu nại tới cơ quan giám sát liên quan tại khu vực tài phán của mình (ví dụ: UK Information Commissioner’s Office hoặc cơ quan bảo vệ dữ liệu quốc gia tương ứng).'),
    ]),
    section('15', 'Liên hệ với chúng tôi', []),
  ],
  contact: [
    { label: 'Bên kiểm soát dữ liệu', value: 'World Wise Learning' },
    { label: 'Thương hiệu', value: 'Jurassic English™' },
    { label: 'Website', value: 'www.jurassicenglish.com' },
    { label: 'Liên hệ về quyền riêng tư', value: 'legal@worldwiselearning.com' },
    { label: 'Ngày hiệu lực', value: 'Tháng 3 năm 2026' },
    { label: 'Cập nhật lần cuối', value: '21 tháng 3 năm 2026' },
  ],
};

const cookiesVi: LegalDocument = {
  title: 'Chính sách cookie',
  effectiveDate: 'Tháng 3 năm 2026',
  lastUpdated: '21 tháng 3 năm 2026',
  callout: {
    label: 'VỀ CHÍNH SÁCH NÀY',
    body: 'Chính sách cookie này giải thích cookie là gì, World Wise Learning sử dụng chúng như thế nào trên các nền tảng Jurassic English™, và bạn có thể quản lý tùy chọn cookie của mình ra sao.',
  },
  sections: [
    section('1', 'Cookie là gì?', [
      p('Cookie là các tệp văn bản nhỏ được đặt trên thiết bị của bạn (máy tính, máy tính bảng hoặc điện thoại thông minh) khi bạn truy cập một trang web hoặc sử dụng một nền tảng số. Chúng được sử dụng rộng rãi để giúp nền tảng hoạt động hiệu quả, cải thiện trải nghiệm người dùng và cung cấp thông tin vận hành cho đơn vị vận hành trang web.'),
      p('Các công nghệ tương tự — bao gồm web beacon, pixel tag, local storage và session storage — hoạt động tương tự như cookie và được gọi chung là "cookie" trong toàn bộ chính sách này.'),
    ]),
    section('2', 'Cách chúng tôi sử dụng cookie', [
      p('World Wise Learning sử dụng cookie trên các nền tảng của mình để:'),
      list([
        'Kích hoạt chức năng cốt lõi của nền tảng (ví dụ: phiên đăng nhập an toàn và bảo vệ CSRF);',
        'Ghi nhớ tùy chọn và cài đặt của bạn qua các lần truy cập;',
        'Phân tích cách người dùng tương tác với nền tảng để cải thiện khả năng sử dụng và mức độ liên quan của nội dung;',
        'Hỗ trợ cung cấp nội dung giáo dục và lộ trình đào tạo phù hợp;',
        'Đo lường hiệu quả của các chương trình phát triển chuyên môn và truyền thông.',
      ]),
    ]),
    section('3', 'Các loại cookie chúng tôi sử dụng', [
      table(
        ['Loại cookie', 'Thời hạn', 'Mục đích'],
        [
          ['Thực sự cần thiết', 'Phiên', 'Thiết yếu để nền tảng hoạt động. Không thể tắt. Bao gồm token xác thực, quản lý phiên và bảo vệ an ninh (CSRF).'],
          ['Chức năng', 'Lưu lâu dài (tối đa 12 tháng)', 'Ghi nhớ tùy chọn của bạn như ngôn ngữ, khu vực và cài đặt hiển thị để cá nhân hóa trải nghiệm qua các lần truy cập.'],
          ['Hiệu năng / Phân tích', 'Lưu lâu dài (tối đa 24 tháng)', 'Thu thập dữ liệu ẩn danh về lượt truy cập trang, điều hướng và thời gian trên trang để giúp Chúng tôi cải thiện khả năng sử dụng nền tảng và nội dung học tập.'],
          ['Đào tạo & Đánh giá', 'Phiên / Lưu lâu dài', 'Theo dõi việc hoàn thành học phần đào tạo, tiến độ đánh giá và hồ sơ chứng nhận liên quan đến các chương trình phát triển giáo viên.'],
          ['Giao tiếp', 'Lưu lâu dài (tối đa 12 tháng)', 'Ghi nhận việc xác nhận các thông báo quan trọng và trạng thái đăng ký hoặc từ chối nhận thông tin liên lạc.'],
        ],
      ),
    ]),
    section('4', 'Cookie của bên thứ ba', [
      p('Một số cookie trên các nền tảng của Chúng tôi được thiết lập bởi các nhà cung cấp dịch vụ bên thứ ba đáng tin cậy. Chúng có thể bao gồm:'),
      list([
        'Nhà cung cấp phân tích — giúp Chúng tôi hiểu mô hình sử dụng nền tảng thông qua dữ liệu ẩn danh;',
        'Dịch vụ phân phối video và đa phương tiện — để phát nội dung đào tạo và hướng dẫn;',
        'Công cụ truyền thông và khảo sát — để gửi bản tin và thu thập phản hồi;',
        'Bộ xử lý thanh toán — để xử lý giao dịch an toàn.',
      ]),
      p('Các bên thứ ba này hoạt động theo chính sách cookie và quyền riêng tư riêng của họ; Chúng tôi khuyến nghị bạn xem lại các chính sách đó. World Wise Learning không kiểm soát cookie của bên thứ ba và không chịu trách nhiệm đối với thực tiễn dữ liệu của các nhà cung cấp bên thứ ba.'),
    ]),
    section('5', 'Lựa chọn cookie của bạn', [
      sub('5.1 Biểu ngữ đồng ý cookie', [
        p('Trong lần đầu truy cập các nền tảng của Chúng tôi, bạn sẽ được hiển thị một biểu ngữ đồng ý cookie. Bạn có thể chấp nhận tất cả cookie, chỉ chấp nhận các cookie thực sự cần thiết, hoặc quản lý chi tiết tùy chọn của mình. Cookie thực sự cần thiết không thể bị vô hiệu hóa vì chúng là thành phần thiết yếu cho chức năng của nền tảng.'),
      ]),
      sub('5.2 Cài đặt trình duyệt', [
        p('Bạn có thể quản lý và xóa cookie thông qua cài đặt trình duyệt của mình. Hầu hết các trình duyệt hiện đại cho phép bạn:'),
        list([
          'Xem toàn bộ cookie hiện được lưu trên thiết bị của bạn;',
          'Chặn cookie từ một số trang web cụ thể hoặc từ tất cả các trang web;',
          'Xóa toàn bộ cookie vào cuối mỗi phiên duyệt web.',
        ]),
        p('Xin lưu ý rằng việc chặn hoặc xóa cookie có thể làm suy giảm chức năng của các nền tảng của Chúng tôi. Các tính năng như duy trì đăng nhập và cài đặt cá nhân hóa có thể không hoạt động chính xác nếu không có cookie.'),
      ]),
      sub('5.3 Công cụ từ chối', [
        p('Đối với cookie phân tích, bạn có thể sử dụng tiện ích trình duyệt hoặc cơ chế từ chối do từng nhà cung cấp dịch vụ phân tích cung cấp. Liên kết đến các công cụ từ chối này có trong tuyên bố cookie đầy đủ được công bố trên website của Chúng tôi tại www.jurassicenglish.com.'),
      ]),
    ]),
    section('6', 'Cookie và trẻ em', [
      p('Khi các nền tảng chương trình của Chúng tôi được học sinh dưới 18 tuổi truy cập thông qua một thỏa thuận với tổ chức, việc sử dụng cookie được giới hạn ở các nhóm thực sự cần thiết và hiệu năng. Khách hàng tổ chức chịu trách nhiệm bảo đảm đã có sự đồng ý phù hợp của phụ huynh theo yêu cầu pháp luật tại khu vực tài phán của mình.'),
    ]),
    section('7', 'Do Not Track', [
      p('Một số trình duyệt hỗ trợ tín hiệu "Do Not Track" (DNT). Các nền tảng của Chúng tôi hiện chưa phản hồi tín hiệu DNT vì hiện chưa có tiêu chuẩn toàn cầu được chấp nhận rộng rãi quy định cách các nền tảng nên diễn giải tín hiệu này. Chúng tôi sẽ xem xét lại lập trường này khi tiêu chuẩn ngành phát triển.'),
    ]),
    section('8', 'Cập nhật Chính sách này', [
      p('Chúng tôi có thể cập nhật Chính sách cookie này theo thời gian để phản ánh các thay đổi về công nghệ, quy định hoặc thực tiễn vận hành của Chúng tôi. Các thay đổi trọng yếu sẽ được thông báo qua website của Chúng tôi hoặc qua email. Ngày "Cập nhật lần cuối" ở đầu chính sách phản ánh lần sửa đổi gần nhất.'),
    ]),
    section('9', 'Liên hệ với chúng tôi', [
      p('Nếu có câu hỏi về việc Chúng tôi sử dụng cookie hoặc để thực hiện các tùy chọn của bạn, vui lòng liên hệ:'),
    ]),
  ],
  contact: [
    { label: 'Tổ chức', value: 'World Wise Learning' },
    { label: 'Thương hiệu', value: 'Jurassic English™' },
    { label: 'Website', value: 'www.jurassicenglish.com' },
    { label: 'Liên hệ về cookie', value: 'legal@worldwiselearning.com' },
    { label: 'Cập nhật lần cuối', value: '21 tháng 3 năm 2026' },
  ],
};

const accessibilityVi: LegalDocument = {
  title: 'Tuyên bố trợ năng',
  effectiveDate: 'Tháng 3 năm 2026',
  lastUpdated: '21 tháng 3 năm 2026',
  callout: {
    label: 'CAM KẾT CỦA CHÚNG TÔI',
    body: 'World Wise Learning cam kết bảo đảm rằng tất cả các nền tảng số và tài liệu chương trình Jurassic English™ đều có thể được tiếp cận bởi mọi người dùng, bao gồm cả người khuyết tật. Chúng tôi chủ động làm việc để đáp ứng các tiêu chuẩn trợ năng được công nhận trên toàn cầu.',
  },
  sections: [
    section('1', 'Cam kết của chúng tôi về trợ năng', [
      p('World Wise Learning tin rằng việc tiếp cận giáo dục chất lượng cao phải công bằng và bao trùm. Chúng tôi cam kết thiết kế và duy trì các nền tảng số cùng tài liệu chương trình có thể được tiếp cận bởi nhóm đối tượng rộng nhất có thể, bất kể khả năng, khuyết tật hay công nghệ hỗ trợ mà họ sử dụng.'),
      p('Cam kết về trợ năng của Chúng tôi được căn chỉnh theo các khung sau:'),
      list([
        'Web Content Accessibility Guidelines (WCAG) 2.1 Level AA — tiêu chuẩn quốc tế về trợ năng số;',
        'Universal Design for Learning (UDL) — được lồng ghép trong thiết kế chương trình để cung cấp nhiều phương thức tham gia, biểu đạt và thể hiện;',
        'Các nguyên tắc UNESCO Education for All và Education for Sustainable Development (ESD);',
        'Luật và quy định quốc gia, khu vực hiện hành, bao gồm UK Equality Act 2010 và các quy định quốc tế tương đương.',
      ]),
    ]),
    section('2', 'Tình trạng tuân thủ', [
      p('Các nền tảng số của Chúng tôi hiện ở mức tuân thủ một phần với WCAG 2.1 Level AA. "Tuân thủ một phần" nghĩa là một số phần nội dung vẫn chưa hoàn toàn đáp ứng tiêu chuẩn. Chúng tôi đang chủ động khắc phục các khoảng trống đã biết và cải thiện mức độ tuân thủ trên tất cả nền tảng và tài liệu.'),
      table(
        ['Tiêu chí', 'Chi tiết'],
        [
          ['Tiêu chuẩn mục tiêu', 'WCAG 2.1 Level AA'],
          ['Mức độ tuân thủ', 'Tuân thủ một phần'],
          ['Phương pháp đánh giá', 'Rà soát nội bộ bởi nhóm trợ năng của World Wise Learning'],
          ['Ngày đánh giá', '21 tháng 3 năm 2026'],
          ['Lịch rà soát tiếp theo', 'Tháng 3 năm 2027'],
        ],
      ),
    ]),
    section('3', 'Các tính năng trợ năng hiện đang được triển khai', [
      p('Các tính năng trợ năng sau đang hiện diện trên các nền tảng của Chúng tôi:'),
      list([
        'Khả năng điều hướng bằng bàn phím: các chức năng cốt lõi có thể được truy cập mà không cần chuột;',
        'Khả năng tương thích với trình đọc màn hình: HTML ngữ nghĩa và nhãn ARIA hỗ trợ công nghệ hỗ trợ;',
        'Văn bản thay thế: hình ảnh có thuộc tính alt mô tả;',
        'Độ tương phản màu: văn bản và thành phần giao diện được thiết kế để đạt mức tương phản tối thiểu (4.5:1 đối với văn bản thường);',
        'Phóng to văn bản: nội dung tái sắp xếp hợp lý khi cỡ chữ tăng tới 200% mà không cần cuộn ngang;',
        'Phụ đề: nội dung video có phụ đề kín khi khả dụng;',
        'Điều hướng nhất quán: menu điều hướng và cấu trúc trang được giữ nhất quán xuyên suốt;',
        'Nhận diện lỗi: lỗi trong biểu mẫu được nhận diện rõ ràng và mô tả bằng văn bản;',
        'Nhận diện ngôn ngữ: mọi trang đều có thuộc tính ngôn ngữ xác định trong phần đầu trang.',
      ]),
    ]),
    section('4', 'Các hạn chế đã biết', [
      p('Chúng tôi ghi nhận các hạn chế đã biết sau đây và đang chủ động khắc phục:'),
      list([
        'Một số tài liệu chương trình PDF cũ có thể chưa hoàn toàn tương thích với công nghệ trình đọc màn hình. Các tài liệu này đang được cập nhật dần.',
        'Một số công cụ nhúng của bên thứ ba (ví dụ: trình phát video và bài đánh giá tương tác) có thể chưa hoàn toàn tuân thủ WCAG 2.1 AA. Chúng tôi đang làm việc với các nhà cung cấp bên thứ ba để cải thiện mức độ tuân thủ.',
        'Các bảng dữ liệu phức tạp trong một số tài liệu đánh giá có thể cần thêm hỗ trợ điều hướng cho người dùng trình đọc màn hình.',
        'Mô tả âm thanh cho toàn bộ nội dung video hiện chưa có sẵn đồng đều. Vấn đề này đang được xử lý trong quy trình sản xuất nội dung của Chúng tôi.',
      ]),
      p('Nếu bạn gặp một rào cản trợ năng không được liệt kê ở trên, vui lòng liên hệ với Chúng tôi theo mô tả ở Mục 7.'),
    ]),
    section('5', 'Trợ năng của chương trình', [
      p('Tài liệu chương trình Jurassic English™ được thiết kế theo các nguyên tắc Universal Design for Learning (UDL). Các hỗ trợ sau được tích hợp trong khung sư phạm của chương trình Jurassic English™:'),
      sub('5.1 Hỗ trợ cho nhu cầu giáo dục đặc biệt (SEN)', [
        p('Chương trình bao gồm các hỗ trợ được ghi nhận cho các nhóm người học sau:'),
        list([
          'Dyslexia: quy định kéo dài thời gian, linh hoạt về phông chữ (khuyến nghị phông chữ thân thiện với dyslexia), và giảm nhiễu thị giác trên phiếu học tập;',
          'ADHD: chuỗi nhiệm vụ được chia nhỏ, quy trình regulation-before-reasoning, và các khoảng vận động được tích hợp trong cấu trúc bài học;',
          'Autism Spectrum: cấu trúc bài học rõ ràng, dự đoán được, lịch trực quan và câu hỏi siêu nhận thức minh bạch;',
          'Lo âu cao: mức khởi động thấp áp lực, tiếp cận dần dần với nhiệm vụ nói và lựa chọn phản hồi viết riêng tư;',
          'Người học EAL/ESL: hỗ trợ bảng từ song ngữ, sentence stem scaffolds và chuẩn CEFR được điều chỉnh.',
        ]),
      ]),
      sub('5.2 Tài liệu vật lý dễ tiếp cận', [
        p('Các tài liệu chương trình in ấn có thể được cung cấp ở các định dạng dễ tiếp cận sau theo yêu cầu bằng văn bản:'),
        list([
          'Bản chữ lớn (cỡ chữ tối thiểu 16pt);',
          'Bản in độ tương phản cao;',
          'Phiên bản số có thể chỉnh sửa, tương thích với công nghệ hỗ trợ.',
        ]),
        p('Để yêu cầu tài liệu ở định dạng dễ tiếp cận, vui lòng liên hệ legal@worldwiselearning.com.'),
      ]),
    ]),
    section('6', 'Thông số kỹ thuật', [
      p('Các nền tảng của Chúng tôi dựa trên các công nghệ sau để hỗ trợ trợ năng:'),
      list([
        'HTML5 và ARIA (Accessible Rich Internet Applications) cho cấu trúc ngữ nghĩa;',
        'CSS3 cho bố cục phản hồi và thích ứng;',
        'JavaScript cho các tính năng tương tác, kèm chức năng dự phòng cho người dùng tắt JavaScript khi khả thi.',
      ]),
      p('Các nền tảng của Chúng tôi được thiết kế để tương thích với các công nghệ hỗ trợ sau:'),
      list([
        'Trình đọc màn hình: NVDA (Windows), JAWS (Windows), VoiceOver (macOS và iOS), TalkBack (Android);',
        'Nhận diện giọng nói: Dragon NaturallySpeaking;',
        'Phóng đại màn hình: ZoomText và chức năng zoom sẵn có của trình duyệt.',
      ]),
    ]),
    section('7', 'Phản hồi và liên hệ', [
      p('Chúng tôi hoan nghênh phản hồi về khả năng tiếp cận của các nền tảng và tài liệu của mình. Nếu bạn gặp bất kỳ rào cản trợ năng nào, cần nội dung ở định dạng dễ tiếp cận, hoặc muốn báo cáo một vấn đề, vui lòng liên hệ:'),
      table(
        ['Thông tin liên hệ', 'Chi tiết'],
        [
          ['Liên hệ về trợ năng', 'legal@worldwiselearning.com'],
          ['Tổ chức', 'World Wise Learning'],
          ['Website', 'www.jurassicenglish.com'],
          ['Thời gian phản hồi', 'Chúng tôi đặt mục tiêu phản hồi trong vòng 5 ngày làm việc kể từ khi tiếp nhận.'],
        ],
      ),
      p('Chúng tôi xem trọng các phản hồi về trợ năng và sẽ nỗ lực đưa ra cách khắc phục hoặc phương án tiếp cận thay thế trong thời gian phù hợp đối với mọi vấn đề được báo cáo.'),
    ]),
    section('8', 'Khiếu nại chính thức', [
      p('Nếu bạn không hài lòng với phản hồi của Chúng tôi đối với phản hồi trợ năng của mình, bạn có quyền chuyển khiếu nại tới cơ quan thực thi quốc gia hoặc cơ quan bình đẳng có liên quan trong khu vực tài phán của bạn.'),
      p('Đối với người dùng tại Vương quốc Anh: Equality and Human Rights Commission (EHRC) chịu trách nhiệm thực thi pháp luật về bình đẳng. Đối với các vấn đề liên quan đến cơ quan khu vực công và quy định về trợ năng, bạn cũng có thể liên hệ cơ quan giám sát thích hợp. Đối với dịch vụ khu vực tư nhân, bạn có thể tìm kiếm tư vấn pháp lý độc lập.'),
      p('Đối với người dùng tại các khu vực tài phán khác: vui lòng tham khảo cơ quan quốc gia phụ trách quyền của người khuyết tật hoặc cơ quan bình đẳng hiện hành để biết thông tin về quyền và biện pháp khắc phục dành cho bạn.'),
    ]),
    section('9', 'Lịch rà soát', [
      p('Tuyên bố trợ năng này được rà soát hàng năm và được cập nhật để phản ánh các cải tiến liên tục đối với các nền tảng và tài liệu chương trình của Chúng tôi. Chúng tôi cam kết cải tiến liên tục về trợ năng trên toàn bộ sản phẩm và dịch vụ của mình.'),
      table(
        ['Chi tiết', 'Ngày'],
        [
          ['Ngày ban hành', 'Tháng 3 năm 2026'],
          ['Rà soát lần cuối', '21 tháng 3 năm 2026'],
          ['Lịch rà soát tiếp theo', 'Tháng 3 năm 2027'],
        ],
      ),
    ]),
  ],
  contact: [
    { label: 'Liên hệ về trợ năng', value: 'legal@worldwiselearning.com' },
    { label: 'Tổ chức', value: 'World Wise Learning' },
    { label: 'Website', value: 'www.jurassicenglish.com' },
  ],
};

const disclaimerVi: LegalDocument = {
  title: 'Tuyên bố miễn trừ trách nhiệm',
  effectiveDate: 'Tháng 3 năm 2026',
  lastUpdated: '21 tháng 3 năm 2026',
  callout: {
    label: 'THÔNG BÁO QUAN TRỌNG',
    body: 'Vui lòng đọc kỹ Tuyên bố miễn trừ trách nhiệm này trước khi sử dụng bất kỳ tài liệu, dịch vụ hoặc nền tảng nào của Jurassic English™ do World Wise Learning cung cấp. Tuyên bố miễn trừ trách nhiệm này là một phần của Điều khoản & Điều kiện của Chúng tôi và áp dụng cho mọi người dùng.',
  },
  sections: [
    section('1', 'Tuyên bố miễn trừ chung', [
      p('Các thông tin, tài liệu chương trình, dịch vụ và nội dung ("Nội dung") do World Wise Learning cung cấp dưới thương hiệu Jurassic English™ được đưa ra với thiện chí cho mục đích giáo dục. Dù Chúng tôi nỗ lực bảo đảm rằng mọi Nội dung đều chính xác, cập nhật và đạt chất lượng giáo dục cao nhất, World Wise Learning không đưa ra bất kỳ cam đoan hay bảo đảm nào, dù rõ ràng hay ngụ ý, về tính đầy đủ, chính xác, độ tin cậy, sự phù hợp hay khả năng sẵn có của Nội dung cho bất kỳ mục đích cụ thể nào.'),
      p('Mọi sự dựa vào Nội dung của Chúng tôi đều hoàn toàn do bạn tự chịu rủi ro. World Wise Learning sẽ không bị coi là chịu trách nhiệm đối với bất kỳ mất mát, thiệt hại hoặc kết quả bất lợi nào phát sinh trực tiếp hoặc gián tiếp từ việc bạn sử dụng hoặc dựa vào bất kỳ Nội dung nào được cung cấp thông qua Dịch vụ của Chúng tôi.'),
    ]),
    section('2', 'Miễn trừ đối với nội dung giáo dục', [
      p('Tài liệu chương trình Jurassic English™ được thiết kế để hỗ trợ việc học có cấu trúc, có giáo viên điều phối, phù hợp với các khung học thuật được công nhận quốc tế bao gồm CEFR, CCSS và các chuẩn iPGCE/PGCE. Chúng không nhằm phục vụ như một chương trình giáo dục độc lập hoặc thay thế hoàn toàn nếu không có sự giám sát chuyên môn thích hợp của các nhà giáo dục đủ năng lực.'),
      p('Các kết quả học tập được mô tả trong tài liệu chương trình của Chúng tôi thể hiện các mục tiêu và kỳ vọng trong một bối cảnh giảng dạy có cấu trúc. Kết quả của từng học sinh sẽ khác nhau tùy thuộc vào chất lượng triển khai, kiến thức nền trước đó của học sinh, môi trường học tập và bối cảnh giáo dục rộng hơn. World Wise Learning không bảo đảm các kết quả học thuật cụ thể đối với từng người học.'),
      p('Các khung chương trình của Chúng tôi — bao gồm Jurassic Thinking Cycle™, CEIW Structure và các công cụ sư phạm liên quan — là các mô hình giảng dạy độc quyền dựa trên nền tảng nghiên cứu giáo dục đã được thiết lập. Chúng nên được triển khai bởi các nhà giáo dục đủ năng lực, những người thực hiện phán đoán nghề nghiệp khi điều chỉnh tài liệu cho nhóm học sinh và bối cảnh tổ chức cụ thể của mình.'),
    ]),
    section('3', 'Miễn trừ đối với tư vấn chuyên môn', [
      p('Không có nội dung nào trong Dịch vụ, website, ấn phẩm, tài liệu đào tạo hoặc thông tin liên lạc của Chúng tôi cấu thành tư vấn pháp lý, tài chính, y khoa, tâm lý hoặc bất kỳ loại tư vấn chuyên môn nào khác. Nội dung chỉ được cung cấp cho mục đích giáo dục và thông tin chung.'),
      p('Đối với bất kỳ vấn đề pháp lý, tài chính, safeguarding hoặc vấn đề chuyên môn nào khác phát sinh liên quan đến việc cơ sở của bạn sử dụng Dịch vụ của Chúng tôi, bạn nên tìm kiếm tư vấn từ các chuyên gia có trình độ phù hợp. World Wise Learning tuyên bố miễn trừ rõ ràng mọi trách nhiệm phát sinh từ việc dựa vào Nội dung của Chúng tôi như một sự thay thế cho tư vấn chuyên môn.'),
    ]),
    section('4', 'Không bảo đảm', [
      p('Trong phạm vi tối đa pháp luật hiện hành cho phép, World Wise Learning từ chối mọi bảo đảm, dù rõ ràng hay ngụ ý, bao gồm nhưng không giới hạn ở:'),
      list([
        'Các bảo đảm về khả năng bán được hoặc phù hợp cho một mục đích cụ thể;',
        'Các bảo đảm rằng các nền tảng số của Chúng tôi sẽ không bị gián đoạn, không có lỗi, an toàn hoặc không chứa vi-rút hay thành phần gây hại khác;',
        'Các bảo đảm về tính chính xác, đầy đủ hoặc kịp thời của bất kỳ Nội dung nào;',
        'Các bảo đảm rằng lỗi sẽ được khắc phục trong một khung thời gian xác định.',
      ]),
      p('Một số khu vực tài phán không cho phép loại trừ các bảo đảm ngụ ý. Tại các khu vực như vậy, trách nhiệm của Chúng tôi được giới hạn ở mức tối thiểu mà pháp luật hiện hành cho phép.'),
    ]),
    section('5', 'Giới hạn trách nhiệm', [
      p('Trong phạm vi tối đa pháp luật cho phép, World Wise Learning cùng các giám đốc, nhân viên, công ty liên kết, đại diện, bên cấp phép và nhà cung cấp dịch vụ của mình sẽ không chịu trách nhiệm đối với bất kỳ:'),
      list([
        'Thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, hệ quả hoặc mang tính trừng phạt;',
        'Mất lợi nhuận, doanh thu, dữ liệu, thiện chí hoặc cơ hội kinh doanh;',
        'Thiệt hại phát sinh từ việc dựa vào Nội dung hoặc Dịch vụ của Chúng tôi cho việc ra quyết định ở cấp tổ chức hoặc cá nhân;',
        'Thiệt hại phát sinh từ việc truy cập trái phép hoặc thay đổi dữ liệu của bạn trên các nền tảng của Chúng tôi.',
      ]),
      p('Trong mọi trường hợp, tổng mức trách nhiệm cộng gộp của Chúng tôi sẽ không vượt quá tổng số phí mà bạn hoặc tổ chức của bạn đã thanh toán cho World Wise Learning trong mười hai (12) tháng trước sự kiện dẫn tới khiếu nại.'),
      p('Không có nội dung nào trong Tuyên bố miễn trừ trách nhiệm này loại trừ hoặc giới hạn trách nhiệm của Chúng tôi đối với: (a) tử vong hoặc thương tích cá nhân do sơ suất của Chúng tôi; (b) gian lận hoặc trình bày gian dối; hoặc (c) bất kỳ trách nhiệm nào khác mà pháp luật không cho phép loại trừ.'),
    ]),
    section('6', 'Nội dung bên thứ ba và liên kết bên ngoài', [
      p('Các nền tảng và tài liệu của Chúng tôi có thể viện dẫn, liên kết tới hoặc tích hợp các tài nguyên, ấn phẩm, nghiên cứu hoặc website của bên thứ ba. Những viện dẫn như vậy chỉ nhằm mục đích cung cấp thông tin. World Wise Learning không bảo trợ, kiểm soát hay chịu trách nhiệm đối với nội dung, tính chính xác, thực tiễn quyền riêng tư hoặc khả năng tiếp cận của bất kỳ tài nguyên bên thứ ba nào.'),
      p('Việc đưa vào một liên kết hoặc viện dẫn bên thứ ba không ngụ ý sự bảo trợ của World Wise Learning. Bạn truy cập các tài nguyên bên thứ ba theo toàn quyền quyết định và rủi ro của riêng mình.'),
      p('Khi tài liệu chương trình của Chúng tôi viện dẫn các văn bản văn học cụ thể cho mục đích giảng dạy, các văn bản đó vẫn chịu sự điều chỉnh của các điều khoản từ chủ sở hữu bản quyền tương ứng. Giáo viên chịu trách nhiệm bảo đảm rằng mọi việc sao chép văn bản của bên thứ ba đều tuân thủ pháp luật bản quyền hiện hành, các quy định về fair dealing và các thỏa thuận cấp phép liên quan trong khu vực tài phán của mình.'),
    ]),
    section('7', 'Sai sót và thiếu sót', [
      p('Dù Chúng tôi cẩn trọng trong việc xây dựng và rà soát Nội dung, tài liệu chương trình đôi khi vẫn có thể chứa lỗi đánh máy, thiếu chính xác hoặc thiếu sót. World Wise Learning có quyền sửa mọi lỗi vào bất kỳ thời điểm nào mà không cần thông báo trước.'),
      p('Chúng tôi không chấp nhận trách nhiệm đối với bất kỳ sai sót hoặc thiếu sót nào trong Nội dung của mình. Nếu bạn phát hiện lỗi trong bất kỳ tài liệu nào của Chúng tôi, vui lòng liên hệ legal@worldwiselearning.com để Chúng tôi có thể xử lý kịp thời.'),
    ]),
    section('8', 'Miễn trừ về quy định và khu vực tài phán', [
      p('Các khung chương trình Jurassic English™ được phát triển có tham chiếu đến các chuẩn giáo dục quốc tế bao gồm CEFR, CCSS và iPGCE/PGCE. Tuy nhiên, việc tuân thủ các yêu cầu chương trình quốc gia cụ thể, chuẩn quy định hoặc chính sách tổ chức trong khu vực tài phán của bạn là trách nhiệm của Khách hàng tổ chức và các nhà giáo dục đủ năng lực trực tiếp triển khai chương trình.'),
      p('World Wise Learning không bảo đảm rằng chương trình hoặc Dịch vụ của Chúng tôi tuân thủ các yêu cầu quy định cụ thể của bất kỳ cơ quan giáo dục quốc gia hay khu vực nào. Khách hàng tổ chức nên tự thực hiện quá trình thẩm định để bảo đảm tính phù hợp trong bối cảnh quy định và văn hóa của mình.'),
    ]),
    section('9', 'Thông báo về sở hữu trí tuệ', [
      p('Mọi khung phương pháp, phương pháp luận, nhãn hiệu và nội dung thương hiệu độc quyền có trong tài liệu của Chúng tôi đều là tài sản sở hữu trí tuệ của World Wise Learning. Tuyên bố miễn trừ trách nhiệm này không chuyển giao bất kỳ quyền sở hữu trí tuệ nào cho người dùng. Việc sao chép, phân phối hoặc khai thác thương mại Nội dung của Chúng tôi khi chưa được phép là hành vi bị nghiêm cấm và có thể dẫn tới trách nhiệm dân sự và/hoặc hình sự.'),
      p('Jurassic English™, Jurassic Thinking Cycle™ và mọi nhãn liên quan là nhãn hiệu đã đăng ký hoặc chưa đăng ký của World Wise Learning. Mọi quyền được bảo lưu trên phạm vi toàn cầu.'),
    ]),
    section('10', 'Thay đổi đối với Tuyên bố miễn trừ trách nhiệm này', [
      p('World Wise Learning có quyền sửa đổi Tuyên bố miễn trừ trách nhiệm này vào bất kỳ thời điểm nào. Những thay đổi trọng yếu sẽ được thông báo qua website của Chúng tôi hoặc qua email tới người dùng đã đăng ký. Việc bạn tiếp tục sử dụng Dịch vụ của Chúng tôi sau thông báo đó cấu thành sự chấp nhận của bạn đối với Tuyên bố miễn trừ trách nhiệm đã được cập nhật.'),
    ]),
    section('11', 'Thông tin liên hệ', [
      p('Nếu bạn có câu hỏi liên quan đến Tuyên bố miễn trừ trách nhiệm này hoặc muốn báo cáo một vấn đề trong bất kỳ Nội dung nào của Chúng tôi, vui lòng liên hệ:'),
    ]),
  ],
  contact: [
    { label: 'Tổ chức', value: 'World Wise Learning' },
    { label: 'Thương hiệu', value: 'Jurassic English™' },
    { label: 'Website', value: 'www.jurassicenglish.com' },
    { label: 'Liên hệ pháp lý', value: 'legal@worldwiselearning.com' },
    { label: 'Ngày hiệu lực', value: 'Tháng 3 năm 2026' },
    { label: 'Cập nhật lần cuối', value: '21 tháng 3 năm 2026' },
  ],
};

const viLegalDocuments: Record<string, LegalDocument> = {
  '/legal/terms': termsVi,
  '/legal/privacy': privacyVi,
  '/legal/cookies': cookiesVi,
  '/legal/accessibility': accessibilityVi,
  '/legal/disclaimer': disclaimerVi,
};

export function getLocalizedLegalDocument(pathname: string, locale: Locale): LegalDocument | null {
  if (locale === 'vi') {
    return viLegalDocuments[pathname] ?? null;
  }

  return legalDocuments[pathname] ?? null;
}

export function getLegalPageChrome(locale: Locale) {
  return locale === 'vi' ? viLegalPageChrome : {
    backCta: 'Back to Jurassic English',
    eyebrow: 'Legal',
    effectiveDate: 'Effective Date',
    lastUpdated: 'Last Updated',
    copyright: '© 2026 World Wise Learning. All rights reserved.',
  };
}
