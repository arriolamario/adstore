"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type Props = { fields: Array<"search" | "payment" | "supplier">; basePath: string };

export default function ListFilters({ fields, basePath }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [values, setValues] = useState({ search: params.get("search") ?? "", payment: params.get("payment") ?? "", supplier: params.get("supplier") ?? "" });
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const next = new URLSearchParams(); Object.entries(values).forEach(([key, value]) => { if (value) next.set(key, value); }); router.push(`${basePath}?${next.toString()}`); }
  return <form onSubmit={submit} className="mt-8 grid gap-4 border-y border-[var(--line)] py-5 md:grid-cols-[1fr_220px_auto]">{fields.includes("search") && <label className="text-xs font-bold uppercase tracking-[0.1em]">Buscar<input value={values.search} onChange={(event) => setValues({ ...values, search: event.target.value })} placeholder="Producto, talle o SKU" className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label>}{fields.includes("supplier") && <label className="text-xs font-bold uppercase tracking-[0.1em]">Proveedor<input value={values.supplier} onChange={(event) => setValues({ ...values, supplier: event.target.value })} placeholder="Nombre del proveedor" className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label>}{fields.includes("payment") && <label className="text-xs font-bold uppercase tracking-[0.1em]">Medio de pago<select value={values.payment} onChange={(event) => setValues({ ...values, payment: event.target.value })} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2"><option value="">Todos</option><option value="CASH">Efectivo</option><option value="BANK_TRANSFER">Transferencia</option></select></label>}<button className="self-end bg-[var(--ink)] px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--paper)]">Filtrar</button></form>;
}
