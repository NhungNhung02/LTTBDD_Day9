# Hướng dẫn chạy BookStore Buổi 9 trên máy tính trường

## Cách 1 – Máy đã có Node.js 20.19+ (không cần quyền admin)

1. Tải file ZIP của bài hoàn chỉnh về máy, nhấn chuột phải **Extract All...** hoặc **Giải nén tất cả**, chọn thư mục có quyền ghi (ví dụ `Documents` hoặc ổ D). Không chạy trực tiếp trong ZIP.
2. Mở VS Code → **File → Open Folder** → chọn thư mục `BookStore_Buoi9_Starter` bên trong file đã giải nén.
3. Mở **Terminal → New Terminal**. Kiểm tra `node -v` và `npm -v`. Nếu Node thấp hơn 20.19, xem Cách 2.
4. Chạy `npm install` một lần. Cần Internet để tải thư viện. Chờ hoàn tất, không đóng terminal.
5. Mở Terminal 1, chạy `npm run api`. Giữ nguyên terminal này, API sẽ chạy ở `http://localhost:3000`.
6. Mở Terminal 2 (nút dấu `+` trong Terminal), chạy `npx expo start -c`. Nhấn **w** để mở bản web trên trình duyệt.
7. Đăng nhập: `demo@bookstore.vn` / `123456`. Demo Home → Chi tiết → Giỏ → Thanh toán → Đơn hàng → Tài khoản → Sửa hồ sơ → Thông báo.
8. Mở Terminal 3, chạy `npm run typecheck` để kiểm tra TypeScript.

## Cách 2 – Máy trường không cho cài Node.js

Nếu máy đã có Node.js đúng phiên bản thì **không cần cài thêm**. Nếu chưa có hoặc quá cũ, có thể dùng bản Node.js **Windows Binary (.zip)** từ https://nodejs.org/en/download (nếu quy định phòng máy cho phép): giải nén vào thư mục cá nhân, không cần trình cài đặt `.msi` và quyền admin. Trong terminal PowerShell của VS Code, chạy (đổi đường dẫn theo vị trí giải nén):

```powershell
$env:PATH="D:\node-portable;$env:PATH"
node -v
npm -v
```

Sau đó thực hiện các bước 4–8 ở Cách 1. Nếu PowerShell chặn `npm.ps1`, dùng `npm.cmd install`, `npm.cmd run api`, `npx.cmd expo start -c`, `npm.cmd run typecheck`.

## Chạy bằng điện thoại và Expo Go

Máy tính và điện thoại phải cùng mạng Wi-Fi, và firewall phải cho phép kết nối tới cổng 3000. Trên Windows mở PowerShell và chạy `ipconfig`, tìm **IPv4 Address** của Wi-Fi. Trong Terminal 2, trước khi khởi động Expo:

```powershell
$env:EXPO_PUBLIC_API_URL="http://192.168.1.10:3000"
npx.cmd expo start -c
```

Thay `192.168.1.10` bằng IPv4 thật của máy tính. Mở Expo Go trên điện thoại, quét QR. Nếu Wi-Fi trường chặn các thiết bị nhìn thấy nhau, **dùng bản web trên cùng máy** để demo, không cần điện thoại.

## Khắc phục nhanh

- `node` không nhận: Node chưa có trong PATH; mở terminal mới hoặc dùng bản portable.
- `configs.toReversed is not a function`: Node quá cũ, dùng Node 20.19+.
- `EADDRINUSE :3000`: có server khác chiếm cổng 3000; đóng tiến trình cũ trước khi chạy `npm run api`.
- `Network Error`: kiểm tra Terminal 1, truy cập `http://localhost:3000/books`, và URL API nếu chạy trên điện thoại.
- Không muốn mất dữ liệu demo: sao lưu `db.json` trước khi đặt hàng; json-server ghi thay đổi vào file này.
- Không cài được thư viện vì mạng trường: phải có Internet hoặc thư mục `node_modules` đã được cài trên máy khác tương thích; file ZIP không chứa `node_modules`.

**Lưu ý:** Không cần tải thêm ZIP Starter; bản này đã chứa source code, assets và `db.json`. Expo Go có thể không hiển thị icon/splash riêng; cấu hình đã có trong `app.json`.
