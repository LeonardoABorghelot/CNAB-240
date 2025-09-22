import { FastifyInstance } from "fastify";
import { listarDuplicatasController } from "../controller/duplicatas";
import { verificarToken } from "../middlewares/authMiddleware";

export default async function duplicatasRoutes(app: FastifyInstance) {
  app.get(
    "/duplicatas",
    { preHandler: verificarToken },
    listarDuplicatasController
  );
}
