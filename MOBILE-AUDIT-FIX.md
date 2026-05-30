# BÁO CÁO KIỂM TRA RESPONSIVE ĐIỆN THOẠI
## PC Master Builder - Phát hiện lỗi & Prompt sửa

> ⚠️ **Nguyên tắc:** Các fix bên dưới CHỈ áp dụng cho mobile (< 769px), **KHÔNG thay đổi bố cục desktop**, KHÔNG di dời phần tử, KHÔNG ảnh hưởng web khác.

---

## 📱 LỖI #1: Builder - MainMenu padding quá lớn trên mobile

**File:** `components/MainMenu.js` - dòng 79

**Vấn đề:** `padding: 32px 48px` làm nội dung bị ép vào giữa, các card chế độ bị nhỏ trên màn hình 375px.

**Prompt sửa (dán vào AI):**

```
Trong file components/MainMenu.js, tìm dòng có:
  padding: '32px 48px'

Thay bằng inline style responsive:
  padding: 'clamp(16px, 4vw, 48px)'

Giải thích: Dùng clamp() để padding tự động co theo màn hình.
CHỈ sửa padding này, KHÔNG sửa gì khác trong file.
```

---

## 📱 LỖI #2: Builder - Camera panel bị tràn màn hình mobile

**File:** `app/builder/page.js` - dòng 421

**Vấn đề:** Camera panel có `width: 360px` và `position: fixed, bottom: 2rem, right: 2rem`. Trên mobile 375px, panel rộng 360px + right 2rem (~32px) = 392px > 375px → bị tràn phải.

**Prompt sửa (dán vào AI):**

```
Trong file app/builder/page.js, tìm đoạn code camera panel có:
  width: '360px',
  position: 'fixed', bottom: '2rem', right: '2rem',

Thêm bao bọc responsive: dùng style object riêng và thêm
  maxWidth: 'calc(100vw - 2rem)',
  width: 'min(360px, calc(100vw - 2rem))',

CHỈ thêm/sửa 2 dòng width này, KHÔNG thay đổi gì khác.
```

---

## 📱 LỖI #3: Builder - PartPickerSidebar quá rộng, chiếm hết màn hình mobile

**File:** `components/PartPickerSidebar.js` - dòng 46

**Vấn đề:** `width: '240px', minWidth: '240px'` cố định. Trên mobile, layout `display: flex, gap: 16px` với PartPickerSidebar + GameEngine không khả thi.

**Prompt sửa (dán vào AI):**

```
Trong file app/builder/page.js, tìm đoạn:
  appMode === 'assembly' ? (
    <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
      <PartPickerSidebar ...

Thêm style responsive: đổi div cha thành:
  <div style={{ display: 'flex', gap: '16px', width: '100%', flexDirection: mobile ? 'column' : 'row' }}>

Và thêm state isMobile ở đầu component (nếu chưa có):
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 769)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

CHỈ thêm đoạn này. KHÔNG ảnh hưởng desktop vì desktop luôn là flexDirection 'row'.
```

---

## 📱 LỖI #4: Builder - Breadcrumb header bị tràn trên mobile

**File:** `app/builder/page.js` - dòng 370

**Vấn đề:** Header có Hand Tracking badge + nút "Thoát" bên phải. Trên mobile các phần tử này quá nhiều cho 1 dòng.

**Prompt sửa (dán vào AI):**

```
Trong file app/builder/page.js, tìm đoạn:
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '12px 24px', ...

Thêm flexWrap: 'wrap', gap: '8px' vào style của div này.
  Sửa dòng thành:
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '12px 24px', background: ..., flexWrap: 'wrap', gap: '8px' }}>

Và tìm hand tracking badge có style:
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '100px', ...

Thêm flexShrink: 0 vào style của nó.

CHỈ thêm flexWrap, gap, flexShrink. KHÔNG thay đổi layout desktop.
```

---

## 📱 LỖI #5: Trang student/progress và student/learning-path bị padding-top thừa

**File:** `app/student/progress/page.tsx` - dòng 33
**File:** `app/student/profile/page.tsx`

**Vấn đề:** Các trang dùng `pt-24` (padding-top: 96px) nhưng không có top navbar (chỉ có sidebar). Trên mobile, nội dung bị đẩy xuống quá nhiều, tạo khoảng trống phía trên.

**Prompt sửa (dán vào AI):**

```
Trong file app/student/progress/page.tsx, tìm dòng:
  className="min-h-screen pt-24 pb-12 px-4 sm:px-6

Sửa thành:
  className="min-h-screen pt-4 pb-12 px-4 sm:px-6 sm:pt-24

Giải thích: pt-4 (16px) trên mobile vì không có top navbar, sm:pt-24 (96px) giữ nguyên trên desktop.
CHỈ sửa className này. KHÔNG thay đổi gì khác.
```

---

## 📱 LỖI #6: Student Dashboard - Grid layout bóp hẹp trên mobile

**File:** `app/(dashboard)/student/dashboard/StudentDashboardClient.tsx` - dòng 116, 188

**Vấn đề:** Dòng 116: `gridTemplateColumns: '1.6fr 1fr'` tạo 2 cột rất hẹp trên mobile.
Dòng 188: `gridTemplateColumns: '2fr 1.2fr'` cũng bị hẹp.

