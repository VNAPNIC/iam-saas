describe('Authentication Flow', () => {
  // Mock data cho API response
  const MOCK_USER_DATA = {
    token: 'fake-jwt-token-string',
    user: {
      id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      email: 'test@example.com',
      full_name: 'Test User',
      tenant_id: 't1e2n3a4-n5t6-7890-1234-567890abcdef',
    },
  };

  context('Signup Flow', () => {
    beforeEach(() => {
      // Điều hướng đến trang đăng ký trước mỗi test
      cy.visit('/signup');
    });

    it('should allow a user to sign up successfully', () => {
      // Dùng cy.intercept để "bắt" và giả lập API call
      cy.intercept('POST', '/api/v1/auth/register', {
        statusCode: 201,
        body: {
          data: MOCK_USER_DATA,
          message: 'register_successful',
          error: null,
        },
      }).as('registerRequest');

      // Điền thông tin vào form
      cy.get('[data-testid="signup-tenant-name"]').type('My Test Company');
      cy.get('[data-testid="signup-full-name"]').type('Test User');
      cy.get('[data-testid="signup-email"]').type('test@example.com');
      cy.get('[data-testid="signup-password"]').type('password123');

      // Click nút submit
      cy.get('[data-testid="signup-submit-button"]').click();

      // Đợi cho API call được thực hiện
      cy.wait('@registerRequest');

      // Kiểm tra xem đã điều hướng đến đúng trang dashboard chưa
      cy.url().should('include', '/dashboard');
      
      // Kiểm tra xem localStorage có lưu token không (chứng tỏ đã login)
      cy.window().its('localStorage').invoke('getItem', 'auth-storage').should('exist');
    });

    it('should display an error message if email already exists', () => {
      // Giả lập backend trả về lỗi Conflict (409)
      cy.intercept('POST', '/api/v1/auth/register', {
        statusCode: 409,
        body: {
          data: null,
          message: 'email_already_exists',
          error: { code: 'CONFLICT', details: 'Email already exists' },
        },
      }).as('registerRequest');

      // Điền thông tin
      cy.get('[data-testid="signup-tenant-name"]').type('Another Company');
      cy.get('[data-testid="signup-full-name"]').type('Another User');
      cy.get('[data-testid="signup-email"]').type('existing@example.com');
      cy.get('[data-testid="signup-password"]').type('password123');
      
      // Submit
      cy.get('[data-testid="signup-submit-button"]').click();

      // Kiểm tra thông báo lỗi hiển thị đúng i18n key
      cy.get('[data-testid="signup-error"]').should('be.visible').and('contain.text', 'email_already_exists');
      
      // Đảm bảo vẫn ở trang signup
      cy.url().should('include', '/signup');
    });
  });

  context('Login & Logout Flow', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should allow an existing user to log in', () => {
      // Giả lập API login thành công
      cy.intercept('POST', '/api/v1/auth/login', {
        statusCode: 200,
        body: {
          data: MOCK_USER_DATA,
          message: 'login_successful',
          error: null,
        },
      }).as('loginRequest');
      
      // Điền thông tin login
      cy.get('[data-testid="login-email"]').type('test@example.com');
      cy.get('[data-testid="login-password"]').type('password123');

      // Submit
      cy.get('[data-testid="login-submit-button"]').click();

      cy.wait('@loginRequest');

      // Kiểm tra đã điều hướng đến dashboard
      cy.url().should('include', '/dashboard');
    });
    
    it('should allow a logged-in user to log out', () => {
      // Giả lập trạng thái đã đăng nhập bằng cách set token trong localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('auth-storage', JSON.stringify({
          state: {
            user: MOCK_USER_DATA.user,
            token: MOCK_USER_DATA.token,
            isAuthenticated: true,
          },
          version: 0,
        }));
      });
      
      // Truy cập trang dashboard (nơi có nút logout)
      cy.visit('/dashboard');
      
      // Mở menu người dùng và click nút logout
      // Giả định nút logout nằm trong Header và có data-testid
      cy.get('[data-testid="user-menu-button"]').click(); // Cần thêm test-id này vào Header.tsx
      cy.get('[data-testid="logout-button"]').click();   // Cần thêm test-id này vào Header.tsx
      
      // Kiểm tra đã điều hướng về trang login
      cy.url().should('include', '/login');
      
      // Kiểm tra token đã bị xóa khỏi localStorage
      cy.window().its('localStorage').invoke('getItem', 'auth-storage').should('not.exist');
    });
  });
});