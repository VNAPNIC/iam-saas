***

## **Tài liệu Mô tả Chức năng Chi tiết theo Từng Giao diện**

### **Phần I: Các Giao diện Xác thực & Onboarding (Thư mục gốc)**

#### **1. `login.html`**
* **Mục đích chính**: Cung cấp giao diện cho người dùng đăng nhập vào hệ thống.
* **Đối tượng sử dụng**: User, Tenant Admin, Super Admin.
* **Chức năng và Luồng tương tác**:
    1.  **Form Đăng nhập**: Người dùng nhập **Email** và **Mật khẩu**.
    2.  **Hành động Đăng nhập**: Nhấn nút "Đăng nhập".
    3.  **Đăng nhập SSO**: Nhấn nút "Đăng nhập với SSO" để chuyển hướng đến nhà cung cấp định danh (IdP) đã được cấu hình.
    4.  **Khôi phục Mật khẩu**: Nhấp vào liên kết "Quên mật khẩu?" để điều hướng đến `forgot-password.html`.
    5.  **Điều hướng Đăng ký**: Nhấp vào liên kết "Đăng ký ngay" để tới `signup.html`.
    6.  **Phản hồi Lỗi**: Hiển thị thông báo "Email hoặc mật khẩu không đúng" nếu xác thực thất bại.
* **Logic Backend Liên quan**:
    * Xác thực thông tin đăng nhập (email, password đã hash).
    * Kiểm tra trạng thái tài khoản (active, suspended).
    * Nếu người dùng đã bật MFA, yêu cầu thêm một bước nhập OTP.
    * Tạo và trả về cặp Access/Refresh Token (JWT).
    * Ghi log sự kiện đăng nhập (thành công/thất bại).

#### **2. `signup.html`**
* **Mục đích chính**: Cho phép người dùng mới đăng ký tài khoản và tạo một Tenant mới.
* **Đối tượng sử dụng**: Người dùng mới (sẽ trở thành Tenant Admin).
* **Chức năng và Luồng tương tác**:
    1.  **Form Đăng ký**: Người dùng điền các thông tin: **Họ và tên**, **Email**, **Mật khẩu** (tối thiểu 8 ký tự), và **Xác nhận mật khẩu**.
    2.  **Hành động Đăng ký**: Nhấn nút "Đăng ký".
    3.  **Phản hồi Lỗi**: Hiển thị lỗi cụ thể cho từng trường (ví dụ: "Mật khẩu không khớp", "Email này đã được sử dụng").
* **Logic Backend Liên quan**:
    * Validate dữ liệu đầu vào.
    * Kiểm tra email có tồn tại trên toàn hệ thống không.
    * Tạo bản ghi `Tenant` và `User` với trạng thái `pending_verification`.
    * Tạo và gửi token xác thực qua email.

#### **3. `forgot-password.html` & `recover-account.html`**
* **Mục đích chính**: Cung cấp quy trình khôi phục quyền truy cập tài khoản.
* **Đối tượng sử dụng**: User, Tenant Admin, Super Admin.
* **Chức năng và Luồng tương tác**:
    1.  **Yêu cầu Đặt lại Mật khẩu (`forgot-password.html`)**: Người dùng nhập email và nhấn "Gửi liên kết đặt lại".
    2.  **Chọn Phương thức Khôi phục (`recover-account.html`)**: Nếu không truy cập được email, người dùng có thể chọn khôi phục bằng **Mã khôi phục** hoặc **Câu hỏi bảo mật**.
    3.  **Xác minh**: Người dùng nhập thông tin tương ứng và nhấn "Xác minh".
* **Logic Backend Liên quan**:
    * Tạo và gửi token đặt lại mật khẩu.
    * Xác thực token, mã khôi phục, hoặc câu trả lời cho câu hỏi bảo mật.
    * Cho phép người dùng đặt mật khẩu mới sau khi xác minh thành công.

#### **4. `verify-email.html`**
* **Mục đích chính**: Trang đích để xác thực email của người dùng sau khi đăng ký.
* **Đối tượng sử dụng**: Người dùng mới.
* **Chức năng và Luồng tương tác**:
    1.  Trang tự động đọc `token` từ URL.
    2.  Hiển thị trạng thái "Đang xác thực...".
    3.  Sau khi xử lý, hiển thị thông báo "Xác thực Thành công!" hoặc "Xác thực Thất bại".
    4.  Nếu thành công, nút "Đi đến trang Đăng nhập" sẽ xuất hiện.
* **Logic Backend Liên quan**:
    * Xác thực `token` nhận được.
    * Nếu hợp lệ, cập nhật trạng thái của `User` và `Tenant` thành `active`.

#### **5. `onboarding-wizard.html`**
* **Mục đích chính**: Hướng dẫn Tenant Admin mới các bước thiết lập ban đầu cho tenant của họ.
* **Đối tượng sử dụng**: Tenant Admin (lần đầu đăng nhập).
* **Chức năng và Luồng tương tác**:
    1.  **Bước 1 - Tùy chỉnh**: Tải lên logo công ty, chọn ngôn ngữ mặc định.
    2.  **Bước 2 - Mời thành viên**: Nhập email và chọn vai trò cho thành viên đầu tiên.
    3.  **Bước 3 - Hoàn tất**: Thông báo thiết lập thành công và cung cấp nút "Đi đến Dashboard" để điều hướng đến `index.html`.
* **Logic Backend Liên quan**:
    * Lưu các cài đặt branding (logo, ngôn ngữ) cho tenant.
    * Thực hiện logic mời người dùng.

### **Phần II: Giao diện Chính và Trang Cá nhân**

#### **6. `index.html`**
* **Mục đích chính**: Là khung sườn (shell) chính của ứng dụng sau khi đăng nhập, chứa sidebar, header và vùng nội dung chính.
* **Đối tượng sử dụng**: User, Tenant Admin, Super Admin.
* **Chức năng và Luồng tương tác**:
    1.  **Sidebar (Thanh bên)**: Chứa các liên kết điều hướng đến tất cả các trang chức năng. Sidebar có thể thu gọn/mở rộng. Các mục menu hiển thị sẽ phụ thuộc vào vai trò của người dùng.
    2.  **Header (Đầu trang)**: Hiển thị tiêu đề của trang hiện tại, các nút chuyển đổi ngôn ngữ, chế độ tối/sáng, thông báo và hồ sơ người dùng.
    3.  **Main Content (Nội dung chính)**: Vùng trống (`<main id="main-content">`) nơi nội dung của các trang chức năng khác sẽ được tải vào động bằng JavaScript.
