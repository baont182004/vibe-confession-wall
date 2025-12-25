const supportMessages = [
  {
    question: 'Hôm nay bạn đã dừng lại để thở chưa?',
    comfort: 'Bạn đã đi được một đoạn dài dù không ai biết điều đó.',
    action: 'Hít thở chậm 4 nhịp sâu và cảm nhận bàn chân trên sàn trong 30 giây.',
  },
  {
    question: 'Có điều gì khiến bạn cẩn thận hơn những ngày trước không?',
    comfort: 'Vững vàng là khi bạn vẫn đứng lên dù chông chênh.',
    action: 'Viết ra 1 điều bạn làm tốt trong ngày hôm nay.',
  },
  {
    question: 'Bạn đang ở trạng thái “nên” nhiều hơn “được” sao?',
    comfort: 'Đôi khi cho phép mình “ngừng lại” là liều thuốc quý.',
    action: 'Tắt thông báo điện thoại trong 30 giây và lắng nghe im lặng.',
  },
  {
    question: 'Có ai đó khiến bạn cảm thấy nhẹ hơn khi trò chuyện không?',
    comfort: 'Bạn không cần phải nói quá nhiều để được hiểu.',
    action: 'Tặng một lời khen thầm cho ai đó trong đầu.',
  },
  {
    question: 'Bạn đang mang theo bao nhiêu “muốn làm” mà quên nghỉ?',
    comfort: 'Đôi khi yêu cầu nghỉ ngơi là cách chăm sóc bản thân mạnh mẽ nhất.',
    action: 'Đặt hẹn 10 phút làm việc chậm lại sau đây.',
  },
  {
    question: 'Những tiếng vọng bên trong bạn hôm nay thế nào?',
    comfort: 'Bạn có quyền không trả lời hết mọi câu hỏi ngay lập tức.',
    action: 'Viết “tôi ổn” ba lần rồi thở ra thật nhẹ.',
  },
  {
    question: 'Có điều gì bạn từng muốn chia sẻ nhưng chưa tìm được ai để tin?',
    comfort: 'Không cần giải thích để xứng đáng được lắng nghe.',
    action: 'Gọi hay nhắn một người bạn dù chỉ nói “tớ nghĩ về cậu”.',
  },
  {
    question: 'Bạn có đang cảm thấy quá tải vì phải thể hiện bản thân?',
    comfort: 'Bạn là đủ ngay cả khi không hoàn hảo.',
    action: 'Đứng dậy, duỗi người và mỉm cười với chính mình trong gương.',
  },
  {
    question: 'Mỗi ngày bạn có thể làm gì để yêu thương hơn?',
    comfort: 'Những bước nhỏ tích tụ thành sức mạnh lớn.',
    action: 'Ngồi xuống, đặt tay lên tim và đếm 4 nhịp thở.',
  },
  {
    question: 'Bạn có đang cố gắng quá nhiều để người khác yên lòng không?',
    comfort: 'Kể cả khi bạn chọn an toàn, bạn vẫn đáng tin.',
    action: 'Viết ra một câu “Tôi ổn với cảm xúc của mình”.',
  },
  {
    question: 'Bạn đã chấp nhận hôm nay là một ngày khác chưa?',
    comfort: 'Thành công không chỉ hiện ra ở kết quả, mà còn ở quyết định không bỏ cuộc.',
    action: 'Gõ nhẹ 3 lần vào bàn và nói “Tôi đang ở đây”.',
  },
  {
    question: 'Có điều gì khiến bạn bất an khi nhìn lại hôm qua?',
    comfort: 'Thất bại chỉ là dấu chấm chúng ta tạm dừng, không phải dấu chấm hết.',
    action: 'Viết ra 1 điều bạn đã học được trong ngày.',
  },
  {
    question: 'Bạn có đang tin rằng mình phải “mạnh” 24/7?',
    comfort: 'Cho phép mình yếu đuối cũng là cách mạnh mẽ.',
    action: 'Xoa nhẹ thái dương, hít thật sâu 3 lần.',
  },
  {
    question: 'Bạn đang lắng nghe mình đủ chưa?',
    comfort: 'Bạn được quyền im lặng giữa những thứ hỗn độn.',
    action: 'Viết 1 từ mô tả tâm trạng hiện tại và treo nó trong đầu.',
  },
  {
    question: 'Bạn có đang mong chờ kết quả từ người khác?',
    comfort: 'Niềm tin lớn nhất nên dành cho bản thân trước tiên.',
    action: 'Nhắm mắt, nhớ về khoảnh khắc bạn được ai đó ôm thật chặt.',
  },
  {
    question: 'Điều nhỏ nào khiến bạn cười gần đây?',
    comfort: 'Những niềm vui nhỏ là nền tảng cho sự hồi phục.',
    action: 'Gửi một icon yêu thương cho chính bạn trong tin nhắn.',
  },
  {
    question: 'Bạn đã từng tự hỏi “mình đã làm đủ chưa”?',
    comfort: 'Đủ là khi bạn vẫn đứng ở đây và tiếp tục.',
    action: 'Viết nó ra giấy và gấp lại, giữ cho riêng mình.',
  },
  {
    question: 'Bạn có cảm thấy cô đơn giữa đám đông?',
    comfort: 'Cảm giác đó không có nghĩa là bạn đang đơn độc mãi mãi.',
    action: 'Hít sâu, đếm tới 5 và thở ra chậm.',
  },
  {
    question: 'Bạn có đang nỗ lực mà không nhìn thấy tín hiệu đang tới?',
    comfort: 'Tín hiệu có thể đang ở đâu đó bạn chưa để ý.',
    action: 'Nhìn ra một khung cửa sổ, quan sát chi tiết nhỏ bạn chưa từng thấy.',
  },
  {
    question: 'Ai đó đã từng hiểu bạn mà không cần bạn nói hết?',
    comfort: 'Bạn luôn có thể tìm thấy người đó trong chính mình.',
    action: 'Viết 1 câu “Tôi cho phép mình yên”.',
  },
  {
    question: 'Bạn đã lắng nghe cơ thể ngày hôm nay chưa?',
    comfort: 'Cơ thể có thể cho bạn biết khi nào nên chậm lại.',
    action: 'Nâng tay lên cao, thả xuống, đồng bộ với nhịp thở.',
  },
  {
    question: 'Bạn có đang so sánh mình với người khác?',
    comfort: 'So sánh chỉ khiến bản thân mất tập trung với cuộc hành trình riêng.',
    action: 'Viết ra điều bạn làm tốt nhất mà không cần xin phép ai.',
  },
  {
    question: 'Bạn có đang giữ một bí mật làm mình nặng nề?',
    comfort: 'Bạn không cần mang tất cả một mình.',
    action: 'Gửi một dòng nhắn bạn chưa từng nói ra, dù chỉ với chính mình.',
  },
  {
    question: 'Bạn có đang cần “giấy phép nghỉ ngơi” không?',
    comfort: 'Bạn không cần ai cho phép để chăm sóc mình.',
    action: 'Đặt chế độ “không làm gì” trong 30s và chỉ lắng nghe nhịp tim.',
  },
];

export default supportMessages;
