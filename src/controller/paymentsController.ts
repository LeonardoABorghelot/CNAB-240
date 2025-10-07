import { FastifyRequest, FastifyReply } from "fastify";
import { listPayments, insertPayments } from "../service/paymentsService";
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
    reply
      .status(500)
      .send({ error: "Error while fetching duplicates from the database." });
  }
}

export async function insertPaymentsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const schema = z.object({
    dt_agendamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    selecionados: z.array(
      z.object({
        cd_pg_cred: z.number(),
        vlr_saldo: z.number(),
        cd_filial: z.number(),
        vlr_desc: z.number().optional().default(0),
        vlr_juros: z.number().optional().default(0),
        vlr_imp: z.number().optional().default(0),
        vlr_devolucao: z.number().optional().default(0),
      })
    ),
  });

  const parsed = schema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.format() });
  }

  const { dt_agendamento, selecionados } = parsed.data;
  const cd_fun = request.user?.cd_fun;

  if (!cd_fun) {
    return reply.status(401).send({ error: "User not authenticated." });
  }

  try {
    const result = await insertPayments(
      cd_fun,
      new Date(dt_agendamento),
      selecionados
    );

    return reply.send({
      message: `Batch ${result.nr_arquivo} inserted with ${result.totalPagamentos} payment(s).`,
      ...result,
    });
  } catch (error) {
    console.error("Error inserting payments:", error);
    return reply
      .status(500)
      .send({ error: "Error inserting payments into the database." });
  }
}