* **Logic Backend Liên quan**:
    * Cung cấp API để lấy thông tin người dùng hiện tại (tên, vai trò) và các quyền hạn để quyết định các mục menu nào được hiển thị trên sidebar.

#### **7. `pages/profile.html`**
* **Mục đích chính**: Cho phép người dùng quản lý thông tin cá nhân và cài đặt bảo mật của họ.
* **Đối tượng sử dụng**: User, Tenant Admin, Super Admin.
* **Chức năng và Luồng tương tác**:
    1.  **Thông tin cá nhân**: Form để chỉnh sửa **Họ và tên**, tải lên **Ảnh đại diện**.
    2.  **Đổi mật khẩu**: Form để thay đổi mật khẩu.
    3.  **Cài đặt MFA**: Nút để bật/tắt MFA và khu vực hiển thị mã QR.
    4.  **Lịch sử Đăng nhập**: Bảng liệt kê các phiên đăng nhập gần đây.
* **Logic Backend Liên quan**:
    * Cung cấp các API endpoint để cập nhật tên, ảnh đại diện, mật khẩu.
    * Cung cấp API để tạo `secret key` cho MFA và xác thực OTP.
    * Cung cấp API để lấy lịch sử đăng nhập của người dùng.

### **Phần III: Các Giao diện của Super Admin**

#### **8. `pages/tenant-manager.html` & `pages/tenant-details.html`**
* **Mục đích chính**: Cung cấp công cụ cho Super Admin để quản lý toàn bộ các tenant.
* **Đối tượng sử dụng**: Super Admin.
* **Chức năng và Luồng tương tác**:
    1.  **Danh sách Tenant (`tenant-manager.html`)**: Hiển thị bảng liệt kê các tenant với thông tin cơ bản (Tên, Gói, Trạng thái). Nhấp vào một tenant sẽ điều hướng đến trang chi tiết.
    2.  **Thêm Tenant**: Nút "Thêm Tenant" mở một modal để nhập Tên Tenant, Email Quản trị viên, và chọn Gói dịch vụ.
    3.  **Chi tiết Tenant (`tenant-details.html`)**: Hiển thị thông tin chi tiết về một tenant cụ thể, các chỉ số sử dụng (người dùng, hóa đơn, API calls), và các nút hành động.
    4.  **Hành động**: Các nút "Tạm ngưng Tenant" và "Xóa Tenant" yêu cầu xác thực OTP để thực hiện.
* **Logic Backend Liên quan**:
    * Cung cấp các API CRUD cho `Tenants`.
    * Logic xóa/tạm ngưng tenant cần được thực hiện cẩn thận (ví dụ: soft delete).
    * Tổng hợp các chỉ số sử dụng từ các dịch vụ khác để hiển thị.

#### **9. `pages/plans.html`**
* **Mục đích chính**: Cho phép Super Admin tạo và quản lý các gói dịch vụ.
* **Đối tượng sử dụng**: Super Admin.
* **Chức năng và Luồng tương tác**:
    1.  **Danh sách Gói**: Bảng liệt kê các gói dịch vụ hiện có (Tên, Giá, Giới hạn User/API, Trạng thái).
    2.  **Tạo/Sửa Gói**: Modal cho phép Super Admin nhập các thuộc tính của một gói dịch vụ.
* **Logic Backend Liên quan**:
    * Cung cấp các API CRUD cho `Plans`.
    * Ràng buộc nghiệp vụ: không cho phép xóa một gói nếu có tenant đang sử dụng.

#### **10. `pages/request-management.html`**
* **Mục đích chính**: Trung tâm để Super Admin phê duyệt các yêu cầu từ Tenant Admin.
* **Đối tượng sử dụng**: Super Admin.
* **Chức năng và Luồng tương tác**:
    1.  **Tabs**: Giao diện được chia thành các tab cho "Phê duyệt Tenant" và "Yêu cầu Quota".
    2.  **Xử lý Yêu cầu**: Mỗi yêu cầu trong danh sách có nút "Phê duyệt" và "Từ chối". Nút "Từ chối" sẽ mở một modal yêu cầu nhập lý do.
* **Logic Backend Liên quan**:
    * Lưu trữ và quản lý trạng thái của các yêu cầu (`pending`, `approved`, `denied`).
    * Thực hiện các hành động tương ứng khi một yêu cầu được xử lý (ví dụ: cập nhật quota của tenant).

#### **11. `pages/security-dashboard.html`**
* **Mục đích chính**: Cung cấp cho Super Admin một cái nhìn tổng quan về tình hình an ninh trên toàn hệ thống.
* **Đối tượng sử dụng**: Super Admin.
* **Chức năng và Luồng tương tác**:
    1.  **Thẻ Số liệu**: Hiển thị các con số thống kê nhanh về cảnh báo, phiên bất thường, tài khoản bị khóa.
    2.  **Phát hiện Bất thường (AI)**: Liệt kê các sự kiện đáng ngờ được phát hiện bởi hệ thống (ví dụ: đăng nhập từ IP lạ).
    3.  **Nhật ký Quan trọng**: Hiển thị các sự kiện có mức độ `CRITICAL` hoặc `HIGH` (ví dụ: xóa tenant).
* **Logic Backend Liên quan**:
    * Tổng hợp dữ liệu từ các dịch vụ giám sát và ghi log.
    * Triển khai một mô hình (hoặc dịch vụ) AI để phân tích và phát hiện các hành vi bất thường.

### **Phần IV: Các Giao diện của Tenant Admin**

#### **12. `pages/users.html`**
* **Mục đích chính**: Cho phép Tenant Admin quản lý người dùng trong tenant của họ.
* **Đối tượng sử dụng**: Tenant Admin.
* **Chức năng và Luồng tương tác**:
    1.  **Danh sách Người dùng**: Bảng hiển thị người dùng với các bộ lọc theo trạng thái và vai trò.
    2.  **Mời Người dùng**: Modal để mời người dùng mới bằng email.
    3.  **Hành động**: Các tùy chọn để sửa vai trò hoặc xóa người dùng.
* **Logic Backend Liên quan**:
    * API CRUD cho `Users` trong phạm vi một tenant.
    * Kiểm tra quota người dùng trước khi cho phép mời.

