# DearPeer — Campus Peer Support

## 📚 Mục lục
1. [Giới thiệu](#-giới-thiệu)
2. [Tính năng chính](#-tính-năng-chính)
3. [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
4. [Yêu cầu môi trường](#-yêu-cầu-môi-trường)
5. [Cài đặt & chạy](#-cài-đặt--chạy)
6. [Biến môi trường](#-biến-môi-trường)
7. [Các script quan trọng](#-các-script-quan-trọng)
8. [API nhanh](#-api-nhanh)
9. [Triển khai (Deploy)](#-triển-khai-deploy)
10. [Đóng góp & ghi chú](#-đóng-góp--ghi-chú)

## 🧩 Giới thiệu
DearPeer là một nền tảng hỗ trợ tinh thần dành cho cộng đồng học đường, giúp người dùng chia sẻ suy nghĩ, ghi lại nhật ký và xây dựng chuỗi hoạt động tích cực. Dự án hướng tới cả người dùng thường và quản trị viên, bộ công cụ gồm feed chia sẻ, quản lý bình luận, lịch tuần cá nhân và dashboard admin để giám sát nội dung.

**Tech stack**
- Frontend: React + Vite + Tailwind CSS + Radix UI primitives.
- Backend: Express + MongoDB (Mongoose) + JWT + Nodemailer + Zod validation.
- DB: MongoDB (Atlas hoặc local).
- Auth: OTP email (JWT giữ trong cookie httpOnly).
- UI: custom Tailwind + CSS variables với glassmorphism.

## ⚙️ Tính năng chính
- Xác thực qua email (OTP) và JWT được lưu trong `httpOnly` cookie.
- Feed + đăng bài: người dùng viết bài, phản ứng (reaction), xem bình luận.
- Bình luận / vote với chế độ sửa / xóa cho creator.
- Nhật ký cá nhân (journal) có lưu theo ngày và mood.
- Kế hoạch tuần (weekly plan) với kéo-thả/đổi trạng thái, chuỗi streak, lịch biểu.
- Trang admin với dashboard tổng quan, lọc bài/comment, phân trang, preview bài viết.
- Các dịch vụ phản hồi: báo cáo nội dung, kiểm soát spam (limit) và admin-only routes.
- Vai trò:
  * `user`: đọc/viết bài, bình luận, quản lý kế hoạch/ngày cá nhân.
  * `admin`: toàn quyền xử lý bài/comment, xem dashboard, yêu cầu ẩn/xóa nội dung.

## 📁 Cấu trúc thư mục
```
.
├─ backend/
│  ├─ src/
│  │  ├─ controllers/      # logic xử lý routes (auth, post,weekly, admin,…)
│  │  ├─ models/           # schema mongoose (User, Post, WeeklyPlan,…)
│  │  ├─ routes/           # API entrypoint (api.js, journalRoutes.js)
│  │  ├─ config/           # env schema, DB, email transport
│  │  ├─ middleware/        # bảo mật + rate limit
│  │  ├─ services/          # dịch vụ phụ trợ (streak, weekly plan)
│  │  ├─ scripts/           # migrate/seed
│  │  └─ server.js          # entrypoint Express
│  └─ package.json
├─ frontend/
│  ├─ src/
│  │  ├─ pages/            # các route React (Feed, Admin, WeeklyPlan,…)
│  │  ├─ components/       # UI components chung
│  │  ├─ services/         # gọi API (axios)
│  │  ├─ context/           # AuthContext
│  │  ├─ hooks/, utils/,… 
│  └─ package.json
└─ README.md (tập tin này)
```

## 🧰 Yêu cầu môi trường
- **Node.js**: 18.x / 20.x (đã kiểm thử với 18+).
- **MongoDB**: Atlas hoặc local (phiên bản 6.x+ khuyến nghị).
- **SMTP**: bất kỳ SMTP (Gmail App Password, Mailtrap, SendGrid SMTP,…).
- **JWT secret**: cần tối thiểu 32 kí tự.
- **Vite frontend**: dùng `VITE_API_URL` để trỏ đến backend (mặc định `http://localhost:5000/api`).

## 🚀 Cài đặt & chạy
1. Clone repo:
   ```bash
   git clone <repo-url>
   cd vibe-confession-wall
   ```
2. Cài deps:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Tạo `.env` (backend) và `.env.local`/`.env` (frontend) dựa trên mẫu trong `backend/.env.example` và `frontend/.env.example`.
4. Chạy backend:
   ```bash
   cd backend
   npm run dev
   ```
   → Express mặc định lắng nghe `http://localhost:5000`.
5. Chạy frontend:
   ```bash
   cd ../frontend
   npm run dev
   ```
   → Vite dev server mặc định `http://localhost:5173`.
6. Truy cập: `http://localhost:5173` (frontend). Backend API tại `http://localhost:5000/api`.

## 🧾 Biến môi trường
### Backend (`backend/.env.example`)
| Tên biến | Bắt buộc | Mô tả | Ví dụ |
| --- | --- | --- | --- |
| `NODE_ENV` | có | Môi trường chạy | `development` |
| `PORT` | không | Port Express | `5000` |
| `MONGO_URI` | có | Chuỗi kết nối MongoDB | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `CLIENT_URL` | có | URL frontend dùng CORS | `http://localhost:5173` |
| `JWT_SECRET` | có | Khóa JWT (>=32 ký tự) | `a-very-long-secret-string...` |
| `JWT_EXPIRES_IN` | không | Thời hạn JWT | `1d` |
| `SMTP_HOST` | có | SMTP host | `smtp.mailtrap.io` |
| `SMTP_PORT` | có | SMTP port | `587` |
| `SMTP_USER` | có | SMTP username | `username` |
| `SMTP_PASS` | có | SMTP password | `password` |
| `SMTP_FROM` | không | Địa chỉ gửi mặc định | `Campus Support <noreply@campus.edu>` |
| `SMTP_SECURE` | không | `true` nếu TLS | `false` |
| `REPORT_THRESHOLD` | không | Số báo cáo cần để kích hoạt hành động | `3` |
| `OTP_EXPIRY_MINUTES` | không | Hiệu lực OTP | `10` |
| `RATE_LIMIT_WINDOW_MS` | không | Millisecond cho throttling | `900000` |
| `RATE_LIMIT_MAX` | không | Số request tối đa | `100` |
| `ADMIN_EMAIL` | có | Email admin seed | `admin@campus.edu` |
| `ADMIN_NICKNAME` | có | Nickname admin seed | `DearPeer Admin` |

### Frontend (`frontend/.env.example`)
| Tên biến | Bắt buộc | Mô tả | Ví dụ |
| --- | --- | --- | --- |
| `VITE_API_URL` | không | URL API backend (gắn suffix `/api`) | `http://localhost:5000/api` |

## ⚙️ Các script quan trọng
- Backend:
  - `npm run dev`: chạy server trong hot reload (`nodemon`).
  - `npm run start`: start production build.
  - `npm run seed`: seed data mặc định (admin…).
  - `npm run migrate`: chạy migrate scripts.
  - `npm run test`: chạy test engine Node (placeholder).
- Frontend:
  - `npm run dev`: vật dev vite (mặc định port 5173).
  - `npm run build`: bundle sản phẩm.
  - `npm run preview`: preview build.
  - `npm run lint`: kiểm tra eslint.
  - `npm run test`: test runner Node (placeholder).

## 🧭 API nhanh
1. `POST /api/auth/request-otp`, `/api/auth/verify-otp`, `/api/auth/logout`, `/api/auth/me`.
2. `GET/POST/PATCH/DELETE /api/posts` + `/api/posts/:id/reactions/:type`.
3. `/api/posts/:postId/comments + /api/comments/:id + /api/comments/:id/vote`.
4. `Weekly Plan`: `/api/weekly-plan`, `/weekly-plan/items`, `/close`, `/reopen`.
5. `Journal`: `/api/journal` (GET/PUT/DELETE) dùng `date`.
6. `Admin`: `/api/admin/overview`, `/admin/posts`, `/admin/comments`, `/admin/stats`.
7. `User profile`: `/api/users/me/*` (username/nickname/avatar/timezone/profile-note).
8. `Streak`: `/api/streak`, `/api/streak/status`.
9. `Reports`: `/api/reports`.

## ☁️ Triển khai (Deploy)
- **Render/Netlify/Vercel**: chia 2 service/backend. Frontend build command `npm run build`, publish `dist`. Backend `npm run start`, dùng `PORT`. Cấu hình env giống phần “Biến môi trường”.
- Đảm bảo backend có `CLIENT_URL` trỏ về URL frontend và `JWT_SECRET` đủ dài.
- Nếu sử dụng dịch vụ GitHub Action/Render, chạy `npm install`/`npm run build` tương ứng.

## ✍️ Đóng góp & ghi chú
- Cách đóng góp: fork → feature branch → PR (description, link issue). Giữ commit ngắn và theo dạng `feat:`, `fix:`, `style:`, `docs:`.
- License: MIT (không định nghĩa file riêng, áp dụng mặc định).
