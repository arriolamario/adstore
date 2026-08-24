import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  { name: "Campera Orbit", slug: "campera-orbit", category: "Abrigos", color: "Piedra", price: 89900, imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85", featured: true, variants: [{ size: "S", sku: "ORBIT-S", stock: 3 }, { size: "M", sku: "ORBIT-M", stock: 5 }, { size: "L", sku: "ORBIT-L", stock: 4 }] },
  { name: "Runner 02", slug: "runner-02", category: "Calzado", color: "Hueso / Lima", price: 124900, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85", featured: true, variants: [{ size: "39", sku: "RUNNER-39", stock: 2 }, { size: "40", sku: "RUNNER-40", stock: 4 }, { size: "41", sku: "RUNNER-41", stock: 2 }] },
  { name: "Jean Ruta", slug: "jean-ruta", category: "Pantalones", color: "Azul lavado", price: 64900, imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=85", featured: false, variants: [{ size: "38", sku: "RUTA-38", stock: 4 }, { size: "40", sku: "RUTA-40", stock: 8 }, { size: "42", sku: "RUTA-42", stock: 8 }] },
  { name: "Remera Base 01", slug: "remera-base-01", category: "Básicos", color: "Naranja solar", price: 29900, imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85", featured: true, variants: [{ size: "M", sku: "BASE01-M", stock: 12 }, { size: "L", sku: "BASE01-L", stock: 12 }, { size: "XL", sku: "BASE01-XL", stock: 8 }] },
  { name: "Zapatilla Court", slug: "zapatilla-court", category: "Calzado", color: "Blanco / rojo", price: 109900, imageUrl: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=85", featured: true, availability: "PREORDER" as const, variants: [{ size: "39", sku: "COURT-39", stock: 0 }, { size: "40", sku: "COURT-40", stock: 0 }, { size: "41", sku: "COURT-41", stock: 0 }] },
];

async function main() {
  for (const { variants, ...product } of products) {
    const savedProduct = await prisma.product.upsert({ where: { slug: product.slug }, update: product, create: product });
    for (const variant of variants) {
      await prisma.productVariant.upsert({ where: { sku: variant.sku }, update: { ...variant, productId: savedProduct.id }, create: { ...variant, productId: savedProduct.id } });
    }
  }
}

main().finally(() => prisma.$disconnect());
