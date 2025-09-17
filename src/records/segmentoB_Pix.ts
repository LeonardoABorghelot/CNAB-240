import { buildLine } from "../lib/line";
import { toAlfa, toNum } from "../lib/format";
import { BANCO_CODIGO } from "../banks/banrisul/constants";

/**
 * Segmento 'B' – PIX (detalhe complementar)
 * Ver páginas 16–17. Este registro vem logo após o 3A (mesmo pagamento).
 */
export function segmentoB_PIX(params: {
  lote: number;
  seqNoLote: number; // sequência do registro no lote (3B = 3A + 1)
  formaIniciacao: "01" | "02" | "03" | "04" | "05"; // 01=Tel, 02=Email, 03=CPF/CNPJ, 04=Aleatória, 05=Dados Bancários
  tipoInscricao: "1" | "2" | ""; // obrigatório quando 03 ou 05
  inscricao?: string; // obrigatório quando 03 ou 05
  txid?: string; // 35, opcional
  tipoContaRecebedor?: "01" | "02" | "03"; // 01 CC, 02 Conta Pagamento, 03 Poupança (obrigatório se forma=05)
  codComplOcorrencia?: string; // 4 (retornos PIX rejeitados – opcional na remessa)
  chavePix?: string; // até 99 (telefone c/ +55..., e-mail, aleatória minúsculas)
  ispbDestino?: string; // 8 dígitos – obrigatório se usou câmara 888 no 3A
}) {
  const f = [
    { type: "num", len: 3, value: BANCO_CODIGO }, // 001-003
    { type: "num", len: 4, value: params.lote }, // 004-007
    { type: "num", len: 1, value: "3" }, // 008-008
    { type: "num", len: 5, value: params.seqNoLote }, // 009-013
    { type: "alfa", len: 1, value: "B" }, // 014-014
    { type: "alfa", len: 3, value: params.formaIniciacao }, // 015-017 (alinhado à esquerda)
    { type: "num", len: 1, value: params.tipoInscricao ?? "0" }, // 018-018
    { type: "num", len: 14, value: params.inscricao ?? "" }, // 019-032
    { type: "alfa", len: 35, value: params.txid ?? "" }, // 033-067 (TXID opcional)
    // 068-123 – “Tipo de conta do recebedor” em 56 posições, numérico à esquerda com brancos à direita
    { type: "alfa", len: 56, value: params.tipoContaRecebedor ?? "" }, // 068-123
    { type: "num", len: 4, value: params.codComplOcorrencia ?? "" }, // 124-127 (retorno)
    { type: "alfa", len: 99, value: params.chavePix ?? "" }, // 128-226 (chave PIX)
    { type: "alfa", len: 6, value: "" }, // 227-232 (SIAPE)
    { type: "num", len: 8, value: params.ispbDestino ?? "" }, // 233-240 (ISPB – obrigatório com câmara 888)
  ] as const;

  return buildLine(f as any);
}
