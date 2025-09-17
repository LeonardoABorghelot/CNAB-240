import { CnabWriter } from "../src/lib/writer";
import { headerArquivo } from "../src/records/headerArquivo";
import { headerLotePagamentos } from "../src/records/headerLotePagamentos";
import { segmentoA_PIX } from "../src/records/segmentoA_Pix";
import { segmentoB_PIX } from "../src/records/segmentoB_Pix";
import { trailerLote } from "../src/records/trailerLote";
import { trailerArquivo } from "../src/records/trailerArquivo";
import { pos } from "./helpers";

test("trailer de lote e trailer de arquivo preenchem totais nas posições mapeadas", () => {
  const hoje = new Date(2025, 0, 31);
  const w = new CnabWriter();

  // 0
  w.add(headerArquivo({
    tipoInscricao: "2",
    inscricao: "12345678000199",
    convenio: "000123",
    agencia: "01234",
    agenciaDV: "0",
    conta: "000012345678",
    contaDV: "9",
    dvAgConta: "0",
    nomeEmpresa: "MINHA EMPRESA LTDA",
    nomeBanco: "BANRISUL",
    dataGeracao: hoje,
    nsa: 99,
    versaoLayoutArquivo: "101",
  }));

  // 1
  w.nextLote();
  w.add(headerLotePagamentos({
    lote: w.lote, tipoServico: "20", formaLancamento: "45",
    tipoInscricao: "2", inscricao: "12345678000199",
    convenio: "000123", agencia: "01234",
    conta: "000012345678", contaDV: "9", nomeEmpresa: "MINHA EMPRESA LTDA",
  }));

  // 3A + 3B (12,34)
  const seq = w.nextSeq();
  w.add(segmentoA_PIX({
    lote: w.lote, seqNoLote: seq, camara: "009",
    bancoFav: "041", agenciaFav: "01234", dvAgenciaFav: "0",
    contaFav: "000012345678", dvContaFav: "9", dvAgContaFav: "0",
    nomeFav: "FAV", seuNumero: "DOC", dataPagamento: hoje,
    valor: "000000000001234",
  }));
  w.addValorAtual(1234);
  w.add(segmentoB_PIX({
    lote: w.lote, seqNoLote: seq + 1, formaIniciacao: "05",
    tipoInscricao: "2", inscricao: "22345678000188",
    tipoContaRecebedor: "01", chavePix: "",
  }));

  // 5
  const qtdRegistrosEsperada = w.getQtdRegistrosDoLote(w.lote) + 1; // header(1) + 3A/3B(...) + trailer(1)
  const l5 = trailerLote({
    lote: w.lote,
    qtdRegistros: qtdRegistrosEsperada,
    somaValoresCentavos: w.getSomaValoresDoLote(w.lote), // em centavos
  });
  w.add(l5);

// 9) Trailer do Arquivo — NÃO contar no lote
  const linhasAntesDo9 = w.getLinhas();                // pegue o total ANTES de adicionar o 9
  const totalLotes = 1;
  const totalRegistros = linhasAntesDo9.length + 1;    // +1 do próprio 9

  const l9 = trailerArquivo({ totalLotes, totalRegistros });
  w.add(l9, { countInLote: false }); 

  const linhas = w.getLinhas();
  const trailerL = linhas[linhas.length - 2]; // penúltima
  const trailerA = linhas[linhas.length - 1]; // última

  // Trailer de Lote: posições
  expect(trailerL).toHaveLength(240);
  expect(pos(trailerL!, 8, 8)).toBe("5");
  expect(pos(trailerL!, 18, 23)).toBe((w.getQtdRegistrosDoLote(w.lote)).toString().padStart(6, "0")); // atenção: este é o valor passado (sem +1 aqui; já somamos ao criar)
  expect(pos(trailerL!, 24, 41)).toBe("000000000000001234");

  // Trailer de Arquivo: posições
  expect(trailerA).toHaveLength(240);
  expect(pos(trailerA!, 8, 8)).toBe("9");
  expect(pos(trailerA!, 18, 23)).toBe(totalLotes.toString().padStart(6, "0"));
  expect(pos(trailerA!, 24, 29)).toBe(totalRegistros.toString().padStart(6, "0"));
});
