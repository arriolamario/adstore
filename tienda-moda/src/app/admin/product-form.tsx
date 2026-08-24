"use client";

import { FormEvent, useState } from "react";

type VariantDraft = { size: string; sku: string; stock: number };
type CloudinaryResponse = { secure_url?: string; error?: { message?: string } };

export default function ProductForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Básicos");
  const [color, setColor] = useState("");
  const [price, setPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [availability, setAvailability] = useState<"IN_STOCK" | "PREORDER">("IN_STOCK");
  const [variantsText, setVariantsText] = useState("M, SKU-M, 0\nL, SKU-L, 0\nXL, SKU-XL, 0");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  function parseVariants(): VariantDraft[] {
    return variantsText.split("\n").filter((line) => line.trim()).map((line) => {
      const [size = "", sku = "", stock = "0"] = line.split(",").map((part) => part.trim());
      return { size, sku, stock: Number(stock) };
    });
  }

  async function uploadImage(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      setMessage("Faltan NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET en .env.");
      return;
    }
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
    const result = await response.json() as CloudinaryResponse;
    if (!response.ok || !result.secure_url) setMessage(result.error?.message ?? "No se pudo subir la imagen.");
    else setImageUrl(result.secure_url);
    setUploading(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!imageUrl) { setMessage("Seleccioná y subí una imagen antes de crear el producto."); return; }
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, category, color, price, imageUrl, availability, leadTimeDays: 5, variants: parseVariants() }) });
    const result = await response.json();
    setMessage(response.ok ? "Producto creado correctamente." : result.error);
    if (response.ok) { setName(""); setColor(""); setPrice(0); setImageUrl(""); setVariantsText("M, SKU-M, 0\nL, SKU-L, 0\nXL, SKU-XL, 0"); }
    setSaving(false);
  }

  return (
    <section className="mb-12 border-y border-[var(--line)] py-8">
      <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">Catálogo</p><h2 className="display-font mt-1 text-5xl">Nuevo producto.</h2></div>
      <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
        <label className="text-xs font-bold uppercase tracking-[0.1em]">Nombre<input value={name} onChange={(event) => setName(event.target.value)} required className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label>
        <label className="text-xs font-bold uppercase tracking-[0.1em]">Categoría<input value={category} onChange={(event) => setCategory(event.target.value)} required className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label>
        <label className="text-xs font-bold uppercase tracking-[0.1em]">Color<input value={color} onChange={(event) => setColor(event.target.value)} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label>
        <label className="text-xs font-bold uppercase tracking-[0.1em]">Precio<input type="number" min={1} value={price} onChange={(event) => setPrice(Number(event.target.value))} required className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2" /></label>
        <div className="md:col-span-2"><label className="text-xs font-bold uppercase tracking-[0.1em]">Imagen del producto<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); }} className="mt-2 block w-full border border-[var(--line)] bg-transparent p-3 text-sm" /></label>{uploading && <p className="mt-2 text-xs text-[var(--muted)]">Subiendo imagen...</p>}{imageUrl && <div className="mt-3 flex items-center gap-4"><img src={imageUrl} alt="Vista previa del producto" className="h-20 w-20 object-cover" /><span className="text-xs text-green-700">Imagen subida correctamente.</span></div>}</div>
        <label className="text-xs font-bold uppercase tracking-[0.1em]">Modalidad<select value={availability} onChange={(event) => setAvailability(event.target.value as "IN_STOCK" | "PREORDER")} className="mt-2 w-full border-b border-[var(--ink)] bg-transparent py-2"><option value="IN_STOCK">Disponible ahora</option><option value="PREORDER">Por encargo</option></select></label>
        <label className="text-xs font-bold uppercase tracking-[0.1em]">Variantes<textarea value={variantsText} onChange={(event) => setVariantsText(event.target.value)} required rows={4} className="mt-2 w-full border border-[var(--line)] bg-transparent p-2 font-mono text-sm" /><span className="mt-1 block text-[10px] normal-case text-[var(--muted)]">Una por línea: talle, SKU, stock</span></label>
        <div className="md:col-span-2"><button disabled={saving || uploading} className="bg-[var(--ink)] px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--paper)] disabled:opacity-50">{saving ? "Guardando..." : "Crear producto"}</button>{message && <p className="mt-3 text-sm font-bold text-[var(--coral)]">{message}</p>}</div>
      </form>
    </section>
  );
}
