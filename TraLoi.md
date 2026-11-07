# Trả lời câu hỏi bổ sung – Buổi 9

**1. Giá trị dẫn xuất:** `errors` và `valid` phụ thuộc trực tiếp vào các ô nhập và giỏ hàng, nên tính mỗi lần render để luôn đồng bộ. Nếu dùng state riêng, rất dễ quên cập nhật khi người dùng sửa một trường hoặc giỏ thay đổi, khiến nút đặt hàng sai trạng thái.

**2. Thứ tự gọi:** Nếu `clear()` chạy trước khi POST thành công, lỗi mạng sẽ làm mất giỏ hàng dù chưa tạo đơn. Vì vậy chỉ xóa giỏ sau khi `await createOrder(...)` trả về thành công.

**3. PUT và PATCH:** PUT thường thay thế toàn bộ tài nguyên; nếu chỉ gửi `name` và `phone`, các thuộc tính khác có nguy cơ mất. PATCH chỉ cập nhật hai trường gửi lên, giữ nguyên email và mật khẩu.

**4. Cập nhật lạc quan:** Nếu không hoàn tác `read: false` khi PATCH thất bại, giao diện báo đã đọc nhưng server vẫn chưa đọc, gây sai lệch. Thích hợp với đánh dấu yêu thích; không nên áp dụng kiểu xác nhận thành công trước cho thanh toán.

**5. Bộ lọc trạng thái:** Đã thêm vào `OrdersScreen.tsx` với state `filter`, các lựa chọn Tất cả / Chờ xác nhận / Đang giao / Hoàn tất / Đã huỷ. `FlatList` nhận `visibleOrders` lọc theo `status`. Ảnh chụp màn hình cần thực hiện trên máy chạy ứng dụng.

**Thử thách BT9.C1:** Đã thêm nút Mua lại cho đơn hoàn tất, lấy danh sách sách mới từ API, giới hạn số lượng theo tồn kho và chuyển sang Giỏ.
