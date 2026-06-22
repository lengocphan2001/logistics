# Quy tắc Dự án (Project Rules & Behavioral Constraints)

Mọi thay đổi mã nguồn, tính năng mới hoặc nâng cấp hệ thống trong tương lai đều phải tuân thủ nghiêm ngặt các quy tắc thiết kế và phát triển dưới đây.

---

## 1. Bảo mật & Bảo vệ Backend (Backend Security & Protection)

* **Xác thực và Phân quyền (Authentication & Authorization)**:
  - Mọi route biên (API endpoints) ngoại trừ đăng nhập/đăng ký công khai phải được bảo vệ bởi `JwtAuthGuard` và `RolesGuard`.
  - Không bao giờ cho phép bỏ qua kiểm tra quyền hạn trừ khi được chỉ định rõ ràng.
* **Bảo vệ dữ liệu nhạy cảm**:
  - Mật khẩu người dùng phải luôn được hash bằng `bcrypt` (với salt rounds tối thiểu là 10).
  - Phải sanitize đối tượng `User` trước khi trả về API client để xóa bỏ thuộc tính `password`. Không bao giờ trả về mật khẩu (dù đã được hash) ra ngoài API.
* **Validate dữ liệu ở biên**:
  - Sử dụng NestJS `ValidationPipe` kết hợp với `class-validator` và `class-transformer` để lọc sạch dữ liệu đầu vào.
  - Sử dụng Zod hoặc các schema tương đương ở frontend admin để validate dữ liệu trước khi gửi lên API.

---

## 2. Tối ưu truy vấn dữ liệu & Tránh lỗi N + 1 (Query Optimization & N+1 Prevention)

* **Tránh lỗi N+1**:
  - Không bao giờ viết vòng lặp (`map`, `forEach`, `for`) để gọi database liên tiếp hoặc truy vấn chi tiết cho từng bản ghi con sau khi đã lấy danh sách cha.
  - Sử dụng tính năng **Eager Loading** (dùng `include` trong Prisma Client) để JOIN các bản ghi liên quan (Relations) ngay trong một truy vấn duy nhất.
  - Ví dụ: Khi lấy danh sách User, JOIN kèm Warehouse phụ trách bằng `include: { warehouse: true }`.
* **Select các trường cần thiết**:
  - Khi không cần toàn bộ dữ liệu, hãy chỉ định cụ thể các trường cần lấy (dùng `select` của Prisma) để giảm thiểu kích thước payload chuyển giao từ cơ sở dữ liệu.
* **Pagination (Phân trang)**:
  - Tất cả các API liệt kê danh sách có nguy cơ phình to dữ liệu (Orders, Shipments, Customers, v.v.) phải hỗ trợ phân trang (`take`, `skip` trong Prisma) thay vì trả về toàn bộ DB.
