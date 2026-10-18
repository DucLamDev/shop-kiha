# Nội Thất KIHA

Website trưng bày giường ngủ pallet, nhận tư vấn qua Zalo. Mã nguồn hoàn chỉnh gồm Next.js App Router và Express API riêng; dữ liệu được lưu trong MongoDB, không dùng localStorage để giả lập backend.

## Chạy bản đã thiết lập trên máy này

Chỉ cần một terminal tại thư mục dự án:

```powershell
npm run dev
```

- Website: <http://localhost:3000>
- Quản trị: <http://localhost:3000/admin>
- API health: <http://127.0.0.1:4000/api/health>
- Tài khoản local đã tạo được lưu trong `.local/admin-credentials.txt`. File này và `.env` được loại khỏi Git. Mật khẩu là chuỗi ngẫu nhiên, không có mật khẩu mặc định trong source.
- Lệnh tự bật MongoDB local nếu chưa chạy, chờ API sẵn sàng rồi mới mở Next.js. Dữ liệu vẫn lưu trong `.local/mongodb`.
- Dừng bằng `Ctrl+C`. Runner dừng các tiến trình do phiên này tạo, gồm cả tiến trình con của Next.js/API trên Windows. Nếu MongoDB đã được bạn mở riêng, runner dùng lại và không dừng nó.
- Chạy lệnh lần thứ hai sẽ báo phiên đang chạy. Cổng website được cố định ở `3000`; không tự chuyển sang `3001` vì liên kết và cấu hình bảo vệ API phải cùng origin.
- Không xóa `.local/mongodb` nếu muốn giữ nội dung đã quản trị. `npm run db:local` vẫn dùng được khi cần chạy database riêng để seed hoặc quản trị dữ liệu.

## Cài đặt từ đầu

Yêu cầu Node.js 22 trở lên, npm và kết nối Internet trong lần cài đặt đầu. Dự án đã được kiểm tra với Node.js 24.12.0. Không cần cài MongoDB toàn hệ thống hoặc chạy Docker để dùng chế độ local.

```powershell
npm ci
# Chỉ sao chép khi chưa có .env; không ghi đè cấu hình hiện tại.
Copy-Item .env.example .env
npm run media:scan
npm run db:local
```

Giữ terminal MongoDB đang chạy. Ở terminal khác:

```powershell
npm run seed
npm run admin:create -- --generate-local
npm run dev
```

Lần chạy `db:local` đầu tải binary MongoDB 8.0.17, khoảng 756 MB trên Windows. Thư viện `mongodb-memory-server` chỉ quản lý tiến trình: database local sử dụng **mongod thật**, storage engine WiredTiger, ghi vào `.local/mongodb`. Test API sử dụng một database tạm riêng và tự dọn sau test. Không dùng runner này làm dịch vụ database production.

Nếu muốn dùng một dịch vụ MongoDB có sẵn, đặt `MONGODB_URI` tương ứng và bỏ qua `db:local`. Runner local dùng đúng cổng trong URI, mặc định **27018**, để tránh xung đột với dịch vụ MongoDB 27017 đã có trên máy. Không có thay đổi nào đối với dịch vụ database đó.

`npm run dev` chỉ tự khởi động database cho URI local `mongodb://127.0.0.1:27018/kiha` (hoặc `localhost`) không có tài khoản. Với URI khác, database cần sẵn sàng trước khi chạy. `npm start` luôn yêu cầu MongoDB đã chạy và không tự bật database phát triển.

Nếu gặp `ECONNREFUSED ...:27018` trên bản cũ, cập nhật mã rồi chạy lại `npm run dev`. Nếu cổng `3000`/`4000` đang bận, dừng phiên cũ bằng `Ctrl+C` trong terminal đang chạy nó; runner không tự tắt tiến trình khác. Một khóa phiên bị bỏ lại khi đóng cưỡng bức terminal sẽ được bỏ qua ở lần chạy tiếp theo khi PID cũ đã dừng.

