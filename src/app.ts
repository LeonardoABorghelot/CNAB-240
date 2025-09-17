import fastify from "fastify";
import remessaRoutes from "./routes/remessa";

export const app = fastify();

app.register(remessaRoutes, {
  prefix: "remessa",
});
