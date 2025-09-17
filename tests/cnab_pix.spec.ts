import { buildLine, joinFile } from "../src/lib/line";
import { pos } from "./helpers";

// teste 1: uma linha qualquer com 240 colunas
test("buildLine retorna 240 colunas", () => {
  const l = buildLine([{ type: "alfa", len: 240, value: "X" }]);
  expect(l).toHaveLength(240);
  expect(l[0]).toBe("X");            // primeira coluna
  expect(l[239]).toBe(" ");          // última é espaço (porque padEnd)
});

// teste 2: fim de arquivo CRLF + ^Z
test("joinFile finaliza com CRLF + ^Z", () => {
  const body = joinFile(["a".repeat(240)], true);
  expect(body.endsWith("\r\n" + String.fromCharCode(0x1a))).toBe(true);
});

// (Exemplo) Se você já tiver headerArquivo:
import { headerArquivo } from "../src/records/headerArquivo";

test("headerArquivo: banco 041, lote 0000, tipo 0", () => {
  const hoje = new Date();
  const l = headerArquivo({
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
    nsa: 1,
    versaoLayoutArquivo: "101",
  });
  expect(l).toHaveLength(240);
  expect(pos(l, 1, 3)).toBe("041");   // código do banco
  expect(pos(l, 4, 7)).toBe("0000");  // lote do arquivo
  expect(pos(l, 8, 8)).toBe("0");     // tipo registro
});
