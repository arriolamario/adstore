import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  includeUnavailable: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { category, search, includeUnavailable, page, pageSize } = querySchema.parse(Object.fromEntries(url.searchParams));
  const where = {
      active: true,
      ...(category && category !== "Todo" && { category }),
      ...((includeUnavailable !== "true" || search) && {
        AND: [
          ...(includeUnavailable !== "true" ? [{ OR: [{ variants: { some: { stock: { gt: 0 } } } }, { availability: "PREORDER" as const }] }] : []),
          ...(search ? [{ OR: [{ name: { contains: search, mode: "insensitive" as const } }, { category: { contains: search, mode: "insensitive" as const } }] }] : []),
        ],
      }),
    };
  const [products, total] = await Promise.all([prisma.product.findMany({
    where,
    include: { variants: { orderBy: { size: "asc" } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
  }), prisma.product.count({ where })]);
  return NextResponse.json({ products, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}
