import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no Prisma/bcryptjs) so it can run in middleware.
export const authConfig = {
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CUSTOMER" | "ADMIN";
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
} satisfies NextAuthConfig;
