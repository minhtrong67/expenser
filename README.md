# Expenser — Quản Lý Chi Tiêu Cá Nhân

Ứng dụng web quản lý chi tiêu cá nhân, xây dựng bằng **ReactJS + Vite + TailwindCSS + Firebase**, tối ưu cho **di động** và cài đặt được như một ứng dụng thật (PWA). Giao diện tối giản, font hệ thống (system-ui), icon từ **lucide-react** (không phụ thuộc font ngoài), tông màu **xanh lá (green)** duy nhất, hoàn toàn bằng tiếng Việt.

## ✨ Tính năng chính

- **Xác thực người dùng**: Đăng ký / Đăng nhập bằng Email-Mật khẩu hoặc Google (Firebase Authentication)
- **Dashboard tổng quan**: số dư, thu/chi tháng này, biểu đồ thu chi theo ngày, phân bổ chi tiêu theo danh mục, giao dịch gần đây, số dư theo ví
- **Giao dịch** — 2 chế độ xem trong cùng một trang:
  - **Danh sách**: nhóm giao dịch theo từng ngày (ví dụ "Thứ 3, 22/09/2026"), hiển thị dạng card, có bộ lọc, sắp xếp, chọn nhiều để xóa hàng loạt
  - **Lịch**: xem tổng thu/chi theo từng ngày trên lịch tháng, chạm vào một ngày để xem chi tiết
- **Thêm giao dịch nhanh**: một trường ngày-giờ duy nhất (mặc định là thời điểm hiện tại), ghi chú dùng ô nhập tự mở rộng theo nội dung
- **Gợi ý nhập nhanh**: khi thêm giao dịch mới, ứng dụng gợi ý các mục đã nhập gần đây — chạm để điền nhanh số tiền, danh mục và ví (ngày giờ luôn lấy thời điểm hiện tại)
- **Quản lý danh mục thu & chi**: CRUD với **emoji tự chọn** (chọn từ bộ gợi ý theo nhóm hoặc gõ/dán bất kỳ emoji nào) và màu sắc tùy chỉnh
- **Quản lý ví / tài khoản**: nhiều ví, xem số dư, **chuyển tiền giữa các ví**
- **Thống kê**: nổi bật tổng số giao dịch, tổng thu, tổng chi và chênh lệch theo khoảng thời gian (Hôm nay / Tuần / Tháng / Năm / Tất cả), kèm biểu đồ đường, cột, tròn (Recharts) và xuất báo cáo PDF/Excel/CSV cho khoảng thời gian đang xem
- **Cài đặt**: giao diện Sáng/Tối/Hệ thống, cỡ chữ, xuất/nhập toàn bộ dữ liệu giao dịch, khôi phục cài đặt mặc định, cài đặt PWA
- **Xuất dữ liệu**: CSV, Excel (.xlsx) hoặc JSON
- **Nhập dữ liệu**: từ file CSV, Excel (.xlsx) hoặc JSON — tự nhận diện định dạng theo phần mở rộng file
- **Xuất báo cáo thống kê**: file PDF định dạng đẹp, có font tiếng Việt nhúng sẵn (không lỗi font/dấu)
- **Tìm kiếm nhanh (Ctrl + K)**: điều hướng và thao tác nhanh trong toàn bộ ứng dụng
- **PWA, ưu tiên di động**: cài lên màn hình chính điện thoại, dùng được khi mất mạng, thanh điều hướng dưới (Tổng quan / Giao dịch / Thống kê / Cài đặt) + nút thêm nhanh (FAB) được thiết kế riêng cho thao tác một tay
- Toàn bộ tùy chỉnh giao diện được **lưu vào localStorage**
- Kiểm tra dữ liệu nhập chặt chẽ: `trim()` khoảng trắng, chặn số âm/0, chặn ngày tương lai, chặn trùng tên danh mục/ví...

## 🛠️ Công nghệ sử dụng

| Thành phần         | Công nghệ                                               |
| ------------------ | ------------------------------------------------------- |
| Frontend           | React 19, Vite, React Router 7                          |
| Styling & Icon     | TailwindCSS 3, font hệ thống (system-ui), lucide-react  |
| Backend / Database | Firebase Authentication + Cloud Firestore               |
| Biểu đồ            | Recharts                                                |
| Nhập/Xuất dữ liệu  | PapaParse (CSV), SheetJS (Excel), JSON, jsPDF (báo cáo) |
| PWA                | vite-plugin-pwa (Workbox)                               |
| Thông báo          | react-hot-toast                                         |

## 🚀 Hướng dẫn cài đặt

### 1. Cài dependencies

```bash
npm install
```

