import { buscarEquipamentos } from "../equipamentos/equipamentos.service";

export async function buscarCatalogo() {
  const equipamentos = await buscarEquipamentos();
  return { equipamentos };
}
