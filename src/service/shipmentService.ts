import { CnabWriter } from "../lib/writer";
import { joinFile } from "../lib/line";
import { headerArquivo } from "../records/headerArquivo";
import { headerLotePagamentos } from "../records/headerLotePagamentos";
import { segmentoA_PIX } from "../records/segmentoA_Pix";
import { segmentoB_PIX } from "../records/segmentoB_Pix";
import { trailerLote } from "../records/trailerLote";
import { trailerArquivo } from "../records/trailerArquivo";
import { env } from "../env";

const tipoChaveMap = {
  cpf: "01",
  cnpj: "02",
  telefone: "03",
  email: "04",
  aleatoria: "05",
} as const;

type TipoChavePix = keyof typeof tipoChaveMap;

interface PagamentoPixDTO {
  nomeFavorecido: string;
  chavePix: string;
  tipoChavePix: TipoChavePix;
  valorCentavos: number;
  seuNumero: string;
  dataPagamento: string;
}

export function shipmentPix(nsa: number, pagamentos: PagamentoPixDTO[]) {
  const w = new CnabWriter();
  const hoje = new Date();

  w.add(
    headerArquivo({
      tipoInscricao: "2",
      inscricao: env.EMPRESA_CNPJ,
      convenio: env.BANCO_CONVENIO,
      agencia: env.BANCO_AGENCIA,
      agenciaDV: "0",
      conta: env.BANCO_CONTA,
      contaDV: env.BANCO_CONTA_DV,
      dvAgConta: "0",
      nomeEmpresa: env.EMPRESA_NOME,
      nomeBanco: "BANRISUL",
      dataGeracao: hoje,
      nsa,
      versaoLayoutArquivo: "101",
    })
  );

  w.nextLote();
  w.add(
    headerLotePagamentos({
      lote: w.lote,
      tipoServico: "20",
      formaLancamento: "45",
      tipoInscricao: "2",
      inscricao: env.EMPRESA_CNPJ,
      convenio: env.BANCO_CONVENIO,
      agencia: env.BANCO_AGENCIA,
      conta: env.BANCO_CONTA,
      contaDV: env.BANCO_CONTA_DV,
      nomeEmpresa: env.EMPRESA_NOME,
    })
  );

  for (const pagamento of pagamentos) {
    const seq = w.nextSeq();

    w.add(
      segmentoA_PIX({
        lote: w.lote,
        seqNoLote: seq,
        camara: "009",
        bancoFav: "000",
        agenciaFav: "00000",
        dvAgenciaFav: "0",
        contaFav: "000000000000",
        dvContaFav: "0",
        dvAgContaFav: "0",
        nomeFav: pagamento.nomeFavorecido,
        seuNumero: pagamento.seuNumero,
        dataPagamento: new Date(pagamento.dataPagamento),
        valor: pagamento.valorCentavos.toString().padStart(17, "0"),
      })
    );

    w.addValorAtual(pagamento.valorCentavos);

    const seqB = w.nextSeq();
    w.add(
      segmentoB_PIX({
        lote: w.lote,
        seqNoLote: seqB,
        formaIniciacao: tipoChaveMap[pagamento.tipoChavePix],
        tipoInscricao: ["cpf", "cnpj"].includes(pagamento.tipoChavePix)
          ? "1"
          : "",
        inscricao: ["cpf", "cnpj"].includes(pagamento.tipoChavePix)
          ? pagamento.chavePix.replace(/\D/g, "")
          : "",
        tipoContaRecebedor: "01",
        chavePix: pagamento.chavePix,
      })
    );
  }

  w.add(
    trailerLote({
      lote: w.lote,
      qtdRegistros: w.getQtdRegistrosDoLote(w.lote) + 1,
      somaValoresCentavos: w.getSomaValoresDoLote(w.lote),
    })
  );

  const linhasAntesDo9 = w.getLinhas();
  w.add(
    trailerArquivo({
      totalLotes: 1,
      totalRegistros: linhasAntesDo9.length + 1,
    }),
    { countInLote: false }
  );

  const arquivo = joinFile(w.getLinhas(), true);
  return arquivo;
}