#### **13. `pages/roles.html` & `pages/permissions.html`**
* **Mục đích chính**: Cho phép Tenant Admin quản lý hệ thống phân quyền (RBAC).
* **Đối tượng sử dụng**: Tenant Admin.
* **Chức năng và Luồng tương tác**:
    1.  **`permissions.html`**: Tạo ra các quyền cơ bản với một `key` duy nhất (ví dụ: `users:delete`).
    2.  **`roles.html`**: Tạo ra các vai trò và gán một hoặc nhiều quyền đã tạo cho vai trò đó.
* **Logic Backend Liên quan**:
    * API CRUD cho `Roles` và `Permissions`.
    * Quản lý các mối quan hệ nhiều-nhiều giữa Users-Roles và Roles-Permissions.

#### **14. `pages/billing.html` & `pages/subscriptions.html`**
* **Mục đích chính**: Cho phép Tenant Admin quản lý gói dịch vụ và thanh toán của họ.
* **Đối tượng sử dụng**: Tenant Admin.
* **Chức năng và Luồng tương tác**:
    1.  **`billing.html`**: Hiển thị gói hiện tại, theo dõi việc sử dụng quota, và xem lịch sử thanh toán. Cho phép gửi yêu cầu tăng quota.
    2.  **`subscriptions.html`**: (Dành cho Super Admin) Hiển thị danh sách đăng ký của tất cả các tenant và cho phép thay đổi gói của họ.
* **Logic Backend Liên quan**:
    * Theo dõi và tính toán việc sử dụng tài nguyên (quota).
    * Tích hợp với một cổng thanh toán (ví dụ: Stripe) để xử lý các giao dịch.

#### **15. `pages/audit-logs.html`**
* **Mục đích chính**: Cung cấp nhật ký kiểm tra chi tiết cho các quản trị viên.
* **Đối tượng sử dụng**: Tenant Admin, Super Admin.
* **Chức năng và Luồng tương tác**:
    1.  **Bảng Log**: Hiển thị các sự kiện với thông tin chi tiết (Hành động, Người thực hiện, IP, Thời gian).
    2.  **Bộ lọc**: Cho phép lọc các sự kiện theo hành động, người dùng, hoặc khoảng thời gian.
    3.  **Xuất dữ liệu**: Nút "Xuất Nhật ký" để tải về tệp CSV.
* **Logic Backend Liên quan**:
    * Cung cấp một API mạnh mẽ để truy vấn và lọc dữ liệu log.
    * Phân quyền để Tenant Admin chỉ thấy log của tenant mình, còn Super Admin thấy toàn bộ.

***

## **Đặc tả Kỹ thuật Chi tiết theo Giao diện Người dùng (.html)**

Tài liệu này phân tích từng file `.html` theo một cấu trúc thống nhất để đảm bảo tính rõ ràng và đầy đủ, phục vụ trực tiếp cho việc phát triển backend.

### **Phần I: Giao diện Xác thực & Khởi tạo (Thư mục gốc)**

#### **1. `login.html` - Trang Đăng nhập**

* **Mục đích**: Cung cấp giao diện để người dùng xác thực và truy cập vào hệ thống.
* **Đối tượng sử dụng**: User, Tenant Admin, Super Admin.
* **Thành phần & Luồng chức năng**:
    * **Form Đăng nhập**:
        * **Input `email`**: Người dùng nhập địa chỉ email.
        * **Input `password`**: Người dùng nhập mật khẩu.
        * **Button "Đăng nhập"**: Kích hoạt sự kiện đăng nhập bằng tài khoản/mật khẩu.
    * **Button "Đăng nhập với SSO"**:
        * **Luồng**: Kích hoạt luồng xác thực qua nhà cung cấp định danh (IdP) bên ngoài.
    * **Link "Quên mật khẩu?"**: Điều hướng người dùng đến `forgot-password.html`.
* **Yêu cầu Backend**:
    * **Endpoint `POST /api/v1/auth/login`**:
        * **Input**: `{ "email": "String", "password": "String", "mfa_otp": "String" (optional) }`.
        * **Logic**:
            1.  Tìm `User` dựa trên `email`. Nếu không tìm thấy, trả về lỗi `401 Unauthorized`.
            2.  So sánh `password` được cung cấp với `password_hash` trong CSDL bằng bcrypt. Nếu sai, trả về lỗi `401 Unauthorized` và tăng bộ đếm đăng nhập thất bại.
            3.  Nếu mật khẩu đúng, kiểm tra xem người dùng có bật MFA không. Nếu có và `mfa_otp` không được cung cấp hoặc sai, trả về lỗi yêu cầu MFA.
            4.  Nếu tất cả đều hợp lệ, reset bộ đếm đăng nhập thất bại, tạo cặp Access/Refresh Token, và trả về cho client.
    * **Endpoint `GET /api/v1/auth/sso/redirect`**:
        * **Logic**: Lấy thông tin cấu hình SSO của tenant (dựa trên domain của email nếu có thể) và trả về URL chuyển hướng của IdP.
* **Sự kiện Ghi Log**:
    * `EVENT: USER_LOGIN_SUCCESS`, `LEVEL: INFO`, `DETAILS: {userId, ipAddress, userAgent}`.
    * `EVENT: USER_LOGIN_FAILURE`, `LEVEL: WARNING`, `DETAILS: {email, ipAddress, reason: "INVALID_CREDENTIALS/INVALID_MFA"}`.

---

#### **2. `signup.html` - Trang Đăng ký**

* **Mục đích**: Cho phép người dùng mới tạo tài khoản và một Tenant mới.
* **Đối tượng sử dụng**: Người dùng mới (sẽ trở thành Tenant Admin).
* **Thành phần & Luồng chức năng**:
    * **Form Đăng ký**:
        * **Inputs**: `name`, `email`, `password`, `confirm-password`.
        * **Button "Đăng ký"**: Gửi thông tin form để tạo tài khoản.
* **Yêu cầu Backend**:
    * **Endpoint `POST /api/v1/auth/register`**:
        * **Input**: `{ "name": "String", "email": "String", "password": "String", "tenantName": "String" (derived from form or separate field) }`.
        * **Logic**:
            1.  Validate các trường (email hợp lệ, password > 8 ký tự).
            2.  Kiểm tra email đã tồn tại chưa. Nếu có, trả về lỗi `409 Conflict`.
            3.  Hash mật khẩu.
            4.  Tạo bản ghi `Tenant` (`status: pending_verification`).
            5.  Tạo bản ghi `User` (`status: pending_verification`), gán vai trò `Tenant Admin` và liên kết với `Tenant` mới.
            6.  Tạo token xác thực và gửi email.
