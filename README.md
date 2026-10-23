# Ứng Dụng React Native Expo - Firebase Authentication & FCM Push Notifications

Dự án hoàn thành theo yêu cầu bài thực hành MMA301:
1. **Đăng nhập + Quản lý thông tin người dùng**:
   - Xác thực đăng nhập và đăng ký tài khoản qua **Firebase Authentication**.
   - Người dùng có thể xem và cập nhật lại thông tin cá nhân: **Email, Số điện thoại, Mật khẩu, Địa chỉ, Họ tên, Ảnh đại diện**.
   - Dữ liệu đồng bộ realtime với **Firebase Firestore Database** (`users/{uid}`).
2. **Cài đặt dịch vụ FCM (Firebase Cloud Messaging)**:
   - Tích hợp `expo-notifications` và `expo-device` để lấy FCM / Expo Push Token.
   - Nhận thông báo đẩy (Foreground, Background, Khi click vào thông báo).
   - Tự động lưu Token vào Firestore của người dùng.
   - Giao diện trực quan: hiển thị Token, nút Sao chép nhanh, gửi thử nghiệm thông báo trực tiếp trên máy và hướng dẫn bắn thông báo từ Firebase Console.
3. **Tương thích hoàn hảo với Expo Snack**:
   - Sử dụng 100% online asset (URL Unsplash, CDN icons), không bị lỗi thiếu file asset cục bộ khi import từ GitHub vào Snack.
   - Hỗ trợ chế độ Dùng thử (Demo Mode) khi chưa điền API keys để chấm bài mượt mà.

---

## 📁 Cấu Trúc Thư Mục

```text
mma-b6/
├── App.js                         # Root component, quản lý Auth state & Navigation tabs
├── app.json                       # Cấu hình Expo, Android package, Push notification plugin
├── babel.config.js                # Cấu hình Babel preset cho Expo
├── package.json                   # Dependencies chuẩn Expo SDK 51 & Firebase SDK 10
├── .gitignore                     # Bỏ qua node_modules, .expo, dist
├── README.md                      # Hướng dẫn chi tiết từ A-Z
└── src/
    ├── config/
    │   └── firebase.js            # Khởi tạo Firebase App, Auth, Firestore
    ├── services/
    │   └── notificationService.js # Đăng ký quyền FCM, lấy Push token, bắn test notif
    └── screens/
        ├── LoginScreen.js         # Màn hình Đăng nhập (Firebase Auth)
        ├── RegisterScreen.js      # Màn hình Đăng ký (Auth + lưu thông tin Firestore)
        ├── ProfileScreen.js       # Quản lý & Cập nhật: Email, SĐT, Mật khẩu, Địa chỉ
        └── NotificationScreen.js  # Màn hình FCM Push Notifications & Test trigger
```

---

## 🛠 HƯỚNG DẪN THIẾT LẬP FIREBASE TỪNG BƯỚC

Để kết nối với Firebase của bạn, thực hiện các bước sau:

