import { buildLine } from "../lib/line";
import { BANCO_CODIGO } from "../banks/banrisul/constants";

export function trailerLote(params: {
  lote: number;
  qtdRegistros: number;              // total do lote (inclui header e trailer)
  somaValoresCentavos?: number | string; // somatório em centavos (18 dígitos)
}) {
  const soma = (params.somaValoresCentavos ?? 0).toString().replace(/\D/g, "");
  const f = [
    { type: "num",  len: 3,  value: BANCO_CODIGO },   // 001-003
    { type: "num",  len: 4,  value: params.lote },     // 004-007
    { type: "num",  len: 1,  value: "5" },            // 008-008
    { type: "alfa", len: 9,  value: "" },             // 009-017
    { type: "num",  len: 6,  value: params.qtdRegistros },     // 018-023
    { type: "num",  len: 18, value: soma },                     // 024-041 (centavos)
    { type: "alfa", len: 199, value: "" },            // 042-240
  ] as const;

  return buildLine(f as any);
}