# KIHA trên Ubuntu 24.04 — noithatkiha.vn

Mô hình: **Nginx + HTTPS → Next.js / Express → MongoDB**, chạy trên cùng VPS.
Docker Compose quản lý ứng dụng; Nginx và Certbot chạy trên host. Không cần Vercel, Render hay MongoDB Atlas.

| Thành phần | Địa chỉ | Dữ liệu |
| --- | --- | --- |
| Website | `https://noithatkiha.vn` → `127.0.0.1:3100` | Ảnh sản phẩm nằm trong image web |
| API | `/api/*` → `127.0.0.1:4100` | Video nằm trong volume `kiha_video_data` |
| MongoDB 8.0 | Mạng Docker, không mở cổng Internet | Volume `kiha_mongo_data`, có xác thực |

Next.js dùng `API_INTERNAL_URL=http://api:4000` bên trong Docker, được cấu hình cả lúc build và chạy. Tài khoản MongoDB của ứng dụng chỉ có quyền `readWrite` trên database `kiha`. API chạy user thường, không chạy root.

## 1. Chuẩn bị VPS và DNS

- Ubuntu **24.04 LTS**, CPU hỗ trợ MongoDB 8.0; nên có 2 vCPU, 4 GB RAM và đủ dung lượng cho ảnh/video, Docker image và backup.
- A record của `noithatkiha.vn` trỏ đúng IP VPS. Nếu có AAAA, IPv6 cũng phải tới đúng máy. File mẫu chỉ cấu hình domain gốc, chưa cấu hình `www`.
- Cho phép TCP 80/443 tại firewall nhà cung cấp và VPS. Giữ nguyên cổng SSH đang sử dụng. Không mở 3100, 4100 hoặc 27017 ra ngoài.
- Kiểm tra site đang dùng domain và cổng trước khi thay đổi. Không xóa site Nginx hoặc dữ liệu hiện có để cài KIHA.

Kiểm tra trên VPS:

```bash
cat /etc/os-release
free -h
df -h /
sudo ss -lntp
sudo nginx -T 2>/dev/null | grep -nF noithatkiha.vn
```

