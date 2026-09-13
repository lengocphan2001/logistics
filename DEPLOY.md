# Hướng dẫn Triển khai Hệ thống Logistics (Production Deployment Guide)

Tài liệu này hướng dẫn chi tiết cách triển khai toàn bộ ứng dụng (gồm **NestJS backend**, **Next.js admin**, và **Next.js frontend**) lên một máy chủ **Ubuntu Server** sử dụng **Nginx** làm Reverse Proxy, quản lý tiến trình bằng **PM2**, cấu hình cơ sở dữ liệu **PostgreSQL** và thiết lập SSL miễn phí với **Let's Encrypt** theo mô hình subdomains.

---

## 1. Thiết lập Mô hình Tên miền (Subdomains Setup)

Tên miền chính của dự án là `tamanlogistics.vn`, phân chia subdomains như sau:
* **Frontend chính**: `tamanlogistics.vn` (hoặc `www.tamanlogistics.vn`) - Port chạy cục bộ: `3000`
* **Admin dashboard**: `admin.tamanlogistics.vn` - Port chạy cục bộ: `3001`
* **Backend API**: `api.tamanlogistics.vn` - Port chạy cục bộ: `4000`

> **Lưu ý**: Hãy trỏ các bản ghi DNS (A record) của `tamanlogistics.vn`, `admin.tamanlogistics.vn` và `api.tamanlogistics.vn` về IP Public của Ubuntu Server trước khi bắt đầu.

---

## 2. Chuẩn bị Môi trường trên Ubuntu Server

Kết nối SSH vào server Ubuntu của bạn và cập nhật hệ thống:
```bash
sudo apt update && sudo apt upgrade -y
```

### 2.1 Cài đặt Node.js (phiên bản v20 LTS)
Sử dụng NodeSource để cài đặt Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```
Xác nhận phiên bản đã cài đặt:
```bash
node -v
npm -v
```

### 2.2 Cài đặt PostgreSQL
Cài đặt PostgreSQL và các công cụ đi kèm:
```bash
sudo apt install postgresql postgresql-contrib -y
```
Khởi động và kích hoạt PostgreSQL chạy cùng hệ thống:
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Tạo cơ sở dữ liệu và tài khoản quản trị cho ứng dụng:
```bash
# Đăng nhập vào PostgreSQL CLI với quyền user postgres mặc định
sudo -i -u postgres psql
```
Chạy các truy vấn sau bên trong Postgres CLI:
```sql
-- Tạo Database
CREATE DATABASE logistics;

-- Tạo User mới với mật khẩu mạnh
CREATE USER logistics_user WITH PASSWORD 'MatKhauSieuManh123';

-- Cấp quyền kết nối database
GRANT ALL PRIVILEGES ON DATABASE logistics TO logistics_user;

-- Bắt buộc với PostgreSQL 15+: cấp quyền trên schema public
\c logistics
GRANT USAGE, CREATE ON SCHEMA public TO logistics_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO logistics_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO logistics_user;

-- (Khuyến nghị) Chuyển owner schema public cho user ứng dụng
ALTER SCHEMA public OWNER TO logistics_user;

-- Thoát khỏi postgres CLI
\q
```

> **Lỗi `permission denied for schema public` khi đồng bộ database?**  
> Database đã tạo trước đó nhưng thiếu quyền schema. Chạy lại (với user `postgres`):
> ```bash
> sudo -i -u postgres psql -d logistics
> ```
> ```sql
> GRANT USAGE, CREATE ON SCHEMA public TO logistics_user;
> ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO logistics_user;
> ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO logistics_user;
> ALTER SCHEMA public OWNER TO logistics_user;
> \q
> ```
> Sau đó chạy lại: `npm run db:sync`

### 2.3 Cài đặt Git, PM2 và Nginx
```bash
sudo apt install git nginx -y
sudo npm install --global pm2
```

---

## 3. Clone và Cấu hình Ứng dụng

Di chuyển tới thư mục chứa mã nguồn (ví dụ `/var/www/`):
```bash
sudo mkdir -p /var/www/logistics
sudo chown -R $USER:$USER /var/www/logistics
cd /var/www/logistics

