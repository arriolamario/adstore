"use client";

import { useState } from "react";

type Props = { orderId: string; paymentMethod: string; paymentStatus: string; receiptUrl: string | null };
type CloudinaryResponse = { secure_url?: string; error?: { message?: string } };

export default function PaymentReceipt({ orderId, paymentMethod, paymentStatus, receiptUrl }: Props) {
  const [url, setUrl] = useState(receiptUrl ?? "");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  if (paymentMethod !== "BANK_TRANSFER") return null;

  async function upload(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !preset) { setMessage("Falta configurar Cloudinary."); return; }
    setUploading(true);
    const body = new FormData(); body.append("file", file); body.append("upload_preset", preset);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
    const result = await response.json() as CloudinaryResponse;
    if (response.ok && result.secure_url) setUrl(result.secure_url); else setMessage(result.error?.message ?? "No se pudo subir el comprobante.");
    setUploading(false);
  }

  async function attach() {
    if (!url) return;
    setSaving(true); setMessage("");
    const response = await fetch(`/api/my-orders/${orderId}/payment`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentReceiptUrl: url }) });
    const result = await response.json();
    setMessage(response.ok ? "Comprobante enviado para revisión." : result.error);
    setSaving(false);
  }

  return <div className="mt-5 border-t border-[var(--line)] pt-4"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--coral)]">Comprobante de transferencia</p>{paymentStatus === "VERIFIED" ? <p className="mt-2 text-sm text-green-700">Transferencia verificada.</p> : <><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} className="mt-3 block w-full text-xs" />{url && <button disabled={saving || uploading} onClick={attach} className="mt-3 bg-[var(--ink)] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--paper)] disabled:opacity-50">{uploading ? "Subiendo..." : saving ? "Enviando..." : "Enviar comprobante"}</button>}{message && <p className="mt-2 text-xs text-[var(--coral)]">{message}</p>}</>}</div>;
}