### Bước 1: Tạo Firebase Project
1. Truy cập [Firebase Console](https://console.firebase.google.com/) và đăng nhập tài khoản Google.
2. Bấm **"Add project"** (Thêm dự án), đặt tên dự án (ví dụ: `mma301-b6-app`), tắt Google Analytics hoặc để mặc định rồi bấm **Create project**.

### Bước 2: Bật Firebase Authentication (Xác thực Email/Password)
1. Trong menu bên trái, chọn **Build** -> **Authentication**.
2. Bấm **Get started**.
3. Tại tab **Sign-in method**, bấm vào **Email/Password** -> Bật công tắc **Enable** đầu tiên -> Bấm **Save**.

### Bước 3: Tạo Firestore Database (Lưu SĐT, Địa chỉ, Profile)
1. Trong menu bên trái, chọn **Build** -> **Firestore Database**.
2. Bấm **Create database**.
3. Chọn vị trí server (ví dụ: `asia-southeast1`) -> Bấm **Next**.
4. Chọn **Start in test mode** (để cho phép đọc/ghi khi làm bài) -> Bấm **Create**.

### Bước 4: Lấy Firebase Web Configuration
1. Bấm vào icon bánh răng **Project Settings** (Cài đặt dự án) ở góc trên bên trái.
2. Cuộn xuống mục **Your apps**, bấm vào icon Web **`</>`**.
3. Đặt App nickname (ví dụ: `mma-web`), bỏ chọn Firebase Hosting -> Bấm **Register app**.
4. Bạn sẽ thấy đoạn code `firebaseConfig`:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789...",
     appId: "1:123456789:web:abcdef..."
   };
   ```
5. Mở file `src/config/firebase.js` trong dự án và thay thế các giá trị này vào.

---

## 🚀 HƯỚNG DẪN IMPORT VÀO EXPO SNACK

1. Mở trình duyệt và truy cập [https://snack.expo.dev/](https://snack.expo.dev/).
2. Đăng nhập tài khoản Expo (hoặc có thể dùng ẩn danh).
3. Ở thanh menu trên cùng hoặc góc dưới, bấm vào nút **Import git repository** (biểu tượng Git hoặc menu Snack -> Import git repository).
4. Dán link repository GitHub của bạn:
   ```text
   https://github.com/ttrangdt/mma-b6.git
   ```
5. Chọn nhánh: `main`.
6. Bấm **Import**. Toàn bộ cấu trúc thư mục, `App.js`, các màn hình và cấu hình sẽ hiển thị trực tiếp trên Expo Snack.
7. Bạn có thể chọn tab **Web**, **Android**, hoặc quét mã QR bằng ứng dụng **Expo Go** trên điện thoại để trải nghiệm ngay.

---

## 🔔 HƯỚNG DẪN TEST PUSH NOTIFICATION (FCM)

### Cách 1: Test trực tiếp ngay trên App
1. Sau khi đăng nhập, chuyển sang tab **FCM Thông Báo**.
2. Nhập tiêu đề và nội dung mong muốn -> Bấm **"Kích Hoạt Nhận Thông Báo"**.
3. Sau 1 giây, banner thông báo đẩy sẽ xuất hiện trên thanh thông báo của điện thoại/máy ảo.

### Cách 2: Gửi từ Firebase Console qua FCM Token
1. Trong màn hình **FCM Thông Báo**, bấm nút **"Sao Chép FCM Token"**.
2. Vào **Firebase Console** -> **Engage** -> **Messaging**.
3. Bấm **New campaign** -> Chọn **Firebase Notification messages**.
4. Điền:
   - Notification title: `Thông báo từ Firebase Console`
   - Notification text: `Xin chào, đây là tin nhắn FCM đẩy về ứng dụng!`
5. Bấm nút **Send test message** ở bên phải.
6. Dán Token bạn vừa sao chép vào ô **Add an FCM registration token** -> Bấm dấu `+` -> Chọn token -> Bấm **Test**.

---

## 📱 HƯỚNG DẪN CHẠY & BUILD APP BẰNG EXPO CLI

### 1. Chạy trên máy cục bộ (Local Development)
```bash
# Cài đặt thư viện
npm install

# Khởi động Expo Server
npx expo start
```
- Bấm `a` để mở trên Android Emulator.
- Bấm `w` để mở trên Web.
- Quét mã QR bằng ứng dụng Expo Go trên điện thoại thật.

### 2. Build ứng dụng thành file APK Android bằng Expo CLI / EAS Build
Expo hiện đại sử dụng **EAS Build** (chính thức từ Expo) để đóng gói file APK độc lập:

```bash
# 1. Cài đặt EAS CLI nếu chưa có
npm install -g eas-cli

# 2. Đăng nhập tài khoản Expo
npx eas login

# 3. Khởi tạo cấu hình EAS Build
npx eas build:configure

# 4. Build file APK Android (Preview profile)
npx eas build -p android --profile preview
```
Sau khi build hoàn tất, link tải file APK cài đặt trực tiếp trên Android sẽ được cung cấp trên terminal và trang quản lý Expo.

---

## ✅ BẢNG TỔNG HỢP YÊU CẦU ĐÃ HOÀN THÀNH

| STT | Yêu Cầu Đề Bài | Trạng Thái | Mô Tả Thực Hiện |
|:---:|:---|:---:|:---|
| 1 | Đăng nhập qua Firebase | ✅ Đã xong | `signInWithEmailAndPassword`, thông báo lỗi tiếng Việt trực quan |
| 2 | Quản lý thông tin người dùng | ✅ Đã xong | Đăng ký & Lưu dữ liệu vào Firestore (`users/{uid}`) |
| 3 | Cập nhật Email | ✅ Đã xong | `updateEmail` của Firebase Auth & Firestore |
| 4 | Cập nhật Số điện thoại | ✅ Đã xong | Cập nhật trường `phone` trong Firestore |
| 5 | Cập nhật Mật khẩu | ✅ Đã xong | `updatePassword` với modal đổi mật khẩu an toàn |
| 6 | Cập nhật Địa chỉ | ✅ Đã xong | Cập nhật trường `address` trong Firestore |
| 7 | Cài đặt dịch vụ FCM Firebase | ✅ Đã xong | Đăng ký Token, lưu Firestore, listener foreground/background |
| 8 | Link Asset Online | ✅ Đã xong | Sử dụng URL Unsplash và Icons8, đảm bảo Expo Snack không lỗi asset |
| 9 | Đẩy lên GitHub & Expo Snack | ✅ Đã xong | Repo: `https://github.com/ttrangdt/mma-b6.git` |
