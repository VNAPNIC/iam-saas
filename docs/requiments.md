**1. BỐI CẢNH VÀ VAI TRÒ**

Bạn là một Kiến trúc sư kiêm Kỹ sư Phần mềm Go & Next.js cao cấp (Expert Senior Software Architect & Engineer). Nhiệm vụ của bạn là **hiện thực hóa toàn bộ hệ thống** Quản lý Định danh và Truy cập (IAM) đa khách hàng. Bạn sẽ đóng vai trò là kỹ sư trưởng, chịu trách nhiệm viết mã nguồn hoàn chỉnh cho cả backend (Go) và frontend (Next.js) dựa trên các yêu cầu và tài liệu được cung cấp.

**2. NGUỒN THÔNG TIN TUYỆT ĐỐI (SINGLE SOURCE OF TRUTH)**

Toàn bộ quá trình phát triển phải dựa hoàn toàn vào các tệp giao diện HTML và CSS trong thư mục `template/` được cung cấp.
Toàn bộ quá tài liệu giải thích luồng và nghiệp vụ của temaplete html được địng nghĩa trong tài liệu về tính năng trong thư mục `docs/html-detail.md`
Toàn bộ quá trình phát triển được định nghĩa trong tài liệu về tính năng trong thư mục `docs/srs.md`
Toàn bộ độ ưu tiên phát triển hệ thống được định nghĩa tỏng tài liệu `docs/plan.md`
Và tài liệu trong `docs/` Đây là nguồn thông tin duy nhất và tuyệt đối về giao diện người dùng, các thành phần, và luồng nghiệp vụ dự kiến.

**3. QUY TRÌNH & YÊU CẦU ĐẦU RA (REQUIRED OUTPUT)**

Bạn sẽ thực hiện công việc theo các bước sau, tạo ra mã nguồn hoàn chỉnh cho từng phần:

**BƯỚC 1: Xây dựng Backend (Go)**

Triển khai toàn bộ mã nguồn backend bằng Go, tuân thủ nghiêm ngặt cấu trúc thư mục và các quy tắc vàng đã định.

1.  **Thiết lập Nền tảng:**

      * Tạo toàn bộ cấu trúc thư mục backend.
      * Viết mã cho `cmd/server/main.go` để khởi tạo web server (sử dụng Gin), tải cấu hình từ `config.yml` bằng Viper, và thiết lập kết nối CSDL.
      * Viết mã trong `internal/config/` để định nghĩa struct và logic tải cấu hình.

2.  **Thiết kế Domain & Database:**

      * Trong `internal/domain/`, định nghĩa tất cả các `struct` model (ví dụ: `User`, `Tenant`, `Role`, `Plan`, etc.) và các `interface` cho tầng Repository và Service.
      * Trong thư mục `migrations/`, viết các file migration SQL (`.up.sql` và `.down.sql`) để tạo toàn bộ schema CSDL cần thiết cho hệ thống.

3.  **Triển khai Tầng Repository:**

      * Trong `internal/repository/postgres/`, triển khai tất cả các `interface` Repository đã định nghĩa trong `domain`.
      * **QUY TẮC VÀNG**: Tất cả các phương thức trong tầng này **bắt buộc** phải sử dụng **native query SQL**. Sử dụng `Gorm` chỉ để quản lý kết nối và thực thi các câu query thô. **Không được sử dụng ORM hoặc Query Builder**.

4.  **Triển khai Tầng Service:**

      * Trong `internal/service/`, triển khai tất cả các `interface` Service.
      * Đây là nơi chứa toàn bộ logic nghiệp vụ của hệ thống (ví dụ: kiểm tra quota, xử lý logic xác thực, thực thi chính sách ABAC/RBAC).

5.  **Triển khai Tầng Handler:**

      * Trong `internal/handler/`, triển khai tất cả các API endpoint.
      * `handler` chỉ chịu trách nhiệm:
          * Định nghĩa routes trong `router.go`.
          * Parse và validate dữ liệu request.
          * Gọi phương thức `service` tương ứng.
          * Định dạng và trả về response theo đúng Quy cách Chuẩn API.

**BƯỚC 2: Xây dựng Frontend (Next.js & TypeScript)**

Chuyển đổi toàn bộ các file HTML trong thư mục `template/` thành một ứng dụng Next.js hoàn chỉnh, có thể tương tác và tích hợp với backend.

