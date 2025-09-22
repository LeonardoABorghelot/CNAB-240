import { FastifyInstance } from "fastify";
import { loginController } from "../controller/authController";

export default async function loginRoutes(app: FastifyInstance) {
  app.post("/login", loginController);
}
