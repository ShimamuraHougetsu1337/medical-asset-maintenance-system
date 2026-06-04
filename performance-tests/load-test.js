import http from 'k6/http';
import { check, sleep } from 'k6';

// Cấu hình (Options) cho bài test
export let options = {
    // Kịch bản chịu tải (Stages)
    stages: [
        { duration: '10s', target: 50 }, // Giai đoạn 1: Tăng dần lên 50 người dùng ảo (VUs) trong 10 giây
        { duration: '30s', target: 50 }, // Giai đoạn 2: Giữ nguyên mức tải 50 VUs trong 30 giây
        { duration: '10s', target: 0 },  // Giai đoạn 3: Giảm tải từ từ về 0 trong 10 giây
    ],
    // Ngưỡng hiệu năng (Thresholds) để xác định bài test Pass hay Fail
    thresholds: {
        http_req_duration: ['p(95)<500'], // Yêu cầu: 95% request phải phản hồi dưới 500 mili-giây
        http_req_failed: ['rate<0.01'],   // Yêu cầu: Tỉ lệ lỗi (HTTP 500, Timeout...) phải nhỏ hơn 1%
    },
};

// URL của hệ thống (Nếu bạn đang chạy Spring Boot ở máy local thông thường)
const BASE_URL = 'http://localhost:8080/api';

// Hàm setup() chỉ chạy ĐÚNG 1 LẦN trước khi bắt đầu bài test
// Mục đích: Thực hiện login để lấy Token, tránh việc 50 VUs đều gọi login gây sai lệch kết quả test API
export function setup() {
    const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
        username: 'admin',
        password: 'admin123'
    }), {
        headers: { 'Content-Type': 'application/json' },
    });

    // Lấy token và trả về cho các hàm default sử dụng
    let token = loginRes.json('data.token');
    if (!token) {
        console.error("Không thể đăng nhập để lấy token. Vui lòng kiểm tra lại hệ thống.");
    }
    return { token: token };
}

// Hàm default() sẽ được chạy lặp đi lặp lại bởi TẤT CẢ các người dùng ảo (VUs)
export default function (data) {
    if (!data.token) {
        return; // Dừng nếu không có token
    }

    const params = {
        headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json',
        },
    };

    // Bắt đầu đo hiệu năng API lấy danh sách thiết bị
    let res = http.get(`${BASE_URL}/assets`, params);
    
    // Kiểm tra tính đúng đắn của dữ liệu trả về
    check(res, {
        'status is 200': (r) => r.status === 200,
        'has SUCCESS status': (r) => r.json('status') === 'SUCCESS',
        'has data array': (r) => r.json('data').length > 0,
    });

    // Giả lập thời gian User đọc danh sách (Think time)
    // Tránh spam máy chủ quá phi thực tế
    sleep(1); 
}
