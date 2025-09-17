import { REGISTRO_TAM } from "../banks/banrisul/constants";
import {toAlfa, toNum } from "./format";
import type { FieldType } from "./format";

export type FieldSpec = { type: FieldType; len: number; value: string | number };

export function buildLine(fields: FieldSpec[]): string {
  let out = "";
  for (const f of fields) {
    out += f.type === "num" ? toNum(f.value, f.len) : toAlfa(f.value, f.len);
  }
  if (out.length !== REGISTRO_TAM) {
    throw new Error(`Linha fora do tamanho ${REGISTRO_TAM}: atual=${out.length}`);
  }
  return out;
}

export function joinFile(lines: string[], withFileEnd = true): string {
  const body = lines.join("\r\n") + "\r\n";
  return withFileEnd ? body + String.fromCharCode(0x1a) : body;
}
