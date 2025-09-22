import { FastifyInstance } from "fastify";
import { gerarRemessaController } from "../controller/remessa";
import { verificarToken } from "../middlewares/authMiddleware";

export default async function remessaRoutes(app: FastifyInstance) {
  app.post("/manual", { preHandler: verificarToken }, gerarRemessaController);
}
