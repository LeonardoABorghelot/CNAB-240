import { FastifyInstance } from "fastify";
import { listarDuplicatasController } from "../controller/duplicatas";

export default async function duplicatasRoutes(app: FastifyInstance) {
  app.get("/duplicatas", listarDuplicatasController);
}
