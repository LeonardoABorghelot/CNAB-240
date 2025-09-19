import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { listarDuplicatas } from "../service/duplicatas";
import { gerarRemessaPix } from "../service/remessa";

function detectaTipoChavePix(
  chave: string
): "cpf" | "cnpj" | "telefone" | "email" | "aleatoria" {
  if (/^\d{11}$/.test(chave)) return "cpf";
  if (/^\d{14}$/.test(chave)) return "cnpj";
  if (/^\d{10,11}$/.test(chave)) return "telefone";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(chave)) return "email";
  return "aleatoria";
}

export async function geraRemessaAutomaticaController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const schema = z.object({
    nsa: z.number().int().positive(),
    dataInicial: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dataFinal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  });

  const parsed = schema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.format() });
  }

  const { nsa, dataInicial, dataFinal } = parsed.data;

  try {
    const duplicatas = await listarDuplicatas(dataInicial, dataFinal);

    const pagamentos = duplicatas.map((item) => {
      const tipoChavePix = detectaTipoChavePix(item.chavePix);

      return {
        nomeFavorecido: item.nomeFavorecido,
        chavePix: item.chavePix,
        tipoChavePix,
        valorCentavos: Math.round(Number(item.valor) * 100),
        dataPagamento: item.dataPagamento,
        seuNumero: String(item.seuNumero),
      };
    });

    const conteudo = gerarRemessaPix(nsa, pagamentos);

    reply
      .code(200)
      .header("Content-Type", "text/plain; charset=latin1")
      .send(conteudo);
  } catch (error) {
    console.error("Erro ao gerar remessa automática", error);
    reply.status(500).send({ error: "Erro ao gerar remessa automática." });
  }
}
