import { FastifyRequest, FastifyReply } from "fastify";
import { shipmentPix } from "../service/shipmentService";
import { z } from "zod";

export async function shipmentController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const schema = z.object({
    nsa: z.number().int().positive(),
    pagamentos: z.array(
      z.object({
        nomeFavorecido: z.string(),
        chavePix: z.string(),
        tipoChavePix: z.enum(["cpf", "cnpj", "telefone", "email", "aleatoria"]),
        valorCentavos: z.number().int().positive(),
        dataPagamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        seuNumero: z.string(),
      })
    ),
  });

  const parsed = schema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.format() });
  }

  const { nsa, pagamentos } = parsed.data;

  try {
    const conteudo = shipmentPix(nsa, pagamentos);

    reply
      .code(200)
      .header("Content-Type", "text/plain; charset=latin1")
      .send(conteudo);
  } catch (error) {
    console.error("Error generating manual shipment:", error);
    reply.status(500).send({ error: "Error generating manual shipment:" });
  }
}
