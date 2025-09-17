import { CnabWriter } from "../src/lib/writer";
import { headerArquivo } from "../src/records/headerArquivo";
import { headerLotePagamentos } from "../src/records/headerLotePagamentos";
import { segmentoA_PIX } from "../src/records/segmentoA_Pix";
import { segmentoB_PIX } from "../src/records/segmentoB_Pix";
import { trailerLote } from "../src/records/trailerLote";
import { trailerArquivo } from "../src/records/trailerArquivo";
import { joinFile } from "../src/lib/line";
import { pos } from "./helpers";

test("lote com 2 pagamentos: trailer do lote e trailer do arquivo com totais corretos", () => {
  const hoje = new Date(2025, 0, 31);
  const w = new CnabWriter();

  // 0 - Header de Arquivo
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
    nsa: 77,
    versaoLayoutArquivo: "101",
  }));

  // 1 - Header de Lote (PIX)
  w.nextLote();
  w.add(headerLotePagamentos({
    lote: w.lote,
    tipoServico: "20",
    formaLancamento: "45",
    tipoInscricao: "2",
    inscricao: "12345678000199",
    convenio: "000123",
    agencia: "01234",
    conta: "000012345678",
    contaDV: "9",
    nomeEmpresa: "MINHA EMPRESA LTDA",
  }));

  // Pagamento #1 – 12,34
  const seq1 = w.nextSeq();
  w.add(segmentoA_PIX({
    lote: w.lote, seqNoLote: seq1, camara: "009",
    bancoFav: "041", agenciaFav: "01234", dvAgenciaFav: "0",
    contaFav: "000012345678", dvContaFav: "9", dvAgContaFav: "0",
    nomeFav: "FAV 1", seuNumero: "PGTO1", dataPagamento: hoje,
    valor: "000000000001234",
  }));
  w.addValorAtual(1234);
  w.add(segmentoB_PIX({
    lote: w.lote, seqNoLote: seq1 + 1,
    formaIniciacao: "05", tipoInscricao: "2", inscricao: "22345678000188",
    tipoContaRecebedor: "01", chavePix: "",
  }));

  // Pagamento #2 – 7,89 (por chave: zera dados bancários no 3A)
  const seq2 = w.nextSeq();
  w.add(segmentoA_PIX({
    lote: w.lote, seqNoLote: seq2, camara: "009",
    bancoFav: "000", agenciaFav: "00000", dvAgenciaFav: "0",
    contaFav: "000000000000", dvContaFav: "0", dvAgContaFav: "0",
    nomeFav: "", seuNumero: "PGTO2", dataPagamento: hoje,
    valor: "000000000000789",
  }));
  w.addValorAtual(789);
  w.add(segmentoB_PIX({
    lote: w.lote, seqNoLote: seq2 + 1,
    formaIniciacao: "01", // telefone
    chavePix: "+5551999999999",
  }));

  // 5 - Trailer do lote (inclui o próprio 5 na contagem: +1)
  const qtdRegistrosEsperada = w.getQtdRegistrosDoLote(w.lote) + 1; // header(1)+A/B(2x2)+5(1)=6
  const somaEsperada = w.getSomaValoresDoLote(w.lote);              // 1234 + 789 = 2023
  const l5 = trailerLote({
    lote: w.lote,
    qtdRegistros: qtdRegistrosEsperada,
    somaValoresCentavos: somaEsperada,
  });
  w.add(l5);

  // 9 - Trailer do arquivo (NÃO contar no lote)
  const linhasAntesDo9 = w.getLinhas();
  const totalLotes = 1;
  const totalRegistros = linhasAntesDo9.length + 1; // +1 do próprio 9
  const l9 = trailerArquivo({
    totalLotes,
    totalRegistros,
  });
  w.add(l9, { countInLote: false });

  const linhas = w.getLinhas();
  // Estrutura esperada: 0, 1, 3A1, 3B1, 3A2, 3B2, 5, 9 -> 8 linhas
  expect(linhas).toHaveLength(8);
  linhas.forEach(l => expect(l).toHaveLength(240));

  // Trailer do lote: tipo, quantidade e somatório em posições mapeadas
  const trailerL = linhas[6];
  expect(pos(trailerL!, 8, 8)).toBe("5");
  expect(pos(trailerL!, 18, 23)).toBe(qtdRegistrosEsperada.toString().padStart(6, "0"));
  expect(pos(trailerL!, 24, 41)).toBe("000000000000002023");

  // Trailer do arquivo: tipo, total de lotes e total de registros
  const trailerA = linhas[7];
  expect(pos(trailerA!, 8, 8)).toBe("9");
  expect(pos(trailerA!, 18, 23)).toBe(totalLotes.toString().padStart(6, "0"));
  expect(pos(trailerA!, 24, 29)).toBe(totalRegistros.toString().padStart(6, "0"));

  // Arquivo final válido (CRLF + ^Z)
  const arquivo = joinFile(linhas, true);
  expect(arquivo.endsWith("\r\n" + String.fromCharCode(0x1a))).toBe(true);
});
