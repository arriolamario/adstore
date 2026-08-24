"use client";

import { useState } from "react";

type Variant = { id: string; size: string; sku: string; stock: number; product: { name: string } };

type Props = { variants: Variant[] };

export default function Operations({ variants }: Props) {
  const [type, setType] = useState<"PURCHASE" | "POS_SALE">("PURCHASE");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER">("CASH");
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [supplier, setSupplier] = useState("");
  const [purchaseTotal, setPurchaseTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    setMessage("");
    const endpoint = type === "POS_SALE" ? "/api/admin/sales" : "/api/admin/stock";
    const payload = type === "POS_SALE" ? { items: [{ variantId, quantity }], paymentMethod, notes: note } : { type, items: [{ variantId, quantity }], supplier, total: purchaseTotal || undefined, note };
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    setMessage(response.ok ? "Movimiento registrado correctamente." : result.error);
    if (response.ok) { setQuantity(1); setNote(""); setSupplier(""); setPurchaseTotal(0); }
    setSaving(false);
  }

  return (
    <section className="mb-12 border-y border-[var(--line)] py-8">
      <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">Operación rápida</p><h2 className="display-font mt-1 text-5xl">Mover stock.</h2></div>
      <div className="grid gap-4 md:grid-cols-[180px_1fr_120px_1fr_auto] md:items-end">
        <label className="text-xs font-bold uppercase tracking-[0.1em]">Movimiento<select value={type} onChange={(event) => setType(event.target.value as "PURCHASE" | "POS_SALE")} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2"><option value="PURCHASE">Entrada</option><option value="POS_SALE">Venta presencial</option></select></label>
        <label className="text-xs font-bold uppercase tracking-[0.1em]">Producto / talle<select value={variantId} onChange={(event) => setVariantId(event.target.value)} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2">{variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.product.name} / {variant.size} · {variant.stock} u.</option>)}</select></label>
        <label className="text-xs font-bold uppercase tracking-[0.1em]">Cantidad<input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label>
        {type === "POS_SALE" && <label className="text-xs font-bold uppercase tracking-[0.1em]">Pago<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as "CASH" | "BANK_TRANSFER")} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2"><option value="CASH">Efectivo</option><option value="BANK_TRANSFER">Transferencia</option></select></label>}
        {type === "PURCHASE" && <label className="text-xs font-bold uppercase tracking-[0.1em]">Proveedor<input value={supplier} onChange={(event) => setSupplier(event.target.value)} placeholder="Nombre del proveedor" className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label>}
        {type === "PURCHASE" && <label className="text-xs font-bold uppercase tracking-[0.1em]">Costo total<input type="number" min={0} value={purchaseTotal} onChange={(event) => setPurchaseTotal(Number(event.target.value))} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label>}
        <label className="text-xs font-bold uppercase tracking-[0.1em]">Nota<input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Proveedor, cliente..." className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label>
        <button disabled={!variantId || saving} onClick={submit} className="bg-[var(--ink)] px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--paper)] disabled:opacity-40">{saving ? "Guardando" : "Registrar"}</button>
      </div>
      {message && <p className="mt-4 text-sm font-bold text-[var(--coral)]">{message}</p>}
    </section>
  );
}
