import { FastifyRequest, FastifyReply } from "fastify";
import { validUser } from "../service/authService";
import { generateToken } from "../utils/jwt";

interface LoginBody {
  cd_fun: string;
  senha_prog: string;
}

export async function loginController(
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply
) {
  const { cd_fun, senha_prog } = request.body;

  if (!cd_fun || !senha_prog) {
    return reply
      .status(400)
      .send({ error: "Username and password are required." });
  }

  try {
    const user = await validUser(cd_fun, senha_prog);
    if (!user) {
      return reply.status(401).send({ error: "Invalid credentials." });
    }

    const token = generateToken({ cd_fun: user.CD_FUN });

    return reply.send({ token });
  } catch (error) {
    console.error("Erro no login:", error);
    return reply.status(500).send({ error: "Internal server error." });
  }
}
