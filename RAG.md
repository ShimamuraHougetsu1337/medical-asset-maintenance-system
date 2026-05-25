# Hướng dẫn quy trình Chatbot RAG trong hệ thống quản lý thiết bị y tế

Chatbot RAG trong hệ thống được thiết kế như một lớp hỗ trợ nghiệp vụ, giúp người dùng thao tác đúng quy trình, giảm lỗi vận hành và tăng hiệu quả sử dụng hệ thống.

Không tập trung vào xử lý dữ liệu giao dịch (CRUD), chatbot tập trung vào:
- Giải thích quy trình
- Hướng dẫn thao tác
- Diễn giải trạng thái hệ thống
- Hỗ trợ chẩn đoán lỗi nghiệp vụ

---

# 1. Hướng dẫn sử dụng hệ thống (System Onboarding)

## 1.1. Đăng ký tài khoản

### Nội dung hỗ trợ:
- Cách tạo tài khoản mới
- Thông tin cần nhập
- Quy tắc mật khẩu

### Nội dung chatbot RAG:
- Điều kiện username hợp lệ
- Quy tắc password (độ dài, ký tự)
- Vai trò mặc định khi đăng ký (thường là DOCTOR)

### Ví dụ câu hỏi:
- “Tôi đăng ký tài khoản như thế nào?”
- “Password hợp lệ gồm những gì?”

---

## 1.2. Đăng nhập hệ thống

### Nội dung hỗ trợ:
- Quy trình đăng nhập
- Xử lý lỗi đăng nhập

### Nội dung RAG:
- JWT authentication là gì
- Lỗi thường gặp: sai mật khẩu, token hết hạn

### Ví dụ:
- “Tại sao tôi không đăng nhập được?”
- “Token expired là gì?”

---

## 1.3. Quên mật khẩu

### Nội dung hỗ trợ:
- Quy trình reset password
- Email xác thực

### Nội dung RAG:
- Flow reset password
- Bảo mật token reset

---

## 1.4. Chỉnh sửa profile

### Nội dung hỗ trợ:
- Cập nhật thông tin cá nhân
- Giới hạn chỉnh sửa theo role

### Nội dung RAG:
- Trường nào được phép chỉnh sửa
- Quy tắc phân quyền khi update profile

---

# 2. Hướng dẫn theo từng vai trò người dùng

---

## 2.1. Bác sĩ (DOCTOR)

### Nhiệm vụ chính:
- Báo hỏng thiết bị
- Theo dõi tiến độ sửa chữa

---

### 2.1.1. Báo hỏng thiết bị

#### Quy trình:
1. Chọn thiết bị từ danh sách AVAILABLE
2. Nhập mô tả lỗi
3. Gửi yêu cầu báo hỏng

#### RAG hỗ trợ:
- Khi nào được phép báo hỏng
- Thiết bị nào không thể báo hỏng (BROKEN / UNDER_MAINTENANCE)
- Ý nghĩa trạng thái sau khi báo hỏng

#### Ví dụ:
- “Máy X không hoạt động thì báo như thế nào?”
- “Tại sao tôi không báo hỏng được thiết bị này?”

---

### 2.1.2. Theo dõi tiến độ sửa chữa

#### RAG hỗ trợ:
- Trạng thái PENDING / COMPLETED nghĩa là gì
- Khi nào thiết bị được trả về AVAILABLE

#### Ví dụ:
- “Thiết bị của tôi đang ở trạng thái gì?”
- “Bao lâu thì sửa xong?”

---

## 2.2. Kỹ thuật viên (ENGINEER)

### Nhiệm vụ chính:
- Nhận yêu cầu sửa chữa
- Thực hiện sửa chữa
- Quản lý linh kiện sử dụng

---

### 2.2.1. Nhận thiết bị sửa chữa

#### Quy trình:
1. Xem danh sách ServiceRequest PENDING
2. Chọn yêu cầu
3. Bắt đầu xử lý

#### RAG hỗ trợ:
- ServiceRequest lifecycle
- Ý nghĩa trạng thái ASSIGNED / COMPLETED

---

### 2.2.2. Quy trình sửa chữa

