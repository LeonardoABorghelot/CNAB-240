import { BANCO_CODIGO } from "../banks/banrisul/constants";
import { knex } from "../database";

export async function listPayments(dataInicial: string, dataFinal: string) {
  const payments = await knex("V_PG_DEB as v")
    .join("PG_FORN as f", "v.CD_FORN", "f.CD_FORN")
    .select(
      "v.RZ_FORN as nomeFavorecido",
      "v.CD_PG_CRED as cd_pg_cred",
      "v.CD_FILIAL as cd_filial",
      "f.CGC_CPF as chavePix",
      "v.VLR_DP as valor",
      "v.VLR_DESC",
      "v.VLR_JUROS",
      "v.VLR_IMP",
      "v.VLR_DEVOLUCAO",
      "v.DT_VENCTO as dataPagamento",
      "f.TEL",
      "f.EMAIL",
      "v.CD_PG_CRED as seuNumero"
    )
    .whereBetween("v.DT_VENCTO", [dataInicial, dataFinal])
    .whereIn("v.STS_DP", [0, 2, 5]);

  return payments;
}

export async function insertPayments(
  cd_usu: string,
  dt_agendamento: Date,
  selecionados: {
    cd_pg_cred: number;
    cd_filial: number;
    vlr_saldo: number;
    vlr_desc: number;
    vlr_juros: number;
    vlr_imp: number;
    vlr_devolucao: number;
  }[]
) {
  return await knex.transaction(async (trx) => {
    const dataAtual = new Date();
    const dt_cad = dataAtual.toISOString().slice(0, 10);

    const ddmm = `${dataAtual.getDate().toString().padStart(2, "0")}${(dataAtual.getMonth() + 1).toString().padStart(2, "0")}`;

    const countResult = await trx("PG_DEB_PAGFOR_LOTE")
      .where("dt_cad", dt_cad)
      .count("* as total");

    const sequencia = ((countResult[0]?.total as number) ?? 0) + 1;
    const sufixo = sequencia.toString();

    const nm_arq_rem = `C:\\CNAB\\PAGAR\\REMESSA\\BANRISUL${ddmm}${sufixo}.TXT`;

    const result = await trx("PG_DEB_PAGFOR_LOTE")
      .max("nr_arquivo as maxNrArquivo")
      .first();
    const maxNrArquivo = result?.maxNrArquivo ?? 0;
    const nr_arquivo = (maxNrArquivo || 0) + 1;

    const insertLote = await trx("PG_DEB_PAGFOR_LOTE").insert({
      cd_emp: 1,
      cd_bc: BANCO_CODIGO,
      cd_cnt: 11,
      nr_arquivo: nr_arquivo,
      situacao: "A",
      dt_agendamento: dt_agendamento,
      opc_bloqueio: "S",
      tp_servico: 20,
      forma_lancto: 0,
      cd_usu: cd_usu,
      dt_cad: dt_cad,
      nm_arq_rem: nm_arq_rem,
      nm_arq_ret: null,
      sts_lote: 0,
    });

    const insertsControle = selecionados.map((item) => ({
      cd_emp: 1,
      cd_bc: BANCO_CODIGO,
      cd_filial: item.cd_filial,
      nr_arquivo: nr_arquivo,
      cd_pg_cred: item.cd_pg_cred,
      sequencia: 0,
      situacao: "R",
      nr_lote: 1,
      vlr_saldo: item.vlr_saldo,
      vlr_desc: item.vlr_desc,
      vlr_juros: item.vlr_juros,
      vlr_imp: item.vlr_imp,
      vlr_devolucao: item.vlr_devolucao,
      dt_cad: new Date().toISOString().slice(0, 10),
      cd_usu: cd_usu,
      cd_cnt: 11,
    }));

    await trx("PG_DEB_PAGFOR_CONTROLE").insert(insertsControle);

    const resultCtr = await trx("PG_CRED_HIST")
      .max("cd_ctr as maxCdCtr")
      .first();
    const maxCdCtr = resultCtr?.maxCdCtr ?? 0;
    const cd_ctr = (maxCdCtr || 0) + 1;

    const insertsHistorico = selecionados.map((item) => ({
      cd_emp: 1,
      cd_filial: item.cd_filial,
      cd_ctr: cd_ctr,
      cd_pg_cred: item.cd_pg_cred,
      hist: "REMESSA AGENDAMENTO",
      dt_hist: dt_agendamento,
      cd_usu: cd_usu,
      cd_bc: BANCO_CODIGO,
      nr_arquivo: nr_arquivo,
      cd_ocorr: 0,
    }));

    await trx("PG_CRED_HIST").insert(insertsHistorico);

    const updates = selecionados.map((item) =>
      trx("PG_CRED")
        .where({
          CD_PG_CRED: item.cd_pg_cred,
          CD_FILIAL: item.cd_filial,
        })
        .update({ STS_DP: 5 })
    );

    await Promise.all(updates);

    return {
      insertedId: insertLote[0],
      nr_arquivo,
      nm_arq_rem,
      totalPagamentos: selecionados.length,
    };
  });
}
