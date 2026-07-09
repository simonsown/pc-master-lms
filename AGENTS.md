# Cách làm việc nhóm tránh xung đột

## Git Branching
- `main` — production, deploy tự động lên https://pc-master-lms.vercel.app
- `feature/2d-renderer` — Người 1: 2D + Error Animation
- `feature/3d-viewer` — Người 2: 3D Viewer

## Quy trình
1. `git checkout -b feature/<tên-nhánh>` — tạo nhánh
2. Làm việc trên nhánh của mình
3. `git add . && git commit -m "mô tả"`
4. `git push origin feature/<tên-nhánh>`
5. `npx vercel --yes` — deploy preview
6. Tạo Pull Request → review → merge vào main

## Lock cơ sở dữ liệu
Khi edit component trong `/creator`:
- Lock tự động acquire khi mở form
- Heartbeat mỗi 4 phút
- Lock tự release sau 5 phút idle
- Không 2 người edit cùng lúc

## Lưu ý
- Chạy `npm run build` trước khi push
- Không push vào main trực tiếp
- Synchronize với nhau qua Pull Request review

## 3D Viewer — Cấu trúc & Xử lý lỗi

### Re-render loop ("Maximum update depth exceeded") — FIXED

**Nguyên nhân:** Synchronous re-render chain do 3 vấn đề:
1. HeadTracker cập nhật `cameraCoords` trong store 60x/sec
2. CameraRig subscribe `cameraCoords` → re-render 60x/sec + `useThree()` trigger thêm
3. VrComponent/PcCaseSimple dùng `useAssemblyStore()` (no selector) → re-render 60x/sec trên mọi store change

**Fix:**
- Tách head tracking ra shared ref (`head-tracker-shared.ts`)
- CameraRig đọc từ ref trong `useFrame` thay vì subscribe store
- HeadTracker ghi vào ref + store, đọc hiển thị từ ref
- Tất cả store subscription dùng primitive selectors (boolean, number) thay vì full state
- Event handlers dùng `getState()` thay vì subscribe

### Files chính
| File | Vai trò |
|------|---------|
| `components/GameScene.tsx` | Scene chính: CameraRig, PcCaseSimple, VrComponent |
| `components/ShowroomScene.tsx` | Showroom: orbiting GLB, point/pinch interaction |
| `components/UnifiedTracker.tsx` | Combined face + hand tracking từ 1 camera |
| `components/hand-shared.ts` | Shared ref cho hand landmarks |
| `components/HeadTracker.tsx` | Face tracking (dùng trong GameScene) |
| `components/head-tracker-shared.ts` | Shared ref cho head tracking |
| `lib/useStore.ts` | Zustand store: components, slots, boot |
| `app/builder/3d-viewer/page.tsx` | Page chứa GameScene |
| `app/builder/showroom/page.tsx` | Page chứa ShowroomScene |
| `app/landing/page.tsx` | Landing page QR + animation |

### Showroom (`/builder/showroom`)
- Không gian sáng, 1 GLB model duy nhất quay quanh người dùng (orbit)
- `UnifiedTracker` — 1 camera 640x480 chạy đồng thời FaceLandmarker + HandLandmarker (MediaPipe)
- Tay 3D: 21 joint + bone, theo landmarks thực tế
- Chỉ tay → component chạy lại gần (radius 2→0.6)
- Chụm ngón (thumb+index) → component xoay tròn
- Load nhanh: preload GLB, single camera, no delay

### Landing (`/landing`)
- Giới thiệu dự án với particle animation, QR code
- Link tới Showroom và VR Classroom

### Debug production error
- Lỗi runtime `Minified React error #185` = Maximum update depth exceeded
- Chỉ xảy ra production (React StrictMode differs between dev/prod)
- Test tại preview URL của Vercel
