describe('Testes de Homologação - Tela de Login', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:5173')
  })


  it('Deve fazer o login com sucesso e ir para o Dashboard', () => {
     // Para realizar os testes, substituir pelos dados de um usuário que realmente exista no seu banco de dados
    cy.get('input').first().type('') 
    cy.get('input[type="password"]').type('')
    cy.contains('Entrar').click()
    cy.url().should('include', '/dashboard') 
  })
})