Cài Docker Engine + Compose theo [hướng dẫn chính thức cho Ubuntu](https://docs.docker.com/engine/install/ubuntu/). Nếu VPS đã có Docker, dùng bản đang cài tương thích thay vì gỡ các dịch vụ của ứng dụng khác.

Cài Nginx và Certbot (nếu chưa có):

```bash
sudo apt update
sudo apt install -y nginx snapd
sudo snap install --classic certbot
```

Không cài thêm Certbot snap nếu máy đang có bản Certbot hoạt động được; dùng bản hiện có.

## 2. Đưa source lên VPS

Đẩy toàn bộ thay đổi đã kiểm tra lên GitHub, sau đó clone vào `/opt/kiha` bằng tài khoản có quyền deploy. Nếu dùng SSH key cho repository private, cấu hình deploy key trên VPS; không đặt token vào URL Git.

```bash
sudo install -d -o "$USER" -g "$(id -gn)" /opt/kiha
git clone https://github.com/DucLamDev/shop-kiha.git /opt/kiha
cd /opt/kiha
sudo bash deploy/vps/setup-env.sh
sudo bash deploy/vps/deploy.sh
```

Nếu `/opt/kiha` đã có source, kiểm tra repository hiện tại trước; không clone đè. `.env` ở `deploy/vps/` được tạo một lần, chứa mật khẩu ngẫu nhiên. Giữ nguyên file này và các volume khi cập nhật. Các script không tự chạy seed, tạo admin hoặc ghi đè database.

Nếu đã tạo `deploy/vps/.env` theo cấu hình domain cũ, trước khi chạy `deploy.sh`, dùng `sudo nano deploy/vps/.env` và chỉ đổi `SITE_URL=https://noithatkiha.vn`. Giữ nguyên hai mật khẩu MongoDB; `setup-env.sh` không sửa file đã tồn tại. Chạy lại `deploy.sh` để build và khởi động ứng dụng với domain mới.

## 3. Chuyển dữ liệu hiện có

Tạm ngừng chỉnh sửa admin trong lúc export để bản sao nhất quán. Trên máy Windows, từ thư mục dự án (MongoDB local đang chạy):

```powershell
node scripts/vps-transfer.mjs export .local/vps-transfer
```

Lệnh tạo thư mục mới; nếu đã có, chọn tên khác để giữ bản cũ. Bản xuất gồm sản phẩm, danh mục, cấu hình giao diện/liên hệ/số liệu, thư viện ảnh và file video. Giữ nguyên ObjectId và ngày tháng; **không xuất admin và session**.

Nếu `.env` đã được đổi sang một MongoDB khác nhưng website local vẫn chạy bằng database cũ, đặt `MONGODB_URI` cho riêng phiên export vào đúng database đang dùng. Với cấu hình local ban đầu của dự án là `mongodb://127.0.0.1:27018/kiha`. Kiểm tra số lượng bản ghi mà script báo; database nguồn rỗng sẽ bị từ chối.

Chuyển cả thư mục bằng SCP vào một thư mục riêng của tài khoản SSH, sau đó đưa vào `/opt/kiha/deploy/vps/transfer`. Không đưa bản xuất vào Git hay thư mục web công khai. Cấu trúc phải là `transfer/catalog.ejson` và `transfer/videos/`.

Trên VPS, chỉ import vào database KIHA mới:

```bash
cd /opt/kiha/deploy/vps
sudo docker compose stop api web
sudo chmod -R a+rX transfer
sudo docker compose run --rm --no-deps -T \
  -v "$PWD/transfer:/transfer:ro" api \
  node scripts/vps-transfer.mjs import /transfer
sudo docker compose up -d --wait
```

Phải cho user Node trong container đọc được thư mục transfer. Bản xuất không chứa mật khẩu hoặc tài khoản, nhưng vẫn cần giữ ngoài web root.

Importer kiểm tra tất cả collection đích phải trống và từ chối ghi đè file video. Nếu import bị gián đoạn hoặc báo dữ liệu đã tồn tại, kiểm tra trước khi chạy tiếp; không xóa volume để thử lại. Sau khi import thành công, giữ một bản xuất ở máy cá nhân rồi cất bản trên VPS trong nơi chỉ tài khoản deploy truy cập được.

Tạo tài khoản admin mới trên VPS bằng prompt ẩn mật khẩu (không đưa mật khẩu vào shell history):

```bash
cd /opt/kiha/deploy/vps
sudo docker compose exec api sh -c '
  printf "Admin email: "
  read -r ADMIN_EMAIL
  printf "Admin password (14+ characters): "
  stty -echo
  trap "stty echo" EXIT
  read -r ADMIN_PASSWORD
  stty echo
  printf "\n"
  export ADMIN_EMAIL ADMIN_PASSWORD
  node scripts/create-admin.mjs
'
```

## 4. Nginx và HTTPS

Sau khi kiểm tra domain chưa được một site khác phục vụ, thêm site KIHA. Không ghi đè file cũ có cùng tên:

```bash
cd /opt/kiha
if sudo test -e /etc/nginx/sites-available/kiha; then
  echo "Site kiha đã tồn tại; kiểm tra cấu hình trước khi thay."
else
  sudo install -m 644 deploy/vps/nginx.conf /etc/nginx/sites-available/kiha
  sudo ln -s /etc/nginx/sites-available/kiha /etc/nginx/sites-enabled/kiha
fi
sudo nginx -t
sudo systemctl reload nginx
```

Truy cập HTTP để kiểm tra domain đã về đúng VPS, sau đó cấp HTTPS:

```bash
sudo /snap/bin/certbot --nginx -d noithatkiha.vn --redirect
sudo /snap/bin/certbot renew --dry-run
```

Certbot hỏi email quản lý chứng chỉ và điều khoản sử dụng. Nếu đã có chứng chỉ cho domain, kiểm tra và tái sử dụng cấu hình hiện tại. Không chép lại file Nginx HTTP mẫu sau khi Certbot đã thêm cấu hình TLS.

Nginx đưa `/api/*` trực tiếp tới Express và ghi đè `X-Forwarded-For` để giới hạn đăng nhập theo IP khách. Giới hạn request 105 MiB cho video 100 MiB cộng multipart; quyền xem video nháp vẫn do API kiểm tra. Các proxy mạng ngoài (ví dụ Cloudflare) cần cấu hình thêm IP thực của khách trước khi dùng.

## 5. Kiểm tra sau triển khai

```bash
curl -fsS https://noithatkiha.vn/api/health
curl -fsS 'https://noithatkiha.vn/api/products?limit=1'
curl -I https://noithatkiha.vn/ve-kiha
cd /opt/kiha/deploy/vps
sudo docker compose ps
sudo docker compose logs --tail=80 api web
```

Kiểm tra trang chủ, ảnh, trang sản phẩm, Về KIHA, Zalo, canonical/sitemap đúng domain. Đăng nhập bằng HTTPS tại `/admin/dang-nhap`, thử lưu nội dung và upload/phát video; video nháp phải yêu cầu đăng nhập. Database và tài khoản local không tự xuất hiện nếu chưa import/tạo admin.

## 6. Cập nhật, backup và quay lại phiên bản cũ

```bash
cd /opt/kiha
sudo bash deploy/vps/backup.sh
git pull --ff-only
sudo bash deploy/vps/deploy.sh
```

Backup tạm dừng API để MongoDB và video nhất quán, rồi bật lại bằng trap kể cả khi có lỗi. Kết quả ở `deploy/vps/backups/<timestamp>/`, gồm MongoDB archive, video tar và file env; giữ riêng tư và sao chép ra khỏi VPS. Volume bền vững không thay thế backup.

Để quay lại code cũ, checkout commit đã xác nhận hoạt động rồi chạy `deploy.sh`; giữ nguyên `.env` và volume. Cần giữ source commit trước mỗi deploy. Không chạy `docker compose down -v` hoặc `docker volume prune`: các lệnh đó có thể xóa dữ liệu.

Khôi phục backup cần dừng ghi, giải nén video vào volume và dùng `mongorestore` với database đích đã được kiểm tra. Kiểm thử khôi phục vào một stack/database riêng trước, tránh ghi đè dữ liệu đang chạy.

Tài liệu: [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting), [MongoDB Docker image](https://hub.docker.com/_/mongo), [Certbot Nginx](https://certbot.eff.org/instructions?ws=nginx&os=snap).
