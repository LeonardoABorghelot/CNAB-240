import { buildLine } from "../lib/line";
import { BANCO_CODIGO } from "../banks/banrisul/constants";

export function trailerArquivo(params: {
  totalLotes: number;
  totalRegistros: number;
}) {
  const f = [
    { type: "num",  len: 3,  value: BANCO_CODIGO }, // 001-003
    { type: "num",  len: 4,  value: "9999" },       // 004-007
    { type: "num",  len: 1,  value: "9" },          // 008-008
    { type: "alfa", len: 9,  value: "" },           // 009-017
    { type: "num",  len: 6,  value: params.totalLotes },     // 018-023
    { type: "num",  len: 6,  value: params.totalRegistros }, // 024-029
    { type: "alfa", len: 211, value: "" },          // 030-240
  ] as const;

  return buildLine(f as any);
}
