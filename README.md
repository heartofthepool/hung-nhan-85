# Bún cá cay Hùng Nhàn 85 — Gọi món bằng giọng nói

Web app chạy trên iPad: nhận order bằng giọng nói, màn hình bếp 2 cột, báo cáo theo chi nhánh.

- `index.html` — toàn bộ app (một file).
- `firestore.rules` — quy tắc bảo mật Firestore (dán vào tab **Rules** của Firestore).

## Bật đồng bộ nhiều iPad
Mở `index.html`, tìm dòng `var FIREBASE_CONFIG = window.FIREBASE_CONFIG || null;` và thay `null` bằng đoạn `firebaseConfig` của project Firebase.

Mỗi iPad đăng nhập tài khoản quán (tạo trong Firebase → Authentication → Users) một lần.