* **Sự kiện Ghi Log**: `EVENT: USER_SIGNUP_ATTEMPT`, `LEVEL: INFO`, `DETAILS: {email, tenantName, status}`.

---

#### **3. `onboarding-wizard.html` - Trình Hướng dẫn Thiết lập**

* **Mục đích**: Hướng dẫn Tenant Admin mới thiết lập các thông tin cơ bản cho Tenant.
* **Đối tượng sử dụng**: Tenant Admin (lần đầu đăng nhập).
* **Thành phần & Luồng chức năng**:
    * **Bước 1: Tùy chỉnh**: Tải lên logo, chọn ngôn ngữ.
    * **Bước 2: Mời thành viên**: Form nhập email và chọn vai trò cho thành viên mới.
* **Yêu cầu Backend**:
    * **Endpoint `PUT /api/v1/tenant/branding`**:
        * **Input**: `multipart/form-data` chứa tệp logo và các cài đặt khác.
        * **Logic**: Lưu tệp logo (vào S3/GCS), cập nhật URL logo và các cài đặt vào bản ghi `Tenant`.
    * **Endpoint `POST /api/v1/users/invite`**:
        * **Logic**: Tái sử dụng logic mời người dùng, kiểm tra quota trước khi gửi lời mời.
* **Sự kiện Ghi Log**: `EVENT: ONBOARDING_COMPLETED`, `LEVEL: INFO`, `DETAILS: {tenantId, adminId}`.

---

### **Phần II: Giao diện Chức năng (Thư mục `pages/`)**

#### **4. `pages/profile.html` - Trang Hồ sơ Người dùng**

* **Mục đích**: Quản lý thông tin cá nhân và cài đặt bảo mật.
* **Đối tượng sử dụng**: Mọi người dùng đã đăng nhập.
* **Thành phần & Luồng chức năng**:
    * **Form Thông tin cá nhân**: Cập nhật `name`, `avatar`.
    * **Form Đổi mật khẩu**: Cập nhật `password`.
    * **Khu vực MFA**: Bật/tắt MFA, hiển thị mã QR.
    * **Bảng Lịch sử Đăng nhập**: Hiển thị danh sách các phiên đăng nhập.
* **Yêu cầu Backend**:
    * **Endpoint `PUT /api/v1/profile`**: Cập nhật thông tin người dùng.
    * **Endpoint `PUT /api/v1/profile/password`**:
        * **Input**: `{ "currentPassword": "...", "newPassword": "..." }`.
        * **Logic**: Xác thực `currentPassword` trước khi cập nhật.
    * **Endpoint `POST /api/v1/mfa/enable`**: Tạo secret key, trả về dưới dạng QR code data URI.
    * **Endpoint `POST /api/v1/mfa/verify`**:
        * **Input**: `{ "otp": "..." }`.
        * **Logic**: Xác thực OTP để hoàn tất việc bật MFA.
    * **Endpoint `POST /api/v1/mfa/disable`**: Yêu cầu xác thực (ví dụ: nhập mật khẩu) để tắt MFA.
    * **Endpoint `GET /api/v1/profile/sessions`**: Lấy danh sách lịch sử đăng nhập.
* **Sự kiện Ghi Log**:
    * `EVENT: PROFILE_UPDATED`, `LEVEL: LOW`.
    * `EVENT: PASSWORD_CHANGED`, `LEVEL: MEDIUM`.
    * `EVENT: MFA_ENABLED/MFA_DISABLED`, `LEVEL: HIGH`.

---

#### **5. `pages/users.html` - Quản lý Người dùng**

* **Mục đích**: Cho phép Tenant Admin quản lý vòng đời người dùng trong tenant.
* **Đối tượng sử dụng**: Tenant Admin.
* **Thành phần & Luồng chức năng**:
    * **Bộ lọc**: Lọc danh sách người dùng theo `status` và `role`.
    * **Button "Add User"**: Mở modal mời người dùng.
    * **Bảng Người dùng**: Liệt kê người dùng, cung cấp hành động `Edit`, `Delete`.
* **Yêu cầu Backend**:
    * **Endpoint `GET /api/v1/users`**: Hỗ trợ phân trang, lọc và tìm kiếm.
    * **Endpoint `POST /api/v1/users/invite`**:
        * **Logic**: Kiểm tra quota người dùng trước khi tạo bản ghi và gửi email mời.
    * **Endpoint `PUT /api/v1/users/{userId}`**: Cập nhật thông tin người dùng (chủ yếu là `roleId`).
    * **Endpoint `DELETE /api/v1/users/{userId}`**: Xóa người dùng (soft delete).
* **Sự kiện Ghi Log**:
    * `EVENT: USER_INVITED`, `LEVEL: MEDIUM`.
    * `EVENT: USER_UPDATED`, `LEVEL: LOW`.
    * `EVENT: USER_DELETED`, `LEVEL: HIGH`.

---

#### **6. `pages/roles.html` & `pages/permissions.html` - Quản lý Phân quyền**

* **Mục đích**: Định nghĩa hệ thống RBAC cho tenant.
* **Đối tượng sử dụng**: Tenant Admin.
* **Thành phần & Luồng chức năng**:
    * **`permissions.html`**: Giao diện CRUD cho các quyền. Mỗi quyền có một `name` (hiển thị) và một `key` (sử dụng trong code, ví dụ: `users:delete`).
    * **`roles.html`**: Giao diện CRUD cho các vai trò. Khi tạo/sửa vai trò, Tenant Admin có thể chọn một hoặc nhiều quyền từ danh sách đã tạo.
* **Yêu cầu Backend**:
    * Cung cấp các API CRUD đầy đủ cho `Roles` và `Permissions`, luôn có ràng buộc `tenant_id`.
    * **Endpoint `POST /api/v1/roles`**:
        * **Input**: `{ "name": "...", "description": "...", "permissionIds": [1, 5, 12] }`.
        * **Logic**: Tạo vai trò và các bản ghi tương ứng trong bảng trung gian `Role_Permissions`.
* **Sự kiện Ghi Log**: `EVENT: ROLE_CREATED/UPDATED/DELETED`, `LEVEL: MEDIUM`.