# Clone dự án từ repository của bạn
git clone <repository_url> .
```

### 3.1 Cấu hình & Build Backend (NestJS)
Di chuyển vào thư mục backend và tạo file `.env` production:
```bash
cd backend
nano .env
```
Nội dung file `.env` trên môi trường Production:
```env
PORT=4000
NODE_ENV=production
DATABASE_URL="postgresql://logistics_user:password@localhost:5432/logistics?schema=public"
JWT_SECRET="ChuoiKyTuBaoMatNgauNhienSieuDaiCuaBan"
JWT_EXPIRES_IN=7d
CORS_ORIGINS="https://tamanlogistics.vn,https://www.tamanlogistics.vn,https://admin.tamanlogistics.vn"
```
Cài đặt dependencies, đồng bộ schema Prisma và build dự án:
```bash
npm install              # Cài đủ deps để build (gồm prisma, typescript)
npm run deploy           # Đồng bộ database rồi build (db:sync + build)
npm run prisma:seed      # Nạp tài khoản admin mặc định (chạy sau build)
npm prune --omit=dev     # (Tùy chọn) Gỡ devDependencies sau khi build xong
cd ..
```

> **`npm run db:sync` làm gì**: một lệnh duy nhất, chạy lại bao nhiêu lần cũng
> được. Database trống thì nó dựng toàn bộ schema. Database đã có dữ liệu thì nó
> dọn các bản ghi lịch sử không còn migration tương ứng, ghi nhận mốc `0_init`
> nếu chưa có, rồi áp dụng những migration mới hơn. Nó không bao giờ xoá bảng,
> xoá cột hay đụng vào dữ liệu nghiệp vụ. Dùng lệnh này thay cho `prisma db push`
> ở mọi môi trường. Khi sửa `schema.prisma` thì chạy
> `npm run db:migrate -- --name ten_thay_doi` để sinh migration, rồi commit thư
> mục migration đó; các môi trường khác chỉ cần `npm run deploy`.
>
> `npm run deploy` = `db:sync` rồi `build`. Chạy `npm run build` một mình sẽ
> **không** đồng bộ database: hook `prebuild` chỉ sinh lại Prisma Client từ file
> schema, không kết nối database.

> **Lưu ý `prisma:seed`**: Script dùng `node dist/prisma/seed.js`, **không** dùng `ts-node`. Phải chạy `npm run build` trước `npm run prisma:seed`. Trên máy dev local: `npm run prisma:seed:dev` nếu chưa build.

### 3.2 Cấu hình & Build Admin Panel (Next.js)
Di chuyển vào thư mục admin và tạo cấu hình:
```bash
cd admin
nano .env.production
```
Điền các tham số API URL tương ứng với subdomain API của bạn:
```env
NEXT_PUBLIC_API_URL="https://api.tamanlogistics.vn"
PORT=3001
```
Cài đặt và build dự án Next.js:
```bash
npm install
npm run build
cd ..
```

### 3.3 Cấu hình & Build Frontend (Next.js)
Tương tự cho dự án frontend chính dành cho khách hàng:
```bash
cd frontend
nano .env.production
```
Điền thông tin API:
```env
NEXT_PUBLIC_API_URL="https://api.tamanlogistics.vn"
PORT=3000
```
Cài đặt và build dự án:
```bash
npm install
npm run build
cd ..
```

---

## 4. Quản lý Tiến trình với PM2

Chúng ta sẽ viết file cấu hình PM2 để khởi động và quản lý cả 3 service cùng lúc nhằm đảm bảo hệ thống tự khởi động lại khi crash hoặc khi restart server.

Tạo file `ecosystem.config.js` ở thư mục gốc của dự án `/var/www/logistics/`:
```bash
nano ecosystem.config.js
```
Nội dung file `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'logistics-backend',
      script: 'dist/src/main.js',
      cwd: '/var/www/logistics/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'logistics-admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      cwd: '/var/www/logistics/admin',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'logistics-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/logistics/frontend',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

Khởi chạy ứng dụng với PM2:
```bash
# Đảm bảo backend đã build (tạo dist/src/main.js)
cd /var/www/logistics/backend && npm run deploy && cd ..

pm2 start ecosystem.config.js
# Hoặc nếu đã chạy rồi:
pm2 restart ecosystem.config.js
```

