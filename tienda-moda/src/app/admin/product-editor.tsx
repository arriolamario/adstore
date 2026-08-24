"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Product = { id: string; name: string; category: string; color: string | null; price: number; imageUrl: string; availability: "IN_STOCK" | "PREORDER"; leadTimeDays: number };
type CloudinaryResponse = { secure_url?: string; error?: { message?: string } };

export default function ProductEditor({ product }: { product: Product }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(product);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadImage(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) { setMessage("Configurá Cloudinary antes de subir una imagen."); return; }
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", uploadPreset);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
    const result = await response.json() as CloudinaryResponse;
    if (response.ok && result.secure_url) setForm((current) => ({ ...current, imageUrl: result.secure_url! }));
    else setMessage(result.error?.message ?? "No se pudo subir la imagen.");
    setUploading(false);
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/admin/products/${product.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, color: form.color || null }) });
    const result = await response.json();
    if (response.ok) { setOpen(false); router.refresh(); }
    else setMessage(result.error ?? "No se pudo guardar.");
    setSaving(false);
  }

  return <><button onClick={() => setOpen(true)} className="border border-[var(--ink)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em]">Editar</button>{open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[var(--ink)] bg-[var(--paper)] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--coral)]">Editar catálogo</p><h2 className="display-font mt-1 text-5xl">{product.name}</h2></div><button onClick={() => setOpen(false)} className="text-xs font-bold uppercase">Cerrar</button></div><div className="mt-8 grid gap-5 sm:grid-cols-2"><label className="text-xs font-bold uppercase tracking-[0.1em]">Nombre<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label><label className="text-xs font-bold uppercase tracking-[0.1em]">Categoría<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label><label className="text-xs font-bold uppercase tracking-[0.1em]">Color<input value={form.color ?? ""} onChange={(event) => setForm({ ...form, color: event.target.value })} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label><label className="text-xs font-bold uppercase tracking-[0.1em]">Precio<input type="number" min={1} value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label><label className="text-xs font-bold uppercase tracking-[0.1em]">Modalidad<select value={form.availability} onChange={(event) => setForm({ ...form, availability: event.target.value as "IN_STOCK" | "PREORDER" })} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2"><option value="IN_STOCK">Disponible ahora</option><option value="PREORDER">Por encargo</option></select></label><label className="text-xs font-bold uppercase tracking-[0.1em]">Días de encargo<input type="number" min={1} max={60} value={form.leadTimeDays} onChange={(event) => setForm({ ...form, leadTimeDays: Number(event.target.value) })} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label><div className="sm:col-span-2"><label className="text-xs font-bold uppercase tracking-[0.1em]">Reemplazar imagen<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); }} className="mt-2 block w-full border border-[var(--line)] p-2" /></label>{form.imageUrl && <img src={form.imageUrl} alt="Vista previa" className="mt-3 h-28 w-28 object-cover" />}</div></div><div className="mt-8 flex items-center gap-4"><button disabled={saving || uploading} onClick={save} className="bg-[var(--ink)] px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--paper)] disabled:opacity-50">{saving ? "Guardando" : uploading ? "Subiendo imagen" : "Guardar cambios"}</button>{message && <p className="text-sm font-bold text-[var(--coral)]">{message}</p>}</div></section></div>}</>;
}