---

#### **7. `pages/billing.html` - Thanh toán & Quota**

* **Mục đích**: Cho phép Tenant Admin quản lý gói dịch vụ và thanh toán.
* **Đối tượng sử dụng**: Tenant Admin.
* **Thành phần & Luồng chức năng**:
    * **Hiển thị Gói hiện tại**: Tên gói, giá, ngày gia hạn.
    * **Hiển thị Quota**: Thanh tiến trình thể hiện mức sử dụng (người dùng, hóa đơn) so với giới hạn.
    * **Button "Yêu cầu tăng Quota"**: Mở modal để gửi yêu cầu đến Super Admin.
    * **Bảng Lịch sử Thanh toán**: Liệt kê các giao dịch và cho phép tải hóa đơn.
* **Yêu cầu Backend**:
    * **Endpoint `GET /api/v1/subscription`**: Lấy thông tin gói, quota và mức sử dụng hiện tại của tenant.
    * **Endpoint `POST /api/v1/requests/quota`**:
        * **Input**: `{ "quotaType": "users", "requestedAmount": 200, "reason": "..." }`.
        * **Logic**: Tạo một bản ghi `Request` với trạng thái `pending`.
    * Tích hợp với cổng thanh toán (ví dụ: Stripe) để lấy lịch sử giao dịch và link tải hóa đơn.
* **Sự kiện Ghi Log**: `EVENT: QUOTA_REQUEST_SUBMITTED`, `LEVEL: INFO`.

---

#### **8. `pages/tenant-manager.html` & `pages/tenant-details.html` - Quản lý Tenant**

* **Mục đích**: Cung cấp công cụ cho Super Admin để quản lý toàn bộ các tenant.
* **Đối tượng sử dụng**: Super Admin.
* **Thành phần & Luồng chức năng**:
    * **`tenant-manager.html`**: Bảng danh sách tất cả các tenant, cho phép thêm tenant mới.
    * **`tenant-details.html`**: Hiển thị thông tin chi tiết của một tenant, bao gồm các chỉ số sử dụng và các hành động quản trị cấp cao.
    * **Hành động "Tạm ngưng" / "Xóa"**: Các hành động nguy hiểm yêu cầu xác nhận.
* **Yêu cầu Backend**:
    * **Endpoint `GET /api/v1/sa/tenants`**: Lấy danh sách tenant (chỉ Super Admin).
    * **Endpoint `GET /api/v1/sa/tenants/{tenantId}`**: Lấy thông tin chi tiết một tenant.
    * **Endpoint `PUT /api/v1/sa/tenants/{tenantId}/status`**:
        * **Input**: `{ "status": "suspended" }`.
        * **Logic**: Thay đổi trạng thái của tenant. Nếu tạm ngưng, tất cả người dùng của tenant đó sẽ không thể đăng nhập.
    * **Endpoint `DELETE /api/v1/sa/tenants/{tenantId}`**: Thực hiện soft delete.
* **Sự kiện Ghi Log**:
    * `EVENT: TENANT_CREATED`, `LEVEL: HIGH`.
    * `EVENT: TENANT_STATUS_CHANGED`, `LEVEL: CRITICAL`.
    * `EVENT: TENANT_DELETED`, `LEVEL: CRITICAL`.

***

### **Phần V: Giao diện Giám sát và Phân tích**

#### **9. `pages/overview.html` - Trang Tổng quan**

* **Mục đích**: Cung cấp một dashboard tổng hợp các chỉ số quan trọng và hoạt động gần đây cho Tenant Admin.
* **Đối tượng sử dụng**: Tenant Admin.
* **Thành phần & Luồng chức năng**:
    * **Bộ lọc Thời gian**: Dropdown cho phép chọn khoảng thời gian (`Last 24 Hours`, `Last 7 Days`, `Last 30 Days`, `Custom`). Nếu chọn `Custom`, hai ô nhập ngày bắt đầu và kết thúc sẽ hiện ra.
    * **Thẻ Số liệu (Stat Cards)**: Hiển thị 4 chỉ số chính: **Total Users**, **Active Sessions**, **MFA Enabled**, và **Audit Events**. Mỗi thẻ có một con số chính, một chỉ số % thay đổi, và một biểu đồ sparkline nhỏ.
    * **Bảng "Recent Activity"**: Liệt kê 5-10 hoạt động gần nhất trong tenant (ví dụ: User Login, Role Updated) với các cột Event, User, Time, Status.
    * **Khu vực "Quick Actions"**: Các nút/liên kết để thực hiện nhanh các hành động phổ biến như "Invite User", "Create Role", "Configure MFA".
* **Yêu cầu Backend**:
    * **Endpoint `GET /api/v1/dashboard/stats`**:
        * **Input**: Query parameters `?timeRange=week` hoặc `?startDate=...&endDate=...`.
        * **Logic**: Tổng hợp dữ liệu từ nhiều nguồn (bảng Users, Sessions, Audit Logs) để tính toán các chỉ số. Ví dụ: `Total Users` là `COUNT(users)`, `Active Sessions` là `COUNT(sessions where last_seen < 15 mins)`. Dữ liệu cho biểu đồ sparkline cũng cần được chuẩn bị.
        * **Output**: `{ "totalUsers": { "value": 1248, "trend": "+12.5%" }, "activeSessions": { ... }, ... "sparklineData": { "totalUsers": [10, 20, ...] } }`.
    * **Endpoint `GET /api/v1/audit-logs?limit=5&sort=desc`**: Lấy 5 sự kiện audit log gần nhất để hiển thị trong bảng "Recent Activity".
* **Sự kiện Ghi Log**: Không áp dụng trực tiếp, trang này chỉ đọc và hiển thị dữ liệu.

---

#### **10. `pages/analytics.html` - Trang Phân tích**

* **Mục đích**: Cung cấp các biểu đồ chi tiết để Tenant Admin có cái nhìn sâu hơn về các xu hướng hoạt động trong tenant.
* **Đối tượng sử dụng**: Tenant Admin.
* **Thành phần & Luồng chức năng**:
    * **Bộ lọc Thời gian**: Tương tự trang `overview.html`.
    * **Biểu đồ (Charts)**:
        * **`active-users-chart`**: Biểu đồ đường (line chart) thể hiện số lượng người dùng hoạt động theo thời gian.
        * **`sso-login-chart`**: Biểu đồ tròn (pie chart) thể hiện tỷ lệ đăng nhập SSO thành công và thất bại.
        * **`mfa-actions-chart`**: Biểu đồ cột (bar chart) thống kê số lần sử dụng các phương thức MFA khác nhau.
        * **`webhook-events-chart`**: Biểu đồ cột thống kê số lượng sự kiện webhook đã được gửi.
