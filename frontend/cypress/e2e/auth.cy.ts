describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/api/v1/auth/register').as('registerRequest'); // Sửa URL
    cy.intercept('POST', '**/api/v1/auth/login').as('loginRequest');
    cy.window().then((win) => {
      win.localStorage.setItem('ui-storage', JSON.stringify({ state: { language: 'en' }, version: 0 }));
    });
  });

  context('Signup Flow', () => {
    it('should allow a user to sign up successfully', () => {
      cy.visit('/signup');
      const uniqueEmail = `test.user.${Date.now()}@example.com`;
      cy.get('[data-testid="signup-tenant-name"]').type('My Test Company');
      cy.get('[data-testid="signup-full-name"]').type('Test User');
      cy.get('[data-testid="signup-email"]').type(uniqueEmail);
      cy.get('[data-testid="signup-password"]').type('password123');
      cy.get('[data-testid="signup-confirm-password"]').type('password123');
      cy.get('[data-testid="signup-submit-button"]').click();
      cy.wait('@registerRequest').then((interception) => {
        console.log('Register response:', interception.response);
      });
      cy.wait('@registerRequest').its('response.statusCode').should('eq', 201);
      cy.get('div[role="status"]').contains('Account created successfully!').should('be.visible');
      cy.url().should('include', '/login');
    });

    it('should display an error message if email already exists', () => {
      cy.intercept('POST', '**/api/v1/auth/register', {
        statusCode: 409,
        body: { message: 'email_already_exists', error: { code: 'EMAIL_ALREADY_EXISTS', details: null } }
      }).as('registerConflictRequest');
      cy.visit('/signup');
      cy.get('[data-testid="signup-tenant-name"]').type('Another Company');
      cy.get('[data-testid="signup-full-name"]').type('Another User');
      cy.get('[data-testid="signup-email"]').type('existing@example.com');
      cy.get('[data-testid="signup-password"]').type('password123');
      cy.get('[data-testid="signup-confirm-password"]').type('password123');
      cy.get('[data-testid="signup-submit-button"]').click();
      cy.get('[data-testid="signup-error"]').should('be.visible').and('contain.text', 'Email already in use.');
      cy.url().should('include', '/signup');
    });
  });

  context('Login & Logout Flow', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/api/v1/auth/login', {
        statusCode: 200,
        body: {
          data: {
            accessToken: 'fake-jwt-token',
            user: { id: '1', email: 'test@example.com', name: 'Test User', tenantId: '1' }
          },
          message: 'login_successful'
        }
      }).as('loginRequest');
      cy.window().then((win) => {
        win.localStorage.setItem('ui-storage', JSON.stringify({ state: { language: 'en' }, version: 0 }));
      });
    });

    it('should allow an existing user to log in', () => {
      cy.visit('/login');
      cy.get('[data-testid="login-email"]').type('test@example.com');
      cy.get('[data-testid="login-password"]').type('password123');
      cy.get('[data-testid="login-submit-button"]').click();
      cy.wait('@loginRequest');
      cy.url().should('include', '/dashboard');
      cy.window().its('localStorage').invoke('getItem', 'auth-storage').should('exist');
    });

    it('should allow a logged-in user to log out', () => {
      const authState = {
        state: { user: { id: '1', email: 'test@example.com', name: 'Test User', tenantId: '1' }, token: 'fake-jwt-token', isAuthenticated: true },
        version: 0
      };
      cy.window().its('localStorage').invoke('setItem', 'auth-storage', JSON.stringify(authState));
      cy.visit('/dashboard');
      cy.get('[data-testid="sidebar-user-menu-button"]').click({ multiple: true }); // Thêm multiple: true
      cy.get('[data-testid="sidebar-logout-button"]').click();
      cy.url().should('include', '/login');
      cy.window().its('localStorage').invoke('getItem', 'auth-storage').should('not.exist');
    });
  });
});