import { buildLine } from "../lib/line";
import { toAlfa, toNum, toDateDDMMAAAA } from "../lib/format";
import { BANCO_CODIGO } from "../banks/banrisul/constants";

/**
 * Segmento 'A' – Detalhe pagamento (inclui PIX)
 * Regras PIX (forma 45): ver páginas 12–14.
 */
export function segmentoA_PIX(params: {
  lote: number;
  seqNoLote: number;                  // sequência do registro no lote (3A)
  tipoMovimento?: "0" | "5" | "9";    // TED/PIX aceitam 0 ou 9 (default '0')
  instrucao?: "00" | "19" | "99";     // PIX aceita 00 ou 99 (default '00')
  camara?: "009" | "888";             // 009 ou 888 (PIX)
  bancoFav?: string;                  // 3 dígitos; zeros quando PIX por chave != dados bancários
  agenciaFav?: string;                // 5 (ou zeros conforme regra)
  dvAgenciaFav?: string;              // 1
  contaFav?: string;                  // 12 (ver regras para 45)
  dvContaFav?: string;                // 1
  dvAgContaFav?: string;              // 1 ('0' ou branco)
  nomeFav?: string;                   // 30 (opcional quando PIX não é por dados bancários)
  seuNumero?: string;                 // 20
  dataPagamento: Date;                // DDMMAAAA
  valor: number | string;             // 15, sem pontuação
  informacao2?: string;               // 40
  finalidadeTED?: string;             // 5 (quando usar TED; para PIX deixe branco)
  finalidadeComplementar?: string;    // 2 (opcional)
  zero230?: "0";                      // posição 230 é zero
}) {
  const f = [
    { type: "num",  len: 3,  value: BANCO_CODIGO },             // 001-003
    { type: "num",  len: 4,  value: params.lote },               // 004-007
    { type: "num",  len: 1,  value: "3" },                       // 008-008
    { type: "num",  len: 5,  value: params.seqNoLote },          // 009-013
    { type: "alfa", len: 1,  value: "A" },                       // 014-014
    { type: "num",  len: 1,  value: params.tipoMovimento ?? "0" }, // 015-015
    { type: "num",  len: 2,  value: params.instrucao ?? "00" },  // 016-017
    { type: "num",  len: 3,  value: params.camara ?? "009" },    // 018-020 P001 (PIX: 009/888)
    { type: "num",  len: 3,  value: params.bancoFav ?? "000" },  // 021-023 P002
    { type: "num",  len: 5,  value: params.agenciaFav ?? "00000" }, // 024-028 G008
    { type: "num",  len: 1,  value: params.dvAgenciaFav ?? "0" },// 029-029 G009
    { type: "num",  len: 12, value: params.contaFav ?? "000000000000" }, // 030-041 G010
    { type: "num",  len: 1,  value: params.dvContaFav ?? "0" },  // 042-042 G011
    { type: "alfa", len: 1,  value: params.dvAgContaFav ?? "0" },// 043-043 G012
    { type: "alfa", len: 30, value: params.nomeFav ?? "" },      // 044-073 G013
    { type: "alfa", len: 20, value: params.seuNumero ?? "" },    // 074-093 G064
    { type: "num",  len: 8,  value: toDateDDMMAAAA(params.dataPagamento) }, // 094-101 P009
    { type: "alfa", len: 3,  value: "BRL" },                     // 102-104 G040
    { type: "num",  len: 15, value: "0" },                       // 105-119 G041 (quantidade moeda)
    { type: "num",  len: 15, value: params.valor },              // 120-134 P010 (valor)
    { type: "alfa", len: 20, value: "" },                        // 135-154 G043 (nosso número - retorno)
    { type: "num",  len: 8,  value: "0" },                       // 155-162 P003 (data efetivação - retorno)
    { type: "num",  len: 15, value: "0" },                       // 163-177 P004 (valor efetivação - retorno)
    { type: "alfa", len: 40, value: params.informacao2 ?? "" },  // 178-217 G031
    { type: "alfa", len: 2,  value: "" },                        // 218-219 P005 (DOC – obsoleto)
    { type: "alfa", len: 5,  value: params.finalidadeTED ?? ""}, // 220-224 P011
    { type: "alfa", len: 2,  value: params.finalidadeComplementar ?? "" }, // 225-226 P013
    { type: "alfa", len: 3,  value: "" },                        // 227-229 G004
    { type: "num",  len: 1,  value: params.zero230 ?? "0" },     // 230-230 (zero)
    { type: "alfa", len: 10, value: "" },                        // 231-240 G059 (retorno)
  ] as const;

  return buildLine(f as any);
}
