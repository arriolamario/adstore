import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional(),
});

export const GET = auth(async function getProfile(request) {
  if (!request.auth?.user?.id) return NextResponse.json({ error: "Debés iniciar sesión." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: request.auth.user.id }, select: { name: true, email: true, phone: true, role: true } });
  return user ? NextResponse.json({ user }) : NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
});

export const PATCH = auth(async function updateProfile(request) {
  if (!request.auth?.user?.id) return NextResponse.json({ error: "Debés iniciar sesión." }, { status: 401 });
  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos de perfil inválidos." }, { status: 400 });
  const user = await prisma.user.update({ where: { id: request.auth.user.id }, data: { name: parsed.data.name, phone: parsed.data.phone || null }, select: { name: true, email: true, phone: true, role: true } });
  return NextResponse.json({ user });
});
