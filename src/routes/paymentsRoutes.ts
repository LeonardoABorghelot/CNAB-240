import { FastifyInstance } from "fastify";
import { listPaymentsController } from "../controller/paymentsController";
import { verificarToken } from "../middlewares/authMiddleware";

export default async function paymentsRoutes(app: FastifyInstance) {
  app.get("/payments", { preHandler: verificarToken }, listPaymentsController);
}
