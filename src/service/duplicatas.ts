import { knex } from "../database";

export async function listarDuplicatas(dataInicial: string, dataFinal: string) {
  const duplicatas = await knex("V_PG_DEB as v")
    .join("PG_FORN as f", "v.CD_FORN", "f.CD_FORN")
    .select(
      "v.RZ_FORN as nomeFavorecido",
      "f.CGC_CPF as chavePix",
      "v.VLR_DP as valor",
      "v.DT_VENCTO as dataPagamento",
      "f.TEL",
      "f.EMAIL",
      "v.CD_CTR as seuNumero"
    )
    .whereBetween("v.DT_VENCTO", [dataInicial, dataFinal])
    .whereIn("v.STS_DP", [0, 2, 5]);

  return duplicatas;
}
