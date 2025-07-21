// frontend/cypress/support/commands.ts

/// <reference types="cypress" />

// -- Đây là một parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
// -- Đây là một child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
// -- Đây là một dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
// -- Lệnh này sẽ ghi đè một lệnh đã có --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })