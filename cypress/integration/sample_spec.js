describe('The Home Page', () => {
    it('successfully loads', () => {
        cy.visit('http://localhost:1234/')
    })
    it('checks that the title is right', () => {
        cy.get('h2').contains('Add an item')
    })

    it('adds an item successfully', () => {
        cy.get('.DraftEditor-root').click()
    })
})
