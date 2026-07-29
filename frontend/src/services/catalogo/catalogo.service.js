// ================================================================
// catalogo.service.js - Catálogo de Equipamentos (FastAPI)
// ================================================================

import { buscarEquipamentos } from "../equipamentos/equipamentos.service";

/**
 * Busca todos os equipamentos para o catálogo
 */
export async function buscarCatalogo() {
  const equipamentos = await buscarEquipamentos();
  return { equipamentos };
}