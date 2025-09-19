import { FastifyInstance } from "fastify";
import { gerarRemessaController } from "../controller/remessa";
import { geraRemessaAutomaticaController } from "../controller/remesaAutomatica";
import { gerarRemessaManualController } from "../controller/remessaManual";

export default async function remessaRoutes(app: FastifyInstance) {
  app.post("/", gerarRemessaController);
  app.post("/automatica", geraRemessaAutomaticaController);
  app.post("/manual", gerarRemessaManualController);
}
