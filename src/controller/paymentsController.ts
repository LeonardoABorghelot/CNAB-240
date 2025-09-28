import { FastifyRequest, FastifyReply } from "fastify";
import { listPayments } from "../service/paymentsService";
import { z } from "zod";

export async function listPaymentsController(
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
    const payments = await listPayments(dataInicial, dataFinal);
    reply.send(payments);
  } catch (error) {
    console.log("Error listing duplicates:", error);
    reply
      .status(500)
      .send({ error: "Error while fetching duplicates from the database." });
  }
}
