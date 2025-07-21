## **Kế hoạch Phát triển Chi tiết - Dự án IAM SaaS**

Kế hoạch này được cấu trúc thành các Giai đoạn (Phases), mỗi giai đoạn tập trung vào một bộ tính năng có liên quan mật thiết với nhau, xây dựng từ nền tảng cốt lõi đến các chức năng nâng cao.

### **Giai đoạn 0: Nền tảng & Cốt lõi Hệ thống (Foundation & Core Setup)**

**Mục tiêu**: Xây dựng bộ khung vững chắc cho cả backend và frontend, thiết lập các quy tắc và thành phần cơ bản nhất để các giai đoạn sau có thể phát triển song song và nhất quán.

* **Cluster 0.1: Khởi tạo Dự án & Môi trường**
    * **Backend**:
        * Thiết lập cấu trúc thư mục Go theo đúng chuẩn đã định (`cmd`, `internal`, `domain`, etc.).
        * Cấu hình `go.mod`, `Makefile`, `viper` để quản lý config, và `docker-compose` cho môi trường phát triển.
        * Thiết lập kết nối cơ sở dữ liệu (`db.go`) sử dụng `Gorm` nhưng chỉ cho mục đích quản lý kết nối và transaction.
    * **Frontend**:
        * Khởi tạo dự án Next.js 14+ (App Router) với TypeScript và Tailwind CSS theo đúng cấu trúc (`app`, `components`, `lib`).
        * Cấu hình `ESLint`, `Prettier` để đảm bảo chất lượng code.
    * **DevOps**:
        * Tạo repository Git, thiết lập các nhánh `develop` và `main`.
        * Cấu hình CI pipeline cơ bản (Build & Test) cho cả backend và frontend.

* **Cluster 0.2: Thiết kế Nền tảng & Quy ước Chung**
    * **Backend**:
        * **Thiết kế API Chuẩn**: Triển khai middleware để chuẩn hóa cấu trúc response (cho cả thành công và lỗi) và xử lý `Correlation ID`.
        * **Triển khai i18n**: Thiết lập thư viện i18n, cấu trúc các file ngôn ngữ (`en.json`, `vi.json`). Mọi message trả về từ API phải sử dụng key i18n.
        * **Logging**: Tích hợp thư viện logger có cấu trúc (structured logging) và ghi log cho mỗi request.
        * **Database Migrations**: Tạo file migration đầu tiên để thiết lập các bảng cốt lõi: `tenants`, `users`, `plans`.
    * **Frontend**:
        * Xây dựng `layout.tsx` chung, bao gồm các `Provider` cần thiết (Redux/Zustand, Theme).
        * Tạo các component UI nguyên tử trong `src/components/ui` (Button, Input, Card) để tái sử dụng.
        * Thiết lập hàm gọi API (`api.ts`) có khả năng tự động xử lý Access Token và Refresh Token.

* **Cluster 0.3: Xác thực Cơ bản**
    * **Mô tả**: Xây dựng luồng đăng ký, xác thực email, và đăng nhập cơ bản nhất. Đây là "cửa ngõ" của toàn bộ hệ thống.
    * **Giao diện liên quan**: `signup.html`, `verify-email.html`, `login.html`.
    * **Backend Tasks**:
        * **Domain**: Định nghĩa interface cho `AuthService` và `UserRepository`.
        * **Repository**: Viết **native query** cho các hàm `CreateUser`, `FindUserByEmail`.
        * **Service**: Triển khai logic `Register`, `VerifyEmail`, `Login` (tạo JWT, so sánh hash mật khẩu).
        * **Handler**: Tạo các endpoint `POST /register`, `GET /verify`, `POST /login`.
    * **Frontend Tasks**:
        * Chuyển đổi các file HTML trên thành component TSX trong Next.js.
        * Tạo các trang trong `app/(auth)/...`.
        * Tích hợp gọi API và quản lý trạng thái (loading, error, success).
        * Lưu token vào `localStorage` hoặc `cookie` và quản lý trạng thái đăng nhập toàn cục (Redux/Zustand).

---

### **Giai đoạn 1: MVP cho Tenant Admin (Core IAM Features)**

**Mục tiêu**: Hoàn thiện các tính năng cốt lõi cho phép một Tenant Admin có thể quản lý tổ chức của mình một cách độc lập. Kết thúc giai đoạn này, sản phẩm đã có thể phục vụ một khách hàng đầu tiên.