#### Các bước:
1. Kiểm tra lỗi thiết bị
2. Xác định linh kiện cần thay
3. Ghi nhận ServiceLog
4. Cập nhật trạng thái hoàn thành

#### RAG hỗ trợ:
- Quy trình chuẩn sửa chữa theo loại thiết bị
- Checklist kỹ thuật
- Các lỗi phổ biến theo thiết bị

#### Ví dụ:
- “Máy ECG không nhận tín hiệu xử lý thế nào?”
- “Quy trình thay cảm biến X là gì?”

---

### 2.2.3. Gợi ý linh kiện

#### RAG hỗ trợ:
- Lịch sử sửa chữa thiết bị tương tự
- Linh kiện thường dùng theo loại thiết bị

---

# 3. Hỗ trợ kiểm tra quy trình (Process Validation)

## 3.1. Kiểm tra báo hỏng

### RAG hỗ trợ:
- Điều kiện hợp lệ để tạo ServiceRequest
- Asset status rules

### Ví dụ:
- “Tại sao báo hỏng bị lỗi?”
- “Thiết bị này có thể báo hỏng không?”

---

## 3.2. Kiểm tra sửa chữa

### RAG hỗ trợ:
- Khi nào ServiceRequest được phép COMPLETED
- Inventory validation rules

### Ví dụ:
- “Vì sao không thể hoàn thành sửa chữa?”
- “Thiếu linh kiện thì xử lý thế nào?”

---

# 4. Hỗ trợ sự cố hệ thống (System Troubleshooting)

## 4.1. Lỗi đăng nhập

### RAG hỗ trợ:
- JWT expired
- Sai username/password
- Role không hợp lệ

---

## 4.2. Lỗi phân quyền

### RAG hỗ trợ:
- HTTP 403 nghĩa là gì
- @PreAuthorize hoạt động như thế nào

---

## 4.3. Lỗi nghiệp vụ

### RAG hỗ trợ:
- InsufficientStockException
- Asset không hợp lệ để sửa/báo hỏng

---

## Ví dụ:
- “Tại sao tôi bị lỗi 403?”
- “Vì sao không đủ linh kiện để sửa máy?”

---

# 5. Tra cứu thống kê nhanh (Analytics Assistant)

## 5.1. Thống kê thiết bị

### Câu hỏi:
- Khoa nào có nhiều thiết bị hỏng nhất?
- Thiết bị nào hay hỏng nhất?

### RAG hỗ trợ:
- repair count logic
- asset status distribution

---

## 5.2. Thống kê thời gian sửa chữa

### Câu hỏi:
- Trung bình mất bao lâu để sửa thiết bị?
- Khoa nào có downtime cao nhất?

### RAG hỗ trợ:
- created_at → completed_at logic

---

## 5.3. Thống kê linh kiện

### Câu hỏi:
- Linh kiện nào được dùng nhiều nhất?
- Kho nào sắp hết hàng?

### RAG hỗ trợ:
- service_log_parts aggregation

---

# 6. Nguyên tắc thiết kế chatbot RAG

## 6.1. Không xử lý giao dịch
Chatbot không:
- Tạo ServiceRequest
- Update database
- Trừ inventory

→ Các hành động này phải qua API backend

---

## 6.2. Chỉ xử lý tri thức
Chatbot chỉ:
- Giải thích quy trình
- Hướng dẫn thao tác
- Diễn giải lỗi
- Truy xuất tài liệu nghiệp vụ

---

## 6.3. Phân tách dữ liệu RAG

### Nên đưa vào RAG:
- SOP quy trình
- Workflow hệ thống
- Giải thích trạng thái
- Quy tắc nghiệp vụ
- Hướng dẫn sử dụng

### Không đưa vào RAG:
- Dữ liệu realtime (inventory, service_requests)
- Dữ liệu cá nhân user
- Transaction state

---

# 7. Kết luận

Chatbot RAG trong hệ thống đóng vai trò:

> “Trợ lý nghiệp vụ y tế – hỗ trợ vận hành hệ thống thiết bị và bảo trì”

Mục tiêu:
- Giảm sai sót thao tác
- Chuẩn hóa quy trình
- Hỗ trợ người dùng theo vai trò
- Giải thích hệ thống thay vì chỉ hiển thị dữ liệu

---