* **Yêu cầu Backend**:
    * **Endpoint `GET /api/v1/analytics/{chartName}`**:
        * **Input**: Query parameters `?timeRange=month`.
        * **Logic**: Mỗi biểu đồ yêu cầu một endpoint riêng để thực hiện truy vấn và tổng hợp dữ liệu phù hợp. Ví dụ, `active-users-chart` yêu cầu truy vấn theo ngày để đếm số user có hoạt động. `sso-login-chart` yêu cầu tổng hợp từ audit logs các sự kiện `SSO_LOGIN_SUCCESS` và `SSO_LOGIN_FAILURE`.
        * **Output**: Dữ liệu đã được định dạng sẵn cho thư viện Chart.js, ví dụ: `{ "labels": ["Week 1", "Week 2", ...], "datasets": [{ "label": "Active Users", "data": [100, 120, ...] }] }`.
* **Sự kiện Ghi Log**: Không áp dụng.

---

### **Phần VI: Giao diện Bảo mật và Chính sách**

#### **11. `pages/sso-integration.html` - Tích hợp SSO**

* **Mục đích**: Cho phép Tenant Admin cấu hình, quản lý và xem lịch sử thay đổi của việc tích hợp SSO.
* **Đối tượng sử dụng**: Tenant Admin.
* **Thành phần & Luồng chức năng**:
    * **Hiển thị Cấu hình Hiện tại**: Hiển thị các thông tin chỉ đọc về trạng thái SSO, nhà cung cấp, Metadata URL.
    * **Các nút Hành động**: "Chỉnh sửa Cấu hình", "Kiểm tra Kết nối", "Xóa Tích hợp".
    * **Bảng Lịch sử Thay đổi**: Liệt kê các lần thay đổi cấu hình SSO (Hành động, Người thực hiện, Thời gian).
    * **Modal `sso-config-modal`**: Form để Tenant Admin nhập và cập nhật các thông tin cấu hình (Trạng thái, Nhà cung cấp, Metadata URL, Client ID, Client Secret).
* **Yêu cầu Backend**:
    * **Endpoint `GET /api/v1/sso-settings`**: Lấy cấu hình SSO hiện tại của tenant (không bao giờ trả về `clientSecret`).
    * **Endpoint `PUT /api/v1/sso-settings`**: Cập nhật cấu hình SSO.
    * **Endpoint `POST /api/v1/sso-settings/test`**: Thực hiện logic kiểm tra kết nối và trả về kết quả.
    * **Endpoint `DELETE /api/v1/sso-settings`**: Xóa cấu hình SSO.
    * **Endpoint `GET /api/v1/sso-settings/history`**: Lấy lịch sử thay đổi cấu hình.
* **Sự kiện Ghi Log**:
    * `EVENT: SSO_CONFIG_UPDATED`, `LEVEL: HIGH`.
    * `EVENT: SSO_CONNECTION_TEST`, `LEVEL: INFO`.
    * `EVENT: SSO_CONFIG_DELETED`, `LEVEL: CRITICAL`.

---

#### **12. `pages/policy-config.html` & `pages/policy-simulator.html` - Chính sách Truy cập**

* **Mục đích**: Cung cấp công cụ quản lý và kiểm thử chính sách truy cập dựa trên thuộc tính (ABAC).
* **Đối tượng sử dụng**: Tenant Admin.
* **Thành phần & Luồng chức năng**:
    * **`policy-config.html`**:
        * **Bảng Chính sách**: Liệt kê các chính sách hiện có (Tên, Đối tượng, Điều kiện, Trạng thái).
        * **Modal `policy-modal`**: Giao diện để tạo/sửa chính sách. Cho phép đặt tên, chọn đối tượng áp dụng (ví dụ: Vai trò Kế toán), hành động (CHO PHÉP/TỪ CHỐI), và xây dựng các điều kiện động (ví dụ: `Thuộc tính: Địa chỉ IP`, `Toán tử: nằm trong dải`, `Giá trị: 10.0.0.0/8`).
    * **`policy-simulator.html`**:
        * **Form Mô phỏng**: Tenant Admin nhập **Người dùng cần kiểm tra**, **Hành động cần kiểm tra**, và các **Thuộc tính Ngữ cảnh** (IP, Thời gian).
        * **Kết quả Phân tích**: Hiển thị kết quả là **CHO PHÉP** hoặc **TỪ CHỐI**, kèm theo lý do chi tiết (ví dụ: "Thỏa mãn chính sách X", "Vi phạm chính sách Y").
* **Yêu cầu Backend**:
    * Cung cấp các API CRUD cho `Policies`.
    * **Endpoint `POST /api/v1/policies/simulate`**:
        * **Input**: `{ "userEmail": "...", "actionKey": "...", "context": { "ip": "...", "time": "..." } }`.
        * **Logic**: Thực thi một "dry run" của engine phân quyền, trả về kết quả và lý do chi tiết mà không thực sự cấp/từ chối quyền.
* **Sự kiện Ghi Log**: `EVENT: POLICY_CREATED/UPDATED/DELETED`, `LEVEL: HIGH`.

---

#### **13. `pages/session-management.html` - Quản lý Phiên đăng nhập**

* **Mục đích**: Cho phép Tenant Admin xem và thu hồi các phiên đăng nhập đang hoạt động.
* **Đối tượng sử dụng**: Tenant Admin.
* **Thành phần & Luồng chức năng**:
    * **Bộ lọc**: Tìm kiếm theo Người dùng, Địa chỉ IP, Hệ điều hành.
    * **Bảng Phiên**: Liệt kê các phiên đang hoạt động với thông tin chi tiết.
    * **Button "Thu hồi"**: Cho phép admin chấm dứt một phiên đăng nhập ngay lập tức.
* **Yêu cầu Backend**:
    * **Endpoint `GET /api/v1/sessions`**: Lấy danh sách các phiên đang hoạt động với khả năng lọc.
    * **Endpoint `DELETE /api/v1/sessions/{sessionId}`**:
        * **Logic**: Vô hiệu hóa Refresh Token liên quan đến phiên đó. Khi Access Token tiếp theo hết hạn, người dùng sẽ bị buộc đăng xuất.
