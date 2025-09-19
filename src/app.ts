import fastify from "fastify";
import remessaRoutes from "./routes/remessa";
import duplicatasRoutes from "./routes/duplicatas";
import cors from "@fastify/cors";

export const app = fastify();

app.register(cors, {
  origin: "*",
});

app.register(remessaRoutes, {
  prefix: "remessa",
});

app.register(duplicatasRoutes);
