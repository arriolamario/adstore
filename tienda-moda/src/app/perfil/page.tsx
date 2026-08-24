"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/me").then(async (response) => {
      if (response.status === 401) { window.location.href = "/login"; return; }
      const result = await response.json();
      setEmail(result.user.email);
      setName(result.user.name ?? "");
      setPhone(result.user.phone ?? "");
      setLoading(false);
    });
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone }) });
    const result = await response.json();
    setMessage(response.ok ? "Perfil actualizado." : result.error);
    setSaving(false);
  }

  return <main className="min-h-screen bg-[var(--paper)]"><header className="border-b border-[var(--line)] px-5 py-6 lg:px-10"><div className="mx-auto flex max-w-[700px] items-center justify-between"><Link href="/" className="display-font text-4xl tracking-[-0.06em]">NOVA<span className="text-[var(--coral)]">.</span></Link><Link href="/mis-reservas" className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--coral)]">Mis reservas</Link></div></header><div className="mx-auto max-w-[700px] px-5 py-12 lg:px-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Tu cuenta</p><h1 className="display-font mt-2 text-7xl leading-none tracking-[-0.06em]">Mi perfil.</h1>{loading ? <p className="mt-10 text-sm text-[var(--muted)]">Cargando datos...</p> : <form onSubmit={saveProfile} className="mt-10 space-y-7 border border-[var(--line)] bg-[#d9e7da] p-7 sm:p-10"><label className="block text-xs font-bold uppercase tracking-[0.12em]">Email<input value={email} readOnly className="mt-2 w-full border-b border-[var(--line)] bg-transparent py-3 text-[var(--muted)] outline-none" /></label><label className="block text-xs font-bold uppercase tracking-[0.12em]">Nombre<input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-3 outline-none" /></label><label className="block text-xs font-bold uppercase tracking-[0.12em]">Teléfono<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="11 5555 5555" className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-3 outline-none" /></label><button disabled={saving} className="w-full bg-[var(--ink)] py-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--paper)] disabled:opacity-50">{saving ? "Guardando..." : "Guardar cambios"}</button>{message && <p className="text-sm font-bold text-[var(--coral)]">{message}</p>}</form>}</div></main>;
}
