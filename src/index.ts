import { env } from "./env";
import { CnabWriter } from "./lib/writer";
import { joinFile } from "./lib/line";
import { headerArquivo } from "./records/headerArquivo";
import { headerLotePagamentos } from "./records/headerLotePagamentos";
import { segmentoA_PIX } from "./records/segmentoA_Pix";
import { segmentoB_PIX } from "./records/segmentoB_Pix";
import { trailerLote } from "./records/trailerLote";
import { trailerArquivo } from "./records/trailerArquivo";
import { mkdirSync, writeFileSync } from "node:fs";

const hoje = new Date();
const w = new CnabWriter();

// 0 - Header de Arquivo
w.add(
  headerArquivo({
    tipoInscricao: "2",
    inscricao: env.EMPRESA_CNPJ!,
    convenio: env.BANCO_CONVENIO!,
    agencia: env.BANCO_AGENCIA!,
    agenciaDV: "0",
    conta: env.BANCO_CONTA!,
    contaDV: env.BANCO_CONTA_DV!,
    dvAgConta: "0",
    nomeEmpresa: env.EMPRESA_NOME!,
    nomeBanco: "BANRISUL",
    dataGeracao: hoje,
    nsa: 1,
    versaoLayoutArquivo: "101",
  })
);

// 1 - Header de Lote (PIX)
w.nextLote();
w.add(
  headerLotePagamentos({
    lote: w.lote,
    tipoServico: "20",
    formaLancamento: "45",
    tipoInscricao: "2",
    inscricao: env.EMPRESA_CNPJ!,
    convenio: env.BANCO_CONVENIO!,
    agencia: env.BANCO_AGENCIA!,
    conta: env.BANCO_CONTA!,
    contaDV: env.BANCO_CONTA_DV!,
    nomeEmpresa: env.EMPRESA_NOME!,
  })
);

// 3A + 3B (um pagamento de exemplo)
const seqA = w.nextSeq();
w.add(
  segmentoA_PIX({
    lote: w.lote,
    seqNoLote: seqA,
    camara: "009",
    bancoFav: "000",
    agenciaFav: "00000",
    dvAgenciaFav: "0",
    contaFav: "000000000000",
    dvContaFav: "0",
    dvAgContaFav: "0",
    nomeFav: "LUIS EDUARDO FORNARI",
    seuNumero: "03880901031",
    dataPagamento: hoje,
    valor: "0000000000001000", // 12,34
  })
);
// informe o valor em CENTAVOS aqui para alimentar o trailer de lote:
w.addValorAtual(1000);

w.add(
  segmentoB_PIX({
    lote: w.lote,
    seqNoLote: seqA + 1,
    formaIniciacao: "03",
    tipoInscricao: "1",
    inscricao: "03880901031",
    tipoContaRecebedor: "01",
    chavePix: "03880901031",
  })
);

// 5 - Trailer do Lote (inclua o próprio trailer na contagem: +1)
w.add(
  trailerLote({
    lote: w.lote,
    qtdRegistros: w.getQtdRegistrosDoLote(w.lote) + 1,
    somaValoresCentavos: w.getSomaValoresDoLote(w.lote),
  })
);

// 9 - Trailer do Arquivo (NÃO contar no lote!)
const linhasAntesDo9 = w.getLinhas();
w.add(
  trailerArquivo({
    totalLotes: 1,
    totalRegistros: linhasAntesDo9.length + 1, // +1 do próprio 9
  }),
  { countInLote: false }
);

const arquivo = joinFile(w.getLinhas(), true);
console.log(arquivo);

writeFileSync("remessa_banrisul_pix.txt", arquivo, { encoding: "latin1" });
