import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";

// Debug simple al cargar el handler
if (process.env.NODE_ENV !== "production") {
	console.log("[auth] session.strategy:", authOptions.session?.strategy);
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
