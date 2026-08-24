"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { signOut } from "next-auth/react";

type Account = { name: string | null; email: string; role: "CUSTOMER" | "ADMIN" };

export default function AccountMenu() {
  const [account, setAccount] = useState<Account | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/me").then(async (response) => {
      if (response.status === 401) { setAccount(null); return; }
      const result = await response.json();
      setAccount(result.user);
    }).catch(() => setAccount(null));
  }, []);

  async function logout() {
    await signOut({ callbackUrl: "/" });
  }

  if (account === undefined) return <div className="hidden h-8 w-24 sm:block" />;
  if (!account) return <div className="hidden items-center gap-3 sm:flex"><Link href="/login" className="text-xs font-bold uppercase tracking-[0.1em]">Ingresar</Link><Link href="/register" className="border-b border-[var(--ink)] pb-1 text-xs font-bold uppercase tracking-[0.1em]">Crear cuenta</Link></div>;

  return <div className="hidden items-center gap-3 sm:flex"><div className="text-right"><p className="max-w-28 truncate text-xs font-bold">{account.name || account.email}</p><p className="text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">{account.role === "ADMIN" ? "Admin" : "Mi cuenta"}</p></div><Link href={account.role === "ADMIN" ? "/admin" : "/perfil"} aria-label="Abrir cuenta" className="flex h-9 w-9 items-center justify-center border border-[var(--ink)]"><UserRound size={16} /></Link><button onClick={logout} aria-label="Cerrar sesión" className="flex h-9 w-9 items-center justify-center border border-[var(--ink)]"><LogOut size={16} /></button></div>;
}