**Prompt sửa (dán vào AI):**

```
Trong file StudentDashboardClient.tsx:
1. Tìm dòng: gridTemplateColumns: '1.6fr 1fr'
   Thêm media query max-width: 768px → gridTemplateColumns: '1fr'

2. Tìm dòng: gridTemplateColumns: '2fr 1.2fr'  
   Thêm media query max-width: 768px → gridTemplateColumns: '1fr'

Cách thêm: dùng <style> tag trong component hoặc thêm CSS class và kiểm tra isMobile.

Cách đơn giản: Thêm đoạn này vào cuối style block:
  `@media (max-width: 768px) {
    .dashboard-grid-collapse { grid-template-columns: 1fr !important; }
  }`

Và thêm className="dashboard-grid-collapse" vào 2 section có gridTemplateColumns đó.

CHỈ thêm class và CSS. KHÔNG thay đổi layout desktop.
```

---

## 📱 LỖI #7: Student Layout - Profile page không nằm trong sidebar layout

**Vấn đề:** Sidebar có link `/student/profile` nhưng `app/student/profile/page.tsx` KHÔNG nằm trong `app/(dashboard)/student/` nên không có sidebar. Người dùng bấm vào sẽ mất sidebar đột ngột.

**Prompt sửa (dán vào AI):**

```
Tạo file mới app/(dashboard)/student/profile/page.tsx với nội dung:

import StudentProfilePage from '@/app/student/profile/page'
export { default } from '@/app/student/profile/page'

File này chỉ là re-export, giúp route /student/profile có sidebar.
⚠️ KHÔNG xóa file app/student/profile/page.tsx gốc.

Hoặc đơn giản hơn: sửa nav link trong layout.tsx từ '/student/profile' thành '/student/profile' (giữ nguyên)
và thêm route group cho profile page.
```

---

## 📱 LỖI #8: Landing page FAQ accordion - text quá dài trên mobile

**File:** `app/page.js`

**Vấn đề:** Câu trả lời FAQ khá dài, trên mobile có thể bị tràn hoặc khó đọc.

**Prompt sửa (dán vào AI):**

```
Trong file app/page.js, tìm tất cả FAQ answer divs có dạng:
  <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '16px', ...

Thêm wordBreak: 'break-word' và fontSize: '13px' vào style của mỗi answer div.

CHỈ thêm 2 thuộc tính style này. KHÔNG thay đổi nội dung hay layout.
```

---

## 📱 LỖI #9: Builder - assembly mode checklist box overflow

**File:** `app/builder/page.js` - dòng 484

**Vấn đề:** Checklist box có `position: absolute, right: 2%` và `minWidth: min(160px, 20vw)`. Trên mobile rất nhỏ.

**Prompt sửa (dán vào AI):**

```
Trong file app/builder/page.js, tìm checklist box:
  <div className="glass-panel" style={{
    position: 'absolute', top: '50px', right: '2%',
    padding: '1rem', minWidth: 'min(160px, 20vw)', ...

Giải thích: Trên mobile, absolute positioning có thể đè lên nội dung chính.

Cách fix: thêm responsive - nếu màn hình < 768px thì đổi position thành 'relative' và right thành 'auto'.

Dùng state isMobile (đã thêm ở lỗi #3) và điều kiện:
  position: isMobile ? 'relative' : 'absolute',
  right: isMobile ? 'auto' : '2%',
  marginTop: isMobile ? '16px' : '0',

CHỈ sửa div này. KHÔNG ảnh hưởng desktop.
```

---

## 📱 LỖI #10: Builder demo banner đè lên hamburger button

**File:** `app/builder/page.js` - dòng 284-300

**Vấn đề:** Demo banner `position: fixed, top: 0, z-index: 9999` nằm chồng lên vị trí hamburger button (top: 16px). Trên mobile không bấm được hamburger.

**Prompt sửa (dán vào AI):**

```
Trong file app/builder/page.js, tìm demo banner:
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,

Thêm paddingLeft: '56px' (để chừa chỗ cho hamburger button bên trái).
Sửa dòng thành:
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, paddingLeft: '56px', ...

CHỈ thêm paddingLeft: '56px'. KHÔNG thay đổi gì khác.
```

---

## TỔNG KẾT

| # | File | Vấn đề | Mức độ |
|---|------|--------|--------|
| 1 | `components/MainMenu.js` | Padding quá lớn | Trung bình |
| 2 | `app/builder/page.js` | Camera tràn màn hình | Cao |
| 3 | `app/builder/page.js` | Sidebar + Game co kéo | Cao |
| 4 | `app/builder/page.js` | Header bị tràn | Trung bình |
| 5 | `app/student/progress/page.tsx` | Padding-top thừa | Thấp |
| 6 | `StudentDashboardClient.tsx` | Grid bị bóp hẹp | Trung bình |
| 7 | Route profile | Không có sidebar | Cao |
| 8 | `app/page.js` | FAQ text overflow | Thấp |
| 9 | `app/builder/page.js` | Checklist overflow | Trung bình |
| 10 | `app/builder/page.js` | Demo banner đè menu | Trung bình |

---

*Audit ngày 29/05/2026 - Kiểm tra trên viewport 375px (iPhone SE)*
