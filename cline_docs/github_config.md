# GitHub Account Configuration: Work Account

Đây là tài liệu hướng dẫn cấu hình Git cho dự án StudyMed để đảm bảo sử dụng đúng tài khoản GitHub Công việc (`mqule.md.hmu@gmail.com`).

## 1. Thông tin tài khoản (Work Context)
- **Email**: `mqule.md.hmu@gmail.com`
- **SSH Host**: `github.com-work`
- **SSH Key Path**: `C:\Users\lequa\.ssh\id_ed25519_work`

## 2. Cấu hình cục bộ (Local Git Config)
Khi làm việc trên dự án này, hãy đảm bảo các lệnh sau đã được thiết lập (chạy trong thư mục gốc dự án):

```bash
git config --local user.name "Quang Le"
git config --local user.email "mqule.md.hmu@gmail.com"
```

## 3. Remote URL Routing
Dự án này sử dụng SSH với định tuyến tùy chỉnh. Nếu cần thiết lập remote cho dự án, hãy sử dụng:

```bash
# Thiết lập remote cho tài khoản Công việc
git remote set-url origin git@github.com-work:Username/StudyMed.git
```

## 4. Checklist kiểm tra nhanh
Trước khi thực hiện `git push`, hãy chạy lệnh sau để xác nhận:
```bash
# Kiểm tra email cục bộ
git config --local user.email

# Kiểm tra URL remote
git remote -v
```
Kết quả `user.email` phải là `mqule.md.hmu@gmail.com` và `remote` phải chứa `github.com-work`.