* **Sự kiện Ghi Log**: `EVENT: SESSION_REVOKED`, `LEVEL: HIGH`, `DETAILS: {adminId, revokedUserId, sessionId}`.

***

### **Phần VII: Giao diện Quản lý Tài nguyên và Tích hợp**

#### **16. `pages/applications.html` & `pages/application-details.html` - Quản lý Ứng dụng**

* **Mục đích**: Cho phép Tenant Admin đăng ký và quản lý các ứng dụng (clients) sẽ sử dụng hệ thống IAM để xác thực (ví dụ: qua luồng OAuth 2.0).
* **Đối tượng sử dụng**: Tenant Admin.
* **Thành phần & Luồng chức năng**:
    * **`applications.html`**:
        * **Hiển thị Danh sách**: Bảng liệt kê các ứng dụng đã đăng ký với Tên và Client ID. Có thể có trạng thái rỗng (empty state) nếu chưa có ứng dụng nào.
        * **Button "Đăng ký Ứng dụng mới"**: Mở modal `app-modal`.
    * **Modal `app-modal`**:
        * **Input**: Tên Ứng dụng, Redirect URIs (mỗi URL trên một dòng).
        * **Hành động**: Khi nhấn "Tạo Ứng dụng", hệ thống sẽ tạo ứng dụng và hiển thị modal `credentials-modal`.
    * **Modal `credentials-modal`**:
        * **Hiển thị**: Hiển thị **Client ID** và **Client Secret** vừa được tạo. Có cảnh báo rằng Client Secret sẽ không được hiển thị lại.
    * **`application-details.html`**:
        * **Form Cập nhật**: Cho phép chỉnh sửa Tên Ứng dụng và Redirect URIs.
        * **Hiển thị Credentials**: Hiển thị Client ID (chỉ đọc) và Client Secret (bị che, có nút "Hiện").
        * **Hành động Nguy hiểm**: Nút "Xóa Ứng dụng".
* **Yêu cầu Backend**:
    * **Endpoint `POST /api/v1/applications`**:
        * **Input**: `{ "name": "String", "redirectUris": ["url1", "url2"] }`.
        * **Logic**:
            1.  Kiểm tra quota ứng dụng của tenant.
            2.  Tạo `client_id` và `client_secret` duy nhất, an toàn.
            3.  Hash `client_secret` trước khi lưu vào CSDL.
            4.  Lưu bản ghi `Application`.
            5.  **Quan trọng**: Trả về `client_secret` gốc (chưa hash) **chỉ một lần duy nhất** trong phản hồi này.
    * **Endpoint `GET /api/v1/applications`**: Lấy danh sách ứng dụng trong tenant.
    * **Endpoint `PUT /api/v1/applications/{appId}`**: Cập nhật Tên và Redirect URIs.
    * **Endpoint `DELETE /api/v1/applications/{appId}`**: Xóa ứng dụng.
* **Sự kiện Ghi Log**: `EVENT: APPLICATION_CREATED/UPDATED/DELETED`, `LEVEL: HIGH`.

---

#### **17. `pages/webhooks.html` - Quản lý Webhook**

* **Mục đích**: Cho phép Tenant Admin cấu hình webhook để nhận thông báo về các sự kiện trong hệ thống.
* **Đối tượng sử dụng**: Tenant Admin.
* **Thành phần & Luồng chức năng**:
    * **Bảng Webhook**: Liệt kê các webhook đã cấu hình với URL, các Sự kiện đã đăng ký, và Trạng thái (Hoạt động/Không hoạt động).
    * **Modal `webhook-modal`**:
        * **Input**: URL Điểm cuối, Khóa bí mật (tùy chọn, nếu để trống sẽ tự tạo), và danh sách các sự kiện để lắng nghe (chọn từ checkbox).
* **Yêu cầu Backend**:
    * **Endpoint `POST /api/v1/webhooks`**:
        * **Input**: `{ "url": "String", "secret": "String (optional)", "events": ["user.created", "billing.failed"] }`.
        * **Logic**:
            1.  Validate URL.
            2.  Nếu `secret` không được cung cấp, tạo một chuỗi ngẫu nhiên an toàn.
            3.  Lưu cấu hình webhook.
    * Cung cấp các API `GET`, `PUT`, `DELETE` cho webhooks.
    * **Webhook Dispatcher Service**: Một dịch vụ nền chịu trách nhiệm:
        1.  Lắng nghe các sự kiện nghiệp vụ từ Message Broker.
        2.  Tìm tất cả các webhook đã đăng ký cho sự kiện đó.
        3.  Tạo payload, ký bằng `secret` (HMAC-SHA256) và gửi yêu cầu `POST` đến URL của webhook.
        4.  Triển khai cơ chế thử lại (retry) nếu gửi thất bại (ví dụ: thử lại 3 lần với khoảng thời gian tăng dần).
* **Sự kiện Ghi Log**:
    * `EVENT: WEBHOOK_CONFIG_CREATED/UPDATED/DELETED`, `LEVEL: HIGH`.
    * `EVENT: WEBHOOK_DISPATCH_FAILURE`, `LEVEL: WARNING`, `DETAILS: {webhookId, event, reason}`.

---

#### **18. `pages/integrations.html` - Tích hợp Bên thứ ba**

* **Mục đích**: Cung cấp một giao diện tập trung để cấu hình các tích hợp phổ biến.
* **Đối tượng sử dụng**: Tenant Admin.
* **Thành phần & Luồng chức năng**:
    * **SCIM User Provisioning**: Cung cấp các thông tin chỉ đọc (`SCIM Base URL`, `API Token`) để admin có thể sao chép và dán vào nhà cung cấp định danh (Okta, Azure AD).
    * **SIEM Log Forwarding**: Form để nhập `URL Điểm cuối` của hệ thống SIEM (Splunk, ELK) và `Header Xác thực` (ví dụ: Bearer token).
* **Yêu cầu Backend**:
    * **Endpoint `GET /api/v1/scim/settings`**: Trả về `baseUrl` (`https://api.iamsaas.com/scim/v2/{tenantId}`) và một `apiToken` đã được tạo trước cho tenant.
    * **Endpoint `PUT /api/v1/siem/settings`**:
        * **Input**: `{ "endpointUrl": "...", "authHeader": "..." }`.
        * **Logic**: Lưu trữ cấu hình này một cách an toàn.
    * **SIEM Forwarding Service**: Một dịch vụ nền lắng nghe các sự kiện audit log từ Message Broker và chuyển tiếp chúng đến `endpointUrl` đã cấu hình.