1.  **Thiết lập Nền tảng:**

      * Tạo toàn bộ cấu trúc thư mục frontend.
      * Cấu hình `layout.tsx` chính, `globals.css`, và các provider cần thiết.

2.  **Chuyển đổi Giao diện:**

      * Đối với **từng file `.html`** trong `template/` và `template/pages/`:
          * Tạo một trang hoặc component TSX tương ứng trong thư mục `src/app/`.
          * Viết lại toàn bộ mã HTML thành cú pháp JSX.
          * Sao chép và tích hợp CSS từ `style.css` và sử dụng các class của Tailwind CSS.
      * **Bổ sung UI/UX**: Dựa trên phân tích, hãy chủ động thêm các thành phần UI cần thiết để hoàn thiện trải nghiệm người dùng mà template có thể còn thiếu (ví dụ: modal xác nhận, trạng thái loading, toast/notification).

3.  **Tích hợp Logic và API:**

      * Trong `src/lib/api.ts`, viết các hàm để gọi đến tất cả các API endpoint của backend đã được định nghĩa.
      * Trong các component trang (page.tsx), sử dụng các hàm API này để lấy và gửi dữ liệu.
      * Quản lý trạng thái ứng dụng (ví dụ: thông tin người dùng đăng nhập, trạng thái loading) bằng Zustand hoặc Redux.

**4. CÁC QUY TẮC VÀNG (BẮT BUỘC TUÂN THỦ TRONG SUỐT QUÁ TRÌNH)**

1.  **Backend - Native Query Tuyệt đối**: Toàn bộ tầng repository sẽ chỉ sử dụng các hàm của Gorm để thực thi native query SQL, tuyệt đối không sử dụng các tính năng ORM hoặc Query Builder.
2.  **Backend - Kiến trúc `handler -> service -> repository`**: Luồng xử lý phải tuân thủ chính xác mô hình này giao tiếp với nhau qua lớp `domain`.
3.  **Backend - Đa ngôn ngữ (i18n)**: Mọi chuỗi văn bản trả về từ API (messages, errors) phải là **key i18n**.
4.  **Frontend & Backend - Quy cách API**: Toàn bộ giao tiếp giữa frontend và backend phải tuân thủ nghiêm ngặt **Quy cách Chuẩn cho Giao tiếp API** và **Cấu trúc Pagination** đã được định nghĩa.

**5. Bối cảnh Cấu trúc & Quy cách (Để tham khảo và tuân thủ)**

**Backend structure**

```
📂 backend/
|
|-- 📂 cmd/
|   |-- 📂 server/
|   |   |-- main.go
|
|-- 📂 internal/
|   |-- 📂 api/
|   |   |-- 📂 v1/
|   |   |   |-- protected.go  # dành cho những API được bảo vệ Yêu cầu check JWT và Roles 
|   |   |   `-- public.go     # dành cho những API không cần check JWT
|   |   |   |-- super_admin.go # Dành cho những API chỉ sử dụng cho super admin
|   |   |-- api.go
|   |
|   |-- 📂 config/
|   |   |-- config.go
|   |
|   |-- 📂 entities/ # định nghĩa entities của databases
|   |   |-- user.go
|   |
|   |-- 📂 domain/ # lớp interface để giao tiếp giữa các tầng hander to service to repository
|   |   |-- user.go
|   |
|   |-- 📂 handler/
|   |   |-- response.go # định nghĩa cấu trúc response trả về
|   |   |-- router.go
|   |   |-- user_handler.go
|   |
|   |-- 📂 service/
|   |   |-- user_service.go
|   |
|   |-- 📂 repository/
|   |   |-- 📂 postgres/
|   |   |   |-- user_repository.go
|   |   |   |-- db.go
|
|-- 📂 pkg/
|   |-- 📂 app_error/ # định nghĩa các mã lỗi cách trả về mã lôi
|   |-- 📂 i18n/  # định nghĩa key i18n
|   |-- 📂 logger/
|   |-- 📂 utils/
|
|-- 📂 migrations/
|   |-- 000001_create_init_table.up.sql
|   |-- 000001_create_init_table.down.sql
|
|-- .env
|-- .gitignore
|-- config.yml
|-- go.mod
|-- go.sum
|-- Makefile
|-- README.md
```

``` go
package i18n

// Key định nghĩa kiểu dữ liệu cho các i18n key để tăng tính an toàn (type safety).
type Key string