Kiểm tra hồi quy khởi động bằng `npm run test:startup` khi đã dừng các phiên KIHA. Bộ kiểm tra dùng dịch vụ thật, xác minh thứ tự khởi động, mở trùng, dừng giữa chừng, lưu dữ liệu qua lần chạy và quyền sở hữu MongoDB; không ghi dữ liệu cửa hàng. Kết quả ở `reports/startup-results.json`.

## Biến môi trường

Toàn bộ cấu hình ban đầu đặt trong `.env` tại root; xem `.env.example`.

| Biến                            | Mục đích                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| `MONGODB_URI`                   | URI MongoDB, local mặc định `mongodb://127.0.0.1:27018/kiha`                            |
| `API_PORT`, `API_HOST`          | Cổng và interface Express; mặc định 4000 và loopback                                    |
| `API_INTERNAL_URL`              | Địa chỉ nội bộ từ Next.js đến Express; không đưa lên client                             |
| `SITE_URL`                      | URL website, dùng cho canonical, Open Graph và sitemap                                  |
| `ALLOWED_ORIGINS`               | Danh sách origin được phép ghi API, phân cách bằng dấu phẩy                             |
| `SEED_DEMO`                     | Chỉ tạo dữ liệu mẫu khi chưa có bộ ảnh sản phẩm đã đặt tên; không dùng trong production |
| `VIDEO_UPLOAD_DIR`              | Thư mục lưu video bền vững; mặc định `.local/uploads/videos`                            |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Chỉ dùng để tạo tài khoản admin bằng CLI                                                |
| `SHOP_*`                        | Giá trị liên hệ ban đầu cho seed, xem file mẫu                                          |

Frontend gọi `/api` cùng origin. Next.js chuyển tiếp sang Express; trình duyệt không cần biết địa chỉ backend. Sau khi seed, cấu hình liên hệ và nội dung thương hiệu nằm trong MongoDB, được sửa tại `/admin/cai-dat`. Chạy lại seed **không ghi đè** nội dung admin đã chỉnh. `.env` local đã chứa thông tin liên hệ chủ shop cung cấp trong phiên làm việc.

## Khởi tạo admin an toàn

Đối với môi trường thật, cung cấp `ADMIN_EMAIL` và `ADMIN_PASSWORD` qua môi trường hoặc file `.env` không commit, sau đó chạy:

```powershell
npm run admin:create
```

Mật khẩu phải dài ít nhất 14 ký tự, tối đa 72 byte UTF-8 theo giới hạn bcrypt. Script từ chối ghi đè tài khoản đã tồn tại. Xóa các biến khởi tạo khỏi `.env` sau khi tạo xong. Không có endpoint đăng ký admin công khai.

`--generate-local` chỉ dành cho phát triển: sinh mật khẩu ngẫu nhiên và ghi vào file local bị Git ignore. Không dùng tài khoản local hoặc file thông tin này khi triển khai thật.

## Tính năng

### Giao diện KIHA mới

Trang chủ dùng bố cục tạp chí nội thất với ảnh lớn, danh mục đổi ảnh theo hover/focus, bộ sưu tập so le và phần câu chuyện màu olive. Chuyển động gồm parallax khi cuộn, chữ chạy, dấu ấn xoay, CTA phản hồi theo chuột và hiệu ứng xuất hiện. Nút tạm dừng ở dưới ảnh đầu trang; cài đặt giảm chuyển động của thiết bị được áp dụng ngay khi thay đổi.

Hai ảnh trang trí được tạo bằng công cụ imagegen tích hợp, lưu bản PNG tại `output/imagegen/`, prompt đầy đủ tại `data/editorial-prompts.json`, ánh xạ WebP tại `data/editorial-media.json`. Tổng WebP khoảng 450 KB. 39 ảnh gốc trong `img/` được giữ nguyên; các sản phẩm và danh mục vẫn sử dụng ảnh KIHA. Ảnh AI có chú thích rõ ràng và tên bắt đầu bằng `AI` trong thư viện quản trị.

