"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="min-h-[70vh] grid place-items-center px-4">
        <div className="text-center">
          <span className="relative inline-flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40" style={{ background: 'var(--accent)' }} />
            <span className="relative inline-flex rounded-full h-6 w-6" style={{ background: 'var(--accent)' }} />
          </span>
          <p className="mt-2 text-[color:var(--muted)]">Cargando...</p>
        </div>
      </main>
    );
  }

  if (status === "authenticated") {
    return null; // Prevent flash while redirecting
  }

  return (
    <main className="min-h-[70vh] grid place-items-center px-4 sm:px-6">
      <section className="w-full max-w-sm space-y-4 border border-white/15 rounded-xl p-4 sm:p-5 bg-white/5 backdrop-blur-sm">
        <h1 className="text-xl font-semibold">Iniciar sesión</h1>
        <Button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="w-full" variant="outline">
          Continuar con Google
        </Button>
        <label htmlFor="email" className="sr-only">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          onClick={() => signIn("credentials", { email, callbackUrl: "/dashboard" })}
          className="w-full"
        >
          Entrar
        </Button>
      </section>
    </main>
  );
}
