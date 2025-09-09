import type { NextAuthOptions, User as NextAuthUser, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { prisma } from "../lib/prisma";

// Para el MVP usaremos el proveedor de credenciales sólo para crear sesión con email fijo en dev.
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Dev Login",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().toLowerCase();
        if (!email) return null;
        // Crear usuario si no existe
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({ data: { email, name: email.split("@")[0] } });
        }
        return { id: user.id, email: user.email ?? null, name: user.name ?? null } as NextAuthUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user && (user as NextAuthUser).id) {
        token.uid = (user as NextAuthUser).id;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        const uid = token?.uid;
        if (uid) {
          session.user.id = uid;
        }
      }
      return session;
    },
  },
};
