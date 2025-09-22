import { FastifyInstance } from "fastify";
import { shipmentController } from "../controller/shipmentController";
import { verificarToken } from "../middlewares/authMiddleware";

export default async function shipmentRoutes(app: FastifyInstance) {
  app.post("/manual", { preHandler: verificarToken }, shipmentController);
}
