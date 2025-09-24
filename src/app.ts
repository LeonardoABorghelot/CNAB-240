import fastify from "fastify";
import staticPlugin from "@fastify/static";
import cors from "@fastify/cors";
import path from "path";
import shipmentRoutes from "./routes/shipmentRoutes";
import paymentsRoutes from "./routes/paymentsRoutes";
import loginRoutes from "./routes/authRoutes";

export const app = fastify();

app.register(cors, {
  origin: "*",
});

app.register(staticPlugin, {
  root: path.join(__dirname, "../cnab-front/dist"),
  prefix: "/",
});

app.setNotFoundHandler((request, reply) => {
  reply.type("text/html").sendFile("index.html");
});

app.register(loginRoutes);

app.register(shipmentRoutes, {
  prefix: "shipment",
});

app.register(paymentsRoutes);
