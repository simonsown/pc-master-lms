# PROMPT GỬI CHO CLAUDE AI

## Copy-paste nội dung này vào Claude:

---

Tôi có một hệ thống API tại: https://pc-master-lms.vercel.app/api/ai/tools
API Key: pc-master-claude-2026-secret-key

Cách dùng:
- GET với ?api_key=... để xem danh sách action
- POST với header "x-api-key: ..." và body JSON:
  { "action": "action_name", "params": { ... } }

Hãy giúp tôi:
1. Dùng function calling / tool call để gọi từng action một
2. Gọi system_info trước để biết tổng quan
3. Sau đó gọi list_lessons, list_quizzes, list_classes, list_courses, list_exams, list_achievements, list_certificates, list_builder_parts, list_learning_paths, list_users
4. Sau đó thử search với từ khóa "cpu", "tin học", "lắp ráp"
5. Tổng hợp lại tất cả dữ liệu thành báo cáo đẹp