Đổi ảnh đầu trang và ảnh câu chuyện tại **Quản trị → Cài đặt → Hình ảnh thương hiệu**. Seed mới tạo sẵn cấu hình ảnh; seed lại không ghi đè lựa chọn của admin. `scripts/apply-editorial.mjs` chỉ dùng để nâng cấp bản local ban đầu: đổi đúng ảnh hero mặc định cũ và điền ảnh câu chuyện khi còn trống. Khi cần tối ưu lại PNG đã lưu, chạy `node scripts/import-editorial.mjs` rồi `npm run seed` để đăng ký asset mới.

Kiểm tra giao diện với `npm run test:design` khi MongoDB và web đang chạy. Ảnh chụp và kết quả nằm trong `reports/redesign-*`.

### Khách hàng

- Trang chủ tông kem, beige và nâu gỗ; dùng logo và ảnh KIHA có sẵn.
- Bộ sưu tập có tìm kiếm, lọc danh mục, sắp xếp và phân trang phía server. Bộ lọc nằm trong URL và hỗ trợ back/forward.
- Trang chi tiết với gallery, phóng to ảnh, video có nút phát/tạm dừng/tua, nội dung video bằng văn bản, thông số, giá tùy chọn và sản phẩm liên quan.
- CTA Zalo, gọi điện, Facebook, TikTok, Google Maps lấy từ cấu hình. Không có giỏ hàng hay thanh toán.
- Sao chép tên và URL sản phẩm để dán vào Zalo; không giả lập khả năng tự điền tin nhắn của Zalo.
- Header mobile dạng drawer, animation Motion có hỗ trợ reduced motion, trạng thái loading, empty, error và 404.
- SEO server rendering, metadata riêng, canonical, Open Graph, sitemap, robots, Organization và breadcrumb JSON-LD. Không tạo giá/đánh giá giả trong dữ liệu có cấu trúc.
- `next/image`, `next/font` với Be Vietnam Pro và Manrope; Tailwind CSS và các primitive shadcn/ui dựa trên Radix.

### Quản trị

- Đăng nhập, đăng xuất, dashboard và kiểm tra phiên từ backend.
- CRUD sản phẩm và danh mục; chặn xóa danh mục còn sản phẩm.
- Tên, slug, mô tả, danh mục, gallery, ảnh đại diện, thứ tự ảnh, thông số, giá tùy chọn, nổi bật, draft/published và SEO đều chỉnh sửa được.
- Lưu lịch sử slug và chuyển hướng 308 từ slug cũ khi sản phẩm còn được công khai.
- Xem trước nội dung sản phẩm chưa lưu.
- Thư viện ảnh có tìm kiếm, phân trang, thông tin định dạng/kích thước và xem ảnh lớn.
- Upload video MP4/WebM, tiến độ và hủy tải, chọn lại từ thư viện, gỡ khỏi sản phẩm, xóa video chưa được sử dụng.
- Một sản phẩm có danh mục chính và nhiều danh mục bổ sung; bộ lọc tìm theo tất cả các nhóm đã chọn.
- Cấu hình logo, ảnh hero, nội dung hero, giới thiệu, nội dung tư vấn/cam kết, liên hệ và SEO.
- Form có validation, thông báo kết quả, dialog xác nhận xóa; phản hồi khi hết phiên hoặc lỗi API.

## Bộ ảnh và danh mục của chủ shop

Đã nhập **38 sản phẩm thật theo tên ảnh**, gồm 37 PNG và 1 JPEG, từ `apps/web/public/media/Tên Giường/`. Nhóm được xác định bằng cách đối chiếu SHA-256 với các bản sao trong `apps/web/public/media/Phân loại/<tên danh mục>/`, không suy đoán theo ảnh. Sáu nhóm gồm **Giường pallet bệt**, **Giường pallet hộp**, **Giường pallet gấp gọn**, **Giường pallet gấp làm ghế sofa**, **Giường pallet chân cao**, **Nệm**.

