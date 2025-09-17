import { buildLine } from "../lib/line";
import { toAlfa, toNum, toDateDDMMAAAA } from "../lib/format";
import { BANCO_CODIGO } from "../banks/banrisul/constants";

/**
 * Header de Arquivo – Registro Tipo '0'
 * Banrisul – Contas a Pagar – CNAB 240 (FEBRABAN 10.11)
 * Campos principais: ver páginas 8–9 do manual Banrisul.
 */
export function headerArquivo(params: {
  tipoInscricao: "1" | "2"; // 1=CPF, 2=CNPJ
  inscricao: string; // CPF/CNPJ sem pontuação
  convenio: string; // 6 dígitos, informado pela agência
  agencia: string; // 5 dígitos (0AAAAA para Banrisul)
  agenciaDV?: string; // 1 dígito (Banrisul usa '0' constante)
  conta: string; // 12 dígitos
  contaDV: string; // 1 dígito
  dvAgConta?: string; // '0' ou branco
  nomeEmpresa: string; // 30
  nomeBanco?: string; // 30 (ex.: "BANRISUL")
  codigoRemessaRetorno?: "1" | "2"; // 1=Remessa, 2=Retorno (remessa=1)
  dataGeracao: Date; // DDMMAAAA
  horaGeracao?: string; // HHMMSS (default agora)
  nsa: number; // Número sequencial do arquivo (6)
  versaoLayoutArquivo?: string; // G019 - 3 dígitos (ex.: '101' para 10.1)*
  densidade?: string; // 5 dígitos (preencha '00000' se não usar)
  usoEmpresa?: string; // 20 caracteres
}) {
  const hhmmss =
    params.horaGeracao ??
    new Date().toTimeString().slice(0, 8).replace(/:/g, ""); // HHMMSS

  const f = [
    { type: "num", len: 3, value: BANCO_CODIGO }, // 001-003 G001
    { type: "num", len: 4, value: "0000" }, // 004-007 G002
    { type: "num", len: 1, value: "0" }, // 008-008 G003
    { type: "alfa", len: 9, value: "" }, // 009-017 G004
    { type: "num", len: 1, value: params.tipoInscricao }, // 018-018 G005
    { type: "num", len: 14, value: params.inscricao }, // 019-032 G006
    { type: "num", len: 6, value: params.convenio }, // 033-038 G007
    { type: "alfa", len: 14, value: "" }, // 039-052 (brancos)
    { type: "num", len: 5, value: params.agencia }, // 053-057 G008
    { type: "num", len: 1, value: params.agenciaDV ?? "0" }, // 058-058 G009
    { type: "num", len: 12, value: params.conta }, // 059-070 G010
    { type: "num", len: 1, value: params.contaDV }, // 071-071 G011
    { type: "alfa", len: 1, value: params.dvAgConta ?? "0" }, // 072-072 G012
    { type: "alfa", len: 30, value: params.nomeEmpresa }, // 073-102 G013
    { type: "alfa", len: 30, value: params.nomeBanco ?? "BANRISUL" }, // 103-132 G014
    { type: "alfa", len: 10, value: "" }, // 133-142 G004
    { type: "num", len: 1, value: params.codigoRemessaRetorno ?? "1" }, // 143-143 G015
    { type: "num", len: 8, value: toDateDDMMAAAA(params.dataGeracao) }, // 144-151 G016
    { type: "num", len: 6, value: hhmmss }, // 152-157 G017
    { type: "num", len: 6, value: params.nsa }, // 158-163 G018
    { type: "num", len: 3, value: params.versaoLayoutArquivo ?? "101" }, // 164-166 G019*
    { type: "num", len: 5, value: params.densidade ?? "00000" }, // 167-171 G020
    { type: "alfa", len: 9, value: "" }, // 172-180 G021 (mensagem consistência)
    { type: "alfa", len: 1, value: "" }, // 181-181
    { type: "alfa", len: 10, value: "" }, // 182-191 G059 (ocorrências retorno)
    { type: "alfa", len: 20, value: params.usoEmpresa ?? "" }, // 192-211 G022
    { type: "alfa", len: 29, value: "" }, // 212-240 G004
  ] as const;

  return buildLine(f as any);
}
