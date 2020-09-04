describe('The Home Page', () => {
    it('successfully loads', () => {
        cy.visit('http://localhost:1234/')
    })
    it('should create an item called hello', () => {
        cy.visit('http://localhost:1234/')
        cy.get('[data-cy=item-creator]').find('p').type('todo hello\n')
        assert.exists(cy.get('[data-cy=item-list]').children().contains('hello'))
    })
    it('should collapse the sidebar', () => {
        cy.visit('http://localhost:1234/')
        cy.get('[data-cy=sidebar-btn-container]').find('button').click()
        cy.get('[data-cy=sidebar-container]').invoke('outerWidth').should('be.eq', 50)
    })
    it('should collapse the sidebar', () => {
        cy.visit('http://localhost:1234/')
        cy.get('[data-cy=sidebar-btn-container]').find('button').click()
        cy.get('[data-cy=sidebar-btn-container]').find('button').click()
        cy.get('[data-cy=sidebar-container]').invoke('outerWidth').should('be.eq', 250)
    })
    it('should create expand the items container', () => {
        cy.visit('http://localhost:1234/')
        cy.get('[data-cy=item-creator]').find('p').type('todo hello\n')
    })
})