Ảnh trong nhiều nhóm được nhập thành một sản phẩm có nhiều danh mục. Giữ nguyên tên do chủ shop đặt, chỉ bỏ đuôi file và khoảng trắng dư. Hai tên khác dấu có thể tạo cùng slug không dấu; importer thêm mã ngắn để đường dẫn không trùng. Sáu mẫu chạy thử ban đầu được chuyển sang nháp, không xóa. Giá và thông số chưa được cung cấp riêng nên để trống; CTA hiển thị “Liên hệ báo giá”.

- `data/owner-catalog.json`: tên ảnh, định dạng thật, SHA-256 và nhóm đối chiếu.
- `data/product-image-map.json`: 38 sản phẩm → slug, ảnh gốc, ảnh phục vụ web và các danh mục.
- `data/media-manifest.json`: kiểm kê 39 ảnh cũ trong `img/`, vẫn được bảo toàn.
- `apps/web/public/media/`: giữ nguyên các thư mục chủ shop; bản sao phục vụ web dùng tên SHA-256.
- `.local/backups/catalog-*.json`: bản sao dữ liệu sản phẩm, danh mục, ảnh và cấu hình trước mỗi lần nhập; không chứa tài khoản/phiên admin.

Khi bổ sung hoặc đổi tên/phân nhóm ảnh, giữ cấu trúc hai thư mục trên rồi chạy (khi MongoDB đã bật):

```powershell
npm run catalog:import
```

Lệnh quét kiểm tra đủ ảnh khớp rồi mới nhập; cập nhật tên/nhóm theo file, không sửa mô tả, giá, video hoặc trạng thái đã chỉnh trong admin. Không tự xóa sản phẩm khi ảnh biến mất. Danh tính bản nhập được nhận diện theo SHA-256; thay nội dung ảnh sẽ tạo sản phẩm mới. `npm run seed` dùng bộ ảnh này cho cài đặt mới; chạy lại không ghi đè tên/nhóm đã sửa trong admin và không tạo trùng. Thêm danh mục mới ngoài sáu nhóm cần bổ sung `data/catalog.json` trước khi nhập.

Với ảnh gallery bổ sung không tạo sản phẩm mới: đặt vào `img/`, chạy `npm run media:scan` rồi `npm run seed`, sau đó chọn ảnh trong admin. Không tự xóa hoặc đổi tên file gốc. Địa chỉ dạng chữ vẫn để trống vì chủ shop cung cấp liên kết Google Maps.

## Video sản phẩm

Trong **Quản trị → Sản phẩm → Chỉnh sửa → Video giới thiệu**, chọn **Tải video lên**, chờ hoàn tất rồi **Lưu sản phẩm**. Mỗi sản phẩm gắn một video. Có thể chọn video đã tải, thay hoặc gỡ video; nhập mô tả/chép lời trong “Nội dung video bằng văn bản”. Thư viện tại **Ảnh & video** cho phép quản lý và xóa video chưa dùng. Gỡ video chỉ bỏ liên kết, không xóa file.

API nhận `multipart/form-data` với đúng một field file tên `video`, tối đa **100 MB**, định dạng **MP4/WebM**. Kiểm tra phiên admin, Origin, đuôi file, MIME và chữ ký nội dung; ghi tạm xuống đĩa rồi chuyển sang tên UUID. API không chuyển mã codec hoặc tạo phụ đề tự động; nên xuất MP4 H.264/AAC. Video tải lên chưa gắn với sản phẩm công khai chỉ xem được bằng phiên admin. Trình phát không autoplay, tải khi cần và hỗ trợ HTTP Range để tua.

File nằm ngoài `public/`, mặc định `.local/uploads/videos`. Phải sao lưu thư mục này **cùng MongoDB**. Khi triển khai dùng `VIDEO_UPLOAD_DIR` trỏ tới volume bền vững, cho tiến trình API quyền đọc/ghi và đặt giới hạn reverse proxy lớn hơn 100 MB để tính cả multipart overhead. Không sử dụng filesystem tạm của serverless cho video.

