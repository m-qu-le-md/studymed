# Workflow: Git Push to Work Account

Tài liệu này định nghĩa quy trình tự động hóa việc đẩy code (push) lên GitHub bằng tài khoản Công việc (Work Account: mqule.md.hmu@gmail.com).

## Quy trình chuẩn (Standard Workflow)
Mọi thay đổi trên dự án **StudyMed** phải tuân thủ nghiêm ngặt các bước sau trước khi thực hiện push:

1. **Xác nhận cấu hình cục bộ (Local Git Config)**:
   - Trước khi commit, kiểm tra cấu hình:
     ```bash
     git config --local user.name "Quang Le"
     git config --local user.email "mqule.md.hmu@gmail.com"
     ```
   - Kiểm tra lại bằng lệnh: `git config --local user.email` (phải trả về đúng email công việc).

2. **Xác nhận Remote**:
   - Dự án phải sử dụng SSH host `github.com-work`.
   - Kiểm tra bằng lệnh: `git remote -v`.
   - Nếu remote chưa đúng, cập nhật: `git remote set-url origin git@github.com-work:m-qu-le-md/studymed.git`.

3. **Thực hiện Commit & Push**:
   - Luôn cập nhật tài liệu `cline_docs/active_context.md` trước khi kết thúc tác vụ.
   - Thêm thay đổi: `git add .`
   - Commit với thông điệp rõ ràng theo ngữ cảnh (ví dụ: `feat: [tên tính năng]`, `fix: [lỗi]`, `docs: [tài liệu]`).
   - Đẩy code: `git push`.

## Lưu ý quan trọng
- **Bảo mật**: TUYỆT ĐỐI KHÔNG commit file `server/.env`.
- **Đồng bộ hóa tài liệu**: Nếu có thay đổi core (cấu trúc thư mục, API mới, thay đổi schema), phải cập nhật tương ứng vào các file trong `cline_docs/` trước khi push.
- **Pre-push**: Luôn xác nhận `git config --local user.email` và `git remote -v` để đảm bảo không bị lẫn sang tài khoản cá nhân.