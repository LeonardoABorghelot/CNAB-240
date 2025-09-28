import { knex } from "../database";

export async function validUser(cd_fun: string, senha_prog: string) {
  const result = await knex("FP_FUNC_GERENTE")
    .select("CD_FUN", "SENHA_PROG")
    .where({ CD_FUN: cd_fun, SENHA_PROG: senha_prog })
    .first();

  return result || null;
}
