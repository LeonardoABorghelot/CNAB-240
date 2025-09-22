import { FastifyRequest, FastifyReply } from "fastify";
import { env } from "../env";
import jwt from "jsonwebtoken";

export async function verificarToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Token JWT não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return reply
      .status(401)
      .send({ error: "Token ausente no cabeçalho Authorization." });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    request.user = decoded;
  } catch (err) {
    return reply.status(401).send({ error: "Token inválido ou expirado." });
  }
}
