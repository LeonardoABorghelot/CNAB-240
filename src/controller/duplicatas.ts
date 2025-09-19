import { FastifyRequest, FastifyReply } from "fastify";
import { listarDuplicatas } from "../service/duplicatas";
import { z } from "zod";

export async function listarDuplicatasController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const schema = z.object({
    dataInicial: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dataFinal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  });

  const parsed = schema.safeParse(request.query);

  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.format() });
  }

  const { dataInicial, dataFinal } = parsed.data;

  try {
    const duplicatas = await listarDuplicatas(dataInicial, dataFinal);
    reply.send(duplicatas);
  } catch (error) {
    console.log("Erro ao listar duplicatas:", error);
    reply.status(500).send({ error: "Erro ao buscar duplicatas no banco." });
  }
}