## Cấu trúc

```text
apps/
  web/
    app/(store)/                 Trang chủ, danh sách, chi tiết, liên hệ
    app/admin/(protected)/       Các trang admin kiểm tra phiên server
    app/admin/dang-nhap/         Đăng nhập
    components/admin/            Form, bảng, media picker, dashboard
    components/ui/               Button, dialog theo shadcn/Radix
    lib/                         API client, server fetch, helpers
    public/media/                Bản sao ảnh được scan
  api/src/
    models.mjs                   Mongoose schemas và indexes
    validation.mjs               Zod schemas
    auth.mjs                     Phiên quản trị và kiểm tra quyền
    app.mjs                      REST routes, middleware, lỗi thống nhất
    server.mjs                   Điểm khởi chạy Express
img/                             39 file gốc, bảo toàn
scripts/                         Quét ảnh, seed, admin, local DB, browser QA
tests/api.test.mjs                Kiểm thử tích hợp API với MongoDB thật
data/                            Manifest ảnh và ánh xạ sản phẩm
reports/                         Kiểm kê, kết quả QA và ảnh chụp local
.local/                          Database local, thông tin admin; không commit
```

## API chính

Response thành công: `{ "data": ... }`. Lỗi: `{ "error": { "message": "...", "fields": [...] } }`. Danh sách sản phẩm/media trả `items`, `total`, `page`, `pages`; sản phẩm có thêm `limit`.

| Method           | Endpoint                    | Nội dung                                                              |
| ---------------- | --------------------------- | --------------------------------------------------------------------- |
| GET              | `/api/health`               | Kiểm tra API và database                                              |
| GET              | `/api/categories`           | Danh mục đang hoạt động                                               |
| GET              | `/api/products`             | Sản phẩm public; `q`, `category`, `sort`, `page`, `limit`, `featured` |
| GET              | `/api/products/:slug`       | Chi tiết, bao gồm khả năng nhận slug cũ                               |
| GET              | `/api/settings/public`      | Cấu hình công khai                                                    |
| POST             | `/api/admin/auth/login`     | Đăng nhập, giới hạn 10 lần/15 phút/IP                                 |
| GET              | `/api/admin/auth/me`        | Kiểm tra phiên                                                        |
| POST             | `/api/admin/auth/logout`    | Thu hồi phiên trên server                                             |
| GET              | `/api/admin/stats`          | Tổng quan                                                             |
| GET, POST        | `/api/admin/products`       | Liệt kê/tạo sản phẩm                                                  |
| GET, PUT, DELETE | `/api/admin/products/:id`   | Đọc/sửa/xóa sản phẩm                                                  |
| GET, POST        | `/api/admin/categories`     | Liệt kê/tạo danh mục                                                  |
| PUT, DELETE      | `/api/admin/categories/:id` | Sửa/xóa danh mục                                                      |
| GET              | `/api/admin/media`          | Tìm kiếm/phân trang asset                                             |
| GET, POST        | `/api/admin/videos`         | Thư viện / upload multipart field `video` (100 MB)                    |
| DELETE           | `/api/admin/videos/:id`     | Xóa video chưa gắn với sản phẩm                                       |
| GET, HEAD        | `/api/videos/:filename`     | Phát video, hỗ trợ Range; video nháp cần phiên admin                  |
| GET, PUT         | `/api/admin/settings`       | Đọc/sửa cấu hình                                                      |

Mọi API admin trừ login đều kiểm tra tài khoản active và quyền admin từ database. Mutations yêu cầu `Origin` trong allowlist, kể cả khi gọi bằng cURL. Cookie HttpOnly, SameSite=Lax, Secure khi production. Session token ngẫu nhiên 256 bit, database chỉ giữ SHA-256 của token, thời hạn 8 giờ và TTL index. Đăng xuất thu hồi token, không chỉ xóa cookie.

