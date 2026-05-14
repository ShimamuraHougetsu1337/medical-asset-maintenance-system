# YÊU CẦU DỰ ÁN: HỆ THỐNG QUẢN LÝ THIẾT BỊ Y TẾ VÀ BẢO TRÌ BỆNH VIỆN 
*(Medical Asset & Maintenance Management System)*

## 1. Tổng quan dự án
Đây là hệ thống quản lý tập trung toàn bộ thiết bị y tế trong bệnh viện, theo dõi lịch bảo trì, xử lý yêu cầu sửa chữa, quản lý tồn kho linh kiện và phân quyền người dùng theo vai trò (RBAC). Hệ thống tập trung vào xử lý logic nghiệp vụ phức tạp (như trừ tồn kho an toàn, sinh lịch bảo trì tự động) thay vì chỉ làm các tính năng CRUD cơ bản.

## 2. Công nghệ sử dụng (Tech Stack)
* **Backend:** Spring Boot 3.x (Java 17/21), Spring Web, Spring Data JPA, Spring Security (JWT stateless), PostgreSQL/MySQL, OpenAPI/Swagger.
* **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI (Headless components), React Hook Form + Zod.
* **Architecture:** Backend phân tầng (Controller -> Service -> Repository -> Entity), dùng DTO. Frontend tách biệt Server Components (fetch data) và Client Components (tương tác UI).

## 3. Vai trò người dùng (Roles)
* **ADMIN:** Quản lý toàn bộ hệ thống, phân công kỹ thuật viên.
* **DOCTOR:** Báo hỏng thiết bị, theo dõi tiến độ.
* **ENGINEER:** Nhận yêu cầu sửa chữa, báo cáo sử dụng linh kiện, hoàn thành sửa chữa.
* **MANAGER:** Xem báo cáo thống kê, chi phí, lịch bảo trì.

---

## 4. Các Giai đoạn Triển khai (Phases)

Khi tôi yêu cầu bạn (AI) code, hãy bám sát kiến trúc và logic của 5 giai đoạn sau:

### Giai đoạn 1 & 2: Thiết lập cơ bản và Luồng Báo hỏng (Core Base & Reporting)
**Backend:**
* **Entities chính:** `User`, `Asset` (trạng thái: AVAILABLE, BROKEN, UNDER_MAINTENANCE), `ServiceRequest` (PENDING, ASSIGNED, COMPLETED), `Inventory`.
* **API:** `POST /api/assets/{id}/report-failure` (Bác sĩ gọi API này -> Đổi Asset thành BROKEN -> Tạo ServiceRequest mới trạng thái PENDING).
* **Cấu hình:** File `pom.xml`, `application.yml` (chuẩn bị cho JWT và DB).

**Frontend:**
* Cấu hình `axios` interceptor gắn JWT token tự động.
* Trang `/app/assets/page.tsx` (Server Component) hiển thị danh sách thiết bị.
* Modal/Form "Báo hỏng" dùng React Hook Form + Zod để gọi API báo hỏng.

### Giai đoạn 3: Xác thực và Phân quyền (Auth & RBAC)
**Backend:**
* API `POST /api/auth/login` nhận `{username, password}`, trả về `{ token, username, role }`.
* Cấu hình `JwtAuthenticationFilter` để giải mã JWT, bảo vệ `/api/assets/**` và kiểm tra quyền (`@PreAuthorize`).

**Frontend:**
* Trang `/app/login/page.tsx`.
* Lưu token vào HTTP-only cookie sau khi đăng nhập thành công.
* Dùng `middleware.ts` của Next.js để chặn người dùng chưa đăng nhập truy cập `/app/**` và điều hướng layout theo Role.

### Giai đoạn 4: Luồng Sửa chữa và Quản lý Tồn kho (Engineer Flow & Inventory)
**Backend:**
* API `POST /api/service-requests/{id}/complete`.
* **Nghiệp vụ (Dùng `@Transactional`):** 1. Nhận payload chứa danh sách linh kiện đã dùng (`usedParts`).
    2. Kiểm tra `Inventory`, nếu số lượng không đủ -> Ném lỗi `InsufficientStockException`.
    3. Trừ số lượng tồn kho.
    4. Tạo `ServiceLog` ghi lại lịch sử sửa chữa.
    5. Đổi trạng thái `ServiceRequest` thành COMPLETED, `Asset` thành AVAILABLE.

**Frontend:**
* Trang `/app/repairs/page.tsx` cho Engineer.
* Modal "Hoàn thành sửa chữa": Chứa form động (Field Array) cho phép thêm nhiều linh kiện thay thế và nhập số lượng, xử lý hiển thị Toast báo lỗi nếu backend trả về lỗi thiếu tồn kho.

### Giai đoạn 5: Tự động hóa và Thống kê (Automation & Dashboard)
**Backend:**
* **Cron Job:** Cấu hình `@Scheduled` chạy hằng ngày lúc 00:00, quét các `Asset` đến hạn bảo trì và tự động tạo `MaintenanceSchedule` mới.
* **API Báo cáo:** GET thống kê số lượng thiết bị theo trạng thái (Pie Chart) và danh sách linh kiện sắp hết hạn mức (Low Stock Alerts).

**Frontend:**
* Trang `/app/dashboard/page.tsx` cho Manager.
* Dùng thư viện Recharts vẽ biểu đồ trạng thái thiết bị.
* Hiển thị bảng cảnh báo linh kiện tồn kho thấp bằng thẻ Card của Shadcn UI.

---

## 5. Quy tắc Code (Coding Guidelines) cho AI
1.  **Backend:** Không bao giờ trả trực tiếp Entity ra Controller, bắt buộc dùng DTO. Luôn có Global Exception Handler (`@ControllerAdvice`) để bắt và trả về JSON lỗi chuẩn mực. Dùng Lombok để code gọn gàng.
2.  **Frontend:** Ưu tiên giao diện sáng sủa, chuyên nghiệp (Admin Dashboard) với Tailwind CSS. Bắt buộc có validation dữ liệu ở Frontend bằng Zod trước khi gửi Request.
3.  **Output:** Khi sinh code, hãy cung cấp code hoàn chỉnh cho từng file, không viết kiểu "bỏ qua phần này để cho ngắn". Có comment giải thích các logic nghiệp vụ quan trọng.