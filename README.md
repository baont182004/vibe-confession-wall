# Vibe Confession Wall

Web app chia sẻ bài viết/confession **ẩn danh** trong phạm vi một cộng đồng trường học (mô phỏng môi trường cấp 3). Dự án được xây dựng theo phong cách **vibe coding** nhằm luyện tập prompt engineering, phát triển full-stack, và cải thiện UI/UX.

---

## Tính năng chính (đang phát triển)

- Đăng nhập bằng OTP email
- Đăng bài (post) và xem feed
- Bình luận theo bài viết
  - Ở feed chỉ hiển thị một số bình luận nổi bật
  - Xem đầy đủ bình luận trong modal (phong cách Threads)
- React bài viết (mỗi người chỉ 1 react cho mỗi bài)
- Hồ sơ cá nhân (Profile)
  - Đổi nickname hiển thị (không trùng nhau)
  - Chọn ảnh đại diện mặc định hoặc tải ảnh đại diện lên
- Phân quyền
  - **User**: sửa/xóa bài viết và bình luận của chính mình
  - **Admin**: chỉ được xóa bài viết/bình luận (không sửa nội dung người khác)
  - Trang quản trị (Admin workspace)

---

## Công nghệ sử dụng

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **UI**: TokyoNight theme (dark)
- **Email**: SMTP (Gmail App Password hoặc dịch vụ gửi mail khác)

---

## Yêu cầu môi trường

- Node.js 18+ (khuyến nghị 20+)
- MongoDB (local hoặc cloud)
- npm (hoặc yarn/pnpm)

---

## Cài đặt

### 1) Clone repo

```bash
git clone <repo-url>
cd vibe-confession-wall
```

### 2) Cài dependencies

**Backend**

```bash
cd backend
npm install
```

**Frontend**

```bash
cd ../frontend
npm install
```

---

## Cấu hình môi trường

### Backend `.env`

Tạo file: `backend/.env`

## Chạy dự án (Development)

### Chạy Backend

```bash
cd backend
npm run dev
```

Backend mặc định chạy tại: `http://localhost:5000`

### Chạy Frontend

```bash
cd frontend
npm run dev
```

Frontend mặc định chạy tại: `http://localhost:5173`

## License

Dự án học tập / demo.
