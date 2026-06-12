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
