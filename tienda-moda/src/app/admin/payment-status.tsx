"use client";

import { useState } from "react";

type Props = { orderId: string; initialStatus: "NOT_REQUIRED" | "PENDING" | "PROOF_SUBMITTED" | "VERIFIED" | "REJECTED" };
const labels = { NOT_REQUIRED: "No requiere", PENDING: "Pendiente", PROOF_SUBMITTED: "Comprobante enviado", VERIFIED: "Verificado", REJECTED: "Rechazado" } as const;

export default function PaymentStatus({ orderId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  async function update(nextStatus: Props["initialStatus"]) { setSaving(true); const response = await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentStatus: nextStatus }) }); if (response.ok) setStatus(nextStatus); setSaving(false); }
  return <select disabled={saving} value={status} onChange={(event) => update(event.target.value as Props["initialStatus"])} className="mt-2 border-b border-[var(--ink)] bg-transparent py-1 text-xs font-bold uppercase">{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>;
}
