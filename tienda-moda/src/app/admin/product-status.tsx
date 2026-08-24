"use client";

import { useState } from "react";

type Props = { productId: string; initialActive: boolean };

export default function ProductStatus({ productId, initialActive }: Props) {
  const [active, setActive] = useState(initialActive);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    const response = await fetch(`/api/admin/products/${productId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
    const result = await response.json();
    if (response.ok) setActive(result.product.active);
    setSaving(false);
  }

  return <button disabled={saving} onClick={toggle} className={`border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] ${active ? "border-[var(--ink)]" : "border-[var(--coral)] text-[var(--coral)]"}`}>{saving ? "Guardando" : active ? "Desactivar" : "Activar"}</button>;
}
