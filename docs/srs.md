## **Hệ thống Quản lý Định danh và Truy cập dạng Dịch vụ (IAM-as-a-Service)**

### **1\. Giới thiệu**

#### **1.1. Mục đích**

Tài liệu này định nghĩa và mô tả toàn diện các yêu cầu của nền tảng **IAM-as-a-Service (IAM SaaS)**. Mục tiêu cốt lõi của tài liệu là phân biệt một cách rành mạch kiến trúc hai hệ thống riêng biệt của sản phẩm, cung cấp một nguồn thông tin thống nhất, không mơ hồ cho tất cả các bên liên quan.

#### **1.2. Nguyên tắc Kiến trúc Cốt lõi: Hai Hệ thống Riêng biệt**

Để hiểu đúng sản phẩm, chúng ta phải luôn phân biệt rõ ràng hai hệ thống sau. Hãy tưởng tượng sản phẩm của chúng ta giống như một nền tảng xây dựng website (ví dụ: Shopify):

* **Hệ thống 1: Nền tảng SaaS Lõi (The Core SaaS Platform)**
  * **Ví như**: Trang quản trị của Shopify (`admin.shopify.com`).
  * **Tên miền chính**: `https://domain.xyz`  
  * **Đối tượng sử dụng**: **Tenant Admin** và **Super Admin**.
  * **Mục đích**: Đăng ký dịch vụ, quản lý thanh toán, và **cấu hình** cửa hàng (tải logo, chọn giao diện, cài đặt chính sách). Tenant Admin đăng nhập tại `domain.xyz/login`để vào Bảng điều khiển Quản trị.  
