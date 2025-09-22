import fastify from "fastify";
import shipmentRoutes from "./routes/shipmentRoutes";
import paymentsRoutes from "./routes/paymentsRoutes";
import cors from "@fastify/cors";
import loginRoutes from "./routes/authRoutes";

export const app = fastify();

app.register(cors, {
  origin: "*",
});

app.register(loginRoutes);

app.register(shipmentRoutes, {
  prefix: "shipment",
});

app.register(paymentsRoutes);
