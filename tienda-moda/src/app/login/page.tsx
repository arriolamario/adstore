import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-md border border-[var(--line)] bg-[#d9e7da] p-8 sm:p-12">
        <Link href="/" className="display-font text-4xl tracking-[-0.06em]">NOVA<span className="text-[var(--coral)]">.</span></Link>
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Tu cuenta</p>
        <h1 className="display-font mt-2 text-6xl leading-none tracking-[-0.06em]">Ingresar</h1>
        <form action={loginAction} className="mt-9 space-y-5">
          <label className="block text-xs font-bold uppercase tracking-[0.12em]">Email<input name="email" type="email" required autoComplete="email" className="mt-2 w-full border-b border-[var(--ink)] bg-transparent px-0 py-3 outline-none" /></label>
          <label className="block text-xs font-bold uppercase tracking-[0.12em]">Contraseña<input name="password" type="password" required minLength={8} autoComplete="current-password" className="mt-2 w-full border-b border-[var(--ink)] bg-transparent px-0 py-3 outline-none" /></label>
          {error === "invalid-credentials" && <p role="alert" className="text-sm font-bold text-[var(--coral)]">El email o la contraseña no son correctos.</p>}
          <button type="submit" className="w-full bg-[var(--ink)] py-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--paper)]">Ingresar</button>
        </form>
        <p className="mt-8 text-sm text-[var(--muted)]">¿Todavía no tenés cuenta? <Link href="/register" className="font-bold text-[var(--ink)] underline">Registrate</Link></p>
      </section>
    </main>
  );
}
