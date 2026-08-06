# BÀI THUYẾT TRÌNH CHÍNH THỨC — PC MASTER BUILDER
### Cuộc thi Khởi nghiệp & Sáng tạo HUIT 2026 | Bảng Học Sinh THPT

---

Kính thưa Ban Giám khảo và quý thầy cô!

Em tên là Khánh Sơn, cùng bạn Quốc An đại diện cho nhóm học sinh trường THPT Nguyễn Công Trứ, thành phố Hồ Chí Minh, xin phép được trình bày dự án **PC Master Builder** — nền tảng phòng lab mô phỏng lắp ráp máy tính 3D và AI đầu tiên tại Việt Nam dành riêng cho học sinh phổ thông.

---

Thưa quý vị, chúng em muốn bắt đầu bằng một câu hỏi rất thực tế: *Học sinh chúng em học phần cứng máy tính như thế nào?*

Theo Chương trình GDPT 2018 mới, môn Tin học Lớp 10 bắt buộc học sinh phải nắm vững cấu tạo và quy trình lắp ráp máy tính. Nhưng thực tế, hơn **85% trường THPT trên cả nước không có phòng thực hành phần cứng**, bởi vì chi phí trang bị một phòng lab với 40 bộ máy thật lên tới hơn **800 triệu đồng** — một con số quá lớn so với ngân sách của hầu hết các trường. Chưa kể, mỗi lần học sinh thực hành tháo lắp thật, một chiếc socket CPU bị gãy chân là thiệt hại ngay 3 đến 5 triệu đồng, chưa kể rủi ro cháy nổ do tĩnh điện.

Kết quả là, chúng em — những học sinh lớp 10 — chỉ được "học chay" qua những hình vẽ 2D khô khan trong sách giáo khoa. Ra ngoài tự mua máy tính học tập, chúng em và phụ huynh hoàn toàn bị bất đồng thông tin và rất dễ bị nhân viên cửa hàng đẩy giá linh kiện tồn kho.

Đó là ba nỗi đau thực tế mà PC Master Builder ra đời để giải quyết triệt để.

---

Vì thế, nhóm chúng em đã tự tay xây dựng **PC Master Builder** — một phòng lab thực hành ảo hoàn toàn trên nền Web, miễn phí 100%, không cần cài đặt, không cần mua bất kỳ thiết bị nào.

Điểm đặc biệt và độc đáo nhất mà nhóm em tự làm được là công nghệ **Hand-Tracking — nhận diện cử chỉ tay qua Webcam**. Bạn học sinh chỉ cần giơ bàn tay trước camera laptop là có thể co ngón tay để bốc cây RAM, xoay GPU 360 độ và gắn từng linh kiện vào bo mạch chủ như ngoài đời thực — mà **không cần mua kính VR đắt tiền**. Đây là ứng dụng thư viện MediaPipe của Google, xử lý AI hoàn toàn trên trình duyệt, không gửi video về máy chủ, bảo mật tuyệt đối và chạy mượt ngay cả trên máy tính văn phòng cũ kỹ của các trường.

Bên cạnh đó, chúng em còn tích hợp **Trợ lý AI Guru** hoạt động như một giáo viên phụ tá ảo, tự động kiểm tra tính tương thích socket CPU với Mainboard, tính tổng công suất TDP của cả bộ máy và cảnh báo ngay lập tức khi học sinh lắp sai. Đặc biệt, chức năng **Chống Chặt Chém Giá** kết nối API các đại lý lớn như Phong Vũ, GearVN để hiển thị giá thị trường thật, bảo vệ phụ huynh khi đi mua linh kiện cho con.

Toàn bộ hệ thống còn là một **LMS đa vai trò hoàn chỉnh**: Học sinh học theo lộ trình cá nhân hóa và nhận chứng chỉ xác thực bằng mã QR. Giáo viên có Dashboard quản lý lớp, tự tạo bài giảng và giao bài tập. Phụ huynh theo dõi thời gian thực tiến độ học của con. Tất cả bảo mật phân quyền tuyệt đối bằng Supabase Row Level Security chuẩn GDPR.

---

Đây không phải dự án lý thuyết suông. Chúng em đã đưa ứng dụng chạy thực tế tại **pc-master-lms.vercel.app** và tổ chức thử nghiệm trực tiếp trên **76 học sinh lớp 10A1 và 10C9** tại trường trong 4 tuần liên tục.

Kết quả đo lường định lượng thực sự thuyết phục: Điểm thi thực hành của các bạn **tăng trung bình 28%**. Tỷ lệ hoàn thành toàn bộ bài học đạt **94%**. Và **92% học sinh phản hồi** rằng học với PC Master Builder dễ hiểu và thú vị hơn hẳn phương pháp truyền thống.