Để cấu hình PM2 tự động chạy khi Ubuntu Server reboot:
```bash
pm2 startup systemd
# Chạy lệnh xuất hiện trên màn hình console của bạn (lệnh sudo env PATH=...)
pm2 save
```

---

## 5. Cấu hình Nginx Reverse Proxy (Subdomains)

Chúng ta sẽ cấu hình Nginx để điều hướng người dùng truy cập qua các tên miền tương ứng về các port Node.js đang chạy ngầm.

### 5.1 Tạo file cấu hình Nginx
Tạo file cấu hình cho dự án:
```bash
sudo nano /etc/nginx/sites-available/logistics
```
Nội dung file cấu hình Nginx:
```nginx
# 1. FRONTEND chính (tamanlogistics.vn & www.tamanlogistics.vn) -> Port 3000
server {
    listen 80;
    server_name tamanlogistics.vn www.tamanlogistics.vn;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# 2. ADMIN Dashboard (admin.tamanlogistics.vn) -> Port 3001
server {
    listen 80;
    server_name admin.tamanlogistics.vn;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# 3. BACKEND API (api.tamanlogistics.vn) -> Port 4000
server {
    listen 80;
    server_name api.tamanlogistics.vn;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> **CORS**: Backend whitelist origin trong `main.ts`. **Không** trả 204 cho OPTIONS tại Nginx (sẽ thiếu header CORS). Để mọi request (kể cả preflight) proxy tới NestJS.

Nếu vẫn lỗi CORS sau khi deploy code mới:
1. Thêm vào `backend/.env`: `CORS_ORIGINS=https://tamanlogistics.vn,https://www.tamanlogistics.vn,https://admin.tamanlogistics.vn`
2. `cd backend && npm run deploy && pm2 restart logistics-backend`
3. Kiểm tra log: `pm2 logs logistics-backend` — dòng `CORS origins: ...`
4. Test preflight:
```bash
curl -I -X OPTIONS "https://api.tamanlogistics.vn/auth/customer/register" \
  -H "Origin: https://tamanlogistics.vn" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```
Phải thấy `access-control-allow-origin: https://tamanlogistics.vn`

### 5.2 Kích hoạt cấu hình và Restart Nginx
Tạo liên kết symlink để kích hoạt:
```bash
sudo ln -s /etc/nginx/sites-available/logistics /etc/nginx/sites-enabled/
```
Kiểm tra cấu hình Nginx xem có lỗi cú pháp không:
```bash
sudo nginx -t
```
Nếu thành công, restart lại Nginx:
```bash
sudo systemctl restart nginx
```

---

## 6. Cấu hình SSL miễn phí với Let's Encrypt (Certbot)

Thiết lập SSL bảo mật HTTPS cho tất cả tên miền và subdomains bằng Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Chạy certbot để lấy chứng chỉ SSL và tự động cập nhật cấu hình Nginx:
```bash
sudo certbot --nginx -d tamanlogistics.vn -d www.tamanlogistics.vn -d admin.tamanlogistics.vn -d api.tamanlogistics.vn
```
* Certbot sẽ hỏi email của bạn và yêu cầu chọn chuyển hướng tất cả HTTP sang HTTPS (hãy chọn Option **2: Redirect**).
* Certbot đã tự động thiết lập cronjob để tự động gia hạn chứng chỉ SSL trước khi hết hạn 90 ngày. Bạn có thể kiểm tra gia hạn tự động bằng lệnh:
```bash
sudo certbot renew --dry-run
```

---

## 7. Bảo trì và Debug trên Production

### Xem log các tiến trình NodeJS:
```bash
pm2 logs                       # Xem logs của tất cả tiến trình
pm2 logs logistics-backend     # Chỉ xem logs của Backend
pm2 logs logistics-admin       # Chỉ xem logs của Admin
```

### Restart ứng dụng khi có cập nhật code mới:
```bash
cd /var/www/logistics
git pull
# Build lại phần cần cập nhật (ví dụ backend)
cd backend && npm install && npm run deploy && cd ..
# Restart tiến trình trên PM2
pm2 restart logistics-backend
```
