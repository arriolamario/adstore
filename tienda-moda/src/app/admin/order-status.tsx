"use client";

import { useState } from "react";

const statuses = [
  ["PENDING", "Pendiente"],
  ["CONFIRMED", "Confirmada"],
  ["READY_FOR_PICKUP", "Lista para retirar"],
  ["OUT_FOR_DELIVERY", "En reparto"],
  ["COMPLETED", "Completada"],
  ["CANCELLED", "Cancelada"],
  ["EXPIRED", "Expirada"],
] as const;

type Props = { orderId: string; initialStatus: (typeof statuses)[number][0] };

export default function OrderStatus({ orderId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function updateStatus(nextStatus: Props["initialStatus"]) {
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
    const result = await response.json();
    if (response.ok) setStatus(result.order.status);
    else setMessage(result.error ?? "No se pudo actualizar.");
    setSaving(false);
  }

  return <div className="flex items-center gap-3"><select disabled={saving} value={status} onChange={(event) => updateStatus(event.target.value as Props["initialStatus"])} className="border-b border-[var(--ink)] bg-transparent py-1 text-xs font-bold uppercase tracking-[0.08em]">{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{message && <span className="text-xs text-[var(--coral)]">{message}</span>}</div>;
}