* **Hệ thống 2: Dịch vụ IAM của Tenant (The Tenant's IAM Service)**
  * **Ví như**: Cửa hàng online thực tế của khách hàng (`your-awesome-store.com`).
  * **Tên miền/Đường dẫn**: `https://domain.xyz/[tenant_domain_path]/` (ví dụ: `.../acme-corp/`)
  * **Đối tượng sử dụng**: **End-User** (người mua hàng) và **Client Application** của Tenant (ví dụ: ứng dụng di động của cửa hàng).  
  * **Mục đích**: Cung cấp các trang xác thực (đăng nhập, đăng ký) cho người mua hàng và các API để ứng dụng của cửa hàng có thể tích hợp. **Tenant Admin không đăng nhập tại đây.**

#### **1.3. Phạm vi Sản phẩm**

Sản phẩm bao gồm việc xây dựng cả hai hệ thống trên, đảm bảo chúng hoạt động độc lập về mặt giao diện người dùng nhưng được kết nối chặt chẽ về mặt dữ liệu và cấu hình.

### **2\. Yêu cầu Chức năng cho HỆ THỐNG 1: NỀN TẢNG SAAS LÕI**

*(Tất cả các yêu cầu trong phần này áp dụng cho tên miền `https://domain.xyz` và chỉ dành cho Tenant Admin và Super Admin)*

#### **FS-PLATFORM-1: Cổng thông tin và Đăng ký Tenant**

* **FR-P1.1**: Nền tảng phải có một trang chủ công khai giới thiệu về sản phẩm và một trang `/pricing` hiển thị chi tiết các gói dịch vụ. Giao diện các trang này là cố định, mang thương hiệu của IAM SaaS.  
* **FR-P1.2**: Nền tảng phải cung cấp một luồng đăng ký cho phép khách hàng mới chọn gói dịch vụ và tạo tài khoản Tenant Admin.
* **FR-P1.3**: Nền tảng phải tích hợp với một cổng thanh toán bên thứ ba (ví dụ: Stripe) để xử lý các giao dịch đăng ký gói trả phí.
* **FR-P1.4**: Nền tảng phải gửi email xác thực đến Tenant Admin. Tài khoản Tenant chỉ được kích hoạt sau khi xác thực.

#### **FS-PLATFORM-2: Cổng Đăng nhập và Bảng điều khiển Quản trị**

* **FR-P2.1**: Nền tảng phải cung cấp một cổng đăng nhập tại `https://domain.xyz/login` dành riêng cho Tenant Admin và Super Admin. **Cổng đăng nhập này hoàn toàn tách biệt và không liên quan đến cổng đăng nhập của End-User.**  
* **FR-P2.2**: Sau khi đăng nhập, Tenant Admin được chuyển đến Bảng điều khiển Quản trị (Admin Dashboard). Giao diện của Bảng điều khiển này là tiêu chuẩn cho tất cả các Tenant.  
* **FR-P2.3**: Bảng điều khiển phải cung cấp các chức năng quản lý tài khoản của Tenant Admin như đổi mật khẩu, quản lý thanh toán, và xem lịch sử hóa đơn.

#### **FS-PLATFORM-3: Cấu hình Dịch vụ IAM của Tenant**

* **Mô tả**: Đây là chức năng cốt lõi của Bảng điều khiển Quản trị, nơi Tenant Admin "xây dựng" và "điều khiển" Dịch vụ IAM của họ.  
* **FR-P3.1 (Cấu hình Chung)**: Tenant Admin phải có khả năng thiết lập `domain_path` duy nhất cho Dịch vụ IAM của họ (ví dụ: "acme-corp" sẽ tạo ra dịch vụ tại `.../acme-corp/`).  
* **FR-P3.2 (Tùy chỉnh Giao diện cho End-User)**: Tenant Admin phải có một khu vực để cấu hình giao diện sẽ hiển thị trên Dịch vụ IAM của họ, bao gồm:  
  * Tải lên logo công ty.  
  * Chọn màu sắc chủ đạo.  
* **FR-P3.3 (Chính sách cho End-User)**: Tenant Admin phải có khả năng thiết lập các chính sách sẽ được áp dụng trên Dịch vụ IAM của họ, bao gồm:  
  * Chính sách mật khẩu (độ dài, độ phức tạp).  
  * Bật/tắt/bắt buộc Xác thực Đa yếu tố (MFA).  
  * Bật/tắt khả năng tự đăng ký của người dùng cuối.  
* **FR-P3.4 (Quản lý Tài nguyên)**: Tenant Admin phải có khả năng quản lý các tài nguyên sẽ tồn tại bên trong Dịch vụ IAM của họ:
  * Đăng ký các Client Application (tạo Client ID/Secret, cấu hình Redirect URIs).
  * Quản lý (thêm, sửa, xóa, vô hiệu hóa) tài khoản người dùng cuối (End-Users).
  * Quản lý các vai trò và quyền hạn.

### **3\. Yêu cầu Chức năng cho HỆ THỐNG 2: DỊCH VỤ IAM CỦA TENANT**

*(Tất cả các yêu cầu trong phần này áp dụng cho đường dẫn `https://domain.xyz/[tenant_domain_path]/` và chỉ dành cho End-User và Client Application)*

#### **FS-IAM-1: Cung cấp các Trang Xác thực Động và Tùy chỉnh**

* **FR-I1.1**: Dịch vụ phải cung cấp một bộ các trang xác thực (đăng nhập, đăng ký, quên mật khẩu) tại đường dẫn đã được Tenant cấu hình.
* **FR-I1.2**: Giao diện của các trang này phải được render động dựa trên các cấu hình mà Tenant Admin đã thiết lập trong **Hệ thống 1**. Cụ thể:  
  * Hiển thị đúng logo và màu sắc chủ đạo.  
  * Ẩn nút "Đăng ký" nếu Tenant Admin đã tắt chính sách tự đăng ký.  
* **FR-I1.3**: Dịch vụ phải cung cấp một luồng hoàn chỉnh cho End-User để tự thiết lập MFA (quét mã QR) nếu chính sách yêu cầu.

#### **FS-IAM-2: Xử lý Xác thực và Chính sách**

* **FR-I2.1**: Khi End-User gửi form đăng nhập, Dịch vụ phải xác thực thông tin (email/mật khẩu) dựa trên cơ sở dữ liệu người dùng của **chỉ Tenant đó**.  
* **FR-I2.2**: Dịch vụ phải thực thi các chính sách mật khẩu và khóa tài khoản mà Tenant Admin đã cấu hình trong **Hệ thống 1**.
* **FR-I2.3**: Dịch vụ phải xử lý luồng đăng nhập bằng mạng xã hội (nếu được Tenant Admin cấu hình).

#### **FS-IAM-3: Cung cấp API Tích hợp (OIDC/OAuth2)**

* **FR-I3.1**: Dịch vụ phải cung cấp các API (endpoints) theo chuẩn OAuth2/OIDC tại đường dẫn của Tenant để các Client Application có thể tích hợp.
  * **Ví dụ endpoint**: `https://domain.xyz/acme-corp/authorize`, `https://domain.xyz/acme-corp/token`.
* **FR-I3.2**: Dịch vụ phải xử lý đầy đủ luồng Authorization Code Flow, bao gồm việc xác thực `client_id` và `redirect_uri` trong yêu cầu ban đầu.
* **FR-I3.3**: Endpoint `/token` của Dịch vụ phải xác thực `client_secret` của Client Application trước khi cấp token.  
* **FR-I3.4**: `id_token` do Dịch vụ cấp phải chứa `aud` (audience) claim khớp với `client_id` của Client Application đã yêu cầu.

### **4\. Các Kịch bản Sử dụng (Use Cases) Minh họa sự Tách biệt**

#### **5.1. UC-01: Luồng End-to-End từ Cấu hình đến Sử dụng**

* **Bối cảnh**: Công ty Acme Corp muốn sử dụng dịch vụ IAM SaaS cho ứng dụng CRM của họ.
* **Tác nhân**: Tenant Admin (Admin của Acme), End-User (nhân viên của Acme).
* **Luồng chính**:  
  1. **\[HỆ THỐNG 1\]** Tenant Admin của Acme đăng nhập vào `https://domain.xyz/login`.
  2. **\[HỆ THỐNG 1\]** Trong Bảng điều khiển, anh ta điều hướng đến mục "Quản lý Ứng dụng" và đăng ký ứng dụng "Acme CRM", nhận được `Client ID` và `Client Secret`.
  3. **\[HỆ THỐNG 1\]** Anh ta cũng vào mục "Tùy chỉnh Giao diện" và tải lên logo, chọn colors, cấu hình chính sách, fowrding, và các setting khác của Acme Corp.
  4. **\[Bên ngoài\]** Lập trình viên của Acme cấu hình `Client ID` và `Client Secret` vào ứng dụng CRM.  
  5. **\[HỆ THỐNG 2\]** Một End-User truy cập ứng dụng CRM và nhấn "Đăng nhập". Ứng dụng chuyển hướng người dùng đến `https://domain.xyz/acme-corp/login...`.
  6. **\[HỆ THỐNG 2\]** End-User thấy trang đăng nhập với logo của Acme Corp (do bước 3).  
  7. **\[HỆ THỐNG 2\]** End-User nhập thông tin đăng nhập. Dịch vụ IAM của Acme xác thực thành công và chuyển hướng người dùng trở lại ứng dụng CRM.  
* **Kết quả**: Luồng hoạt động thành công, thể hiện rõ việc cấu hình trên **Hệ thống 1** ảnh hưởng trực tiếp đến hành vi và giao diện của **Hệ thống 2**.