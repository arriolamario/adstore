"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function VariantForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [size, setSize] = useState("");
  const [sku, setSku] = useState("");
  const [color, setColor] = useState("");
  const [stock, setStock] = useState(0);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/admin/products/${productId}/variants`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ size, sku, color, stock }) });
    const result = await response.json();
    if (response.ok) { setSize(""); setSku(""); setColor(""); setStock(0); setMessage("Variante agregada."); router.refresh(); }
    else setMessage(result.error ?? "No se pudo agregar.");
    setSaving(false);
  }

  return <form onSubmit={submit} className="mt-4 grid gap-3 border-t border-[var(--line)] pt-4 sm:grid-cols-[1fr_1.4fr_1fr_100px_auto] sm:items-end"><label className="text-[10px] font-bold uppercase tracking-[0.1em]">Talle<input value={size} onChange={(event) => setSize(event.target.value)} required placeholder="XXL / 43" className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2 text-sm" /></label><label className="text-[10px] font-bold uppercase tracking-[0.1em]">SKU<input value={sku} onChange={(event) => setSku(event.target.value)} required placeholder="NUEVO-XXL" className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2 text-sm" /></label><label className="text-[10px] font-bold uppercase tracking-[0.1em]">Color<input value={color} onChange={(event) => setColor(event.target.value)} placeholder="Opcional" className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2 text-sm" /></label><label className="text-[10px] font-bold uppercase tracking-[0.1em]">Stock<input type="number" min={0} value={stock} onChange={(event) => setStock(Number(event.target.value))} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2 text-sm" /></label><button disabled={saving} className="bg-[var(--ink)] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--paper)] disabled:opacity-50">{saving ? "..." : "Agregar"}</button>{message && <p className="text-xs text-[var(--coral)] sm:col-span-5">{message}</p>}</form>;
}
