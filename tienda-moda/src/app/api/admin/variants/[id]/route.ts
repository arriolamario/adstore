import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";

const variantSchema = z.object({ size: z.string().trim().min(1).max(20), sku: z.string().trim().min(1).max(40), color: z.string().trim().max(60).nullable().optional() });

export const PATCH = auth(async function updateVariant(request, context) {
  if (request.auth?.user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const parsed = variantSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos de variante inválidos." }, { status: 400 });
  const { id } = await context.params;
  try {
    const variant = await prisma.productVariant.update({ where: { id }, data: { ...parsed.data, color: parsed.data.color || null }, select: { id: true, size: true, sku: true, color: true, stock: true } });
    return NextResponse.json({ variant });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) return NextResponse.json({ error: "El SKU o la combinación de talle y color ya existe." }, { status: 409 });
    return NextResponse.json({ error: "No se pudo actualizar la variante." }, { status: 500 });
  }
});
