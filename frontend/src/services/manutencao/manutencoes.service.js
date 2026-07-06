import {
  MANUTENCOES_CONFIG,
  MOCK_MANUTENCOES,
  MOCK_EQUIPAMENTOS,
  MOCK_NOTIFICACOES_MANUTENCOES,
} from "../../mocks/manutencoes.mock";

function aguardar(ms) {

  if (!ms || ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function formatarData(dataIso) {

  if (!dataIso) {
    return "";
  }

  return new Date(dataIso)
    .toLocaleDateString("pt-BR", {
      timeZone: "UTC",
    });
}

function prepararManutencoes(
  manutencoes
) {

  return manutencoes.map(
    (manutencao) => ({
      ...manutencao,

      dataAberturaFormatada:
        formatarData(
          manutencao.data_abertura
        ),

      dataConclusaoFormatada:
        formatarData(
          manutencao.data_conclusao
        ),
    })
  );
}

/**
 * Camada de acesso às manutenções.
 * Hoje usa mocks.
 * Futuramente trocar por API.
 */

export async function buscarManutencoes({
  simularErro = false,
  simularVazio = false,
} = {}) {

  await aguardar(
    MANUTENCOES_CONFIG.simulateLoadingMs
  );

  if (simularErro) {

    throw new Error(
      "Não foi possível carregar as manutenções."
    );
  }

  if (simularVazio) {

    return {
      manutencoes: [],
      notificacoes: [],
    };
  }

  return {
    manutencoes:
      prepararManutencoes(
        MOCK_MANUTENCOES
      ),

    notificacoes:
      MOCK_NOTIFICACOES_MANUTENCOES.map(
        (notificacao) => ({
          ...notificacao,
        })
      ),
  };
}   

export async function buscarEquipamentos() {

  await aguardar(
    MANUTENCOES_CONFIG.simulateLoadingMs
  );

  return MOCK_EQUIPAMENTOS.map(
    (equipamento) => ({
      ...equipamento,
    })
  );
}

export async function concluirManutencao(
  id
) {

  await aguardar(300);

  const manutencao =
    MOCK_MANUTENCOES.find(
      (item) => item.id === id
    );

  if (!manutencao) {

    throw new Error(
      "Manutenção não encontrada."
    );
  }

  manutencao.concluida = true;

  manutencao.data_conclusao =
    new Date().toISOString();

  return {
    ...manutencao,

    dataConclusaoFormatada:
      formatarData(
        manutencao.data_conclusao
      ),
  };
}

export async function salvarManutencao(
  manutencao
) {

  await aguardar(300);

  // edição
  if (manutencao.id) {

    const index =
      MOCK_MANUTENCOES.findIndex(
        (m) => m.id === manutencao.id
      );

    if (index === -1) {

      throw new Error(
        "Manutenção não encontrada."
      );
    }

    MOCK_MANUTENCOES[index] = {
      ...MOCK_MANUTENCOES[index],
      ...manutencao,
    };

    return prepararManutencoes([
      MOCK_MANUTENCOES[index],
    ])[0];
  }

  // cadastro
  const novaManutencao = {
    ...manutencao,

    id:
      MOCK_MANUTENCOES.length + 1,

    concluida: false,

    data_conclusao: null,
  };

  MOCK_MANUTENCOES.push(
    novaManutencao
  );

  return prepararManutencoes([
    novaManutencao,
  ])[0];
}