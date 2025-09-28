import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  JWT_SECRET: z.string(),

  HOST: z.string(),
  PORT: z.preprocess((val) => Number(val), z.number()),

  EMPRESA_CNPJ: z.string().length(14, "CNPJ deve conter 14 dígitos numéricos"),
  EMPRESA_NOME: z.string().min(5),

  BANCO_CONVENIO: z.string().length(6, "Convênio deve conter 6 dígitos"),
  BANCO_AGENCIA: z.string().length(5, "Agência deve conter 5 dígitos"),
  BANCO_CONTA: z
    .string()
    .min(8)
    .max(12, "Conta deve conter entre 8 e 12 dígitos"),
  BANCO_CONTA_DV: z.string().length(1, "DV da conta deve conter 1 dígito"),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.log("Invalid environment variables!", _env.error.format());

  throw new Error("Invalid environment variables!");
}

export const env = _env.data;
