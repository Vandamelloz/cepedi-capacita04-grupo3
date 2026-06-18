import * as React from 'react'
import { useState, useEffect } from 'react'
import TabelaGipar from '../../components/tabelaGipar/TabelaGipar'
import CabecalhoModulo from '../../components/cabecalhoModulo/CabecalhoModulo'
import CampoPesquisa from '../../components/Pesquisa/Pesquisa'

export default function Equipamentos() {
  // 1. Estados para os dados, carregamento e erros
  const [listaEquipamentos, setListaEquipamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  
  const [termoPesquisa, setTermoPesquisa] = useState('')
  const [statusSelecionado, setStatusSelecionado] = useState('')
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('')

  // 2. Função que faz a requisição para a API
  const buscarEquipamentos = async () => {
    try {
      setCarregando(true)
      const resposta = await fetch('http://localhost:3000/equipamentos')
      
      if (!resposta.ok) {
        throw new Error('Não foi possível carregar os dados do servidor.')
      }
      
      const dadosConvertidos = await resposta.json()
      setListaEquipamentos(dadosConvertidos)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    buscarEquipamentos()
  }, [])

  const categoriasDisponiveis = [...new Set(listaEquipamentos.map(e => e.categoria).filter(Boolean))]
  const statusDisponiveis = [...new Set(listaEquipamentos.map(e => e.status).filter(Boolean))]

  // 🔮 NOVO: Filtro combinado (texto + status + categoria)
  const equipamentosFiltrados = listaEquipamentos.filter((equipamento) => {
    const nome = (equipamento.nome || '').toLowerCase()
    const patrimonio = (equipamento.patrimonio || '').toLowerCase()
    const termo = termoPesquisa.toLowerCase()

    const bateTexto = nome.includes(termo) || patrimonio.includes(termo)
    const bateStatus = statusSelecionado === '' || equipamento.status === statusSelecionado
    const bateCategoria = categoriaSelecionada === '' || equipamento.categoria === categoriaSelecionada

    return bateTexto && bateStatus && bateCategoria
  })

  // Configuração das colunas
  const colunasEquipamentos = [
    { titulo: 'Nome do Equipamento', chave: 'nome', className: 'font-semibold text-gray-900' },
    { titulo: 'Categoria', chave: 'categoria', className: 'text-gray-500' },
    { titulo: 'Nº Patrimônio', chave: 'patrimonio', className: 'font-mono text-xs text-gray-600' },
    { 
      titulo: 'Status', 
      chave: 'status',
      render: (valor, linha) => {
        const cores = {
          'Disponível': 'bg-green-100 text-green-700',
          'Emprestado': 'bg-blue-100 text-blue-700',
          'Manutenção': 'bg-yellow-100 text-yellow-700'
        }
        const classeCor = cores[valor] || 'bg-gray-100 text-gray-700'
        return (
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${classeCor}`}>
            {valor}
          </span>
        )
      }
    },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto mt-6">
      <CabecalhoModulo 
        titulo="Equipamentos" 
        descricao="Visualize os equipamentos disponiveis"
      />

      <div className="mt-6 mb-6">
        <CampoPesquisa 
          termo={termoPesquisa} 
          setTermo={setTermoPesquisa}
          status={statusSelecionado} 
          setStatus={setStatusSelecionado}
          categoria={categoriaSelecionada} 
          setCategoria={setCategoriaSelecionada}
          listaCategorias={categoriasDisponiveis}
          listaStatus={statusDisponiveis}
        />
      </div>

      {/* 4. Renderização Condicional */}
      {carregando && (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          Carregando equipamentos do GIPAR...
        </div>
      )}

      {erro && (
        <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
          <strong>Erro:</strong> {erro}. Por favor, tente novamente mais tarde.
        </div>
      )}

    
      {!carregando && !erro && (
        <TabelaGipar 
          colunas={colunasEquipamentos} 
          dados={equipamentosFiltrados} 
          onEditar={(equip) => alert(`Editar id: ${equip.id}`)}
          onDeletar={(equip) => alert(`Deletar id: ${equip.id}`)}
        />
      )}
    </div>
  )
}