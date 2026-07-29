from seguranca import verificar_senha 

def test_verificar_senha_deve_retornar_true_para_senha_correta():
    # Utilizar um hash real do banco
    senha_plana = "admin123"
    hash_correto = "" 
    
    assert verificar_senha(senha_plana, hash_correto) == True
    