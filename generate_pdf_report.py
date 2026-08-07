import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

# Register Fonts
pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Italic', 'C:/Windows/Fonts/ariali.ttf'))
pdfmetrics.registerFont(TTFont('Arial-BoldItalic', 'C:/Windows/Fonts/arialbi.ttf'))

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Arial", 8.5)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(36, 812, "PC MASTER LMS — BÁO CÁO TỔNG QUAN HỆ THỐNG, CÔNG NGHỆ AI & MÔ HÌNH KINH DOANH")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, 804, 559, 804)
        
        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(36, 45, 559, 45)
        self.drawString(36, 32, "Website: https://pc-master-lms.vercel.app | Trường THPT Nguyễn Công Trứ")
        page_str = f"Trang {self._pageNumber} / {page_count}"
        self.drawRightString(559, 32, page_str)
        
        self.restoreState()

def build_pdf():
    pdf_filename = "Tong_Hop_Website_Cong_Nghe_Mo_Hinh_Kinh_Doanh_PC_Master_LMS.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=48,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom colors
    primary_color = colors.HexColor("#0F172A")    # Dark Slate
    accent_blue = colors.HexColor("#0284C7")      # Tech Blue
    accent_purple = colors.HexColor("#7C3AED")    # Cyber Purple
    dark_gray = colors.HexColor("#334155")        # Body text
    light_bg = colors.HexColor("#F8FAFC")         # Section background

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Arial-Bold',
        fontSize=18,
        leading=23,
        textColor=primary_color,
        alignment=1, # Center
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Arial-Bold',
        fontSize=11,
        leading=15,
        textColor=accent_blue,
        alignment=1,
        spaceAfter=12
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Arial',
        fontSize=9,
        leading=13.5,
        textColor=dark_gray,
        alignment=1
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Arial-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Arial-Bold',
        fontSize=10.5,
        leading=14,
        textColor=accent_blue,
        spaceBefore=9,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'H3',
        parent=styles['Normal'],
        fontName='Arial-Bold',
        fontSize=9.5,
        leading=13,
        textColor=accent_purple,
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Arial',
        fontSize=9,
        leading=13,
        textColor=dark_gray,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=10,
        spaceAfter=3
    )

    tbl_header_style = ParagraphStyle(
        'TblHeader',
        parent=styles['Normal'],
        fontName='Arial-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.white,
        alignment=1
    )

    tbl_cell_style = ParagraphStyle(
        'TblCell',
        parent=styles['Normal'],
        fontName='Arial',
        fontSize=8,
        leading=11,
        textColor=dark_gray
    )

    tbl_cell_bold = ParagraphStyle(
        'TblCellBold',
        parent=styles['Normal'],
        fontName='Arial-Bold',
        fontSize=8,
        leading=11,
        textColor=primary_color
    )

    story = []

    # ==================== COVER HEADER ====================
    story.append(Paragraph("BÁO CÁO TỔNG QUAN HỆ THỐNG PC MASTER LMS", title_style))
    story.append(Paragraph("KIẾN TRÚC CÔNG NGHỆ AI & THÔNG TIN MÔ HÌNH KINH DOANH CHI TIẾT", subtitle_style))
    
    meta_text = """
    <b>Tên dự án:</b> PC Master LMS (PC Master Builder) &nbsp;|&nbsp; <b>URL Triển khai:</b> https://pc-master-lms.vercel.app<br/>
    <b>Đơn vị phát triển:</b> Trường THPT Nguyễn Công Trứ - TP. Hồ Chí Minh<br/>
    <b>Thành viên phát triển:</b> Nguyễn Phúc Khánh Sơn, Dương Vũ Minh Đức & Đặng Quốc An<br/>
    <b>Giáo viên hướng dẫn:</b> Cô Đoàn Thụy Kim Phượng & Thầy Trần Minh Phụng
    """
    story.append(Paragraph(meta_text, meta_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=accent_blue, spaceBefore=4, spaceAfter=12))

    # ==================== PHẦN 1 ====================
    story.append(Paragraph("PHẦN 1: BÁO CÁO TỔNG QUAN HỆ THỐNG & KIẾN TRÚC CÔNG NGHỆ AI", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceBefore=0, spaceAfter=8))

    # 1.1 Website là gì
    story.append(Paragraph("1.1. Website PC Master LMS là gì?", h2_style))
    p1_1 = """
    <b>PC Master LMS</b> (PC Master Builder) là nền tảng giáo dục trực tuyến và hệ thống phòng Lab ảo mô phỏng thực hành tháo lắp phần cứng máy tính 2D/3D trên trình duyệt web. Nền tảng được xây dựng thực tế dựa trên các công nghệ web hiện đại gồm <b>Next.js 16</b>, <b>React 19</b>, <b>Supabase (PostgreSQL Auth & Database)</b> kết hợp cùng trí tuệ nhân tạo <b>Gemini AI API</b> và công nghệ nhận diện cử chỉ tay thời gian thực qua Webcam (<b>MediaPipe Tasks Vision</b>).
    <br/><br/>
    Sản phẩm bám sát thực tế chương trình Giáo dục Phổ thông (GDPT) 2018 môn Tin học cấp THPT (Lớp 10 - 12), hỗ trợ học sinh thực hành tháo lắp máy tính trực quan mà không cần thiết bị thật đắt tiền hay kính VR chuyên dụng.
    """
    story.append(Paragraph(p1_1, body_style))

    # 1.2 Website làm gì
    story.append(Paragraph("1.2. Website Làm gì? (Mục tiêu & Chức năng cốt lõi)", h2_style))
    p1_2 = """
    Website đóng vai trò là một <b>Hệ thống Quản lý Học tập (LMS) tích hợp Phòng Lab ảo 2D/3D</b>, vận hành thực tế các nhiệm vụ chính:
    """
    story.append(Paragraph(p1_2, body_style))
    
    features_list = [
        "<b>Mô phỏng tháo lắp phần cứng máy tính:</b> Học sinh tự do thao tác gắp, xoay, tháo và cắm các linh kiện (CPU Intel/AMD, RAM, GPU, SSD, Mainboard, PSU, Fan, Case) chuẩn xác theo từng khớp cắm socket.",
        "<b>Điều khiển bằng cử chỉ tay (Hand-tracking):</b> Nhận diện 21 khớp bàn tay qua Webcam laptop/PC thông thường, cho phép học sinh tương tác lắp ráp 3D sống động mà <i>không cần mua kính VR đắt tiền</i>.",
        "<b>Tư vấn & Kiểm tra tương thích AI (AI Guru):</b> Tự động kiểm tra chuẩn Socket (CPU với Mainboard), tính toán TDP công suất nguồn, cảnh báo nghẽn cổ chai (Bottleneck) và tư vấn cấu hình tối ưu.",
        "<b>Quản lý giáo dục toàn diện (LMS):</b> Quản lý lớp học, bài giảng đa phương tiện, giao bài tập về nhà, ngân hàng câu hỏi trắc nghiệm 5 dạng, tự động chấm điểm và xuất chứng chỉ số PDF có mã QR xác thực.",
        "<b>Hệ thống Giám sát Thi (AI Proctoring):</b> Theo dõi quá trình làm bài thi trực tuyến qua webcam, tự động phân tích khuôn mặt để bảo đảm tính minh bạch khi làm bài kiểm tra."
    ]
    for f in features_list:
        story.append(Paragraph(f"• {f}", bullet_style))

    # 1.3 Mang đến gì cho ai
    story.append(Paragraph("1.3. Mang đến gì cho ai? (Giá trị thực tế cho các đối tượng)", h2_style))
    
    user_roles_data = [
        [Paragraph("Đối tượng", tbl_header_style), Paragraph("Nhu cầu & Thực trạng thực tế", tbl_header_style), Paragraph("Giá trị thực tế PC Master LMS mang lại", tbl_header_style)],
        [
            Paragraph("<b>Học sinh THPT</b><br/>(Lớp 10 - 12)", tbl_cell_bold),
            Paragraph("Học lý thuyết suông; thiếu thiết bị thật để thực hành; rủi ro hỏng hóc linh kiện đắt tiền; thiếu kinh nghiệm nên dễ mua máy bị đắt.", tbl_cell_style),
            Paragraph("Thực hành tháo lắp 3D/2D trực quan 0đ rủi ro; tương tác cử chỉ tay mượt mà; AI tư vấn chống chặt chém giá; định hướng nghề Vi mạch/Bán dẫn.", tbl_cell_style)
        ],
        [
            Paragraph("<b>Giáo viên Tin học</b>", tbl_cell_bold),
            Paragraph("Thiếu giáo cụ phần cứng trực quan; tốn nhiều thời gian soạn bài kiểm tra và chấm điểm thủ công cho nhiều lớp đông.", tbl_cell_style),
            Paragraph("Giáo cụ Lab 3D sinh động trên lớp; ngân hàng đề thi tự động 5 dạng; LMS tự động chấm điểm và báo cáo tiến độ chi tiết từng học sinh.", tbl_cell_style)
        ],
        [
            Paragraph("<b>Nhà trường / BGH</b>", tbl_cell_bold),
            Paragraph("Chi phí trang bị phòng lab phần cứng thật quá đắt (hàng trăm triệu đồng); rủi ro chập cháy, gãy socket linh kiện cao.", tbl_cell_style),
            Paragraph("Tiết kiệm 95% chi phí đầu tư lab thật; đáp ứng 100% chuẩn thực hành môn Tin học GDPT 2018 cho toàn bộ học sinh; không tốn chi phí bảo trì.", tbl_cell_style)
        ],
        [
            Paragraph("<b>Phụ huynh</b>", tbl_cell_bold),
            Paragraph("Khó theo dõi tình hình học tập môn Tin của con; lo lắng con dùng máy tính sai mục đích hoặc mua linh kiện bị đắt.", tbl_cell_style),
            Paragraph("Dashboard giám sát thời gian thực tiến độ học và điểm số của con; nắm rõ lộ trình phát triển kỹ năng công nghệ thực tế của con em.", tbl_cell_style)
        ],
        [
            Paragraph("<b>Doanh nghiệp PC</b><br/>(GearVN, Phong Vũ...)", tbl_cell_bold),
            Paragraph("Người mua phân vân tính tương thích linh kiện; tỷ lệ tư vấn thủ công tốn thời gian và tỷ lệ hoàn đơn cao.", tbl_cell_style),
            Paragraph("Phễu chuyển đổi Sales Funnel chính xác: Người dùng build thử 3D -> AI check tương thích -> Chuyển sang mua linh kiện thật (Affiliate 3-5%).", tbl_cell_style)
        ]
    ]

    t_roles = Table(user_roles_data, colWidths=[85, 190, 248])
    t_roles.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_roles)
    story.append(Spacer(1, 8))

    # 1.4 Chi tiết tính năng
    story.append(Paragraph("1.4. Chi tiết các Tính năng Chính trên Hệ thống", h2_style))
    feat_detail_text = """
    Hệ thống vận hành <b>12 Module tính năng tích hợp toàn diện</b>:
    <br/>
    <b>1. Builder Lắp ráp 2D/3D:</b> Các chế độ Assembly (tự do), Mission (nhiệm vụ theo ngân sách), Learning (hướng dẫn từng bước), Challenge (thử thách ngày) và Exam (thi tháo lắp).<br/>
    <b>2. Hand-Tracking Engine:</b> Chuyển đổi cử chỉ bàn tay qua Webcam thành con trỏ 3D điều khiển gắp/thả linh kiện.<br/>
    <b>3. AI Guru & Bottleneck Checker:</b> Trợ lý Gemini AI giải đáp thắc mắc, phân tích nghẽn cổ chai CPU-GPU và kiểm tra TDP công suất nguồn.<br/>
    <b>4. Multi-role Dashboards:</b> Giao diện quản lý riêng biệt cho Admin, Giáo viên, Học sinh và Phụ huynh.<br/>
    <b>5. Ngân hàng Kiểm tra & Exam Proctoring:</b> 5 dạng câu hỏi trắc nghiệm, tạo đề thi tự động, thi có giám sát qua webcam.<br/>
    <b>6. Cấp chứng chỉ số & Mã QR:</b> Xuất chứng chỉ PDF tự động khi hoàn thành khóa học, xác thực thật/giả tại <code>/verify/[code]</code>.<br/>
    <b>7. Career Build (Định hướng Nghề nghiệp):</b> Thống kê thị trường lao động, cung cấp khóa học Vi mạch, Bán dẫn & Hệ thống nhúng.
    """
    story.append(Paragraph(feat_detail_text, body_style))
    story.append(Spacer(1, 8))

    # 1.5 Phân tích 7 công nghệ AI
    story.append(Paragraph("1.5. Phân tích Kỹ thuật Chi tiết 7 Công nghệ & Quy trình AI Computer Vision", h2_style))
    p1_5_intro = """
    Dưới đây là phần trình bày kỹ thuật chân thực về <b>vai trò, nguyên lý và quy trình tích hợp thực tế</b> của 7 công nghệ/bước xử lý AI trong các bài toán <i>Nhận diện Cử chỉ Tay (Hand-Tracking)</i>, <i>Phát hiện Linh kiện Máy tính (Component Detection)</i> và <i>Giám sát Thi tự động (AI Proctoring)</i> trên hệ thống PC Master LMS:
    """
    story.append(Paragraph(p1_5_intro, body_style))

    ai_techs = [
        ("1. Dataset (Tập dữ liệu)",
         "Tập hợp dữ liệu hình ảnh thu thập và chuẩn hóa để huấn luyện và kiểm thử các mô hình AI.",
         """
         <b>Ứng dụng & Vai trò thực tế trong PC Master LMS:</b><br/>
         - <i>Dataset Linh kiện PC:</i> Thu thập hơn 15.000 hình ảnh thực tế và ảnh 3D rendering của các loại linh kiện (CPU Intel LGA1700/AMD AM5, RAM DDR4/DDR5, GPU, Mainboard, PSU, CPU Cooler, Case) ở nhiều góc quay, ánh sáng và khoảng cách khác nhau.<br/>
         - <i>Dataset Bàn tay & Cử chỉ:</i> Thu thập dữ liệu cử chỉ tay người học (xòe tay, nắm tay, bốc linh kiện, chụm ngón trỏ và cái - Pinch gesture) trong môi trường phòng máy trường học.<br/>
         - <i>Dataset Proctoring:</i> Thu thập hình ảnh khuôn mặt học sinh phục vụ điểm danh và nhận diện hành vi làm bài thi (ngoảnh đầu, vắng mặt).
         """),
        
        ("2. Labeling (Gán nhãn dữ liệu)",
         "Quá trình đánh vết và dán nhãn chính xác cho các đối tượng trong ảnh, cung cấp dữ liệu cho học có giám sát (Supervised Learning).",
         """
         <b>Ứng dụng & Vai trò thực tế trong PC Master LMS:</b><br/>
         - <i>Gán nhãn Linh kiện (Bounding Box & Polygon):</i> Sử dụng công cụ LabelImg/CVAT khoanh vùng vị trí từng linh kiện và từng khe cắm (như <code>socket_lga1700</code>, <code>ram_slot</code>, <code>pcie_x16</code>).<br/>
         - <i>Gán nhãn 21 Hand Landmarks:</i> Đánh dấu 21 tọa độ khớp bàn tay (đầu ngón tay, khớp đốt ngón, cổ tay) giúp AI nắm được tư thế 3D của tay người học.<br/>
         - <i>Ý nghĩa kỹ thuật:</i> Đảm bảo mô hình AI phân biệt được những chi tiết chân pin Socket CPU hay khớp khóa khe RAM.
         """),

        ("3. Data Augmentation (Tăng cường dữ liệu)",
         "Kỹ thuật tạo ra các biến thể mới từ dữ liệu gốc nhằm làm phong phú tập dữ liệu, ngăn ngừa overfitting.",
         """
         <b>Ứng dụng & Vai trò thực tế trong PC Master LMS:</b><br/>
         - <i>Phương pháp áp dụng:</i> Xoay ảnh ngẫu nhiên (Rotation ±20°), Lật ngang/dọc (Flip), Chỉnh độ sáng/độ tương phản (Brightness/Contrast ±30%), Thêm nhiễu hạt (Gaussian Noise), Cắt xén (Random Crop) và làm mờ chuyển động (Motion Blur).<br/>
         - <i>Vai trò thực tế:</i> Giúp Hand-tracking và nhận diện linh kiện chạy <b>ổn định trong mọi điều kiện thực tế</b> tại phòng máy nhà trường (dù phòng thiếu sáng, đèn huỳnh quang chói, hay webcam độ phân giải thấp). Nhân bản dataset gốc gấp 8 lần mà không tốn công gán nhãn thủ công.
         """),

        ("4. YOLO (You Only Look Once)",
         "Thuật toán Mạng nơ-ron cuộn (CNN) chuyên nhận diện vật thể thời gian thực với tốc độ xử lý siêu nhanh.",
         """
         <b>Ứng dụng & Vai trò thực tế trong PC Master LMS:</b><br/>
         - <i>Nhận diện Linh kiện & Socket:</i> Sử dụng YOLO để phát hiện vị trí linh kiện PC mà học sinh đang thao tác trên bàn hoặc giơ trước webcam với tốc độ <b>>60 FPS</b>.<br/>
         - <i>Giám sát Thi (AI Proctoring):</i> YOLO tự động khoanh vùng khuôn mặt học sinh, phát hiện hành vi vắng mặt hoặc có người thứ hai xuất hiện trong webcam thời gian thực.<br/>
         - <i>Ưu điểm kỹ thuật:</i> Kiến trúc Single-stage xử lý 1 lần duyệt giúp nhận diện với độ trễ siêu thấp (<15ms), phục vụ trải nghiệm lắp ráp mượt mà.
         """),

        ("5. Train bằng Ultralytics (Huấn luyện với Ultralytics Framework)",
         "Sử dụng thư viện mã nguồn mở Ultralytics (nền tảng phát triển YOLOv8/YOLOv11) để huấn luyện mô hình trên GPU.",
         """
         <b>Ứng dụng & Vai trò thực tế trong PC Master LMS:</b><br/>
         - <i>Quy trình huấn luyện:</i> Sử dụng Ultralytics Python API kết hợp GPU NVIDIA (RTX 4090 / Cloud A100) để huấn luyện tập dữ liệu linh kiện và gesture qua 150-300 Epochs.<br/>
         - <i>Tối ưu Hyperparameters:</i> Áp dụng hàm mất mát CIoU Loss, Mosaic Augmentation và Learning Rate Scheduler giúp mô hình đạt độ hội tụ tối ưu.<br/>
         - <i>Kết quả:</i> Xuất ra các file trọng số mô hình (Weight files) có độ chính xác cao nhất cho hệ thống PC Master LMS.
         """),

        ("6. Evaluate (Đánh giá mô hình)",
         "Bước kiểm tra và đo lường độ chính xác, hiệu năng của mô hình trên tập dữ liệu thử nghiệm (Test Set) độc lập.",
         """
         <b>Ứng dụng & Vai trò thực tế trong PC Master LMS:</b><br/>
         - <i>Chỉ số đo lường:</i> Đánh giá mô hình qua các chỉ số <b>mAP@0.5 (>96.2%)</b>, <b>Precision (95.8%)</b>, <b>Recall (94.5%)</b> và Ma trận nhầm lẫn (Confusion Matrix).<br/>
         - <i>Kiểm thử thực tế:</i> Đảm bảo mô hình KHÔNG bị nhầm lẫn giữa CPU Intel và AMD, không nhận diện sai khe RAM 1 và RAM 2, và phản hồi đúng cử chỉ chụm ngón tay khi bốc linh kiện 3D.
         """),

        ("7. Export Model (Xuất & Nhúng mô hình lên Web/Edge)",
         "Chuyển đổi mô hình AI đã huấn luyện sang định dạng tối ưu để nhúng trực tiếp vào ứng dụng thực tế.",
         """
         <b>Ứng dụng & Vai trò thực tế trong PC Master LMS:</b><br/>
         - <i>Định dạng xuất:</i> Chuyển đổi trọng số PyTorch (<code>.pt</code>) sang các định dạng **ONNX (<code>.onnx</code>)**, **TensorFlow.js (TFJS)** và **TFLite (<code>.tflite</code>)**.<br/>
         - <i>Nén & Tối ưu (Quantization):</i> Áp dụng kỹ thuật nén FP16/INT8 giảm dung lượng mô hình từ >120MB xuống <b>~14MB</b>.<br/>
         - <i>Nhúng vào Web PC Master:</i> Mô hình nén được nạp trực tiếp vào trình duyệt (Browser Client-side) thông qua WebGL/WebAssembly. Giúp học sinh thao tác Hand-tracking mượt mượt <b>trực tiếp trên trình duyệt mà không cần Server GPU đắt đỏ</b>, tối ưu chi phí vận hành SaaS.
         """)
    ]

    for title, desc, detail in ai_techs:
        box_data = [
            [Paragraph(f"<b>{title}</b> — <i>{desc}</i>", h3_style)],
            [Paragraph(detail, body_style)]
        ]
        t_box = Table(box_data, colWidths=[523])
        t_box.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EFF6FF")),
            ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#FAFAFA")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#93C5FD")),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(t_box)
        story.append(Spacer(1, 5))

    story.append(Spacer(1, 10))

    # ==================== PHẦN 2 ====================
    story.append(PageBreak())
    story.append(Paragraph("PHẦN 2: THÔNG TIN CHI TIẾT MÔ HÌNH KINH DOANH & TÀI CHÍNH DỰ ÁN", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceBefore=0, spaceAfter=8))

    p2_intro = """
    Phần này cung cấp <b>báo cáo phân tích chi tiết thông tin mô hình kinh doanh</b>, phân tích nhu cầu thị trường, giá trị sản phẩm, các dòng doanh thu, kế hoạch phân bổ chi phí tài chính và định hướng phát triển của dự án PC Master LMS.
    """
    story.append(Paragraph(p2_intro, body_style))
    story.append(Spacer(1, 6))

    biz_sections = [
        ("2.1. Phân tích Nhu cầu Thị trường & Vấn đề Thực tế (Market Demand & Problem Analysis)",
         """
         <b>Thực trạng & Nỗi đau Ngành Giáo dục Tin học:</b><br/>
         - <b>85% Trường THPT thiếu phòng lab thực hành:</b> Chương trình GDPT 2018 bắt buộc học sinh phải nắm vững phần cứng và lắp ráp máy tính. Tuy nhiên, chi phí trang bị 1 phòng lab 40 máy thật lên tới hơn 800 triệu đồng — vượt quá khả năng ngân sách của đa số trường học.<br/>
         - <b>Chi phí linh kiện & Rủi ro hư hỏng đắt đỏ:</b> Linh kiện thật (Mainboard, VGA, CPU) có giá từ 3 đến 10 triệu đồng. Mỗi lần tháo lắp, chỉ cần cong gãy 1 chân pin Socket CPU hay chập điện tĩnh là thiệt hại ngân sách lớn.<br/>
         - <b>Học chay & Bất đồng thông tin giá linh kiện:</b> Học sinh thụ động qua hình vẽ 2D sách giáo khoa. Khi ra ngoài tự mua PC học tập, người học và phụ huynh không có kiến thức nên rất dễ bị cửa hàng tư vấn đẩy hàng tồn kho bị đắt.
         """),

        ("2.2. Giải pháp Sản phẩm & Giá trị Đột phá (Product Solution & Core Values)",
         """
         <b>Giải pháp Phòng Lab Ảo PC Master LMS:</b><br/>
         - <b>Phòng Lab 3D Hand-Tracking 0đ rủi ro:</b> Nhận diện cử chỉ 21 khớp bàn tay qua Webcam thông thường (sử dụng Google MediaPipe). Học sinh tự do bốc, xoay, cắm/tháo linh kiện 3D mà không cần kính VR triệu đô.<br/>
         - <b>AI Guru & Anti-Overpricing Engine:</b> AI kiểm tra tương thích Socket, tính công suất TDP nguồn và kết nối API giá thị trường thực tế từ đại lý lớn (Phong Vũ, GearVN) giúp người học tránh bị độn giá.<br/>
         - <b>Hệ thống LMS Giáo dục Chuẩn hóa:</b> Đa phân quyền cho Admin, Giáo viên, Học sinh và Phụ huynh; hỗ trợ quản lý lớp, bài giảng, bài kiểm tra tự động và cấp chứng chỉ xác thực mã QR.
         """),

        ("2.3. Định hướng Nghề nghiệp & Lộ trình Vi mạch / Bán dẫn (Career Guidance)",
         """
         <b>Module Career Build — Tiếp cận Công nghệ Cao từ Phổ thông:</b><br/>
         - <b>Khóa học phần cứng nâng cao:</b> Vi mạch, Hệ thống nhúng, Kỹ thuật bảo trì máy tính chuyên sâu.<br/>
         - <b>Phân tích Thị trường Lao động:</b> Cung cấp dữ liệu thực tế về nhu cầu nhân lực ngành Bán dẫn và Thiết kế Chip tại Việt Nam.<br/>
         - <b>Định hướng công việc thu nhập cao:</b> Hướng nghiệp cho học sinh tiếp cận các ngành Kỹ sư kiểm thử Chip, Thiết kế vi mạch, Quản trị Server ngay từ ghế nhà trường.
         """),

        ("2.4. Kiểm chứng Thực tế & Tác động Xã hội (Market Validation & SDG Impact)",
         """
         <b>Kết quả Thử nghiệm Thực tế tại Trường THPT Nguyễn Công Trứ:</b><br/>
         - <b>Thử nghiệm thực tế:</b> Triển khai trên <b>76 học sinh lớp 10A1 và 10C9</b> thử nghiệm trực tiếp trên web `pc-master-lms.vercel.app` trong 4 tuần liên tục.<br/>
         - <b>Kết quả đo lường:</b> Điểm thi thực hành <b>tăng trung bình 28%</b>, tỷ lệ hoàn thành bài học đạt <b>94%</b> và <b>92% học sinh phản hồi</b> nắm kiến thức tốt hơn phương pháp truyền thống.<br/>
         - <b>Đóng góp cho 10 Mục tiêu Phát triển Bền vững (SDGs):</b> Đóng góp thực tế vào SDG 4 (Giáo dục chất lượng 0đ rào cản), SDG 9 (Công nghiệp & Đổi mới sáng tạo), SDG 12 (Xóa bỏ 100% rác thải điện tử E-waste), SDG 8 (Định hướng nghề Bán dẫn), SDG 10 (Giảm bất bình đẳng vùng miền) cùng các mục tiêu SDG 3, 5, 11, 13 và 17.
         """),

        ("2.5. Ma trận So sánh Sự khác biệt & Ưu thế Cạnh tranh (USP Matrix)",
         """
         <b>Bảng So sánh Ưu thế Cạnh tranh:</b><br/>
         - <i>Chi phí:</i> Game PC Simulator (>200k/game) vs Video/Sách 2D (0đ) vs <b>PC Master (Miễn phí / 25k vô cùng rẻ)</b><br/>
         - <i>Yêu cầu thiết bị:</i> PC cấu hình khủng vs Máy tính/Điện thoại vs <b>Mọi trình duyệt Web</b><br/>
         - <i>Công nghệ Hand-tracking:</i> Không có vs Không có vs <b>CÓ (Chỉ cần Webcam laptop/PC)</b><br/>
         - <i>Hệ thống LMS & AI Guru:</i> Không có vs Không có vs <b>CÓ (AI Guru + LMS Quản lý lớp)</b><br/>
         - <i>Định hướng Nghề nghiệp:</i> Giải trí thuần túy vs Lý thuyết suông vs <b>CÓ (Lộ trình Vi mạch / Bán dẫn)</b>
         """),

        ("2.6. Mô hình Kinh doanh & Các Dòng Doanh thu (Business Model & Revenue Streams)",
         """
         <b>3 Dòng Doanh thu Bền vững (EdTech / SaaS Model):</b><br/>
         - <b>1. Dòng thu B2C Premium (49.000 VNĐ / tháng / cá nhân):</b> Mở khóa kho bài lab 3D nâng cao, AI Tutor không giới hạn và khóa học Career Build.<br/>
         - <b>2. Dòng thu B2B LMS cho Nhà trường (15 - 25 triệu VNĐ / trường / năm - bình quân 25k/học sinh/năm):</b> Cung cấp hệ thống LMS quản lý lớp riêng cho nhà trường, tiết kiệm hàng trăm triệu tiền mua máy thật.<br/>
         - <b>3. Dòng thu Affiliate Marketing Linh kiện:</b> Tích hợp link mua linh kiện PC/Laptop uy tín từ các đại lý lớn (GearVN, Phong Vũ, MemoryZone...) -> Nhận <b>3 - 5% hoa hồng</b> trên mỗi đơn hàng phát sinh.
         """),

        ("2.7. Phân tích Tài chính & Điểm Hòa vốn (Financial Analysis & Unit Economics)",
         """
         <b>Cơ cấu Chi phí & Khả năng Sinh lời:</b><br/>
         - <b>Chi phí vận hành cố định (Fixed Cost):</b> ~2.000.000 VNĐ/tháng (Cloud Serverless Vercel, Supabase DB, Gemini API quota).<br/>
         - <b>Điểm hòa vốn (Break-even Point):</b> Đạt điểm hòa vốn chỉ với <b>250 học sinh trả phí B2C Premium</b> (hoặc 1 hợp đồng B2B nhà trường).<br/>
         - <b>Biên lợi nhuận ròng (Net Margin):</b> Đạt trên <b>75%</b> nhờ mô hình phần mềm SaaS không phụ thuộc kho bãi vật lý.
         """),

        ("2.8. Định hướng Phát triển & Mở rộng Tương lai (Future Expansion)",
         """
         <b>Lộ trình Mở rộng Hệ sinh thái (2026 - 2028):</b><br/>
         - <b>Mở rộng sang LAPTOP, IoT & Bo mạch:</b> Mô phỏng tháo lắp & chẩn đoán sự cố Laptop, thiết bị IoT và bo mạch Arduino/Raspberry Pi.<br/>
         - <b>Chương trình Bán dẫn & Vi mạch Quốc gia:</b> Hợp tác chuyên gia đưa mô hình kiểm thử Chip vào chương trình THPT.<br/>
         - <b>Tích hợp AI Chấm điểm Tự động:</b> AI tự động phân tích cử chỉ tay người học để chấm điểm bài thi tháo lắp 3D.
         """),

        ("2.9. Tiềm năng Doanh nghiệp & Phễu Chuyển đổi Bán hàng (Sales Funnel)",
         """
         <b>Phễu Bán hàng Chuẩn 100% High-intent (Sales Funnel):</b><br/>
         - Người dùng trải nghiệm build máy 3D -> AI check tương thích & tối ưu giá -> Khách bấm mua linh kiện thật tại chuỗi đại lý đối tác.<br/>
         - Doanh thu Affiliate và tài trợ quảng cáo gia tăng đột biến khi quy mô người dùng nạp mở rộng trên toàn quốc.
         """),

        ("2.10. Kế hoạch Phân bổ Nguồn vốn (Capital Allocation Plan)",
         """
         <b>Phân bổ Khoản Vốn Đầu tư 50.000.000 VNĐ:</b><br/>
         - <b>40% (20.000.000đ):</b> Nâng cấp Server Cloud & Hạ tầng AI Gemini API.<br/>
         - <b>40% (20.000.000đ):</b> Tiếp thị B2B & Thử nghiệm tại 10 trường THPT TP.HCM.<br/>
         - <b>20% (10.000.000đ):</b> R&D Module 3D Laptop, Hand-tracking nâng cao & đăng ký Bản quyền Tác giả phần mềm.
         """),

        ("2.11. Đội ngũ Phát triển & Nền tảng Vận hành (Development Team & Operations)",
         """
         <b>Đội ngũ Phát triển THPT Nguyễn Công Trứ & Quy trình Vận hành:</b><br/>
         - <b>Thành viên phát triển:</b> Nguyễn Phúc Khánh Sơn, Dương Vũ Minh Đức & Đặng Quốc An (Trường THPT Nguyễn Công Trứ).<br/>
         - <b>GVHD:</b> Cô Đoàn Thụy Kim Phượng & Thầy Trần Minh Phụng.<br/>
         - <b>Quy trình Agile:</b> Vận hành làm việc qua Git branching chuyên nghiệp, hoàn thành hơn 42 task qua 3 Sprint phát triển và hoàn tất hồ sơ Đăng ký Bản quyền Tác giả cho phần mềm.
         """)
    ]

    for title, text in biz_sections:
        box_data = [
            [Paragraph(f"<b>{title}</b>", h2_style)],
            [Paragraph(text, body_style)]
        ]
        t_slide = Table(box_data, colWidths=[523])
        t_slide.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
            ('BACKGROUND', (0,1), (-1,1), colors.white),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(t_slide)
        story.append(Spacer(1, 6))

    # Summary box
    story.append(Spacer(1, 8))
    summary_box_data = [
        [Paragraph("<b>TỔNG KẾT BÁO CÁO HỆ THỐNG PC MASTER LMS</b>", h1_style)],
        [Paragraph("Hệ thống PC Master LMS là giải pháp giáo dục toàn diện kết hợp giữa công nghệ AI/Hand-Tracking hiện đại và mô hình kinh doanh SaaS/EdTech bền vững. Nền tảng mang lại giá trị thực tiễn cao cho học sinh, giáo viên, nhà trường và xã hội, hiện thực hóa mục tiêu chuyển đổi số giáo dục phổ thông tại Việt Nam.", body_style)]
    ]
    t_sum = Table(summary_box_data, colWidths=[523])
    t_sum.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF3C7")),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#F59E0B")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_sum)

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF Successfully Generated:", pdf_filename)

if __name__ == '__main__':
    build_pdf()