* **Cluster 1.1: Quản lý Vòng đời Người dùng**
    * **Mô tả**: Cho phép Tenant Admin mời, xem, và quản lý các thành viên trong tenant của mình.
    * **Giao diện liên quan**: `users.html`, `profile.html`.
    * **Backend Tasks**:
        * Triển khai API CRUD cho `Users` (Invite, Get List, Update Role, Delete). **Quan trọng**: Mọi query trong `UserRepository` phải có điều kiện `WHERE tenant_id = ?`.
        * Logic mời người dùng (tạo token mời, gửi email).
        * Logic kiểm tra quota người dùng trước khi mời.
    * **Frontend Tasks**:
        * Xây dựng trang Quản lý Người dùng với chức năng lọc, phân trang, và các hành động (mời, sửa, xóa).
        * Xây dựng trang `profile` cho phép người dùng tự cập nhật thông tin.

* **Cluster 1.2: Hệ thống Phân quyền (RBAC)**
    * **Mô tả**: Xây dựng nền tảng cho việc kiểm soát truy cập dựa trên vai trò.
    * **Giao diện liên quan**: `permissions.html`, `roles.html`.
    * **Backend Tasks**:
        * Thiết kế và tạo migration cho các bảng `roles`, `permissions`, `role_permissions`, `user_roles`.
        * Triển khai API CRUD cho `Roles` và `Permissions`, luôn ràng buộc bởi `tenant_id`.
        * Xây dựng **Authorization Middleware**: Middleware này sẽ kiểm tra JWT trên mỗi request, xác định `userId` và `tenantId`, sau đó kiểm tra xem người dùng có quyền thực hiện hành động hay không dựa trên `requiredPermission`.
    * **Frontend Tasks**:
        * Xây dựng giao diện cho phép Tenant Admin tạo/sửa vai trò và gán quyền.

* **Cluster 1.3: Khung sườn Ứng dụng & Cài đặt Tenant**
    * **Mô tả**: Xây dựng giao diện chính và cho phép Tenant Admin tùy chỉnh cơ bản.
    * **Giao diện liên quan**: `index.html` (khung sườn), `tenant-settings.html`, `onboarding-wizard.html`.
    * **Backend Tasks**:
        * Triển khai API `PUT /api/v1/tenant/branding` để lưu logo và màu sắc.
        * Triển khai API `GET /api/v1/public/branding` để trang login có thể tải các tùy chỉnh này.
    * **Frontend Tasks**:
        * Chuyển đổi `index.html` thành `layout` chính với Sidebar và Header.
        * Xây dựng trang Cài đặt Tenant và trình Onboarding. **Bổ sung**: Cần thêm logic preview trực tiếp trên trang `tenant-settings` như UI đã gợi ý.

---

### **Giai đoạn 2: Quản lý Đa khách hàng (Super Admin & SaaS Features)**

**Mục tiêu**: Triển khai các tính năng dành cho Super Admin, biến hệ thống từ một ứng dụng đơn lẻ thành một nền tảng SaaS thực thụ.

* **Cluster 2.1: Quản lý Tenant & Gói dịch vụ**
    * **Mô tả**: Cung cấp công cụ cho Super Admin để quản lý toàn bộ khách hàng và các gói dịch vụ.
    * **Giao diện liên quan**: `tenant-manager.html`, `tenant-details.html`, `plans.html`.
    * **Backend Tasks**:
        * Xây dựng các endpoint đặc quyền cho Super Admin (ví dụ: `/api/v1/sa/...`).
        * Triển khai API CRUD cho `Plans`.
        * Triển khai API CRUD cho `Tenants` từ góc độ Super Admin (tạo, tạm ngưng, xóa).
    * **Frontend Tasks**:
        * Xây dựng các trang quản trị này, chỉ hiển thị cho người dùng có vai trò Super Admin.

* **Cluster 2.2: Quy trình Phê duyệt & Thanh toán**
    * **Mô tả**: Hoàn thiện luồng nghiệp vụ SaaS, từ yêu cầu của khách hàng đến phê duyệt của admin và quản lý thanh toán.
    * **Giao diện liên quan**: `request-management.html`, `billing.html`.
    * **Backend Tasks**:
        * Xây dựng hệ thống `Requests` (tăng quota, tạo tenant).
        * Triển khai API cho Super Admin để phê duyệt/từ chối các yêu cầu.
        * Bắt đầu tích hợp với cổng thanh toán (Stripe) để quản lý `Subscription` và lấy lịch sử giao dịch.
    * **Frontend Tasks**:
        * Xây dựng trang Quản lý Yêu cầu cho Super Admin.
        * Hoàn thiện trang Thanh toán cho Tenant Admin, cho phép họ xem quota và gửi yêu cầu.

