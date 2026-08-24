"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "No pudimos crear la cuenta.");
      setLoading(false);
      return;
    }
    window.location.href = "/login";
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-md border border-[var(--line)] bg-[var(--lime)] p-8 sm:p-12">
        <Link href="/" className="display-font text-4xl tracking-[-0.06em]">NOVA<span className="text-[var(--coral)]">.</span></Link>
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Nueva cuenta</p>
        <h1 className="display-font mt-2 text-6xl leading-none tracking-[-0.06em]">Registrate</h1>
        <form onSubmit={handleSubmit} className="mt-9 space-y-5">
          <label className="block text-xs font-bold uppercase tracking-[0.12em]">Nombre<input name="name" required minLength={2} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent px-0 py-3 outline-none" /></label>
          <label className="block text-xs font-bold uppercase tracking-[0.12em]">Email<input name="email" type="email" required autoComplete="email" className="mt-2 w-full border-b border-[var(--ink)] bg-transparent px-0 py-3 outline-none" /></label>
          <label className="block text-xs font-bold uppercase tracking-[0.12em]">Contraseña<input name="password" type="password" required minLength={8} autoComplete="new-password" className="mt-2 w-full border-b border-[var(--ink)] bg-transparent px-0 py-3 outline-none" /></label>
          {error && <p role="alert" className="text-sm font-bold text-[var(--coral)]">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-[var(--ink)] py-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--paper)] disabled:opacity-50">{loading ? "Creando..." : "Crear cuenta"}</button>
        </form>
        <p className="mt-8 text-sm text-[var(--muted)]">¿Ya tenés cuenta? <Link href="/login" className="font-bold text-[var(--ink)] underline">Ingresá</Link></p>
      </section>
    </main>
  );
}
