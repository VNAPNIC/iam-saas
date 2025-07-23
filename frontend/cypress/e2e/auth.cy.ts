describe('Authentication and UI Features', () => {

  beforeEach(() => {
    // We still intercept to control API responses during tests
    cy.intercept('POST', '**/public/login').as('loginRequest');
    cy.intercept('POST', '**/public/register').as('registerRequest');
    cy.intercept('POST', '**/public/forgot-password').as('forgotPasswordRequest');
  });

  context('Login Flow', () => {
    it('should show an error for invalid credentials', () => {
      cy.intercept('POST', '**/public/login', {
        statusCode: 401,
        body: { message: 'login_failed' },
      }).as('failedLogin');

      cy.visit('/login');
      cy.get('#email').type('wrong@example.com');
      cy.get('#password').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      cy.wait('@failedLogin');
      cy.get('[data-testid=error-message]').should('be.visible');
    });

    it('should login successfully and redirect', () => {
      cy.intercept('POST', '**/public/login', {
        statusCode: 200,
        body: { data: { token: 'fake-jwt-token' } },
      }).as('successfulLogin');
      // Also mock the /me call that happens after login
      cy.intercept('GET', '**/protected/me', {
        statusCode: 200,
        body: { data: { id: 1, name: 'Test User', email: 'test@example.com' } },
      }).as('getMe');

      cy.visit('/login');
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();
      cy.wait('@successfulLogin');
      cy.wait('@getMe');
      cy.url().should('include', '/dashboard');
    });
  });

  context('Signup Flow', () => {
    it('should show a client-side error if passwords do not match', () => {
      cy.visit('/signup');
      cy.get('#name').type('Test User');
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('password123');
      cy.get('#confirmPassword').type('password1234'); // Mismatched password
      cy.get('button[type="submit"]').click();
      
      // No network request should be made
      cy.get('@registerRequest.all').should('have.length', 0);
      cy.get('[data-testid=error-message]').should('be.visible').and('contain.text', 'Passwords do not match');
    });

    it('should register a new user and show success alert', () => {
      cy.intercept('POST', '**/public/register', {
        statusCode: 201,
        body: { message: 'register_successful' },
      }).as('successfulRegister');

      // Handle the alert pop-up
      const alertStub = cy.stub();
      cy.on('window:alert', alertStub);

      cy.visit('/signup');
      cy.get('#name').type('New User');
      cy.get('#email').type(`new_user_${Date.now()}@example.com`);
      cy.get('#password').type('password123');
      cy.get('#confirmPassword').type('password123');
      cy.get('#tenantName').type('New Company');
      cy.get('button[type="submit"]').click();
      cy.wait('@successfulRegister').then(() => {
        expect(alertStub.getCall(0)).to.be.calledWith('Registration successful! Please check your email for verification.');
      });
      cy.url().should('include', '/login');
    });
  });

  context('Forgot Password Flow', () => {
    it('should show a success message after submitting', () => {
      cy.intercept('POST', '**/public/forgot-password', {
        statusCode: 200,
      }).as('forgotPassword');

      cy.visit('/forgot-password');
      cy.get('#email').type('user@example.com');
      cy.get('button[type="submit"]').click();
      cy.wait('@forgotPassword');
      cy.get('p').should('contain.text', 'If your email exists in our system');
    });
  });

  context('UI Features', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should toggle dark mode correctly', () => {
      cy.get('body').should('not.have.class', 'dark-mode');
      cy.get('[data-testid=theme-toggle]').click();
      cy.get('body').should('have.class', 'dark-mode');
      cy.get('[data-testid=theme-toggle]').click();
      cy.get('body').should('not.have.class', 'dark-mode');
    });

    it('should switch language correctly', () => {
      cy.get('h1').should('contain.text', 'IAM SaaS');
      cy.get('select').select('vi');
      cy.get('p').should('contain.text', 'Chào mừng trở lại!');
      cy.get('select').select('en');
      cy.get('p').should('contain.text', 'Welcome back!');
    });
  });

});