Zod dùng schema strict, validate ObjectId, slug, URL của từng kênh và ảnh trong manifest; chống truyền object query để NoSQL injection. JSON body tối đa 100 KB; upload video có giới hạn riêng 100 MB. Sản phẩm dùng `category` cho danh mục chính, `categories` cho các nhóm, `video` cho đường dẫn trả về từ API upload và `videoDescription` cho nội dung văn bản. Helmet, CORS allowlist, generic production errors; không trả password hash hay stack trace cho client.

## Kiểm thử

```powershell
npm run lint
npm test
npm run build
# Cần npm run dev đang chạy (tự bật MongoDB local), Chrome đã cài:
npm run test:browser
npm audit
```

API test chạy 23 trường hợp với database tạm độc lập: auth, CSRF, CRUD, slug, ảnh, lọc nhiều danh mục, trạng thái hiển thị, settings, session, rate limit; upload MP4/WebM, từ chối giả định dạng/quá dung lượng, dọn file lỗi, quyền xem video, Range và xóa video đang sử dụng.

Browser QA dùng Playwright + Chrome headless, kiểm tra desktop 1440 px, tablet 768 px và mobile 390 px. Có thao tác tạo/sửa/xuất bản/xóa dữ liệu QA, lựa chọn và sắp xếp ảnh, cập nhật lại cấu hình không thay đổi giá trị, thử lỗi API rồi retry. Script chỉ xóa các bản ghi QA do chính lần chạy tạo ra. Kết quả ghi ở `reports/browser-results.json`; screenshots trong `reports/`. Bộ test browser kiểm tra cấu hình KIHA ban đầu, nên cần cập nhật assertion khi bạn đổi số điện thoại hoặc kênh liên hệ.

## Triển khai production

1. Dùng MongoDB Atlas hoặc MongoDB được vận hành riêng với xác thực, sao lưu và hạn chế mạng. Thay `MONGODB_URI`, `SITE_URL`, `ALLOWED_ORIGINS`, `API_INTERNAL_URL` theo môi trường. Không đưa credentials vào source.
2. Chạy `npm ci`, `npm run media:scan`. Phân phối cả `apps/web/public/media/` cùng ứng dụng. Đây là asset tĩnh lúc build/deploy, không phụ thuộc filesystem tạm để upload.
3. Đặt `NODE_ENV=production`, `SEED_DEMO=false` rồi chạy `npm run seed` để khởi tạo asset/cấu hình vào database production; cung cấp giá trị `SHOP_*` thật trước lần seed đầu. Tạo admin production bằng biến môi trường.
4. Hoàn thiện dữ liệu thật trong admin. Không dùng database local và tài khoản local cho production.
5. Chạy `npm run build`, sau đó `npm start`. Lệnh start chạy Next.js và Express với `NODE_ENV=production`. Trên hạ tầng thật nên dùng process manager/service riêng cho từng ứng dụng.
6. Reverse proxy HTTPS vào Next.js cổng 3000. Express cổng 4000 chỉ cần truy cập nội bộ. Nếu hai ứng dụng ở các container khác nhau, cấu hình `API_HOST=0.0.0.0` và mạng private phù hợp. `API_INTERNAL_URL` dùng cho rewrite khi build nên build lại khi thay đổi endpoint.
7. Kiểm tra cookie Secure, Zalo, gọi điện, sitemap và canonical dưới domain thật. Không sử dụng HTTP production cho luồng đăng nhập.

Kiến trúc Next.js + Express + MongoDB cần Node runtime và database riêng. Dự án được bàn giao tại workspace local, chưa publish lên hosting. Video upload dùng đĩa của API; ảnh vẫn dùng thư viện quét từ file. Chưa có object storage, form thu lead riêng, giỏ hàng hoặc thanh toán; tư vấn đi trực tiếp qua Zalo như phạm vi MVP.

Tài liệu tham khảo: [Next.js App Router](https://nextjs.org/docs/app/getting-started/installation), [shadcn/ui](https://ui.shadcn.com/docs/components).
