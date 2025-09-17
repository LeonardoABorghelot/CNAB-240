import { FastifyInstance } from "fastify";
import { gerarRemessaController } from "../controller/remessa";

export default async function remessaRoutes(app: FastifyInstance) {
  app.post("/", gerarRemessaController);
}
