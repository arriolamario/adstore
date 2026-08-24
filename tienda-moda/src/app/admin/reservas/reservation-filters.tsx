"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function ReservationFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [status, setStatus] = useState(params.get("status") ?? "");
  const [payment, setPayment] = useState(params.get("payment") ?? "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams();
    if (search.trim()) next.set("search", search.trim());
    if (status) next.set("status", status);
    if (payment) next.set("payment", payment);
    router.push(`/admin/reservas?${next.toString()}`);
  }

  return <form onSubmit={submit} className="mt-8 grid gap-4 border-y border-[var(--line)] py-5 md:grid-cols-[1fr_190px_190px_auto]"><label className="text-xs font-bold uppercase tracking-[0.1em]">Buscar cliente<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o email" className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label><label className="text-xs font-bold uppercase tracking-[0.1em]">Estado<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2"><option value="">Todos</option><option value="PENDING">Pendiente</option><option value="CONFIRMED">Confirmada</option><option value="READY_FOR_PICKUP">Lista para retirar</option><option value="OUT_FOR_DELIVERY">En reparto</option><option value="COMPLETED">Completada</option><option value="CANCELLED">Cancelada</option></select></label><label className="text-xs font-bold uppercase tracking-[0.1em]">Pago<select value={payment} onChange={(event) => setPayment(event.target.value)} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2"><option value="">Todos</option><option value="CASH">Efectivo</option><option value="BANK_TRANSFER">Transferencia</option></select></label><button className="self-end bg-[var(--ink)] px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--paper)]">Filtrar</button></form>;
}
