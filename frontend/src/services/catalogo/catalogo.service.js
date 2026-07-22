import { buscarEquipamentos } from "../Equipamentos/equipamentos.service";

export async function buscarCatalogo() {
  const equipamentos = await buscarEquipamentos();
  return { equipamentos };
}
