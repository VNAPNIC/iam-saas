document.addEventListener('DOMContentLoaded', () => {
    const App = {
        state: { editingRoleId: null },
        state: { editingPermissionId: null },
        state: { viewingAppId: null },
        charts: {}, // Để lưu trữ các đối tượng biểu đồ Chart.js

        showLoading() {
            document.getElementById('loading-overlay')?.classList.add('visible');
        },
        hideLoading() {
            document.getElementById('loading-overlay')?.classList.remove('visible');
        },
        // Hàm hiển thị hộp thoại xác nhận
        showConfirmation(title, message, onConfirm) {
            const modal = document.getElementById('confirmation-modal');
            if (!modal) return;

            modal.querySelector('#confirmation-title').textContent = title;
            modal.querySelector('#confirmation-message').innerHTML = message; // Dùng innerHTML để có thể chèn HTML
            modal.classList.remove('hidden');

            const confirmBtn = modal.querySelector('#confirmation-confirm-btn');
            const cancelBtn = modal.querySelector('#confirmation-cancel-btn');

            // Tạo clone để xóa các event listener cũ
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

            newConfirmBtn.addEventListener('click', () => {
                onConfirm();
                this.hideConfirmation();
            });

            cancelBtn.addEventListener('click', () => this.hideConfirmation());
        },
        hideConfirmation() {
            document.getElementById('confirmation-modal')?.classList.add('hidden');
        },

        // Hàm khởi tạo chính của ứng dụng
        init() {
            this.setupEventListeners();
            this.loadPage('overview'); // Tải trang mặc định
            this.updateTheme(); // Đảm bảo theme được áp dụng đúng khi tải lần đầu
        },

        // Thiết lập các trình nghe sự kiện toàn cục
        setupEventListeners() {
            const toggleSidebarBtn = document.getElementById('toggle-sidebar');
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            const notificationsToggle = document.getElementById('notifications-toggle');


            // Điều hướng trang
            document.addEventListener('click', (e) => {
                // Xử lý điều hướng trang
                const navLink = e.target.closest('a[data-page]');
                if (navLink) {
                    e.preventDefault();
                    this.loadPage(navLink.dataset.page);
                    // Đóng popup nếu đang mở
                    document.getElementById('notifications-popup')?.classList.add('hidden');
                    return; // Dừng lại sau khi xử lý điều hướng
                }

                // Xử lý mở/đóng popup thông báo
                const popup = document.getElementById('notifications-popup');
                if (notificationsToggle && notificationsToggle.contains(e.target)) {
                    e.stopPropagation();
                    popup?.classList.toggle('hidden');
                    return;
                }

                // Đóng popup khi click ra ngoài
                if (popup && !popup.classList.contains('hidden') && !popup.contains(e.target)) {
                    popup.classList.add('hidden');
                }
            });

            // Thu gọn/mở rộng sidebar
            if (toggleSidebarBtn) {
                toggleSidebarBtn.addEventListener('click', () => {
                    document.getElementById('sidebar').classList.toggle('collapsed');
                    toggleSidebarBtn.innerHTML = document.getElementById('sidebar').classList.contains('collapsed')
                        ? '<i class="fas fa-chevron-right"></i>'
                        : '<i class="fas fa-chevron-left"></i>';
                });
            }

            // Menu trên di động
            if (mobileMenuBtn) {
                mobileMenuBtn.addEventListener('click', () => {
                    document.getElementById('sidebar').classList.toggle('open');
                });
            }

            // Chuyển đổi chế độ tối/sáng
            if (darkModeToggle) {
                darkModeToggle.addEventListener('click', () => {
                    document.body.classList.toggle('dark-mode');
                    this.updateTheme();
                });
            }

            if (notificationsToggle) {
                notificationsToggle.addEventListener('click', (e) => {
                    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
                    document.getElementById('notifications-popup').classList.toggle('hidden');
                });
            }

            // Đóng popup khi click ra ngoài
            window.addEventListener('click', (e) => {
                const popup = document.getElementById('notifications-popup');
                if (popup && !popup.contains(e.target) && !notificationsToggle.contains(e.target)) {
                    popup.classList.add('hidden');
                }
            });
        },

        // Cập nhật giao diện (icon, màu biểu đồ) khi đổi theme
        updateTheme() {
            const isDarkMode = document.body.classList.contains('dark-mode');
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            if (darkModeToggle) {
                darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            }
            this.updateAllChartColors();
        },

        // Hàm tải nội dung trang con
        async loadPage(page) {
            const mainContent = document.getElementById('main-content');
            const headerTitle = document.getElementById('header-title');
            if (!mainContent || !page) return;

            this.showLoading();
            this.destroyAllCharts(); // Hủy các biểu đồ cũ

            try {
                await new Promise(resolve => setTimeout(resolve, 100));

                const response = await fetch(`pages/${page}.html`);
                if (!response.ok) throw new Error(`Không thể tải trang: ${page}`);

                mainContent.innerHTML = await response.text();

                // Cập nhật tiêu đề và trạng thái active của menu
                const navItem = document.querySelector(`.nav-item[data-page='${page}']`);
                if (navItem) {
                    headerTitle.textContent = navItem.querySelector('.sidebar-text')?.textContent || 'Dashboard';
                    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('bg-blue-50', 'text-blue-600'));
                    navItem.classList.add('bg-blue-50', 'text-blue-600');
                }

                // Gọi hàm khởi tạo cho trang cụ thể
                if (this.pages[page] && typeof this.pages[page].init === 'function') {
                    this.pages[page].init();
                }

            } catch (error) {
                mainContent.innerHTML = `<div class="p-4 bg-red-100 text-red-700 rounded-lg"><strong>Lỗi:</strong> ${error.message}</div>`;
            } finally {
                this.hideLoading(); // Luôn ẩn loading sau khi hoàn tất
            }
        },

        // Hủy tất cả biểu đồ đang hoạt động
        destroyAllCharts() {
            Object.values(this.charts).forEach(chart => chart?.destroy());
            this.charts = {};
        },

        // Cập nhật màu cho tất cả biểu đồ
        updateAllChartColors() {
            const isDarkMode = document.body.classList.contains('dark-mode');
            const textColor = isDarkMode ? '#f7fafc' : '#374151';
            const gridColor = isDarkMode ? '#4a5568' : '#e5e7eb';

            Object.values(this.charts).forEach(chart => {
                if (!chart) return;
                chart.options.plugins.legend.labels.color = textColor;
                if (chart.options.scales) {
                    Object.values(chart.options.scales).forEach(scale => {
                        if (scale.ticks) scale.ticks.color = textColor;
                        if (scale.grid) scale.grid.color = gridColor;
                    });
                }
                chart.update();
            });
        },


        // === LOGIC CỤ THỂ CHO TỪNG TRANG ===
        pages: {
            overview: {
                init() {
                    console.log('Overview page loaded');
                }
            },
            analytics: {
                init() {
                    console.log('Analytics page loaded');
                    this.initializeCharts();
                    App.updateAllChartColors();
                },
                initializeCharts() {
                    const chartOptions = { responsive: true, maintainAspectRatio: false };

                    // Active Users Chart
                    const activeUsersCtx = document.getElementById('active-users-chart');
                    if (activeUsersCtx) {
                        App.charts.activeUsersChart = new Chart(activeUsersCtx, {
                            type: 'line',
                            data: { labels: ['T1', 'T2', 'T3', 'T4', 'T5'], datasets: [{ label: 'Active Users', data: [120, 150, 140, 160, 180], borderColor: '#3B82F6', tension: 0.4 }] },
                            options: chartOptions
                        });
                    }

                    // SSO Login Success Rate Chart
                    const ssoLoginCtx = document.getElementById('sso-login-chart');
                    if (ssoLoginCtx) {
                        App.charts.ssoLoginChart = new Chart(ssoLoginCtx, {
                            type: 'pie',
                            data: { labels: ['Success', 'Failure'], datasets: [{ data: [85, 15], backgroundColor: ['#10B981', '#EF4444'] }] },
                            options: chartOptions
                        });
                    }

                    // MFA Actions Chart
                    const mfaActionsCtx = document.getElementById('mfa-actions-chart');
                    if (mfaActionsCtx) {
                        App.charts.mfaActionsChart = new Chart(mfaActionsCtx, {
                            type: 'bar',
                            data: {
                                labels: ['Email', 'SMS', 'Authenticator'],
                                datasets: [{ label: 'MFA Actions', data: [200, 150, 100], backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'] }]
                            },
                            options: chartOptions
                        });
                    }

                    // Webhook Events Chart
                    const webhookEventsCtx = document.getElementById('webhook-events-chart');
                    if (webhookEventsCtx) {
                        App.charts.webhookEventsChart = new Chart(webhookEventsCtx, {
                            type: 'bar',
                            data: {
                                labels: ['user.created', 'user.updated', 'user.deleted'],
                                datasets: [{ label: 'Webhook Events', data: [50, 80, 30], backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'] }]
                            },
                            options: chartOptions
                        });
                    }
                }
            },
            'users': {
                init() {
                    console.log('Users page loaded');
                    this.updateViewState(); // Gọi hàm này khi trang được tải

                    // Gán sự kiện cho các nút
                    document.getElementById('add-user-btn')?.addEventListener('click', () => this.openModal());
                    document.getElementById('add-user-btn-empty')?.addEventListener('click', () => this.openModal());
                    document.getElementById('cancel-user-modal-btn')?.addEventListener('click', () => this.closeModal());

                    document.getElementById('user-form')?.addEventListener('submit', (e) => {
                        e.preventDefault();
                        // Xử lý logic lưu người dùng (thêm mới hoặc cập nhật)
                        alert('Đã lưu thông tin người dùng!');
                        this.closeModal();
                        // Sau khi lưu, cập nhật lại giao diện để hiển thị người dùng mới (nếu có)
                        this.updateViewState();
                    });
                },

                // Để kiểm tra trạng thái rỗng, hãy làm cho mảng này trống: users: []
                users: [
                    { id: 1, name: 'Jane Cooper', email: 'jane.cooper@example.com', role: 'Admin', status: 'Active', avatar: 'https://randomuser.me/api/portraits/women/12.jpg' },
                    { id: 2, name: 'Michael Smith', email: 'michael.smith@example.com', role: 'Editor', status: 'Active', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
                    { id: 3, name: 'Sara Johnson', email: 'sara.johnson@example.com', role: 'Viewer', status: 'Pending', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }
                ],

                // Hàm kiểm tra và cập nhật giao diện
                updateViewState() {
                    const hasUsers = this.users.length > 0;
                    document.getElementById('users-empty-state')?.classList.toggle('hidden', hasUsers);
                    document.getElementById('users-main-content')?.classList.toggle('hidden', !hasUsers);

                    if (hasUsers) {
                        this.renderTable();
                    }
                },

                // Hàm render dữ liệu ra bảng
                renderTable() {
                    const tbody = document.querySelector('#users-main-content table tbody');
                    if (!tbody) return;

                    tbody.innerHTML = this.users.map(user => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-full" src="${user.avatar}" alt="${user.name}">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${user.name}</div>
                            <div class="text-sm text-gray-500">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        ${user.role}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${user.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900" onclick="App.pages.users.openModal(${user.id})">Edit</button>
                </td>
            </tr>
        `).join('');
                },

                // Hàm mở modal để thêm hoặc sửa
                openModal(userId = null) {
                    const modal = document.getElementById('user-modal');
                    const title = document.getElementById('modal-title');
                    const form = document.getElementById('user-form');

                    form.reset(); // Luôn reset form khi mở

                    if (userId) {
                        title.textContent = 'Edit User';
                        // Tìm người dùng trong dữ liệu mẫu và điền vào form
                        const user = this.users.find(u => u.id === userId);
                        if (user) {
                            form.elements['user-name'].value = user.name;
                            form.elements['user-email'].value = user.email;
                            form.elements['user-role'].value = user.role;
                        }
                    } else {
                        title.textContent = 'Add User';
                    }

                    modal?.classList.remove('hidden');
                },

                // Hàm đóng modal
                closeModal() {
                    document.getElementById('user-modal')?.classList.add('hidden');
                }
            },
            roles: {
                init() {
                    console.log('Roles page loaded');
                    window.openAddRoleModal = () => this.openModal(null);
                    window.openEditRoleModal = (id) => this.openModal(id);
                    window.closeRoleModal = () => {
                        console.log('Closing role modal');
                        const modal = document.getElementById('role-modal');
                        if (modal) {
                            modal.classList.add('hidden');
                            console.log('Modal classList after adding hidden:', modal.classList.toString());
                        } else {
                            console.error('Modal element not found');
                        }
                    };
                    window.deleteRole = (id) => { if (confirm(`Are you sure you want to delete role ${id}?`)) alert(`Deleted role ${id}`); };
                    window.exportRoles = () => alert('Exporting roles...');

                    document.getElementById('role-form')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
                    document.getElementById('role-icon')?.addEventListener('change', () => this.updateIconPreview());
                    document.getElementById('apply-filters')?.addEventListener('click', () => alert('Applying filters...'));
                },
                openModal(id) {
                    const modal = document.getElementById('role-modal');
                    const title = document.getElementById('modal-title');
                    const form = document.getElementById('role-form');
                    if (!modal || !title || !form) return;

                    App.state.editingRoleId = id;
                    title.textContent = id ? 'Edit Role' : 'Add Role';
                    form.reset();

                    if (id) {
                        // Simulate fetching role data
                        form.elements['role-name'].value = 'Sample Role';
                        form.elements['role-description'].value = 'This is a sample description.';
                        form.elements['role-icon'].value = 'fa-user-tie';
                    }
                    this.updateIconPreview();
                    modal.classList.remove('hidden'); // Hiển thị modal
                },
                updateIconPreview() {
                    const select = document.getElementById('role-icon');
                    const preview = document.getElementById('icon-preview');
                    if (select && preview) {
                        const selectedIcon = select.value;
                        preview.innerHTML = selectedIcon ? `<i class="fas ${selectedIcon}"></i>` : '';
                    }
                },
                handleFormSubmit(event) {
                    event.preventDefault();
                    const name = document.getElementById('role-name').value;
                    const icon = document.getElementById('role-icon').value;
                    if (!name || !icon) {
                        alert('Role Name and Icon are required.');
                        return;
                    }
                    alert(`Role ${App.state.editingRoleId ? 'updated' : 'added'} successfully!`);
                    document.getElementById('role-modal')?.classList.add('hidden');
                }
            },
            permissions: {
                init() {
                    console.log('Permissions page loaded');
                    // Gán các hàm vào window để HTML có thể gọi
                    window.openPermissionModal = (id) => this.openModal(id);
                    window.closePermissionModal = () => this.closeModal();
                    window.deletePermission = (id) => this.deletePermission(id);
                    window.exportPermissions = () => this.exportPermissions();

                    document.getElementById('permission-form')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
                },
                openModal(id) {
                    App.state.editingPermissionId = id; // Sử dụng state toàn cục
                    const modal = document.getElementById('permission-modal');
                    const title = modal.querySelector('#modal-title');
                    const form = modal.querySelector('#permission-form');

                    title.textContent = id ? 'Sửa Quyền' : 'Thêm Quyền';
                    form.reset();

                    if (id) {
                        // Giả lập tải dữ liệu cho quyền
                        if (id === '1') {
                            form.elements['permission-name'].value = 'Quản lý người dùng';
                            form.elements['permission-key'].value = 'users:manage';
                            form.elements['permission-description'].value = 'Cho phép tạo, sửa, xóa người dùng.';
                            form.elements['permission-category'].value = 'Người dùng';
                        } else {
                            form.elements['permission-name'].value = 'Xem thanh toán';
                            form.elements['permission-key'].value = 'billing:view';
                            form.elements['permission-description'].value = 'Cho phép xem lịch sử và thông tin thanh toán.';
                            form.elements['permission-category'].value = 'Thanh toán';
                        }
                    }
                    modal.classList.remove('hidden');
                },
                closeModal() {
                    document.getElementById('permission-modal')?.classList.add('hidden');
                },
                deletePermission(id) {
                    if (confirm(`Bạn có chắc muốn xóa quyền này không?`)) {
                        alert(`Đã xóa quyền có ID: ${id}`);
                        console.log(`Audit log: Deleted permission ${id} (Level: HIGH)`);
                    }
                },
                exportPermissions() {
                    alert('Đang xuất danh sách quyền...');
                    console.log('Audit log: Exported permissions (Level: LOW)');
                },
                handleFormSubmit(event) {
                    event.preventDefault();
                    const name = document.getElementById('permission-name').value;
                    const key = document.getElementById('permission-key').value;
                    if (!name || !key) {
                        alert('Tên quyền và Khóa là bắt buộc.');
                        return;
                    }
                    const action = App.state.editingPermissionId ? 'cập nhật' : 'thêm';
                    alert(`Đã ${action} quyền thành công!`);
                    console.log(`Audit log: ${action === 'thêm' ? 'Created' : 'Updated'} permission ${name} (Level: MEDIUM)`);
                    this.closeModal();
                }
            },
            'mfa-settings': {
                init() {
                    console.log('MFA Settings page loaded');
                    // Gán hàm vào window để HTML gọi được
                    window.openMfaSettingsModal = () => this.openModal();
                    window.closeMfaSettingsModal = () => document.getElementById('mfa-settings-modal').classList.add('hidden');
                    window.resetAllMfa = () => this.resetAllMfa();
                    window.exportMfaHistory = () => alert('Đang xuất lịch sử thay đổi MFA...');

                    document.getElementById('mfa-settings-form')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
                },

                openModal() {
                    const modal = document.getElementById('mfa-settings-modal');
                    // Giả lập tải cài đặt hiện tại
                    document.getElementById('mfa-policy').value = 'required_admins';
                    document.querySelector('input[name="mfa_methods"][value="authenticator"]').checked = true;
                    document.querySelector('input[name="mfa_methods"][value="email"]').checked = true;
                    document.querySelector('input[name="mfa_methods"][value="sms"]').checked = false;

                    modal.classList.remove('hidden');
                },

                resetAllMfa() {
                    if (confirm('Bạn có chắc muốn reset cài đặt MFA cho tất cả người dùng không? Hành động này sẽ yêu cầu họ thiết lập lại MFA trong lần đăng nhập tiếp theo.')) {
                        alert('Đã reset MFA cho tất cả người dùng.');
                        console.log('Audit log: Reset MFA for all users (Level: HIGH)');
                    }
                },

                handleFormSubmit(event) {
                    event.preventDefault();
                    const policy = document.getElementById('mfa-policy').value;
                    const methods = Array.from(document.querySelectorAll('input[name="mfa_methods"]:checked')).map(cb => cb.value);

                    if (policy !== 'disabled' && methods.length === 0) {
                        document.getElementById('mfa-methods-error').classList.remove('hidden');
                        return;
                    }
                    document.getElementById('mfa-methods-error').classList.add('hidden');

                    alert('Đã cập nhật cài đặt MFA thành công!');
                    console.log('Audit log: Updated MFA settings (Level: MEDIUM)');
                    document.getElementById('mfa-settings-modal').classList.add('hidden');
                }
            },
            'sso-integration': {
                init() {
                    console.log('SSO Integration page loaded');
                    // Gán hàm vào window để HTML gọi được
                    window.openSsoConfigModal = () => this.openModal();
                    window.closeSsoConfigModal = () => document.getElementById('sso-config-modal').classList.add('hidden');
                    window.testSsoConnection = () => this.testSsoConnection();
                    window.deleteSsoIntegration = () => this.deleteSsoIntegration();
                    window.exportSsoHistory = () => alert('Đang xuất lịch sử SSO...');

                    document.getElementById('sso-config-form')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
                },
                openModal() {
                    const modal = document.getElementById('sso-config-modal');
                    // Giả lập tải cài đặt hiện tại
                    document.getElementById('sso-status').value = 'enabled';
                    document.getElementById('sso-provider').value = 'saml';
                    document.getElementById('sso-metadata-url').value = 'https://idp.example.com/saml/metadata';
                    document.getElementById('sso-client-id').value = 'test-client-id';

                    modal.classList.remove('hidden');
                },
                testSsoConnection() {
                    alert('Kiểm tra kết nối SSO... Thành công!');
                    console.log('Audit log: Tested SSO connection (Level: LOW)');
                },
                deleteSsoIntegration() {
                    if (confirm('Bạn có chắc muốn xóa tích hợp SSO này không? Hành động này sẽ ảnh hưởng đến tất cả người dùng đang đăng nhập qua SSO.')) {
                        alert('Đã xóa tích hợp SSO.');
                        console.log('Audit log: Deleted SSO integration (Level: HIGH)');
                    }
                },
                handleFormSubmit(event) {
                    event.preventDefault();
                    const url = document.getElementById('sso-metadata-url').value;
                    const urlError = document.getElementById('sso-metadata-url-error');

                    try {
                        new URL(url); // Kiểm tra xem URL có hợp lệ không
                        urlError.classList.add('hidden');
                        alert('Đã cập nhật cấu hình SSO thành công!');
                        console.log('Audit log: Updated SSO configuration (Level: MEDIUM)');
                        document.getElementById('sso-config-modal').classList.add('hidden');
                    } catch (_) {
                        urlError.classList.remove('hidden');
                    }
                }
            },
            'audit-logs': {
                init() {
                    console.log('Audit Logs page loaded');
                    // Gán các hàm vào window để HTML có thể gọi
                    window.exportAuditLogs = () => this.exportLogs();

                    document.getElementById('apply-filters')?.addEventListener('click', () => this.applyFilters());
                },

                applyFilters() {
                    const action = document.getElementById('action-filter').value;
                    const user = document.getElementById('user-filter').value;
                    const date = document.getElementById('date-filter').value;

                    alert(`Đang lọc nhật ký với các tiêu chí: Hành động=${action}, Người dùng=${user}, Ngày=${date}`);
                    console.log('Simulating fetching filtered audit logs...');
                    // Logic để tải lại bảng với dữ liệu đã lọc sẽ được thêm ở đây
                },

                exportLogs() {
                    alert('Đang chuẩn bị tệp xuất nhật ký kiểm tra...');
                    console.log('Audit log: Exported audit logs (Level: LOW)');
                    // Logic để tạo và tải về tệp CSV/JSON
                }
            },
            // Thay thế toàn bộ logic cho 'tenant-settings' trong App.pages bằng đoạn mã này
            'tenant-settings': {
                loginPageContent: '',
                signupPageContent: '',
                currentPreview: 'login',
                loginLogoDataUrl: '',
                signupLogoDataUrl: '',


                async init() {
                    console.log('Tenant Settings (STABLE VERSION) loaded');
                    window.setPreviewSize = this.setPreviewSize.bind(this);

                    try {
                        if (!this.loginPageContent) {
                            this.loginPageContent = await (await fetch('login.html')).text();
                        }
                        if (!this.signupPageContent) {
                            this.signupPageContent = await (await fetch('signup.html')).text();
                        }
                    } catch (e) {
                        console.error("Lỗi tải file HTML cho preview:", e);
                        const frame = document.getElementById('browser-frame');
                        if (frame) frame.innerHTML = '<p class="text-red-500 p-4">Lỗi tải giao diện xem trước.</p>';
                        return;
                    }

                    this.setupPreviewTabs();
                    this.setupSettingListeners();
                    this.switchToPreview('login'); // Hiển thị preview mặc định
                },

                setupPreviewTabs() {
                    document.getElementById('preview-tab-login')?.addEventListener('click', () => this.switchToPreview('login'));
                    document.getElementById('preview-tab-signup')?.addEventListener('click', () => this.switchToPreview('signup'));
                },

                switchToPreview(previewType) {
                    this.currentPreview = previewType;
                    document.getElementById('preview-tab-login')?.classList.toggle('active', previewType === 'login');
                    document.getElementById('preview-tab-signup')?.classList.toggle('active', previewType === 'signup');
                    const iframe = document.getElementById('preview-iframe');
                    if (!iframe) return;
                    iframe.srcdoc = (previewType === 'login') ? this.loginPageContent : this.signupPageContent;
                    iframe.onload = () => {
                        this.applyAllSettingsToPreview();
                        this.enablePreviewInteractions();
                    };
                },

                enablePreviewInteractions() {
                    const iframeDoc = document.getElementById('preview-iframe')?.contentDocument;
                    if (!iframeDoc) return;

                    // Bắt sự kiện click trên toàn bộ body của iframe
                    iframeDoc.body.addEventListener('click', (e) => {
                        const darkModeToggle = e.target.closest('#dark-mode-toggle');

                        // Ngăn chặn tất cả hành vi mặc định (như click vào link)
                        e.preventDefault();

                        if (darkModeToggle) {
                            const previewBody = iframeDoc.body;
                            const isDarkMode = previewBody.classList.toggle('dark-mode');
                            // Cập nhật icon mặt trăng/mặt trời
                            darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
                        }
                    });
                },

                applyAllSettingsToPreview() {
                    const iframeDoc = document.getElementById('preview-iframe')?.contentDocument;
                    if (!iframeDoc) return;

                    // iframeDoc.body.querySelectorAll('input, button[type="submit"], a').forEach(el => {
                    //     if (el.id !== 'dark-mode-toggle') {
                    //         el.setAttribute('disabled', 'true');
                    //     }
                    // });

                    const settings = {
                        name: document.getElementById('tenant-name-input').value,
                        color: document.getElementById('primary-color-input-settings').value,
                        signupAllowed: document.getElementById('public-signup-toggle-settings').checked
                    };

                    const titleEl = iframeDoc.querySelector('.ml-4 h1');
                    if (titleEl) titleEl.textContent = settings.name;

                    // Xác định logo cần hiển thị dựa trên cache
                    const logoDataUrlToShow = (this.currentPreview === 'signup' && this.signupLogoDataUrl)
                        ? this.signupLogoDataUrl
                        : this.loginLogoDataUrl;

                    const iconDiv = iframeDoc.querySelector('.w-12.h-12.bg-blue-500');
                    if (logoDataUrlToShow && iconDiv) {
                        iconDiv.className = 'w-auto h-12 flex items-center justify-center';
                        iconDiv.innerHTML = `<img src="${logoDataUrlToShow}" class="h-full w-auto">`;
                    }

                    iframeDoc.querySelectorAll('button[type="submit"], a[href*="signup.html"], a[href*="login.html"]')
                        .forEach(el => {
                            if (el.tagName === 'BUTTON') el.style.backgroundColor = settings.color;
                            else el.style.color = settings.color;
                        });

                    if (this.currentPreview === 'login') {
                        const signupLink = iframeDoc.querySelector('a[href="signup.html"]')?.parentElement;
                        if (signupLink) signupLink.style.display = settings.signupAllowed ? 'block' : 'none';
                    }
                },

                setupSettingListeners() {
                    const handleFileUpload = (file, target) => {
                        const reader = new FileReader();
                        reader.onload = e => {
                            if (target === 'login') this.loginLogoDataUrl = e.target.result;
                            if (target === 'signup') this.signupLogoDataUrl = e.target.result;
                            // Sau khi đọc file xong, gọi lại hàm apply để cập nhật ngay lập tức
                            this.applyAllSettingsToPreview();
                        };
                        reader.readAsDataURL(file);
                    };

                    document.getElementById('logo-upload-login-settings')?.addEventListener('change', (e) => {
                        if (e.target.files[0]) handleFileUpload(e.target.files[0], 'login');
                    });
                    document.getElementById('logo-upload-signup-settings')?.addEventListener('change', (e) => {
                        if (e.target.files[0]) handleFileUpload(e.target.files[0], 'signup');
                    });

                    // Các listener khác
                    document.getElementById('tenant-name-input')?.addEventListener('input', () => this.applyAllSettingsToPreview());
                    document.getElementById('primary-color-input-settings')?.addEventListener('input', () => this.applyAllSettingsToPreview());
                    document.getElementById('public-signup-toggle-settings')?.addEventListener('change', () => this.applyAllSettingsToPreview());
                },

                setPreviewSize(device) {
                    const frame = document.getElementById('browser-frame');
                    if (!frame) return;
                    document.querySelectorAll('.device-toggle').forEach(btn => btn.classList.remove('active'));
                    document.querySelector(`button[onclick="setPreviewSize('${device}')"]`)?.classList.add('active');

                    frame.style.maxWidth = '100%';
                    frame.style.maxHeight = '100%';
                    if (device === 'tablet') frame.style.maxWidth = '768px';
                    if (device === 'mobile') frame.style.maxWidth = '375px';
                }
            },
            webhooks: {
                init() {
                    console.log('Webhooks page loaded');
                    // Gán các hàm vào window để HTML gọi được
                    window.openWebhookModal = (id) => this.openModal(id);
                    window.closeWebhookModal = () => document.getElementById('webhook-modal').classList.add('hidden');
                    window.deleteWebhook = (id) => this.deleteWebhook(id);

                    document.getElementById('webhook-form')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
                },

                openModal(id) {
                    App.state.editingWebhookId = id;
                    const modal = document.getElementById('webhook-modal');
                    modal.querySelector('#modal-title').textContent = id ? 'Sửa Webhook' : 'Thêm Webhook';

                    const form = modal.querySelector('#webhook-form');
                    form.reset();

                    if (id) {
                        // Giả lập tải dữ liệu webhook
                        form.elements['webhook-url'].value = 'https://api.example.com/webhook1';
                        form.querySelector('input[value="user.created"]').checked = true;
                        form.querySelector('input[value="user.updated"]').checked = true;
                    }

                    modal.classList.remove('hidden');
                },

                deleteWebhook(id) {
                    if (confirm(`Bạn có chắc muốn xóa webhook này không?`)) {
                        alert(`Đã xóa webhook có ID: ${id}`);
                        console.log(`Audit log: Deleted webhook ${id} (Level: HIGH)`);
                    }
                },

                handleFormSubmit(event) {
                    event.preventDefault();
                    const url = document.getElementById('webhook-url').value;
                    const events = Array.from(document.querySelectorAll('input[name="webhook_events"]:checked'));

                    const urlError = document.getElementById('webhook-url-error');
                    const eventsError = document.getElementById('webhook-events-error');
                    urlError.classList.add('hidden');
                    eventsError.classList.add('hidden');

                    let isValid = true;
                    try {
                        new URL(url);
                    } catch (_) {
                        urlError.classList.remove('hidden');
                        isValid = false;
                    }
                    if (events.length === 0) {
                        eventsError.classList.remove('hidden');
                        isValid = false;
                    }

                    if (isValid) {
                        alert('Đã lưu cấu hình webhook thành công!');
                        console.log('Audit log: Saved webhook configuration (Level: MEDIUM)');
                        document.getElementById('webhook-modal').classList.add('hidden');
                    }
                }
            },
            // Thay thế logic cho 'plans' và 'subscriptions'
            'plans': {
                init() {
                    console.log('Plans page (Full CRUD) loaded');
                    this.renderTable();

                    document.getElementById('create-plan-btn')?.addEventListener('click', () => this.openModal());
                    document.getElementById('cancel-plan-btn')?.addEventListener('click', () => this.closeModal());
                    document.getElementById('plan-form')?.addEventListener('submit', (e) => this.handleFormSubmit(e));

                    document.getElementById('plans-table-body')?.addEventListener('click', (e) => {
                        const editBtn = e.target.closest('.edit-plan-btn');
                        const deleteBtn = e.target.closest('.delete-plan-btn');
                        if (editBtn) this.openModal(editBtn.dataset.planId);
                        if (deleteBtn) this.handleDelete(deleteBtn.dataset.planId, deleteBtn.dataset.planName);
                    });
                },

                plans: [
                    { id: 1, name: 'Trial', price: 0, userLimit: 10, apiLimit: 1000, active: true },
                    { id: 2, name: 'Pro', price: 99, userLimit: 100, apiLimit: 10000, active: true }
                ],
                editingPlanId: null,

                renderTable() {
                    const tbody = document.getElementById('plans-table-body');
                    if (!tbody) return;
                    tbody.innerHTML = this.plans.map(plan => `
            <tr>
                <td class="px-4 py-3 text-sm font-medium">${plan.name}</td>
                <td class="px-4 py-3 text-sm text-gray-500">$${plan.price}</td>
                <td class="px-4 py-3 text-sm text-gray-500">${plan.userLimit}</td>
                <td class="px-4 py-3 text-sm text-gray-500">${plan.apiLimit.toLocaleString()}</td>
                <td class="px-4 py-3 text-sm"><span class="px-2 inline-flex text-xs font-semibold rounded-full ${plan.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">${plan.active ? 'Hoạt động' : 'Tắt'}</span></td>
                <td class="px-4 py-3 text-right text-sm font-medium space-x-2">
                    <button class="edit-plan-btn text-blue-600 hover:text-blue-900" data-plan-id="${plan.id}">Sửa</button>
                    <button class="delete-plan-btn text-red-600 hover:text-red-900" data-plan-id="${plan.id}" data-plan-name="${plan.name}">Xóa</button>
                </td>
            </tr>
        `).join('');
                },

                openModal(planId = null) {
                    const modal = document.getElementById('plan-modal');
                    const form = document.getElementById('plan-form');
                    form.reset();
                    this.editingPlanId = planId;

                    if (planId) {
                        modal.querySelector('#plan-modal-title').textContent = 'Sửa Gói dịch vụ';
                        const plan = this.plans.find(p => p.id == planId);
                        if (plan) {
                            form.elements['plan-name'].value = plan.name;
                            form.elements['plan-price'].value = plan.price;
                            form.elements['plan-user-limit'].value = plan.userLimit;
                            form.elements['plan-api-limit'].value = plan.apiLimit;
                            form.elements['plan-status'].value = plan.active;
                        }
                    } else {
                        modal.querySelector('#plan-modal-title').textContent = 'Tạo Gói mới';
                    }
                    modal?.classList.remove('hidden');
                },

                closeModal() {
                    document.getElementById('plan-modal')?.classList.add('hidden');
                },

                handleFormSubmit(event) {
                    event.preventDefault();
                    const form = event.target;
                    const updatedPlan = {
                        name: form.elements['plan-name'].value,
                        price: parseInt(form.elements['plan-price'].value),
                        userLimit: parseInt(form.elements['plan-user-limit'].value),
                        apiLimit: parseInt(form.elements['plan-api-limit'].value),
                        active: form.elements['plan-status'].value === 'true'
                    };

                    if (this.editingPlanId) {
                        const index = this.plans.findIndex(p => p.id == this.editingPlanId);
                        this.plans[index] = { ...this.plans[index], ...updatedPlan };
                        alert('Đã cập nhật Gói dịch vụ!');
                    } else {
                        this.plans.push({ id: this.plans.length + 1, ...updatedPlan });
                        alert('Đã tạo Gói dịch vụ mới!');
                    }

                    this.closeModal();
                    this.renderTable();
                },

                handleDelete(planId, planName) {
                    App.showConfirmation(
                        'Xác nhận Xóa Gói',
                        `Bạn có chắc muốn xóa gói <strong>${planName}</strong>? Các tenant đang sử dụng gói này có thể bị ảnh hưởng.`,
                        () => {
                            this.plans = this.plans.filter(p => p.id != planId);
                            this.renderTable();
                            alert(`Đã xóa gói ${planName}.`);
                        }
                    );
                }
            },

            // Thay thế toàn bộ logic cho 'subscriptions'
            'subscriptions': {
                init() {
                    console.log('Subscriptions page (with Change Plan) loaded');
                    this.renderTable();

                    // Sử dụng event delegation cho các nút
                    document.getElementById('subscriptions-table-body')?.addEventListener('click', (e) => {
                        const detailsBtn = e.target.closest('.details-btn');
                        if (detailsBtn) this.openDetailsModal(detailsBtn.dataset.tenantName);
                    });

                    // Gán sự kiện cho các nút trong modal chi tiết
                    document.getElementById('close-details-modal-btn')?.addEventListener('click', () => this.closeDetailsModal());
                    document.getElementById('change-plan-btn')?.addEventListener('click', () => this.openChangePlanModal());
                    document.getElementById('cancel-subscription-btn')?.addEventListener('click', () => this.handleCancelSubscription());

                    // Gán sự kiện cho modal đổi gói
                    document.getElementById('cancel-change-plan-btn')?.addEventListener('click', () => this.closeChangePlanModal());
                    document.getElementById('change-plan-form')?.addEventListener('submit', (e) => this.handleChangePlanSubmit(e));
                },

                subscriptions: [
                    { tenant: 'Acme Corp', plan: 'Pro', status: 'Active', renewsOn: '15/08/2025' },
                    { tenant: 'Beta Inc', plan: 'Trial', status: 'Active', renewsOn: '01/08/2025' }
                ],

                // Lưu lại tenant đang được xem
                viewingTenant: null,

                renderTable() {
                    const tbody = document.getElementById('subscriptions-table-body');
                    if (!tbody) return;
                    tbody.innerHTML = this.subscriptions.map(sub => `
            <tr>
                <td class="px-4 py-3 text-sm font-medium">${sub.tenant}</td>
                <td class="px-4 py-3 text-sm text-gray-500">${sub.plan}</td>
                <td class="px-4 py-3 text-sm"><span class="px-2 inline-flex text-xs font-semibold rounded-full ${sub.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${sub.status}</span></td>
                <td class="px-4 py-3 text-sm text-gray-500">${sub.renewsOn}</td>
                <td class="px-4 py-3 text-right text-sm font-medium">
                    <button class="details-btn text-blue-600 hover:text-blue-900" data-tenant-name="${sub.tenant}">Chi tiết</button>
                </td>
            </tr>
        `).join('');
                },

                openDetailsModal(tenantName) {
                    this.viewingTenant = this.subscriptions.find(s => s.tenant === tenantName);
                    if (!this.viewingTenant) return;

                    const contentEl = document.getElementById('subscription-details-content');
                    contentEl.innerHTML = `
            <p><strong>Tenant:</strong> ${this.viewingTenant.tenant}</p>
            <p><strong>Gói hiện tại:</strong> ${this.viewingTenant.plan}</p>
            <p><strong>Trạng thái:</strong> ${this.viewingTenant.status}</p>
        `;

                    document.getElementById('subscription-details-modal')?.classList.remove('hidden');
                },

                closeDetailsModal() {
                    document.getElementById('subscription-details-modal')?.classList.add('hidden');
                    this.viewingTenant = null; // Reset
                },

                openChangePlanModal() {
                    if (!this.viewingTenant) return;

                    // Lấy danh sách các gói dịch vụ từ trang 'plans'
                    const plans = App.pages.plans.plans;
                    const selectEl = document.getElementById('new-plan-select');

                    // Lọc ra các gói khác với gói hiện tại
                    selectEl.innerHTML = plans
                        .filter(p => p.name !== this.viewingTenant.plan)
                        .map(p => `<option value="${p.name}">${p.name} ($${p.price}/tháng)</option>`)
                        .join('');

                    document.getElementById('change-plan-tenant-name').textContent = this.viewingTenant.tenant;
                    document.getElementById('change-plan-modal')?.classList.remove('hidden');
                },

                closeChangePlanModal() {
                    document.getElementById('change-plan-modal')?.classList.add('hidden');
                },

                handleChangePlanSubmit(event) {
                    event.preventDefault();
                    const newPlan = document.getElementById('new-plan-select').value;

                    App.showConfirmation(
                        'Xác nhận Đổi Gói',
                        `Bạn có chắc muốn đổi gói cho <strong>${this.viewingTenant.tenant}</strong> sang gói <strong>${newPlan}</strong>?`,
                        () => {
                            // Cập nhật dữ liệu
                            const index = this.subscriptions.findIndex(s => s.tenant === this.viewingTenant.tenant);
                            this.subscriptions[index].plan = newPlan;

                            alert('Đã đổi gói thành công!');
                            this.closeChangePlanModal();
                            this.closeDetailsModal();
                            this.renderTable(); // Cập nhật lại bảng
                        }
                    );
                },

                handleCancelSubscription() {
                    if (!this.viewingTenant) return;
                    App.showConfirmation(
                        'Xác nhận Hủy Subscription',
                        `Bạn có chắc muốn hủy gói dịch vụ của <strong>${this.viewingTenant.tenant}</strong>?`,
                        () => {
                            const index = this.subscriptions.findIndex(s => s.tenant === this.viewingTenant.tenant);
                            this.subscriptions[index].status = 'Canceled';
                            this.subscriptions[index].renewsOn = 'N/A';

                            alert('Đã hủy subscription thành công.');
                            this.closeDetailsModal();
                            this.renderTable();
                        }
                    );
                }
            },
            alerts: {
                init() {
                    console.log('Alerts page loaded');
                    // Gán hàm vào window để HTML có thể gọi
                    window.openAlertModal = (id) => this.openModal(id);
                    document.getElementById('close-modal-btn')?.addEventListener('click', () => {
                        document.getElementById('alert-modal').classList.add('hidden');
                    });
                    document.getElementById('apply-filters')?.addEventListener('click', () => {
                        alert('Đang lọc danh sách cảnh báo...');
                    });
                },

                openModal(id) {
                    const modal = document.getElementById('alert-modal');
                    const content = modal.querySelector('#alert-modal-content');
                    const resolveBtn = modal.querySelector('#resolve-btn');
                    const deleteBtn = modal.querySelector('#delete-btn');

                    // Reset
                    resolveBtn.classList.add('hidden');

                    // Giả lập dữ liệu
                    let alertData = {};
                    if (id === '1') {
                        alertData = {
                            severity: '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full severity-high">Cao</span>',
                            content: 'Gói Premium của tenant Acme Corp sẽ hết hạn trong 3 ngày.',
                            tenant: 'Acme Corp',
                            time: '17/07/2025 14:30',
                            status: 'Chưa đọc'
                        };
                        resolveBtn.classList.remove('hidden');
                    } else if (id === '2') {
                        alertData = {
                            severity: '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full severity-medium">Trung bình</span>',
                            content: 'Phát hiện 5 lần đăng nhập thất bại liên tiếp vào tài khoản admin@beta.inc từ IP 1.2.3.4.',
                            tenant: 'Beta Inc',
                            time: '17/07/2025 11:00',
                            status: 'Đã đọc'
                        };
                        resolveBtn.classList.remove('hidden');
                    } else {
                        alertData = {
                            severity: '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full severity-low">Thấp</span>',
                            content: 'Webhook tới https://api.gamma.com/hook đã thất bại 3 lần.',
                            tenant: 'Gamma Ltd',
                            time: '16/07/2025 20:15',
                            status: 'Đã giải quyết'
                        };
                    }

                    content.innerHTML = `
                        <div><label class="block text-sm font-medium text-gray-700">Mức độ:</label><div class="mt-1">${alertData.severity}</div></div>
                        <div><label class="block text-sm font-medium text-gray-700">Nội dung:</label><p class="mt-1 text-sm text-gray-900">${alertData.content}</p></div>
                        <div><label class="block text-sm font-medium text-gray-700">Tenant:</label><p class="mt-1 text-sm text-gray-900">${alertData.tenant}</p></div>
                        <div><label class="block text-sm font-medium text-gray-700">Thời gian:</label><p class="mt-1 text-sm text-gray-900">${alertData.time}</p></div>
                        <div><label class="block text-sm font-medium text-gray-700">Trạng thái:</label><p class="mt-1 text-sm text-gray-900">${alertData.status}</p></div>
                    `;

                    resolveBtn.onclick = () => {
                        if (confirm('Bạn có chắc muốn đánh dấu cảnh báo này là đã giải quyết?')) {
                            alert('Đã cập nhật trạng thái cảnh báo.');
                            modal.classList.add('hidden');
                            console.log(`Audit log: Resolved alert ${id} (Level: MEDIUM)`);
                        }
                    };

                    deleteBtn.onclick = () => {
                        if (confirm('Bạn có chắc muốn xóa cảnh báo này?')) {
                            alert('Đã xóa cảnh báo.');
                            modal.classList.add('hidden');
                            console.log(`Audit log: Deleted alert ${id} (Level: HIGH)`);
                        }
                    };

                    modal.classList.remove('hidden');
                }
            },
            billing: {
                init() {
                    console.log('Billing page loaded');
                    // Gán các hàm vào window để có thể gọi từ HTML
                    window.upgradePlan = (planName) => this.openUpgradeModal(planName);
                    window.closeUpgradeModal = () => document.getElementById('upgrade-modal').classList.add('hidden');
                    window.openQuotaRequestModal = () => this.openQuotaRequestModal();
                    window.closeQuotaRequestModal = () => document.getElementById('quota-request-modal').classList.add('hidden');

                    document.getElementById('cancel-plan-btn')?.addEventListener('click', () => this.cancelPlan());
                    document.getElementById('payment-form')?.addEventListener('submit', (e) => this.handlePayment(e));
                    document.getElementById('quota-request-form')?.addEventListener('submit', (e) => this.handleQuotaRequest(e));
                },

                openUpgradeModal(planName) {
                    const modal = document.getElementById('upgrade-modal');
                    modal.querySelector('#upgrade-plan-name').textContent = planName;
                    modal.querySelector('#upgrade-price').textContent = planName === 'Enterprise' ? 'Liên hệ' : '$199.00'; // Giả lập giá
                    modal.classList.remove('hidden');
                },

                handlePayment(event) {
                    event.preventDefault();
                    alert('Thanh toán thành công! Gói dịch vụ của bạn đã được nâng cấp.');
                    console.log('Audit log: Plan upgraded via self-service portal (Level: MEDIUM)');
                    window.closeUpgradeModal();
                },

                cancelPlan() {
                    if (confirm('Bạn có chắc muốn hủy gói dịch vụ hiện tại không? Hành động này không thể hoàn tác.')) {
                        alert('Gói dịch vụ đã được hủy.');
                        console.log('Audit log: Cancelled subscription (Level: HIGH)');
                    }
                },

                openQuotaRequestModal() {
                    document.getElementById('quota-request-modal').classList.remove('hidden');
                },

                handleQuotaRequest(event) {
                    event.preventDefault();
                    alert('Yêu cầu tăng quota của bạn đã được gửi đến Super Admin để xem xét.');
                    console.log('Audit log: Submitted quota increase request (Level: INFO)');
                    window.closeQuotaRequestModal();
                }
            },
            // Thay thế logic cho 'tenant-manager' và 'tenant-details'
            'tenant-manager': {
                init() {
                    console.log('Tenant Manager page (FULLY FUNCTIONAL) loaded');
                    this.renderTable();

                    // Gán sự kiện cho các nút
                    document.getElementById('add-tenant-btn')?.addEventListener('click', () => this.openModal());
                    document.getElementById('cancel-tenant-modal-btn')?.addEventListener('click', () => this.closeModal());
                    document.getElementById('tenant-form')?.addEventListener('submit', (e) => this.handleFormSubmit(e));

                    document.querySelector('#tenant-manager-table-body')?.addEventListener('click', (e) => {
                        const row = e.target.closest('tr');
                        if (row) {
                            const tenantId = row.dataset.tenantId;
                            if (tenantId) {
                                App.state.viewingTenantId = tenantId;
                                App.loadPage('tenant-details');
                            }
                        }
                    });
                },

                tenants: [
                    { id: 1, name: 'Acme Corp', plan: 'Pro', status: 'Hoạt động', userCount: '85 / 100' },
                    { id: 2, name: 'Beta Inc', plan: 'Trial', status: 'Chờ xử lý', userCount: '1 / 10' }
                ],

                renderTable() {
                    const tbody = document.getElementById('tenant-manager-table-body');
                    if (!tbody) return;
                    tbody.innerHTML = this.tenants.map(tenant => `
            <tr data-tenant-id="${tenant.id}" class="cursor-pointer hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-900">${tenant.name}</td>
                <td class="px-4 py-3 text-sm text-gray-500">${tenant.plan}</td>
                <td class="px-4 py-3 text-sm">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tenant.status === 'Hoạt động' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${tenant.status}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">${tenant.userCount}</td>
            </tr>
        `).join('');
                },

                openModal() {
                    document.getElementById('tenant-form').reset();
                    document.getElementById('tenant-modal')?.classList.remove('hidden');
                },

                closeModal() {
                    document.getElementById('tenant-modal')?.classList.add('hidden');
                },

                handleFormSubmit(event) {
                    event.preventDefault();
                    const newTenant = {
                        id: this.tenants.length + 1,
                        name: document.getElementById('tenant-name').value,
                        plan: document.getElementById('tenant-plan').value,
                        status: 'Hoạt động',
                        userCount: '0 / 10'
                    };
                    this.tenants.push(newTenant);
                    this.renderTable();
                    alert('Đã tạo Tenant mới thành công!');
                    this.closeModal();
                }
            },

            'tenant-details': {
                init() {
                    const tenantId = App.state.viewingTenantId;
                    console.log('Viewing details for Tenant ID:', tenantId);

                    // Giả lập lấy dữ liệu tenant từ mảng
                    const tenantData = App.pages['tenant-manager'].tenants.find(t => t.id == tenantId);
                    if (tenantData) {
                        this.renderDetails(tenantData);
                    }

                    // Gán sự kiện cho các nút hành động
                    document.getElementById('suspend-tenant-btn')?.addEventListener('click', () => this.handleSuspend(tenantId));
                    document.getElementById('delete-tenant-btn')?.addEventListener('click', () => this.handleDelete(tenantId));

                    // Gán sự kiện cho các nút quản lý nhanh
                    document.getElementById('quick-actions-container')?.addEventListener('click', (e) => {
                        const link = e.target.closest('a[data-page]');
                        if (link) {
                            e.preventDefault();
                            App.loadPage(link.dataset.page);
                        }
                    });
                },

                renderDetails(tenant) {
                    document.getElementById('details-tenant-name').textContent = tenant.name;
                    document.getElementById('details-tenant-plan').textContent = tenant.plan;
                    document.getElementById('details-user-count').textContent = tenant.userCount;

                    const statusEl = document.getElementById('details-tenant-status');
                    statusEl.textContent = tenant.status;
                    statusEl.className = `px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${tenant.status === 'Hoạt động' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`;
                },

                handleSuspend(tenantId) {
                    App.showConfirmation(
                        'Xác nhận Tạm ngưng',
                        `Bạn có chắc chắn muốn tạm ngưng Tenant này?`,
                        () => {
                            console.log(`Đã tạm ngưng Tenant ID: ${tenantId}`);
                            alert('Tenant đã được tạm ngưng.');
                        }
                    );
                },

                handleDelete(tenantId) {
                    App.showConfirmation(
                        'Xác nhận Xóa Tenant',
                        `Hành động này <strong>không thể hoàn tác</strong>. Toàn bộ dữ liệu của Tenant sẽ bị xóa.`,
                        () => {
                            console.log(`Đã xóa Tenant ID: ${tenantId}`);
                            // Xóa tenant khỏi dữ liệu mẫu và quay lại
                            const tenants = App.pages['tenant-manager'].tenants;
                            App.pages['tenant-manager'].tenants = tenants.filter(t => t.id != tenantId);
                            alert('Tenant đã được xóa.');
                            App.loadPage('tenant-manager');
                        }
                    );
                }
            },
            'session-management': {
                init() {
                    console.log('Session Management page loaded');
                    // Gán các hàm vào window để HTML có thể gọi
                    window.revokeSession = (sessionId) => this.revokeSession(sessionId);

                    document.getElementById('apply-filters')?.addEventListener('click', () => alert('Đang lọc danh sách phiên đăng nhập...'));
                },

                revokeSession(sessionId) {
                    if (confirm(`Bạn có chắc muốn thu hồi phiên đăng nhập này? Người dùng sẽ bị buộc đăng xuất ngay lập tức.`)) {
                        alert(`Đã thu hồi phiên đăng nhập ID: ${sessionId}`);
                        console.log(`Audit log: Revoked session ${sessionId} (Level: HIGH)`);
                        // Ở đây có thể thêm logic để xóa dòng tương ứng khỏi bảng
                    }
                }
            },
            'policy-config': {
                init() {
                    console.log('Policy Config page loaded');
                    window.openPolicyModal = (id) => this.openModal(id);
                    window.closePolicyModal = () => document.getElementById('policy-modal').classList.add('hidden');

                    document.getElementById('policy-form')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
                    document.getElementById('add-rule-btn')?.addEventListener('click', () => this.addRuleRow());
                },

                openModal(id) {
                    App.state.editingPolicyId = id;
                    const modal = document.getElementById('policy-modal');
                    modal.querySelector('#modal-title').textContent = id ? 'Sửa Chính sách' : 'Thêm Chính sách mới';
                    document.getElementById('rule-container').innerHTML = ''; // Xóa các điều kiện cũ

                    if (id) {
                        // Giả lập tải dữ liệu chính sách để sửa
                        document.getElementById('policy-name').value = 'Truy cập trong giờ hành chính';
                        this.addRuleRow({ attribute: 'time', operator: 'between', value: '09:00-17:00' });
                    } else {
                        // Thêm một hàng điều kiện trống khi tạo mới
                        this.addRuleRow();
                    }

                    modal.classList.remove('hidden');
                },

                addRuleRow(rule = {}) {
                    const container = document.getElementById('rule-container');
                    const ruleIndex = container.children.length;
                    const ruleRow = document.createElement('div');
                    ruleRow.className = 'flex items-center space-x-2';
                    ruleRow.innerHTML = `
                        <select name="attribute" class="flex-1 text-sm border rounded-md p-2 bg-white">
                            <option value="ip_address" ${rule.attribute === 'ip_address' ? 'selected' : ''}>Địa chỉ IP</option>
                            <option value="time" ${rule.attribute === 'time' ? 'selected' : ''}>Thời gian</option>
                            <option value="device" ${rule.attribute === 'device' ? 'selected' : ''}>Thiết bị</option>
                        </select>
                        <select name="operator" class="flex-1 text-sm border rounded-md p-2 bg-white">
                            <option value="in_range" ${rule.operator === 'in_range' ? 'selected' : ''}>nằm trong dải</option>
                            <option value="not_in_range" ${rule.operator === 'not_in_range' ? 'selected' : ''}>không nằm trong dải</option>
                            <option value="between" ${rule.operator === 'between' ? 'selected' : ''}>trong khoảng</option>
                        </select>
                        <input type="text" name="value" placeholder="Giá trị..." value="${rule.value || ''}" class="flex-1 text-sm border rounded-md p-2">
                        <button type="button" class="text-red-500 hover:text-red-700" onclick="this.parentElement.remove()">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    `;
                    container.appendChild(ruleRow);
                },

                handleFormSubmit(event) {
                    event.preventDefault();
                    const policyName = document.getElementById('policy-name').value;
                    if (!policyName) {
                        alert('Vui lòng nhập tên chính sách.');
                        return;
                    }

                    // Logic thu thập dữ liệu từ các điều kiện
                    const rules = [];
                    document.querySelectorAll('#rule-container > div').forEach(row => {
                        rules.push({
                            attribute: row.querySelector('[name=attribute]').value,
                            operator: row.querySelector('[name=operator]').value,
                            value: row.querySelector('[name=value]').value,
                        });
                    });

                    console.log('Saving policy:', {
                        name: policyName,
                        rules: rules
                    });

                    alert('Đã lưu chính sách thành công!');
                    console.log('Audit log: Saved ABAC policy (Level: HIGH)');
                    document.getElementById('policy-modal').classList.add('hidden');
                }
            },
            integrations: {
                init() {
                    console.log('Integrations page loaded');
                    // Gán các hàm vào window để HTML có thể gọi
                    window.openIntegrationModal = (type) => this.openModal(type);
                    window.closeIntegrationModal = (type) => this.closeModal(type);
                    window.testSiemConnection = () => alert('Đang gửi log thử nghiệm... Kết nối thành công!');

                    document.getElementById('siem-form')?.addEventListener('submit', (e) => this.handleSiemSubmit(e));
                },

                openModal(type) {
                    const modal = document.getElementById(`${type}-modal`);
                    if (modal) {
                        modal.classList.remove('hidden');
                        // Giả lập tải dữ liệu đã lưu cho modal SIEM khi mở
                        if (type === 'siem') {
                            document.getElementById('siem-status').value = 'enabled';
                            document.getElementById('siem-url').value = 'https://splunk.my-company.com/logs';
                        }
                    } else {
                        // Thông báo mặc định nếu chưa có modal
                        alert(`Chức năng cấu hình cho "${type}" đang được phát triển.`);
                    }
                },

                closeModal(type) {
                    const modal = document.getElementById(`${type}-modal`);
                    if (modal) {
                        modal.classList.add('hidden');
                    }
                },

                handleSiemSubmit(event) {
                    event.preventDefault();
                    alert('Đã lưu cấu hình SIEM thành công!');
                    console.log('Audit log: Updated SIEM integration settings (Level: HIGH)');
                    this.closeModal('siem');
                }
            },
            'security-dashboard': {
                init() {
                    console.log('Security Dashboard page loaded');
                    // Hiện tại trang này chỉ hiển thị thông tin,
                    // có thể thêm các event listener cho các hành động trong tương lai.
                }
            },
            'request-management': {
                init() {
                    console.log('Request Management page loaded');
                    this.activeTab = 'tenant-requests';

                    // Gán hàm vào window
                    window.approveRequest = (id, type) => this.approveRequest(id, type);
                    window.openDenialModal = (id, type) => this.openDenialModal(id, type);
                    window.closeDenialModal = () => document.getElementById('denial-modal').classList.add('hidden');

                    // Sự kiện chuyển tab
                    document.getElementById('tab-tenant-requests').addEventListener('click', (e) => { e.preventDefault(); this.switchTab('tenant-requests'); });
                    document.getElementById('tab-quota-requests').addEventListener('click', (e) => { e.preventDefault(); this.switchTab('quota-requests'); });

                    // Sự kiện submit form từ chối
                    document.getElementById('denial-form').addEventListener('submit', (e) => this.handleDenialSubmit(e));
                },

                switchTab(tabId) {
                    this.activeTab = tabId;
                    // Ẩn tất cả content
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
                    // Hiện content của tab được chọn
                    document.getElementById(`content-${tabId}`).classList.remove('hidden');

                    // Cập nhật trạng thái active của tab
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    document.getElementById(`tab-${tabId}`).classList.add('active');
                },

                approveRequest(id, type) {
                    if (confirm(`Bạn có chắc muốn phê duyệt yêu cầu ${type} này không?`)) {
                        alert(`Đã phê duyệt yêu cầu ${id}.`);
                        console.log(`Audit log: Approved ${type} request ${id} (Level: MEDIUM)`);
                    }
                },

                openDenialModal(id, type) {
                    const modal = document.getElementById('denial-modal');
                    // Lưu lại ID và type để xử lý khi submit
                    modal.dataset.requestId = id;
                    modal.dataset.requestType = type;
                    modal.querySelector('#denial-reason').value = '';
                    modal.classList.remove('hidden');
                },

                handleDenialSubmit(event) {
                    event.preventDefault();
                    const modal = document.getElementById('denial-modal');
                    const reason = modal.querySelector('#denial-reason').value;
                    const id = modal.dataset.requestId;
                    const type = modal.dataset.requestType;

                    if (!reason) {
                        alert('Vui lòng nhập lý do từ chối.');
                        return;
                    }

                    alert(`Đã từ chối yêu cầu ${type} ID: ${id}.`);
                    console.log(`Audit log: Denied ${type} request ${id} with reason: "${reason}" (Level: MEDIUM)`);
                    window.closeDenialModal();
                }
            },
            'policy-simulator': {
                init() {
                    console.log('Policy Simulator page loaded');
                    document.getElementById('simulator-form')?.addEventListener('submit', (e) => this.runSimulation(e));
                },

                runSimulation(event) {
                    event.preventDefault();
                    const userEmail = document.getElementById('user-email').value;
                    const actionKey = document.getElementById('action-key').value;
                    const contextIp = document.getElementById('context-ip').value;

                    const resultContainer = document.getElementById('result-container');

                    // --- Logic mô phỏng ---
                    // Kịch bản 1: Cho phép
                    if (userEmail.includes('admin') && actionKey.includes('delete')) {
                        const template = document.getElementById('result-template-allowed').content.cloneNode(true);
                        template.querySelector('.user-email').textContent = userEmail;
                        template.querySelector('.action-key').textContent = actionKey;
                        template.querySelector('.role-name').textContent = 'Administrator';
                        template.querySelector('.policy-name').textContent = 'Toàn quyền truy cập';
                        resultContainer.innerHTML = '';
                        resultContainer.appendChild(template);
                        return;
                    }

                    // Kịch bản 2: Từ chối do chính sách ABAC
                    if (actionKey.includes('invoice') && contextIp && !contextIp.startsWith('10.0')) {
                        const template = document.getElementById('result-template-denied').content.cloneNode(true);
                        template.querySelector('.user-email').textContent = userEmail;
                        template.querySelector('.action-key').textContent = actionKey;
                        template.querySelector('.reason-item').textContent = `Vi phạm chính sách "Chỉ truy cập từ IP nội bộ" (IP hiện tại: ${contextIp})`;
                        resultContainer.innerHTML = '';
                        resultContainer.appendChild(template);
                        return;
                    }

                    // Kịch bản 3: Từ chối do thiếu quyền
                    const template = document.getElementById('result-template-denied').content.cloneNode(true);
                    template.querySelector('.user-email').textContent = userEmail;
                    template.querySelector('.action-key').textContent = actionKey;
                    template.querySelector('.reason-item').textContent = 'Không có vai trò nào cấp quyền này.';
                    resultContainer.innerHTML = '';
                    resultContainer.appendChild(template);
                }
            },
            'applications': {
                init() {
                    console.log('Applications page loaded');
                    this.updateViewState();

                    // Gán sự kiện cho các nút chính
                    document.getElementById('add-app-btn')?.addEventListener('click', () => this.openAppModal());
                    document.getElementById('add-app-btn-empty')?.addEventListener('click', () => this.openAppModal());
                    document.getElementById('cancel-app-modal-btn')?.addEventListener('click', () => this.closeAppModal());
                    document.getElementById('app-form')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
                    document.getElementById('close-credentials-modal-btn')?.addEventListener('click', () => this.closeCredentialsModal());

                    // Sử dụng event delegation để bắt sự kiện cho các nút "Chi tiết"
                    document.getElementById('apps-table-container')?.addEventListener('click', (e) => {
                        if (e.target.matches('.view-details-btn')) {
                            e.preventDefault();
                            // 1. Lưu ID vào state
                            App.state.viewingAppId = e.target.dataset.appId;
                            // 2. Tải trang chi tiết
                            App.loadPage('application-details');
                        }
                    });
                },

                // Dữ liệu mẫu, bạn sẽ thay thế bằng dữ liệu từ API
                apps: [
                    { id: '1', name: 'Hệ thống CRM nội bộ', clientId: 'abc...xyz', createdAt: '18/07/2025' }
                ],

                // Hàm render lại nội dung bảng
                renderTable() {
                    const tbody = document.querySelector('#apps-table-container tbody');
                    if (!tbody) return;

                    // Nếu không có ứng dụng, hiển thị một hàng thông báo
                    if (this.apps.length === 0) {
                        tbody.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-gray-500">Chưa có ứng dụng nào được đăng ký.</td></tr>`;
                        return;
                    }

                    // Nếu có ứng dụng, hiển thị danh sách
                    tbody.innerHTML = this.apps.map(app => `
            <tr>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${app.name}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">${app.clientId}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${app.createdAt}</td>
                <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" class="view-details-btn text-blue-500 hover:text-blue-700" data-app-id="${app.id}">Chi tiết</a>
                </td>
            </tr>
        `).join('');
                },

                // Cập nhật giao diện dựa trên việc có ứng dụng hay không
                updateViewState() {
                    this.renderTable(); // Luôn render lại bảng
                    const hasApps = this.apps.length > 0;
                    document.getElementById('empty-state')?.classList.toggle('hidden', hasApps);
                    document.getElementById('apps-table-container')?.classList.toggle('hidden', !hasApps);
                    document.getElementById('add-app-btn')?.classList.toggle('hidden', !hasApps);
                },

                openAppModal() {
                    document.getElementById('app-form').reset();
                    document.getElementById('modal-title').textContent = 'Đăng ký Ứng dụng mới';
                    document.getElementById('app-modal')?.classList.remove('hidden');
                },

                closeAppModal() {
                    document.getElementById('app-modal')?.classList.add('hidden');
                },

                handleFormSubmit(event) {
                    event.preventDefault();
                    this.closeAppModal();
                    // Giả lập tạo credentials
                    document.getElementById('client-id-display').value = 'asdf123-qwer456-zxcv789';
                    document.getElementById('client-secret-display').value = 'super_secret_key_that_is_long_and_random';
                    document.getElementById('credentials-modal')?.classList.remove('hidden');
                },

                closeCredentialsModal() {
                    document.getElementById('credentials-modal')?.classList.add('hidden');
                    // Giả lập thêm ứng dụng mới vào danh sách và cập nhật UI
                    const newApp = {
                        id: '2',
                        name: document.getElementById('app-name').value || "Ứng dụng Mới",
                        clientId: 'asdf...789',
                        createdAt: new Date().toLocaleDateString('vi-VN')
                    };
                    this.apps.push(newApp);
                    this.updateViewState();
                }
            },

            'application-details': {
                init() {
                    console.log('Application Details page loaded');

                    // Lấy app ID từ query string (giả lập)
                    const appId = App.state.viewingAppId;
                    console.log("Viewing details for App ID:", appId);

                    // Gán sự kiện cho các nút trên trang chi tiết
                    document.getElementById('reveal-secret-btn')?.addEventListener('click', this.toggleSecretVisibility);
                    document.getElementById('delete-app-btn')?.addEventListener('click', this.handleDelete);
                },

                toggleSecretVisibility(event) {
                    const btn = event.target;
                    const field = document.getElementById('client-secret-field');
                    if (field.type === 'password') {
                        field.type = 'text';
                        btn.textContent = 'Ẩn';
                    } else {
                        field.type = 'password';
                        btn.textContent = 'Hiện';
                    }
                },

                handleDelete() {
                    if (confirm('Bạn có chắc chắn muốn xóa ứng dụng này không? Hành động này không thể hoàn tác.')) {
                        alert('Đã xóa ứng dụng. Đang quay lại danh sách...');
                        // Chuyển hướng về trang danh sách ứng dụng
                        App.loadPage('applications');
                    }
                }
            },
            // Thêm vào trong App.pages
            'service-roles': {
                init() {
                    console.log('Service Roles page loaded');
                    this.renderTable();

                    document.getElementById('create-service-role-btn')?.addEventListener('click', () => this.openModal());
                    document.getElementById('cancel-service-role-btn')?.addEventListener('click', () => this.closeModal());
                    document.getElementById('service-role-form')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
                },

                roles: [
                    { id: 1, name: 'Billing Read-Only', permissions: 'invoices:read,customers:read' },
                    { id: 2, name: 'Full User Management', permissions: 'users:read,users:write,users:delete' }
                ],

                renderTable() {
                    const tbody = document.getElementById('service-roles-table-body');
                    if (!tbody) return;
                    tbody.innerHTML = this.roles.map(role => `
            <tr>
                <td class="px-4 py-3 text-sm font-medium">${role.name}</td>
                <td class="px-4 py-3 text-sm text-gray-500 font-mono">${role.permissions}</td>
                <td class="px-4 py-3 text-right text-sm font-medium">
                    <button class="text-blue-500 hover:text-blue-700">Sửa</button>
                </td>
            </tr>
        `).join('');
                },

                openModal(roleId = null) {
                    // ... (Logic để mở modal thêm/sửa vai trò)
                    document.getElementById('service-role-modal')?.classList.remove('hidden');
                },

                closeModal() {
                    document.getElementById('service-role-modal')?.classList.add('hidden');
                },

                handleFormSubmit(event) {
                    event.preventDefault();
                    // ... (Logic để lưu vai trò mới/cập nhật)
                    alert('Đã lưu Vai trò Service!');
                    this.closeModal();
                    this.renderTable();
                }
            },

            'access-keys': {
                init() {
                    console.log('Access Keys page (Service Roles architecture) loaded');
                    this.renderGroups();

                    document.getElementById('create-key-group-btn')?.addEventListener('click', () => this.openCreateGroupModal());
                    document.getElementById('cancel-create-key-group-btn')?.addEventListener('click', () => this.closeCreateGroupModal());
                    document.getElementById('create-key-group-form')?.addEventListener('submit', (e) => this.handleGroupFormSubmit(e));
                    document.getElementById('close-show-key-btn')?.addEventListener('click', () => this.closeShowKeyModal());
                    document.getElementById('copy-key-btn')?.addEventListener('click', () => this.copyKey());
                    document.getElementById('search-groups-input')?.addEventListener('input', (e) => this.renderGroups(e.target.value));

                    document.getElementById('key-groups-container')?.addEventListener('click', (e) => {
                        const addBtn = e.target.closest('.add-key-to-group-btn');
                        if (addBtn) this.handleCreateKeyInGroup(addBtn.dataset.groupId);
                    });
                },

                groups: [
                    { id: 1, name: 'Billing Services', role: 'Billing Read-Only', type: 'Direct Key', keys: [{ id: 1, key: 'dk_...a1b2' }] }
                ],

                renderGroups(searchTerm = '') {
                    const container = document.getElementById('key-groups-container');
                    if (!container) return;
                    const filteredGroups = this.groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

                    if (filteredGroups.length === 0) {
                        container.innerHTML = `<p class="text-center text-gray-500 py-8">Không tìm thấy nhóm nào.</p>`;
                        return;
                    }

                    container.innerHTML = filteredGroups.map(group => `
            <div class="card bg-white rounded-lg shadow border border-gray-200">
                <div class="p-4 border-b flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-bold">${group.name}</h3>
                        <p class="text-sm text-gray-500">Vai trò: <span class="font-medium">${group.role}</span> | Loại: <span class="font-medium">${group.type}</span></p>
                    </div>
                    <button class="add-key-to-group-btn text-sm bg-gray-200 px-3 py-1 rounded-md" data-group-id="${group.id}">Thêm Key</button>
                </div>
                <table class="min-w-full">
                    <tbody class="divide-y divide-gray-200">
                        ${group.keys.length > 0 ? group.keys.map(k => `<tr><td class="px-4 py-3 text-sm font-mono">${k.key}</td></tr>`).join('') : '<tr><td class="text-center p-4 text-sm text-gray-400">Chưa có key.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `).join('');
                },

                openCreateGroupModal() {
                    const roleSelect = document.getElementById('key-group-role');
                    if (roleSelect) {
                        const serviceRoles = App.pages['service-roles'].roles;
                        roleSelect.innerHTML = serviceRoles.map(r => `<option value="${r.name}">${r.name}</option>`).join('');
                    }
                    document.getElementById('create-key-group-modal')?.classList.remove('hidden');
                },

                closeCreateGroupModal() {
                    document.getElementById('create-key-group-modal')?.classList.add('hidden');
                },

                handleGroupFormSubmit(event) {
                    event.preventDefault();
                    const groupName = document.getElementById('key-group-name').value;
                    const groupRole = document.getElementById('key-group-role').value;
                    const keyTypeSelect = document.getElementById('key-type');
                    const keyType = keyTypeSelect.options[keyTypeSelect.selectedIndex].text;

                    this.groups.push({ id: this.groups.length + 1, name: groupName, role: groupRole, type: keyType, keys: [] });
                    this.renderGroups();
                    this.closeCreateGroupModal();
                },

                handleCreateKeyInGroup(groupId) {
                    const group = this.groups.find(g => g.id == groupId);
                    if (!group) return;
                    const prefix = group.type === 'User Key (Client to Service)' ? 'uk_live_' : 'dk_live_';
                    const newKey = prefix + Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');

                    document.getElementById('api-key-display').value = newKey;
                    document.getElementById('show-key-modal')?.classList.remove('hidden');
                    this.newKeyData = { groupId, newKey };
                },

                closeShowKeyModal() {
                    document.getElementById('show-key-modal')?.classList.add('hidden');
                    if (this.newKeyData) {
                        const group = this.groups.find(g => g.id == this.newKeyData.groupId);
                        if (group) {
                            group.keys.push({
                                id: group.keys.length + 1,
                                key: this.newKeyData.newKey.substring(0, 11) + '...' + this.newKeyData.newKey.substring(this.newKeyData.newKey.length - 4)
                            });
                            this.renderGroups();
                        }
                        this.newKeyData = null;
                    }
                },

                copyKey() {
                    const key = document.getElementById('api-key-display').value;
                    navigator.clipboard.writeText(key).then(() => alert('Đã sao chép Access Key!'));
                },
            },
            // Thêm vào trong App.pages
            'access-key-alerts': {
                init() {
                    console.log('Access Key Alerts page loaded');
                    this.renderTable();

                    // Sử dụng event delegation cho các hành động
                    document.getElementById('access-key-alerts-table-body')?.addEventListener('click', (e) => {
                        const blockIpBtn = e.target.closest('.block-ip-btn');
                        const revokeKeyBtn = e.target.closest('.revoke-key-btn');

                        if (blockIpBtn) {
                            const ip = blockIpBtn.dataset.ip;
                            this.handleBlockIp(ip);
                        }
                        if (revokeKeyBtn) {
                            const keyName = revokeKeyBtn.dataset.keyName;
                            this.handleRevokeKey(keyName);
                        }
                    });
                },

                // Dữ liệu mẫu
                alerts: [
                    {
                        id: 1,
                        time: '18/07/2025 14:30:00',
                        severity: 'Cao',
                        type: 'Sử dụng từ IP lạ',
                        group: 'External Partners',
                        ip: '103.22.11.5'
                    },
                    {
                        id: 2,
                        time: '18/07/2025 11:00:00',
                        severity: 'Trung bình',
                        type: 'Nhiều yêu cầu thất bại',
                        group: 'Backend Services',
                        ip: '192.168.1.10'
                    }
                ],

                renderTable() {
                    const tbody = document.getElementById('access-key-alerts-table-body');
                    if (!tbody) return;
                    tbody.innerHTML = this.alerts.map(alert => {
                        const severityClass = alert.severity === 'Cao' ? 'severity-high' : 'severity-medium';
                        return `
                <tr>
                    <td class="px-4 py-3 text-sm text-gray-500">${alert.time}</td>
                    <td class="px-4 py-3"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${severityClass}">${alert.severity}</span></td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">${alert.type}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">${alert.group}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 font-mono">${alert.ip}</td>
                    <td class="px-4 py-3 text-right text-sm font-medium space-x-2">
                        <button class="block-ip-btn text-yellow-600 hover:text-yellow-900" data-ip="${alert.ip}">Chặn IP</button>
                        <button class="revoke-key-btn text-red-600 hover:text-red-900" data-key-name="${alert.group}">Thu hồi Key</button>
                    </td>
                </tr>
            `;
                    }).join('');
                },

                handleBlockIp(ip) {
                    App.showConfirmation(
                        'Xác nhận Chặn IP',
                        `Bạn có chắc chắn muốn chặn địa chỉ IP <strong>${ip}</strong>? Mọi yêu cầu từ IP này sẽ bị từ chối.`,
                        () => {
                            console.log(`Đã chặn IP: ${ip}`);
                            alert(`Đã thêm IP ${ip} vào danh sách đen.`);
                        }
                    );
                },

                handleRevokeKey(keyName) {
                    App.showConfirmation(
                        'Xác nhận Thu hồi Key',
                        `Hành động này sẽ thu hồi tất cả các key trong nhóm <strong>${keyName}</strong>. Bạn có chắc chắn?`,
                        () => {
                            console.log(`Đã thu hồi các key trong nhóm: ${keyName}`);
                            alert(`Đã thu hồi thành công các key trong nhóm ${keyName}.`);
                        }
                    );
                }
            },
            // Thêm vào trong App.pages
            'support-tickets': {
                init() {
                    console.log('Support Tickets page loaded');
                    this.renderTable();

                    // Sử dụng event delegation
                    document.getElementById('tickets-table-body')?.addEventListener('click', (e) => {
                        const viewBtn = e.target.closest('.view-ticket-btn');
                        if (viewBtn) {
                            this.openDetailsModal(viewBtn.dataset.ticketId);
                        }
                    });

                    document.getElementById('close-ticket-modal-btn')?.addEventListener('click', () => this.closeDetailsModal());
                },

                // Dữ liệu mẫu
                tickets: [
                    { id: 1, subject: 'Lỗi tích hợp SIEM', user: 'admin@acme.com', date: '18/07/2025', status: 'Mới', description: 'Chúng tôi đang gặp sự cố khi đẩy log sang Splunk...' },
                    { id: 2, subject: 'Yêu cầu tăng quota người dùng', user: 'manager@beta.inc', date: '17/07/2025', status: 'Đang xử lý', description: 'Chúng tôi cần thêm 50 user cho dự án mới.' }
                ],

                renderTable() {
                    const tbody = document.getElementById('tickets-table-body');
                    if (!tbody) return;
                    tbody.innerHTML = this.tickets.map(ticket => {
                        let statusClass = 'bg-blue-100 text-blue-800';
                        if (ticket.status === 'Đang xử lý') statusClass = 'bg-yellow-100 text-yellow-800';
                        if (ticket.status === 'Đã đóng') statusClass = 'bg-gray-100 text-gray-800';

                        return `
                <tr>
                    <td class="px-4 py-3 text-sm font-medium">${ticket.subject}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">${ticket.user}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">${ticket.date}</td>
                    <td class="px-4 py-3"><span class="px-2 inline-flex text-xs font-semibold rounded-full ${statusClass}">${ticket.status}</span></td>
                    <td class="px-4 py-3 text-right text-sm font-medium">
                        <button class="view-ticket-btn text-blue-600 hover:text-blue-900" data-ticket-id="${ticket.id}">Xem</button>
                    </td>
                </tr>
            `;
                    }).join('');
                },

                openDetailsModal(ticketId) {
                    const ticket = this.tickets.find(t => t.id == ticketId);
                    if (!ticket) return;

                    document.getElementById('ticket-user').textContent = ticket.user;
                    document.getElementById('ticket-subject').textContent = ticket.subject;
                    document.getElementById('ticket-description').textContent = ticket.description;

                    document.getElementById('ticket-details-modal')?.classList.remove('hidden');
                },

                closeDetailsModal() {
                    document.getElementById('ticket-details-modal')?.classList.add('hidden');
                }
            },
            support: {
                init() {
                    console.log('Support page loaded');
                    document.getElementById('support-ticket-form')?.addEventListener('submit', (e) => {
                        e.preventDefault();
                        alert('Ticket của bạn đã được gửi thành công! Đội ngũ hỗ trợ sẽ phản hồi trong thời gian sớm nhất.');
                        e.target.reset();
                    });
                }
            },
            profile: {
                init() {
                    console.log('Profile page loaded');

                    document.getElementById('profile-form')?.addEventListener('submit', (e) => this.handleProfileSubmit(e));
                    document.getElementById('password-form')?.addEventListener('submit', (e) => this.handlePasswordSubmit(e));
                    document.getElementById('toggle-mfa')?.addEventListener('click', () => this.toggleMfa());

                    // Cải tiến: Thiết lập trình nghe sự kiện cho quản lý ảnh đại diện
                    this.setupAvatarManagement();
                },

                setupAvatarManagement() {
                    const avatarUpload = document.getElementById('avatar-upload');
                    const avatarPreview = document.getElementById('avatar-preview');

                    if (avatarUpload && avatarPreview) {
                        avatarUpload.addEventListener('change', function (event) {
                            if (event.target.files && event.target.files[0]) {
                                const reader = new FileReader();
                                reader.onload = function () {
                                    avatarPreview.src = reader.result;
                                    // Gợi ý cho người dùng lưu lại
                                    alert('Ảnh xem trước đã được cập nhật. Nhấn "Lưu Thông tin" để xác nhận thay đổi.');
                                }
                                reader.readAsDataURL(event.target.files[0]);
                            }
                        });
                    }

                    // Gán hàm vào window để thẻ button có thể gọi
                    window.removeAvatar = () => {
                        if (confirm('Bạn có chắc muốn xóa ảnh đại diện?')) {
                            // Thay bằng đường dẫn ảnh mặc định của hệ thống
                            const defaultAvatarSrc = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
                            if (avatarPreview) avatarPreview.src = defaultAvatarSrc;
                            // Tại đây sẽ gọi API để xóa ảnh phía backend
                            alert('Đã xóa ảnh đại diện.');
                            console.log('Audit log: Removed own avatar (Level: MEDIUM)');
                        }
                    };
                },

                handleProfileSubmit(event) {
                    event.preventDefault();
                    const name = document.getElementById('profile-name').value;
                    if (!name) {
                        document.getElementById('profile-name-error').classList.remove('hidden');
                        return;
                    }
                    document.getElementById('profile-name-error').classList.add('hidden');
                    alert('Đã cập nhật thông tin hồ sơ!');
                    console.log('Audit log: Updated own profile (Level: LOW)');
                },

                handlePasswordSubmit(event) {
                    event.preventDefault();
                    const currentPassword = document.getElementById('current-password').value;
                    const newPassword = document.getElementById('new-password').value;
                    const confirmPassword = document.getElementById('confirm-password').value;

                    // Reset errors
                    document.getElementById('current-password-error').classList.add('hidden');
                    document.getElementById('new-password-error').classList.add('hidden');
                    document.getElementById('confirm-password-error').classList.add('hidden');

                    let isValid = true;
                    if (!currentPassword) {
                        document.getElementById('current-password-error').classList.remove('hidden');
                        isValid = false;
                    }
                    if (newPassword.length < 8) {
                        document.getElementById('new-password-error').classList.remove('hidden');
                        isValid = false;
                    }
                    if (newPassword !== confirmPassword) {
                        document.getElementById('confirm-password-error').classList.remove('hidden');
                        isValid = false;
                    }

                    if (isValid) {
                        alert('Đã đổi mật khẩu thành công!');
                        console.log('Audit log: Changed own password (Level: MEDIUM)');
                        event.target.reset();
                    }
                },

                toggleMfa() {
                    const statusEl = document.getElementById('mfa-status');
                    const btnEl = document.getElementById('toggle-mfa');
                    const qrEl = document.getElementById('mfa-qr-code');
                    const isEnabled = statusEl.textContent === 'Đã bật';

                    if (isEnabled) {
                        statusEl.textContent = 'Chưa bật';
                        statusEl.classList.remove('text-green-600');
                        statusEl.classList.add('text-red-600');
                        btnEl.textContent = 'Bật MFA';
                        qrEl.classList.add('hidden');
                        console.log('Audit log: Disabled own MFA (Level: HIGH)');
                    } else {
                        statusEl.textContent = 'Đã bật';
                        statusEl.classList.remove('text-red-600');
                        statusEl.classList.add('text-green-600');
                        btnEl.textContent = 'Tắt MFA';
                        qrEl.classList.remove('hidden');
                        console.log('Audit log: Enabled own MFA (Level: HIGH)');
                    }
                }
            },
        }
    };

    App.init();
});