Đặc biệt, dự án của nhóm học sinh chúng em đóng góp thiết thực vào **10 Mục tiêu Phát triển Bền vững của Liên Hợp Quốc**:

Về **SDG 4 — Giáo dục chất lượng**: Chúng em đưa bài học phần cứng 3D chuẩn SGK đến tay mọi học sinh dù trường có phòng lab hay không. Về **SDG 9 — Công nghiệp và Đổi mới sáng tạo**: Chúng em tiên phong ứng dụng WebGL, Computer Vision và Cloud AI vào giáo dục phổ thông Việt Nam. Về **SDG 12 — Tiêu dùng có trách nhiệm**: Không còn linh kiện nào bị hỏng vì thực hành sai — chúng em xóa bỏ 100% rác thải điện tử E-waste. Về **SDG 8 — Việc làm tốt**: Module Career Build định hướng học sinh vào ngành Vi mạch và Bán dẫn đang thiếu nhân lực trầm trọng. Về **SDG 10 — Giảm bất bình đẳng**: Học sinh vùng sâu vùng xa không có phòng lab vẫn học được như học sinh thành phố. Cùng với đó là **SDG 13** giảm dấu chân carbon, **SDG 5** bình đẳng giới trong STEM cho nữ sinh, **SDG 3** loại bỏ hoàn toàn nguy cơ giật điện và tai nạn, **SDG 11** đóng góp vào mô hình trường học thông minh, và **SDG 17** liên kết nhà trường — nhà trường — đại lý — nền tảng công nghệ.

---

Về mô hình phát triển bền vững, là học sinh nên chúng em hiểu rõ tâm lý các bạn. Chúng em chọn mức giá **Gói Pro chỉ 20.000 VNĐ mỗi tháng** — đúng bằng giá một ly trà sữa bình dân — để bạn nào cũng có thể tự đăng ký. Song song đó, chúng em phát triển **Gói B2B LMS cho nhà trường** với giá 15 đến 25 triệu đồng mỗi năm, giúp nhà trường tiết kiệm hàng trăm triệu tiền mua máy thật trong khi học sinh vẫn được học đầy đủ.

Nhờ hạ tầng Cloud Serverless tinh gọn, chi phí duy trì hệ thống chỉ khoảng **2 triệu đồng mỗi tháng**. Dự án đạt điểm hòa vốn chỉ với **250 học sinh trả phí** và đạt biên lợi nhuận ròng trên **75%** — hoàn toàn khả thi để tự vận hành lâu dài mà không phụ thuộc tài trợ bên ngoài.

Nếu may mắn nhận được 50 triệu tiền thưởng từ cuộc thi HUIT, chúng em sẽ dành **40% nâng cấp server AI và mô hình 3D**, **40% giới thiệu sản phẩm đến 10 trường THPT bạn** tại TP.HCM, và **20% đăng ký bản quyền tác giả chính thức** để bảo hộ sản phẩm.

---

Về đội ngũ thực hiện, dưới sự hướng dẫn tận tình của **Cô Đoàn Thụy Kim Phượng** và **Thầy Trần Minh Phụng**, toàn bộ mã nguồn Next.js, mô hình 3D WebGL và thuật toán AI đều do **4 học sinh nhóm em tự tay lập trình 100%** mà không thuê ngoài một dòng code nào. Nhóm em làm việc theo mô hình Agile, quản lý code qua Git branching chuyên nghiệp và đã hoàn thành hơn **42 task công việc qua 3 Sprint phát triển**. Chúng em cũng đã hoàn tất hồ sơ **đăng ký Bản quyền Tác giả** cho phần mềm để bảo hộ sản phẩm "Make-in-HUIT" này.

---

Thưa Ban Giám khảo và quý thầy cô, PC Master Builder của chúng em không chỉ là một sản phẩm công nghệ giáo dục — đây là **câu trả lời của chính những học sinh đang chịu thiệt thòi** cho bài toán mà hệ thống giáo dục chưa giải được.

Chúng em tin rằng mỗi học sinh Việt Nam, dù ở thành phố hay vùng xa, đều xứng đáng được học phần cứng máy tính bằng công nghệ 3D hiện đại nhất — và PC Master Builder chính là cách chúng em biến điều đó thành sự thật.

**Em xin chân thành cảm ơn Ban Giám khảo và quý thầy cô đã lắng nghe. Nhóm em sẵn sàng trả lời mọi câu hỏi phản biện!**

---
*Trải nghiệm ngay: **pc-master-lms.vercel.app***
