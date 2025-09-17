import { format } from "date-fns";

export type FieldType = "num" | "alfa";

export function toNum(value: string | number, len: number): string {
  const s = (value ?? "").toString().replace(/\D/g, "");
  if (s.length > len) return s.slice(-len);
  return s.padStart(len, "0");
}

export function toAlfa(value: string | number, len: number): string {
  const s = (value ?? "").toString()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[ç]/gi, "c");
  if (s.length > len) return s.slice(0, len);
  return s.padEnd(len, " ");
}

export function toDateDDMMAAAA(d: Date): string {
  return format(d, "ddMMyyyy");
}
