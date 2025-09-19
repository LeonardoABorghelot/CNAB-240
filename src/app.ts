import fastify from "fastify";
import remessaRoutes from "./routes/remessa";
import duplicatasRoutes from "./routes/duplicatas";

export const app = fastify();

app.register(remessaRoutes, {
  prefix: "remessa",
});

app.register(duplicatasRoutes);
