import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(60),
  color: z.string().trim().max(60).optional(),
  price: z.number().int().positive(),
  imageUrl: z.string().url(),
  availability: z.enum(["IN_STOCK", "PREORDER"]),
  leadTimeDays: z.number().int().min(1).max(60),
  featured: z.boolean().default(false),
  variants: z.array(z.object({ size: z.string().trim().min(1).max(20), sku: z.string().trim().min(1).max(40), stock: z.number().int().min(0).max(100000) })).min(1).max(100),
});

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const GET = auth(async function getAdminProducts(request) {
  if (request.auth?.user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const products = await prisma.product.findMany({
    include: { variants: { orderBy: [{ productId: "asc" }, { size: "asc" }] } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
});

export const POST = auth(async function createAdminProduct(request) {
  if (request.auth?.user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Revisá los datos del producto y sus variantes." }, { status: 400 });
  const data = parsed.data;
  if (new Set(data.variants.map((variant) => variant.sku)).size !== data.variants.length) return NextResponse.json({ error: "Los SKU no pueden repetirse." }, { status: 400 });

  try {
    const product = await prisma.product.create({ data: { name: data.name, slug: `${slugify(data.name)}-${Date.now().toString(36)}`, category: data.category, color: data.color || null, price: data.price, imageUrl: data.imageUrl, availability: data.availability, leadTimeDays: data.leadTimeDays, featured: data.featured, stock: data.variants.reduce((total, variant) => total + variant.stock, 0), variants: { create: data.variants } }, include: { variants: true } });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) return NextResponse.json({ error: "El SKU ya existe." }, { status: 409 });
    return NextResponse.json({ error: "No se pudo crear el producto." }, { status: 500 });
  }
});