### 2. Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/) → **Add project**
2. Vào **Authentication** → **Sign-in method** → bật **Email/Password** và **Google**
3. Vào **Firestore Database** → **Create database** (chế độ Production hoặc Test)
4. Vào **Project Settings** → **Your apps** → **Web app** → copy cấu hình `firebaseConfig`

### 3. Cấu hình biến môi trường

Sao chép `.env.example` thành `.env` và điền thông tin Firebase:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=xxxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxx
VITE_FIREBASE_APP_ID=xxxxx
```

### 4. Thiết lập Firestore Security Rules

Copy nội dung file `firestore.rules` (đã có sẵn trong dự án) vào tab **Rules** của Firestore trên Firebase Console, đảm bảo mỗi người dùng chỉ đọc/ghi được dữ liệu của chính mình:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{collection}/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 5. Chạy dự án ở môi trường phát triển

```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`. Để xem đúng trải nghiệm ưu tiên cho di động, hãy mở DevTools → chế độ giả lập thiết bị (Ctrl/Cmd + Shift + M), hoặc mở trực tiếp bằng điện thoại trong cùng mạng LAN (`npm run dev -- --host`).

### 6. Build bản phát hành (production)

```bash
npm run build
npm run preview   # xem thử bản build
```

Thư mục `dist/` sau khi build có thể deploy lên Firebase Hosting, Vercel, Netlify, v.v.

```bash
# Ví dụ deploy bằng Firebase Hosting
npm install -g firebase-tools
firebase login
firebase init hosting   # chọn thư mục "dist" làm public directory, cấu hình SPA rewrite
firebase deploy
```

## 📂 Cấu trúc thư mục

```
src/
├── components/
│   ├── layout/           # Sidebar, MobileNav, Topbar, CommandPalette, AppLayout
│   ├── CalendarView.jsx  # Chế độ xem lịch, nhúng trong trang Giao dịch
│   └── ui/                # Button, Modal, Icon, Emoji, EmojiPicker, MoneyInput,
│                          # Textarea, ChoiceSelect, Skeleton...
├── contexts/              # AuthContext, SettingsContext, DataContext (Firestore)
├── hooks/                 # useLocalStorage, usePwaInstall, useRecentEntries
├── pages/                 # Dashboard, Transactions (Danh sách/Lịch), Categories,
│                          # Wallets, Statistics, Settings, Login, Register...
├── routes/                # ProtectedRoute, PublicRoute
├── utils/                 # format.js, validators.js, exportImport.js, defaults.js,
│                          # categoryEmoji.js, iconMap.js (Material-icon-name → lucide)
├── App.jsx
├── firebase.js
└── main.jsx
```

## 🗂️ Cấu trúc dữ liệu Firestore

```
users/{uid}
  ├── transactions/{id}   { type, amount, categoryId, walletId, date, note }
  ├── categories/{id}     { name, type, emoji, color }
  └── wallets/{id}        { name, icon, color, balance }
```

Khi người dùng đăng ký/đăng nhập lần đầu, hệ thống sẽ tự động tạo sẵn một số danh mục (kèm emoji) và ví mặc định. Danh mục cũ (tạo trước khi có tính năng emoji) vẫn hiển thị bình thường nhờ cơ chế ánh xạ dự phòng trong `utils/categoryEmoji.js`.

## ⌨️ Phím tắt

- `Ctrl/Cmd + K`: Mở tìm kiếm nhanh / bảng lệnh
- `Esc`: Đóng modal / bảng tìm kiếm

## 📌 Ghi chú

- File nhập/xuất dữ liệu (CSV/Excel/JSON) dùng các cột: `Ngày, Loại, Danh mục, Ví, Số tiền, Ghi chú` (Loại là "Thu" hoặc "Chi"). File JSON là một mảng các object cùng cấu trúc cột trên.
- Emoji danh mục có thể chọn từ bộ gợi ý sẵn hoặc gõ/dán bất kỳ emoji nào (trên điện thoại: chạm giữ bàn phím → chọn biểu tượng cảm xúc 😀).
- Gợi ý nhập nhanh được lưu theo từng thiết bị/trình duyệt (localStorage), không đồng bộ giữa các thiết bị, và chỉ điền nhanh số tiền/danh mục/ví — ngày giờ luôn lấy thời điểm hiện tại.
- Ứng dụng chỉ hỗ trợ ngôn ngữ tiếng Việt, đơn vị tiền tệ VNĐ và một màu chủ đề duy nhất (xanh lá).
- Cỡ chữ và chế độ sáng/tối được lưu trong `localStorage` của trình duyệt, không đồng bộ giữa các thiết bị.

---

Được phát triển bởi **minhtrong67** với sự hỗ trợ của **Claude (Anthropic)**.
