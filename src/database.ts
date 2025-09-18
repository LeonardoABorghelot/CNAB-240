import { knex as setupKnex, Knex } from "knex";
import { env } from "./env/index";

export const config: Knex.Config = {
  client: "mssql",
  connection: {
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },
  pool: {
    min: 2,
    max: 10,
  },
  useNullAsDefault: true,
};

export const knex = setupKnex(config);
