"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Variant = { id: string; size: string; sku: string; color: string | null; stock: number; product: { name: string } };

export default function VariantEditor({ variant }: { variant: Variant }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState(variant.size);
  const [sku, setSku] = useState(variant.sku);
  const [color, setColor] = useState(variant.color ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/admin/variants/${variant.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ size, sku, color }) });
    const result = await response.json();
    if (response.ok) { setOpen(false); router.refresh(); }
    else setMessage(result.error ?? "No se pudo guardar.");
    setSaving(false);
  }

  return <><button onClick={() => setOpen(true)} className="border border-[var(--ink)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em]">Editar</button>{open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><section className="w-full max-w-md border border-[var(--ink)] bg-[var(--paper)] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--coral)]">Variante</p><h2 className="display-font mt-1 text-4xl">{variant.product.name}</h2></div><button onClick={() => setOpen(false)} className="text-xs font-bold uppercase">Cerrar</button></div><div className="mt-8 space-y-5"><label className="block text-xs font-bold uppercase tracking-[0.1em]">Talle<input value={size} onChange={(event) => setSize(event.target.value)} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label><label className="block text-xs font-bold uppercase tracking-[0.1em]">SKU<input value={sku} onChange={(event) => setSku(event.target.value)} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label><label className="block text-xs font-bold uppercase tracking-[0.1em]">Color<input value={color} onChange={(event) => setColor(event.target.value)} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label><p className="text-xs text-[var(--muted)]">Stock actual: {variant.stock}. Modificalo desde Movimientos para conservar la auditoría.</p></div><div className="mt-8 flex items-center gap-4"><button disabled={saving} onClick={save} className="bg-[var(--ink)] px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--paper)] disabled:opacity-50">{saving ? "Guardando" : "Guardar"}</button>{message && <p className="text-sm font-bold text-[var(--coral)]">{message}</p>}</div></section></div>}</>;
}
