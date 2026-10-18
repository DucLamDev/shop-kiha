# KIHA — Kết quả kiểm tra

Ngày kiểm tra: 18/10/2026, múi giờ Asia/Saigon.

Khắc phục khởi động local: `npm run dev` giờ tự bật MongoDB của dự án khi cần, chờ API rồi mới chạy website trên cổng cố định. Thêm khóa chống chạy trùng, kiểm tra cả IPv4/IPv6 và dọn cây tiến trình thuộc phiên trên Windows. `npm run test:startup` đạt 7/7 trường hợp với các dịch vụ thật; `npm run lint` đạt. Xác minh trang chủ HTTP 200, giữ dữ liệu qua lần chạy, giữ MongoDB mở riêng, không tự bật database dev trong production. Chi tiết ở `startup-results.json`. Sau kiểm tra, các cổng 3000/4000/27018 đã được giải phóng; dịch vụ MongoDB có sẵn tại 27017 vẫn giữ nguyên.

Bổ sung sau yêu cầu nâng cấp thiết kế: đã tạo 2 ảnh trang trí bằng imagegen tích hợp, tối ưu WebP 270.958 + 178.636 byte, giữ nguyên SHA-256 của 39 ảnh gốc. Đã kiểm tra lại lint, production build, 16 API test và 13 nhóm browser test sau thay đổi. Thêm 6 nhóm kiểm tra thiết kế: pause/resume, keyboard/hover danh mục, thay đổi reduced motion ngay trong phiên, responsive 320–1440px, chú thích ảnh AI, không có runtime error. Chi tiết tại `redesign-results.json`; ảnh mới tại `redesign-desktop.png`, `redesign-mobile.png`, `redesign-desktop-hero.png`, `redesign-mobile-hero.png`, `redesign-categories.png`, `redesign-story.png`, `redesign-contact.png`. API kiểm tra ảnh câu chuyện mới tồn tại trong thư viện và từ chối đường dẫn ngoài thư viện.

| Hạng mục | Kết quả thực tế |
| --- | --- |
| `npm run lint` | Thành công, không lỗi hoặc cảnh báo |
| `npm test` | 16/16 kiểm thử API đạt, database MongoDB tạm độc lập |
| `npm run build` | Next.js 16.4.2 production build thành công |
| `npm run test:browser` | 13/13 nhóm kiểm tra đạt, không có uncaught browser error |
| Viewport | Desktop 1440×1000, tablet 768×1024, mobile 390×844 |
| Danh mục xác nhận | Đủ 4 danh mục ở trang chủ, bộ lọc và admin; truy vấn từng danh mục trả đúng nhóm |
| CTA mobile | Kiểm tra riêng 3 trang công khai: Zalo ở header, không có nút nổi che nội dung |
| `npm audit` | 0 lỗ hổng được báo cáo |
| Production smoke | 6 URL công khai/SEO truy cập được; không hiện bản ghi demo; cookie Secure + HttpOnly |
| Ảnh gốc | SHA-256 của toàn bộ 39 ảnh không đổi so với audit ban đầu |
| MongoDB local | Cổng 27018, tách khỏi dịch vụ có sẵn tại 27017; dữ liệu lưu trong `.local/mongodb` |
| Chạy lại seed | Thành công, không nhân đôi bản ghi hoặc ghi đè cấu hình |
| Dọn dữ liệu QA | Không còn sản phẩm/danh mục QA; còn 6 bản ghi tham khảo, 4 danh mục chủ shop xác nhận, 41 asset (39 gốc + 2 AI) và 1 cấu hình |

Các vấn đề đã phát hiện và sửa trong quá trình kiểm tra: cú pháp JSX gallery, nhãn form select, layout quản trị tràn ngang trên mobile, metadata title lặp tên thương hiệu, tương thích API Mongoose, dependency lint có cảnh báo và thư viện xử lý ảnh phiên bản cũ. Các selector test xung đột với route announcer của Next.js cũng đã được sửa.

Chi tiết browser: `browser-results.json`. Chi tiết production: `production-results.json`. Ảnh chụp tại máy này: `home-desktop.png`, `home-mobile.png`, `catalog-mobile.png`, `product-desktop.png`, `admin-dashboard.png`.

Chưa publish lên hosting. Dữ liệu sáu sản phẩm là nhãn ảnh tham khảo rõ ràng, cần chủ shop xác nhận trước khi xuất bản production. Nội dung giá/thông số in trên ảnh gốc chưa được chuyển thành thông số bán hàng. Địa chỉ chữ chưa được cung cấp; đã dùng liên kết Google Maps chính chủ shop gửi. Không có upload ảnh từ trình duyệt trong MVP; bổ sung ảnh qua quy trình scan/seed.