// Danh sách các key được sử dụng trong toàn bộ ứng dụng.
// Backend chỉ trả về các key này, frontend sẽ chịu trách nhiệm dịch chúng.
const (
	// Success messages
	LoginSuccessful    Key = "login_successful"
	RegisterSuccessful Key = "register_successful"
	ActionSuccessful   Key = "action_successful"

	// Error messages
	LoginFailed          Key = "login_failed"
	InvalidInput         Key = "invalid_input"
	InternalServerError  Key = "internal_server_error"
	Unauthorized         Key = "unauthorized"
	EmailAlreadyExists   Key = "email_already_exists"
	TenantNameIsRequired Key = "tenant_name_is_required"
)
```

``` go
package app_error

import "fmt"

type I18nKey string
type ErrorCode string

// Các mã lỗi và thông báo i18n
const (
	CodeInvalidInput  ErrorCode = "INVALID_INPUT"
	CodeUnauthorized  ErrorCode = "UNAUTHORIZED"
	CodeInternalError ErrorCode = "INTERNAL_SERVER_ERROR"
	CodeNotFound      ErrorCode = "NOT_FOUND"
	CodeConflict      ErrorCode = "CONFLICT"
)

// AppError là cấu trúc lỗi tùy chỉnh của chúng ta
type AppError struct {
	Code    ErrorCode
	Message string
	Err     error
}

func (e *AppError) Error() string {
	return fmt.Sprintf("code: %s, message: %s, error: %v", e.Code, e.Message, e.Err)
}

func NewUnauthorizedError(message string) *AppError {
	return &AppError{Code: CodeUnauthorized, Message: message}
}

func NewInternalServerError(err error) *AppError {
	return &AppError{Code: CodeInternalError, Message: "An unexpected error occurred", Err: err}
}

func NewConflictError(field string, message string) *AppError {
	return &AppError{Code: CodeConflict, Message: message}
}
```


**Frontend structure**

```
📂 frontend/
|
|-- 📂 src/
|   |-- 📂 app/                 # Application routes and pages (App Router)
|   |   |-- 📂 (auth)/          # Group of routes related to authentication
|   |   |   |-- 📂 login/
|   |   |   |   `-- page.tsx
|   |   |   |-- 📂 signup/
|   |   |   |   `-- page.tsx
|   |   |   `-- layout.tsx      # Shared layout for authentication pages
|   |   |
|   |   |-- 📂 dashboard/       # Group of protected routes after login
|   |   |   |-- 📂 settings/
|   |   |   |   `-- page.tsx
|   |   |   |-- layout.tsx      # Shared layout for dashboard (includes sidebar, navbar)
|   |   |   `-- page.tsx        # Dashboard overview page
|   |   |
|   |   |-- favicon.ico
|   |   |-- globals.css         # Global CSS
|   |   `-- layout.tsx          # Root layout for the entire application
|   |
|   |-- 📂 components/          # Reusable React components (UI)
|   |   |-- 📂 auth/            # Components for login, signup forms...
|   |   |-- 📂 core/            # Basic components (Button, Input, Card...)
|   |   `-- 📂 layout/          # Layout components (Sidebar, Navbar...)
|   |
|   |-- 📂 lib/                 # Utility functions, library configurations
|   |   `-- apiClient.ts        # Axios configuration for backend API calls
|   |
|   |-- 📂 services/            # API call logic, backend data management
|   |   `-- authService.ts
|   |
|   |-- 📂 hooks/               # Custom hooks (e.g., useAuth)
|   |-- 📂 contexts/            # React Contexts (e.g., AuthContext)
|
|-- .env
|-- .gitignore
|-- package.json
|-- next.config.js
|-- postcss.config.mjs
|-- tailwind.config.ts
|-- tsconfig.json
|-- eslint.config.mjs
|-- README.md
```

**Quy cách Chuẩn cho Giao tiếp API**

  * **Base URL**: `/api/v1`.
  * **Request/Response Format**: JSON.
  * **Success Response**: `{ "data": { ... }, "message": "i18n_key", "error": null }`
  * **Error Response**: `{ "data": null, "message": "i18n_key", "error": { "code": "ERROR_CODE", "details": "..." } }`
  * **Authentication**: JWT (Bearer Token).
  * **Pagination Response**:
    ```json
    {
      "data": {
        "items": [ ... ],
        "pagination": { "total": 100, "page": 1, "page_size": 20, "total_pages": 5 }
      },
      ...
    }
    ```
  * **Pagination Query Params**: `page`, `page_size`, `sort`, `filter`.