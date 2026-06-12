# HƯỚNG DẪN CHO NGƯỜI PHỤ — 3D COMPONENT VIEWER

## 1. Cài đặt

```bash
# Giải nén folder tôi gửi, mở terminal tại thư mục đó
cd pc-master-lms-latest
npm install
npm run dev
```

Mở http://localhost:3000

## 2. Vào builder xem thử

Vào trang web → click **"Tủ Linh Kiện"** → thấy tab **2D | 3D | Split**

- Tab **2D**: thấy danh sách linh kiện vẽ bằng SVG
- Tab **3D**: thấy linh kiện 3D xoay được (đang còn sơ sài)
- Tab **Split**: bên trái 2D, bên phải 3D

## 3. Việc bạn cần làm — sửa file này:

`components/builder/ComponentViewer3D.tsx`

### Nhiệm vụ chi tiết

**A) Thêm fan blades quay (GPU, Cooler)**
- Trong GPU3D: mỗi fan là 1 group, thêm blades xoay quanh tâm
- Code mẫu đã có sẵn trong file `components/ComponentPreview3D.js` (dòng 158-188 — coi và copy ý tưởng)

**B) Thêm button xoay góc**
- Thêm UI overlay bên trên canvas 3D:
  - Button "Top" → camera nhìn từ trên
  - "Front" → camera nhìn trước
  - "Side" → camera nhìn ngang
  - "Free" → xoay tự do

**C) Thêm highlight khi hover connector**
- Connector là các chấm nhỏ trên linh kiện (xem trong ComponentRenderer2D có connector dots)
- Trong 3D: khi hover → phát sáng (emissive)

**D) Làm đẹp mesh**
- CPU: thêm chân vàng (pins) ở mặt dưới
- GPU: thêm PCIe slot, display port
- Mainboard: thêm RAM slots, chipset heatsink

## 4. Cách chạy thử

```bash
# Sau khi sửa file, trình duyệt tự reload
npm run dev
```

Vào http://localhost:3000 → "Tủ Linh Kiện" → tab 3D → click vào từng linh kiện xem 3D

## 5. Khi xong — push lên

Nếu có GitHub:
```bash
git checkout -b feature/3d-viewer
git add .
git commit -m "hoàn thiện 3D viewer"
git push origin feature/3d-viewer
```

Nếu không có GitHub: gửi lại file `components/builder/ComponentViewer3D.tsx` cho tôi.

## 6. File nào cần sửa?

**File chính:**
- `components/builder/ComponentViewer3D.tsx` ← file bạn cần làm

**File tham khảo (có sẵn code mẫu):**
- `components/ComponentPreview3D.js` — Xem cách render fan blades, pins, heatspreader
- `components/builder/ComponentRenderer2D.tsx` — Xem hình dạng 2D của từng loại để biết render 3D thế nào

**Không đụng vào các file khác.**

## 7. Cấu trúc 3D hiện tại

Mỗi loại linh kiện là 1 component riêng trong `ComponentViewer3D.tsx`:

- `CPU3D` — Box PCB + IHS
- `GPU3D` — Box PCB + Shroud + fan circles
- `Motherboard3D` — Box PCB + connector rectangles
- `RAM3D` — Box PCB + heatspreader
- `PSU3D` — Box vỏ + fan circle
- `SSD3D` — Box PCB + controller chip
- `Model3D` — chọn đúng component theo type
- `Scene` — canvas, camera, orbit controls, đèn

## 8. Note quan trọng

- Đã cài sẵn `three`, `@react-three/fiber`, `@react-three/drei`
- File này dùng `'use client'` + `dynamic import` → không ảnh hưởng SSR
- Commit từng phần nhỏ để dễ review
- Hỏi tôi nếu cần giải thích thêm
