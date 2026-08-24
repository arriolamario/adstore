import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  active: z.boolean().optional(),
  name: z.string().trim().min(2).max(120).optional(),
  category: z.string().trim().min(2).max(60).optional(),
  color: z.string().trim().max(60).nullable().optional(),
  price: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
  availability: z.enum(["IN_STOCK", "PREORDER"]).optional(),
  leadTimeDays: z.number().int().min(1).max(60).optional(),
});

export const PATCH = auth(async function updateAdminProduct(request, context) {
  if (request.auth?.user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Actualización inválida." }, { status: 400 });
  const { id } = await context.params;
  if (Object.keys(parsed.data).length === 0) return NextResponse.json({ error: "No hay cambios para guardar." }, { status: 400 });
  const product = await prisma.product.update({ where: { id }, data: parsed.data, select: { id: true, active: true, name: true, category: true, color: true, price: true, imageUrl: true, availability: true, leadTimeDays: true } });
  return NextResponse.json({ product });
});