---

### **Giai đoạn 3: Bảo mật Nâng cao & Giám sát**

**Mục tiêu**: Tăng cường các lớp bảo mật và cung cấp các công cụ giám sát mạnh mẽ cho cả Tenant Admin và Super Admin.

* **Cluster 3.1: Kiểm soát Truy cập Dựa trên Thuộc tính (ABAC)**
    * **Mô tả**: Thêm một lớp bảo mật động dựa trên ngữ cảnh.
    * **Giao diện liên quan**: `policy-config.html`, `policy-simulator.html`.
    * **Backend Tasks**:
        * Thiết kế CSDL để lưu các `Policies` (điều kiện, đối tượng, hành động).
        * Nâng cấp **Authorization Middleware** để thực thi cả chính sách ABAC sau khi đã kiểm tra RBAC.
        * Triển khai API mô phỏng chính sách.
    * **Frontend Tasks**: Xây dựng giao diện để Tenant Admin tạo và kiểm thử chính sách.

* **Cluster 3.2: Tích hợp SSO & Quản lý Phiên**
    * **Mô tả**: Hoàn thiện các tính năng xác thực nâng cao.
    * **Giao diện liên quan**: `sso-integration.html`, `session-management.html`.
    * **Backend Tasks**:
        * Triển khai logic cấu hình và xác thực cho SAML/OIDC.
        * Triển khai API để quản lý Refresh Token (xem danh sách, thu hồi).
    * **Frontend Tasks**: Xây dựng các trang cấu hình và quản lý tương ứng.

* **Cluster 3.3: Giám sát & Ghi Log Toàn diện**
    * **Mô tả**: Cung cấp khả năng theo dõi và phân tích sâu.
    * **Giao diện liên quan**: `overview.html`, `analytics.html`, `audit-logs.html`, `security-dashboard.html`.
    * **Backend Tasks**:
        * Xây dựng các API tổng hợp dữ liệu phức tạp cho các trang dashboard và analytics.
        * Thiết lập một **Audit Logging Service** riêng biệt, nhận sự kiện từ các service khác qua Message Broker và lưu vào Elasticsearch để tối ưu tìm kiếm.
    * **Frontend Tasks**: Xây dựng các trang dashboard với biểu đồ (Chart.js) và các bộ lọc mạnh mẽ.

---

### **Giai đoạn 4: Mở rộng & Tích hợp**

**Mục tiêu**: Hoàn thiện các tính năng tích hợp với hệ sinh thái bên ngoài và quản lý truy cập cho các dịch vụ.

* **Cluster 4.1: Quản lý Truy cập API (Machine-to-Machine)**
    * **Mô tả**: Cung cấp cơ chế xác thực cho các ứng dụng và dịch vụ.
    * **Giao diện liên quan**: `applications.html`, `service-roles.html`, `access-keys.html`, `access-key-alerts.html`.
    * **Backend Tasks**:
        * Triển khai API CRUD cho `Applications`, `ServiceRoles`, `AccessKeys`.
        * Logic tạo và trả về `client_secret` / `secret_access_key` một lần duy nhất.
        * Triển khai luồng Client Credentials Grant (OAuth 2.0) để cấp Access Token cho các ứng dụng.
    * **Frontend Tasks**: Xây dựng các giao diện quản lý tương ứng.

* **Cluster 4.2: Tích hợp Bên thứ ba**
    * **Mô tả**: Hoàn thiện các tính năng kết nối với hệ thống bên ngoài.
    * **Giao diện liên quan**: `webhooks.html`, `integrations.html`.
    * **Backend Tasks**:
        * Xây dựng một **Webhook Dispatcher Service** có khả năng thử lại (retry) và ký payload.
        * Xây dựng một **SIEM Forwarding Service** để đẩy log.
        * Triển khai các endpoint theo chuẩn SCIM 2.0.
    * **Frontend Tasks**: Xây dựng các giao diện cấu hình tương ứng.

* **Cluster 4.3: Hệ thống Hỗ trợ**
    * **Mô tả**: Xây dựng hệ thống ticket hỗ trợ.
    * **Giao diện liên quan**: `support.html`, `support-tickets.html`, `alerts.html`.
    * **Backend Tasks**:
        * Triển khai API CRUD cho `Tickets` và `Replies`.
        * Xây dựng hệ thống `Alerting` để tự động tạo cảnh báo dựa trên các sự kiện hệ thống.
    * **Frontend Tasks**: Xây dựng giao diện tạo ticket cho người dùng và quản lý ticket cho Super Admin.