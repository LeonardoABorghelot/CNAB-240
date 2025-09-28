import jwt from "jsonwebtoken";
import { env } from "../env";

export function generateToken(payload: object): string {
  return jwt.sign(payload, env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
}
