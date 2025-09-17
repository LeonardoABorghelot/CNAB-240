import { buildLine } from "../lib/line";
import { toAlfa, toNum } from "../lib/format";
import { BANCO_CODIGO } from "../banks/banrisul/constants";

/**
 * Header de Lote – Registro Tipo '1' (Pagamentos)
 * Campos principais: ver páginas 10–11.
 */
export function headerLotePagamentos(params: {
  lote: number;                            // 0001..9999
  tipoServico: string;                     // ex.: '20' Fornecedor, '22' Contas/Tributos
  formaLancamento: string;                 // '45' = PIX, '47' = PIX por QR Code, etc.
  versaoHeaderLote?: string;               // G030 (3 dígitos). Informe o da sua homologação.
  tipoInscricao: "1" | "2";
  inscricao: string;
  convenio: string;                        // 6 dígitos
  agencia: string;                         // 5
  agenciaDV?: string;                      // 1 ('0' p/ Banrisul)
  conta: string;                           // 12
  contaDV: string;                         // 1
  dvAgConta?: string;                      // '0' ou branco
  nomeEmpresa: string;                     // 30
  endereco?: {
    logradouro?: string;                   // 30
    numero?: string;                       // 5
    complemento?: string;                  // 15
    cidade?: string;                       // 20
    cep?: string;                          // 5
    cepCompl?: string;                     // 3
    uf?: string;                           // 2
  };
  classificacaoOrdenacao?: "VA" | "VD" | ""; // 223-224
}) {
  const end = params.endereco ?? {};

  const f = [
    { type: "num", len: 3, value: BANCO_CODIGO },          // 001-003 G001
    { type: "num", len: 4, value: params.lote },            // 004-007 G002
    { type: "num", len: 1, value: "1" },                    // 008-008 G003
    { type: "alfa", len: 1, value: "C" },                   // 009-009 G028
    { type: "num", len: 2, value: params.tipoServico },     // 010-011 G025
    { type: "num", len: 2, value: params.formaLancamento }, // 012-013 G029 (45=PIX / 47=PIX-QR)
    { type: "num", len: 3, value: params.versaoHeaderLote ?? "030" }, // 014-016 G030
    { type: "alfa", len: 1, value: "" },                    // 017-017 G004
    { type: "num", len: 1, value: params.tipoInscricao },   // 018-018 G005
    { type: "num", len: 14, value: params.inscricao },      // 019-032 G006
    { type: "num", len: 6, value: params.convenio },        // 033-038 G007
    { type: "alfa", len: 14, value: "" },                   // 039-052 (brancos)
    { type: "num", len: 5, value: params.agencia },         // 053-057 G008
    { type: "num", len: 1, value: params.agenciaDV ?? "0" },// 058-058 G009
    { type: "num", len: 12, value: params.conta },          // 059-070 G010
    { type: "num", len: 1, value: params.contaDV },         // 071-071 G011
    { type: "alfa", len: 1, value: params.dvAgConta ?? "0" },// 072-072 G012
    { type: "alfa", len: 30, value: params.nomeEmpresa },   // 073-102 G013
    { type: "alfa", len: 40, value: "" },                   // 103-142 (brancos)
    { type: "alfa", len: 30, value: end.logradouro ?? "" }, // 143-172 G032
    { type: "alfa", len: 5,  value: end.numero ?? "" },     // 173-177 G032
    { type: "alfa", len: 15, value: end.complemento ?? "" },// 178-192 G032
    { type: "alfa", len: 20, value: end.cidade ?? "" },     // 193-212 G033
    { type: "num", len: 5,  value: end.cep ?? "" },         // 213-217 G034
    { type: "alfa", len: 3,  value: end.cepCompl ?? "" },   // 218-220 G035
    { type: "alfa", len: 2,  value: end.uf ?? "" },         // 221-222 G036
    { type: "alfa", len: 2,  value: params.classificacaoOrdenacao ?? "" }, // 223-224
    { type: "alfa", len: 6,  value: "" },                   // 225-230 G004
    { type: "alfa", len: 10, value: "" },                   // 231-240 G059 (ocorrências retorno)
  ] as const;

  return buildLine(f as any);
}
