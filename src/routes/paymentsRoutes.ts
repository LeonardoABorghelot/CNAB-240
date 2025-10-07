import { FastifyInstance } from "fastify";
import {
  listPaymentsController,
  insertPaymentsController,
} from "../controller/paymentsController";
import { verificarToken } from "../middlewares/authMiddleware";

export default async function paymentsRoutes(app: FastifyInstance) {
  app.get("/payments", { preHandler: verificarToken }, listPaymentsController);

  app.post(
    "/payments/insert",
    { preHandler: verificarToken },
    insertPaymentsController
  );
}