* **Sự kiện Ghi Log**: `EVENT: INTEGRATION_CONFIG_UPDATED`, `LEVEL: HIGH`, `DETAILS: {adminId, integrationType: "SIEM"}`.

---

### **Phần VIII: Giao diện Quản lý Truy cập Nâng cao**

#### **19. `pages/service-roles.html` - Vai trò Dịch vụ**

* **Mục đích**: Cho phép Tenant Admin tạo các vai trò đặc biệt không dành cho người dùng, mà dành cho các ứng dụng/dịch vụ (machine-to-machine).
* **Đối tượng sử dụng**: Tenant Admin.
* **Thành phần & Luồng chức năng**:
    * **Bảng Vai trò Dịch vụ**: Liệt kê các vai trò với Tên và một chuỗi các quyền do hệ thống định nghĩa.
    * **Modal `service-role-modal`**: Form để nhập Tên Vai trò và danh sách các quyền (dạng chuỗi, ví dụ: `invoices:read,customers:read`).
* **Yêu cầu Backend**:
    * Cung cấp API CRUD cho `ServiceRoles`.
    * Khác với vai trò người dùng, các quyền (`permissions`) ở đây là các chuỗi tùy ý. Việc thực thi các quyền này sẽ do ứng dụng của khách hàng tự xử lý. Hệ thống IAM chỉ đơn giản là gắn các chuỗi quyền này vào Access Token.
    * **Logic JWT**: Khi một Access Key được sử dụng để lấy token, payload của JWT sẽ chứa các quyền của Service Role được gán.

---

#### **20. `pages/access-keys.html` & `pages/access-key-alerts.html` - Quản lý Access Key**

* **Mục đích**: Cung cấp công cụ để tạo và quản lý các khóa truy cập API cho các ứng dụng.
* **Đối tượng sử dụng**: Tenant Admin.
* **Thành phần & Luồng chức năng**:
    * **`access-keys.html`**:
        * **Danh sách Nhóm Key**: Hiển thị các nhóm key, mỗi nhóm được gán một **Vai trò Dịch vụ**.
        * **Tạo Nhóm Key**: Modal cho phép đặt tên nhóm và chọn một `Service Role` đã tạo.
        * **Thêm Key**: Trong mỗi nhóm, có nút "Thêm Key" để tạo một access key mới. Key này sẽ được hiển thị một lần duy nhất.
    * **`access-key-alerts.html`**:
        * **Dashboard**: Hiển thị các chỉ số nhanh về cảnh báo, IP nghi vấn, key bị thu hồi.
        * **Bảng Cảnh báo**: Liệt kê các cảnh báo liên quan đến việc sử dụng access key.
* **Yêu cầu Backend**:
    * **Endpoint `POST /api/v1/access-keys`**:
        * **Input**: `{ "keyGroupId": 1 }`.
        * **Logic**: Tạo ra một cặp `access_key_id` và `secret_access_key`. Hash `secret_access_key` trước khi lưu. Trả về `secret_access_key` gốc chỉ một lần.
    * Cần có một hệ thống giám sát để phân tích các log sử dụng API, phát hiện các hành vi bất thường (ví dụ: sử dụng từ IP lạ, tỷ lệ lỗi cao) và tạo ra các cảnh báo.
* **Sự kiện Ghi Log**:
    * `EVENT: ACCESS_KEY_CREATED`, `LEVEL: HIGH`.
    * `EVENT: ACCESS_KEY_USAGE_ANOMALY`, `LEVEL: WARNING`, `DETAILS: {keyId, reason}`.

---

### **Phần IX: Giao diện Hỗ trợ và Cảnh báo Chung**

#### **21. `pages/alerts.html` - Trang Cảnh báo**

* **Mục đích**: Hiển thị một danh sách tập trung các cảnh báo hệ thống cho Super Admin.
* **Đối tượng sử dụng**: Super Admin.
* **Thành phần & Luồng chức năng**:
    * **Bộ lọc**: Lọc cảnh báo theo Mức độ (Cao, Trung bình, Thấp), Trạng thái (Chưa đọc, Đã giải quyết), và Tenant.
    * **Bảng Cảnh báo**: Liệt kê các cảnh báo. Nhấp vào một cảnh báo sẽ mở modal chi tiết.
    * **Hành động**: Trong modal, có các nút "Đánh dấu đã giải quyết" hoặc "Xóa".
* **Yêu cầu Backend**:
    * **Alerting Service**: Một dịch vụ chịu trách nhiệm tạo ra các bản ghi `Alert` dựa trên các sự kiện từ các service khác (ví dụ: `billing.failed`, `sso.connection_failed`).
    * Cung cấp API `GET /api/v1/sa/alerts` hỗ trợ lọc và `PUT /api/v1/sa/alerts/{alertId}` để cập nhật trạng thái.

---

#### **22. `pages/support.html` & `pages/support-tickets.html`**

* **Mục đích**: Cung cấp hệ thống hỗ trợ khách hàng.
* **Đối tượng sử dụng**: User/Tenant Admin (tạo ticket), Super Admin (quản lý ticket).
* **Thành phần & Luồng chức năng**:
    * **`support.html` (Dành cho người dùng)**: Hiển thị FAQ và một form để tạo ticket hỗ trợ mới.
    * **`support-tickets.html` (Dành cho Super Admin)**:
        * Giao diện quản lý ticket với các bộ lọc theo trạng thái.
        * Nhấp vào một ticket sẽ mở modal chi tiết, cho phép Super Admin xem nội dung và gửi trả lời.
* **Yêu cầu Backend**:
    * Cung cấp API CRUD cho `Tickets` và `TicketReplies`.
    * **Endpoint `POST /api/v1/support/tickets` (User/Tenant Admin)**: Tạo một ticket mới.
    * **Endpoint `GET /api/v1/sa/support/tickets` (Super Admin)**: Lấy danh sách ticket.
    * **Endpoint `POST /api/v1/sa/support/tickets/{ticketId}/reply` (Super Admin)**: Gửi câu trả lời, đồng thời gửi email thông báo cho người dùng đã tạo ticket.

***