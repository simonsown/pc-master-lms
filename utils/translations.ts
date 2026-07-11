type Lang = 'en' | 'vn'

const translations: Record<string, { en: string; vn: string }> = {
  // Navigation
  'nav.home': { en: 'Home', vn: 'Trang chủ' },
  'nav.back': { en: 'Back', vn: 'Thoát' },
  'nav.backToBuilder': { en: 'Back to Builder', vn: 'Quay lại Builder' },
  'nav.backToHome': { en: 'Back to home', vn: 'Quay lại trang chủ' },

  // Auth
  'auth.login': { en: 'Login', vn: 'Đăng nhập' },
  'auth.register': { en: 'Register', vn: 'Đăng ký' },
  'auth.logout': { en: 'Logout', vn: 'Đăng xuất' },
  'auth.email': { en: 'Email', vn: 'Email' },
  'auth.password': { en: 'Password', vn: 'Mật khẩu' },
  'auth.confirmPassword': { en: 'Confirm Password', vn: 'Xác nhận mật khẩu' },
  'auth.fullName': { en: 'Full Name', vn: 'Họ và tên' },
  'auth.googleLogin': { en: 'Continue with Google', vn: 'Tiếp tục với Google' },
  'auth.googleNote': { en: 'First login: Email auto-saved, just enter name + role. No password needed!', vn: 'Lần đầu đăng nhập: Email tự động lưu, bạn chỉ cần nhập Họ tên + chọn vai trò. Không cần mật khẩu!' },
  'auth.welcomeBack': { en: 'Welcome back! Login to continue learning.', vn: 'Chào mừng bạn trở lại! Đăng nhập để tiếp tục học tập.' },
  'auth.noAccount': { en: "Don't have an account?", vn: 'Chưa có tài khoản?' },
  'auth.hasAccount': { en: 'Already have an account?', vn: 'Đã có tài khoản?' },
  'auth.registerNow': { en: 'Register now', vn: 'Đăng ký ngay' },
  'auth.forgotPassword': { en: 'Forgot password?', vn: 'Quên mật khẩu?' },
  'auth.orViaEmail': { en: 'Or via email', vn: 'Hoặc qua email' },
  'auth.adminLogin': { en: 'Login as Admin', vn: 'Đăng nhập với tư cách Admin' },
  'auth.adminPassword': { en: 'Admin Password', vn: 'Mật khẩu Admin' },
  'auth.enterAdminPass': { en: 'Enter admin password', vn: 'Nhập mật khẩu admin' },
  'auth.loginSuccess': { en: 'Login successful!', vn: 'Đăng nhập thành công!' },
  'auth.loginFailed': { en: 'Email or password is incorrect.', vn: 'Email hoặc mật khẩu không chính xác.' },
  'auth.processing': { en: 'Processing...', vn: 'Đang xử lý...' },

  // Builder
  'builder.title': { en: 'PC Master Builder', vn: 'PC Master Builder' },
  'builder.freePractice': { en: 'Free Practice', vn: 'Luyện Tập Tự Do' },
  'builder.practiceMode': { en: 'Practice Mode', vn: 'Luyện Tập' },
  'builder.lecture': { en: 'Lecture Course', vn: 'Bài Giảng' },
  'builder.marketplace': { en: 'Marketplace', vn: 'Chợ Máy Tính' },
  'builder.multiplayer': { en: '2-Player Versus', vn: '2 Người Chơi' },
  'builder.exams': { en: 'Exams', vn: 'Kỳ Thi' },
  'builder.challenge': { en: 'Daily Challenge', vn: 'Thử Thách' },
  'builder.components': { en: 'Component Library', vn: 'Tủ Linh Kiện' },
  'builder.checklist': { en: 'Checklist', vn: 'Nhiệm vụ' },

  // Career Build
  'career.title': { en: 'Career & PC Build', vn: 'Nghề Nghiệp & Cấu Hình PC' },
  'career.subtitle': { en: 'Select your dream career, AI will suggest the optimal PC build!', vn: 'Chọn ước mơ nghề nghiệp của bạn, AI sẽ gợi ý cấu hình PC tối ưu!' },
  'career.orType': { en: 'Or type your dream:', vn: 'Hoặc nhập ước mơ của bạn:' },
  'career.placeholder': { en: 'e.g. I want to be an AI engineer, game designer...', vn: 'VD: Em muốn trở thành kỹ sư AI, thiết kế game...' },
  'career.suggest': { en: 'Suggest', vn: 'Gợi ý' },
  'career.analyzing': { en: 'AI is analyzing your career...', vn: 'AI đang phân tích nghề nghiệp...' },
  'career.suggestFor': { en: 'Suggested Build For:', vn: 'Cấu Hình Cho:' },
  'career.totalCost': { en: 'Estimated Total Cost', vn: 'Tổng chi phí ước tính' },
  'career.startBuild': { en: 'Start assembling this config →', vn: 'Bắt đầu lắp ráp cấu hình này →' },
  'career.chooseOther': { en: 'Choose another career', vn: 'Chọn nghề khác' },
  'career.tips': { en: 'Tip:', vn: 'Mẹo:' },

  // Hand Tracking
  'handtracking.off': { en: 'OFF', vn: 'TẮT' },
  'handtracking.on': { en: 'ON', vn: 'BẬT' },
  'handtracking.toggle': { en: 'Toggle', vn: 'Bật/Tắt' },
  'handtracking.label': { en: 'Hand Tracking:', vn: 'Hand Tracking:' },
  'handtracking.waiting': { en: 'Waiting for players...', vn: 'Đang chờ người chơi...' },
  'handtracking.raiseHand': { en: 'Raise your hand high!', vn: 'Giơ tay lên cao!' },
  'handtracking.ready': { en: 'Ready!', vn: 'Sẵn sàng!' },

  // Multiplayer
  'multiplayer.title': { en: 'MULTIPLAYER MODE', vn: 'CHẾ ĐỘ 2 NGƯỜI CHƠI' },
  'multiplayer.instruction': { en: 'Player 1 = Left side of screen · Player 2 = Right side of screen (Each player shows BOTH hands)', vn: 'Người chơi 1 = Bên trái màn hình · Người chơi 2 = Bên phải màn hình (Mỗi người giơ CẢ 2 TAY)' },
  'multiplayer.startMatch': { en: 'START MATCH', vn: 'BẮT ĐẦU THI ĐẤU' },
  'multiplayer.readyHint': { en: 'Both players raise BOTH hands to be ready', vn: 'Cả 2 người chơi giơ CẢ 2 TAY lên để sẵn sàng' },
  'multiplayer.p1Win': { en: 'PLAYER 1 WINS!', vn: 'P1 THẮNG!' },
  'multiplayer.p2Win': { en: 'PLAYER 2 WINS!', vn: 'P2 THẮNG!' },
  'multiplayer.p1Label': { en: 'PLAYER 1', vn: 'NGƯỜI CHƠI 1' },
  'multiplayer.p2Label': { en: 'PLAYER 2', vn: 'NGƯỜI CHƠI 2' },

  // VR 3D
  'vr.title': { en: 'VR MODE', vn: 'CHẾ ĐỘ VR' },
  'vr.explore': { en: 'Explore', vn: 'Khám phá' },
  'vr.build': { en: 'Start Assembly', vn: 'Bắt đầu lắp ráp' },
  'vr.building': { en: 'Building...', vn: 'Đang lắp...' },
  'vr.wasdHint': { en: 'WASD to move, webcam to look around', vn: 'WASD di chuyển, webcam nhìn xung quanh' },
  'vr.headActive': { en: 'Webcam head tracking active', vn: 'Webcam theo dõi đầu đang hoạt động' },
  'vr.mouseHint': { en: 'Move mouse to control hand', vn: 'Di chuyển chuột để điều khiển tay' },
  'vr.wasdMove': { en: 'Move', vn: 'Di chuyển' },
  'vr.wasdLook': { en: 'Head tracking to look', vn: 'Quay đầu để nhìn' },
  'vr.parts': { en: 'Parts', vn: 'Linh kiện' },
  'vr.missingParts': { en: 'Missing parts!', vn: 'Thiếu linh kiện!' },
  'vr.systemOnline': { en: 'System Online!', vn: 'Hệ thống hoạt động!' },
  'vr.powerOn': { en: 'POWER ON', vn: 'KHỞI ĐỘNG' },
  'vr.enter': { en: 'ENTER VR WORKSHOP', vn: 'VÀO PHÒNG VR' },
  'vr.welcome': { en: 'Build your PC in a VR workshop. Use WASD to move, webcam to look around, drag parts into the PC case.',
    vn: 'Lắp ráp PC trong phòng thí nghiệm VR. Dùng WASD di chuyển, webcam nhìn xung quanh, kéo thả linh kiện vào thùng máy.' },
  'vr.step1': { en: 'Toggle Explore to walk around the room (WASD + head tracking)', vn: 'Bật Khám phá để đi lại trong phòng (WASD + theo dõi đầu)' },
  'vr.step2': { en: 'Click Start Assembly to build your PC', vn: 'Nhấn Bắt đầu lắp ráp để ráp PC' },
  'vr.step3': { en: 'Drag parts into the case — press POWER!', vn: 'Kéo linh kiện vào thùng máy — nhấn KHỞI ĐỘNG!' },

  // Common
  'common.loading': { en: 'Loading...', vn: 'Đang tải...' },
  'common.error': { en: 'Error', vn: 'Lỗi' },
  'common.success': { en: 'Success', vn: 'Thành công' },
  'common.save': { en: 'Save', vn: 'Lưu' },
  'common.cancel': { en: 'Cancel', vn: 'Hủy' },
  'common.confirm': { en: 'Confirm', vn: 'Xác nhận' },
  'common.search': { en: 'Search', vn: 'Tìm kiếm' },
  'common.noData': { en: 'No data', vn: 'Không có dữ liệu' },

  // Profile
  'profile.complete': { en: 'Complete Profile', vn: 'Hoàn thiện hồ sơ' },
  'profile.emailAuto': { en: 'Email auto-saved from Google account', vn: 'Email đã được lưu tự động từ tài khoản Google' },
  'profile.role': { en: 'What is your role?', vn: 'Bạn tham gia với vai trò?' },
  'profile.student': { en: 'Student', vn: 'Học viên' },
  'profile.teacher': { en: 'Teacher', vn: 'Giáo viên' },
  'profile.parent': { en: 'Parent', vn: 'Phụ huynh' },
  'profile.finish': { en: 'Complete', vn: 'Hoàn tất' },
  'profile.nextTimeAuto': { en: 'Next login with Google will go straight in without re-entering info.', vn: 'Lần sau đăng nhập bằng Google sẽ tự động vào thẳng mà không cần nhập lại thông tin.' },
  'profile.dob': { en: 'Date of Birth', vn: 'Ngày sinh' },
  'profile.province': { en: 'Province/City', vn: 'Tỉnh/Thành phố' },
  'profile.school': { en: 'School', vn: 'Trường học' },
  'profile.schoolName': { en: 'School name (optional)', vn: 'Tên trường (không bắt buộc)' },
}

export function t(key: string, lang: Lang): string {
  const entry = translations[key]
  if (!entry) return key
  return entry[lang]
}

export function useT(lang: Lang) {
  return (key: string) => t(key, lang)
}

export type { Lang }
