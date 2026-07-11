# n8n Integration Flow — Career Build Feature

## Flow Diagram

```
┌──────────────┐     ┌─────────────────────────────┐
│  User chọn    │────>│  /api/career-suggest        │
│  ước mơ PC    │     │  (Next.js Route Handler)    │
└──────────────┘     └───────────┬─────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │  enrichWithN8n()       │
                    │  (timeout 5s)          │
                    └───────────┬────────────┘
                                │
              ┌─────────────────┼──────────────────┐
              │ CÓ n8n          │ KHÔNG có n8n      │
              ▼                  ▼                   ▼
    ┌──────────────────┐   ┌──────────────────┐
    │ POST /webhook/   │   │ Dùng logic cũ    │
    │ career-suggest   │   │ (Groq + keyword  │
    │ (Bearer Auth)    │   │  match + fallback)│
    └────────┬─────────┘   └──────────────────┘
             │
    ┌────────▼────────┐
    │ n8n Workflow    │
    │ 07-career-build │
    ├─────────────────┤
    │ 1. Gọi AI       │
    │ 2. Fetch giá    │
    │    GearVN       │
    │ 3. Lưu Supabase │
    │ 4. Response     │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │ Enriched Data   │
    │ + link shop     │
    │ + n8n badge     │
    │ + n8n tips      │
    └─────────────────┘
```

## Khi n8n ONLINE → UI hiển thị

```
🎯 AI Engineer                      [n8n]
- CPU: AMD Ryzen 9 7950X  [gearvn]  ↔ Thay thế
- GPU: NVIDIA RTX 4090    [gearvn]  ↔ Thay thế
...
💡 n8n: Giá cập nhật từ GearVN, có khuyến mãi...
```

## Khi n8n OFFLINE → UI vẫn hoạt động

```
🎯 AI Engineer
- CPU: AMD Ryzen 9 7950X             ↔ Thay thế
- GPU: NVIDIA RTX 4090               ↔ Thay thế
...
💡 Mẹo: Dùng thêm RAM 64GB+...
```

## Cấu trúc file

| File | Vai trò |
|------|---------|
| `app/api/career-suggest/route.ts` | API chính, gọi n8n enrich + fallback |
| `app/api/n8n/webhook/career-suggest/route.ts` | Endpoint n8n gọi vào (Bearer auth) |
| `n8n/workflows/07-career-build.json` | n8n workflow (import vào n8n) |
| `app/builder/career-build/page.tsx` | UI hiển thị badge n8n + shop links |

## Demo cho BGK (không cần n8n thật)

Thêm `?n8n_demo=1` vào URL:

```
https://pc-master-lms.vercel.app/builder/career-build?n8n_demo=1
```

Khi đó:
- API tự động trả về dữ liệu enrich giả (không gọi n8n thật)
- UI hiển thị badge **n8n** + link shop **gearvn** + giá cập nhật
- Không cần cài đặt n8n, không cần webhook

### Cách demo step-by-step

1. **Với n8n (thật):** Vào **Builder → Ước mơ & PC** → Chọn nghề → Build PC
   - Nếu n8n chạy: badge **n8n** + link shop + giá từ n8n
   - Nếu n8n tắt/hết hạn: badge biến mất, web vẫn chạy bình thường

2. **Fake demo (cho BGK):** Vào URL có `?n8n_demo=1`
   - Luôn thấy badge **n8n** + link shop + giá fake
   - Giống hệt giao diện n8n thật

3. **So sánh:** Chụp 2 màn hình cạnh nhau
   - Có n8n → badge + link shop + n8n tips
   - Không n8n → UI gốc, không lỗi

## Cách chạy n8n local (nếu muốn chạy thật)

```bash
docker compose -f n8n/docker-compose.yml up -d
# Import workflow 07-career-build.json vào n8n UI (port 5678)
```
