const API_URL = "http://localhost:3001";

export async function buscarManutencoes() {
  const [manutencoesRes, equipamentosRes] =
    await Promise.all([
      fetch(`${API_URL}/manutencoes`),
      fetch(`${API_URL}/equipamentos`),
    ]);

  if (
    !manutencoesRes.ok ||
    !equipamentosRes.ok 
  ) {
    throw new Error(
      "Não foi possível carregar as manutenções."
    );
  }

  const manutencoes = await manutencoesRes.json();
  const equipamentos = await equipamentosRes.json();

  const manutencoesComEquipamento =
    manutencoes.map((manutencao) => {
      const equipamento = equipamentos.find(
        (equipamento) =>
          Number(equipamento.id) ===
          Number(manutencao.id_equipamento)
      );

      return {
        ...manutencao,
        nome: equipamento?.nome ?? "",
        patrimonio: equipamento?.patrimonio ?? "",
      };
    });

  return {
    manutencoes: manutencoesComEquipamento,
  };
}

export async function buscarEquipamentos() {
  const response = await fetch(
    `${API_URL}/equipamentos`
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar os equipamentos."
    );
  }

  return await response.json();
}

export async function concluirManutencao(id, statusFinal) {
  // Busca manutenção
  const manutencaoRes = await fetch(
    `${API_URL}/manutencoes/${id}`
  );

  if (!manutencaoRes.ok) {
    throw new Error("Manutenção não encontrada.");
  }

  const manutencao = await manutencaoRes.json();

  const dataConclusao = new Date().toISOString();

  // Atualiza manutenção
const response = await fetch(
  `${API_URL}/manutencoes/${id}`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      concluida: true,
      data_conclusao: dataConclusao,
    }),
  }
);

if (!response.ok) {
  throw new Error("Erro ao concluir manutenção.");
}

  // Atualiza objeto em memória
  manutencao.concluida = true;
  manutencao.data_conclusao = dataConclusao;

  // Atualiza status do equipamento
  await fetch(
    `${API_URL}/equipamentos/${manutencao.id_equipamento}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
      status: statusFinal,
      })
    }
  );

  return manutencao;
}

export async function excluirManutencao(id) {
  // Buscar manutenção
  const manutencaoRes = await fetch(
    `${API_URL}/manutencoes/${id}`
  );

  if (!manutencaoRes.ok) {
    throw new Error("Manutenção não encontrada.");
  }

  const manutencao = await manutencaoRes.json();

  // Equipamento volta para disponível
  await fetch(
    `${API_URL}/equipamentos/${manutencao.id_equipamento}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "Disponível",
      }),
    }
  );

  // Excluir manutenção
  const response = await fetch(
    `${API_URL}/manutencoes/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao excluir manutenção.");
  }
}

export async function salvarManutencao(manutencao) {
  const editar = !!manutencao.id;

  const body = editar
    ? manutencao
    : {
        ...manutencao,
        concluida: false,
        data_conclusao: null,
      };

  const response = await fetch(
    editar
      ? `${API_URL}/manutencoes/${manutencao.id}`
      : `${API_URL}/manutencoes`,
    {
      method: editar ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao salvar manutenção.");
  }

  const dados = await response.json();

  // Atualiza o status do equipamento
  if (!editar || !dados.concluida) {
    await fetch(
      `${API_URL}/equipamentos/${dados.id_equipamento}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Em Manutenção",
        }),
      }
    );
  }

  return dados;
}