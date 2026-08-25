import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(rawCredentials) {
        const result = credentialsSchema.safeParse({
          email: String(rawCredentials?.email ?? "").trim().toLowerCase(),
          password: String(rawCredentials?.password ?? ""),
        });
        if (!result.success) return null;

        const user = await prisma.user.findUnique({ where: { email: result.data.email } });
        if (!user || !user.active || !(await bcrypt.compare(result.data.password, user.passwordHash))) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
});
