"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import AccountMenu from "./account-menu";
import CartPanel from "./cart-panel";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  color: string | null;
  imageUrl: string;
  stock: number;
  availability: "IN_STOCK" | "PREORDER";
  leadTimeDays: number;
  variants: ProductVariant[];
};

type ProductVariant = {
  id: string;
  size: string;
  color: string | null;
  stock: number;
  sku: string;
};

type CartItem = { productId: string; variantId: string; quantity: number };

const categories = ["Todo", "Novedades", "Abrigos", "Calzado", "Pantalones", "Básicos", "Accesorios"];
const money = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("Todo");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER">("CASH");
  const [deliveryMethod, setDeliveryMethod] = useState<"PICKUP" | "UBER_MOTO">("PICKUP");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((response) => response.json())
      .then((result: { products: Product[] }) => setProducts(result.products))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const savedCart = window.localStorage.getItem("nova-cart");
    window.requestAnimationFrame(() => {
      if (savedCart) {
        try { setCart(JSON.parse(savedCart) as CartItem[]); } catch { window.localStorage.removeItem("nova-cart"); }
      }
      setCartHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (cartHydrated) window.localStorage.setItem("nova-cart", JSON.stringify(cart));
  }, [cart, cartHydrated]);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const categoryMatch = activeCategory === "Todo" || activeCategory === "Novedades" || product.category === activeCategory;
    return categoryMatch && `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase());
  }), [activeCategory, products, query]);
  const cartProducts = cart.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
    return product && variant ? { ...product, ...item, size: variant.size } : null;
  }).filter((entry): entry is Product & CartItem & { size: string } => Boolean(entry));
  const cartTotal = cartProducts.reduce((total, product) => total + product.price * product.quantity, 0);
  const cartQuantity = cart.reduce((total, item) => total + item.quantity, 0);

  function changeQuantity(productId: string, variantId: string, delta: number) {
    setCart((current) => current.flatMap((item) => item.productId === productId && item.variantId === variantId ? (item.quantity + delta > 0 ? [{ ...item, quantity: item.quantity + delta }] : []) : [item]));
  }

  function removeFromCart(productId: string, variantId: string) {
    setCart((current) => current.filter((item) => item.productId !== productId || item.variantId !== variantId));
  }

  async function reserveCart() {
    setSubmittingOrder(true);
    setOrderMessage("");
    const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cart, paymentMethod, deliveryMethod, deliveryAddress }) });
    const result = await response.json();
    if (response.status === 401) {
      window.location.href = "/login";
      return;
    }
    setOrderMessage(response.ok ? `Reserva ${result.order.id} creada. Te contactaremos para coordinarla.` : result.error);
    if (response.ok) setCart([]);
    setSubmittingOrder(false);
  }

  return (
    <main>
      <div className="noise border-b border-[var(--line)] bg-[var(--lime)] px-5 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em]">Envíos gratis desde $120.000 · Cambios simples por 30 días</div>
      <header className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-6 lg:px-10">
        <button className="lg:hidden" aria-label="Abrir menú" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        <a href="#inicio" className="display-font text-3xl tracking-[-0.06em]">NOVA<span className="text-[var(--coral)]">.</span></a>
        <nav className={`${menuOpen ? "flex" : "hidden"} absolute left-0 top-[104px] z-20 w-full flex-col gap-5 border-b border-[var(--line)] bg-[var(--paper)] px-5 py-6 text-sm font-bold uppercase tracking-[0.12em] lg:static lg:flex lg:w-auto lg:flex-row lg:border-0 lg:bg-transparent lg:p-0`}>
          <a href="#shop" onClick={() => setMenuOpen(false)}>Shop</a><a href="#historia" onClick={() => setMenuOpen(false)}>Nuestra mirada</a><Link href="/mis-reservas" onClick={() => setMenuOpen(false)}>Mis reservas</Link><Link href="/perfil" onClick={() => setMenuOpen(false)}>Mi perfil</Link><a href="#contacto" onClick={() => setMenuOpen(false)}>Ayuda</a>
        </nav>
        <div className="flex items-center gap-3">
          <AccountMenu />
          <button className="flex h-10 items-center gap-2 text-xs uppercase tracking-[0.1em]" onClick={() => setSearchOpen(!searchOpen)} aria-label="Buscar"><Search size={18} /><span className="hidden sm:inline">Buscar</span></button>
          <button className="relative flex h-10 items-center gap-2 text-xs uppercase tracking-[0.1em]" aria-label="Abrir carrito" onClick={() => setCartOpen(true)}><ShoppingBag size={19} /><span className="hidden sm:inline">Bolsa</span>{cartQuantity > 0 && <b className="absolute -right-3 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--coral)] px-1 text-[10px]">{cartQuantity}</b>}</button>
        </div>
      </header>
      {searchOpen && <div className="mx-auto max-w-[1440px] px-5 pb-5 lg:px-10"><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar prendas, calzado..." className="w-full border-b-2 border-[var(--ink)] bg-transparent py-3 text-2xl outline-none placeholder:text-[var(--muted)]" /></div>}
        <CartPanel products={products} cart={cart} setCart={setCart} open={cartOpen} onClose={() => setCartOpen(false)} />

      {cartOpen && deliveryMethod === "UBER_MOTO" && <div className="fixed bottom-28 right-6 z-40 w-[min(28rem,calc(100vw-3rem))] border border-[var(--ink)] bg-[var(--paper)] p-4 shadow-xl"><label className="block text-xs font-bold uppercase tracking-[0.1em]">Dirección de entrega<textarea value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} required placeholder="Calle, altura, localidad y referencias" className="mt-2 w-full border border-[var(--line)] bg-transparent p-2 text-sm normal-case" /></label></div>}
      <section id="inicio" className="mx-auto grid max-w-[1440px] gap-5 px-5 pb-14 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:pb-24">
        <div className="relative flex min-h-[510px] flex-col justify-between overflow-hidden bg-[#d9e7da] p-7 sm:p-12 lg:min-h-[680px]">
          <div className="relative z-10 flex items-start justify-between"><span className="rounded-full border border-[var(--ink)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]">Drop 01 / 26</span><span className="text-right text-xs uppercase leading-5 tracking-[0.12em]">Hecho para<br />moverte</span></div>
          <div className="relative z-10 max-w-[530px]"><p className="mb-4 text-xs font-bold uppercase tracking-[0.2em]">Nueva colección</p><h1 className="display-font text-[clamp(4.5rem,10vw,9rem)] leading-[0.78] tracking-[-0.07em]">Vestite<br /><em className="text-[var(--coral)]">libre.</em></h1><a href="#shop" className="mt-9 inline-flex items-center gap-2 border-b border-[var(--ink)] pb-2 text-sm font-bold uppercase tracking-[0.1em]">Explorar drop <ArrowUpRight size={17} /></a></div>
          <div className="absolute bottom-[-8%] right-[2%] h-[70%] w-[49%] rotate-[-7deg] overflow-hidden rounded-[45%_45%_0_0] bg-[var(--coral)]"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=85" alt="Look de la nueva colección" className="h-full w-full object-cover mix-blend-multiply" /></div>
        </div>
        <div className="grid min-h-[510px] grid-rows-2 gap-5 lg:min-h-[680px]"><div className="flex items-end justify-between bg-[var(--ink)] p-7 text-[var(--paper)] sm:p-10"><p className="display-font max-w-[330px] text-5xl leading-[0.88] tracking-[-0.05em]">Menos ruido.<br /><span className="text-[var(--lime)]">Más vos.</span></p><span className="max-w-[120px] text-right text-xs uppercase leading-5 tracking-[0.12em]">Prendas que se quedan con vos</span></div><div className="relative overflow-hidden bg-[#dfcbb5] p-7 sm:p-10"><div className="relative z-10 flex h-full flex-col justify-between"><span className="text-xs font-bold uppercase tracking-[0.16em]">Favoritos de la semana</span><a href="#shop" className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.1em]">Ver selección <ArrowUpRight size={17} /></a></div><img src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=85" alt="Selección de prendas NOVA" className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-multiply" /></div></div>
      </section>

      <section id="shop" className="mx-auto max-w-[1440px] px-5 pb-24 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-5 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">La selección desde Neon</p><h2 className="display-font text-6xl leading-none tracking-[-0.06em]">Elegí tu ritmo.</h2></div></div>
        <div className="mb-9 flex gap-5 overflow-x-auto border-b border-[var(--line)] pb-3 text-xs font-bold uppercase tracking-[0.12em]">{categories.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={`shrink-0 ${activeCategory === category ? "border-b-2 border-[var(--coral)] text-[var(--coral)]" : "text-[var(--muted)]"}`}>{category}</button>)}</div>
        {loading && <p className="py-20 text-center text-[var(--muted)]">Cargando selección...</p>}
        {!loading && filteredProducts.length === 0 && <p className="py-20 text-center text-[var(--muted)]">No hay productos disponibles para esta búsqueda.</p>}
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:gap-x-5">
          {filteredProducts.map((product) => <article key={product.id} className="group"><div className={`relative mb-4 aspect-[0.78] overflow-hidden ${product.availability === "PREORDER" ? "bg-[var(--coral)]" : "bg-[#dedbd2]"}`}><img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 bg-[var(--paper)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em]">{product.availability === "PREORDER" ? "Por encargo" : "Disponible"}</span><button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--paper)]/90" aria-label={`Agregar ${product.name} a favoritos`}><Heart size={16} /></button></div><div className="flex justify-between gap-2"><div className="w-full"><h3 className="text-sm font-bold">{product.name}</h3><p className="mt-1 text-xs text-[var(--muted)]">{product.category} · {product.color}</p><p className="mt-1 text-xs text-[var(--coral)]">{product.availability === "PREORDER" ? `Entrega en ${product.leadTimeDays} días hábiles` : "Elegí tu talle"}</p><select aria-label={`Talle de ${product.name}`} value={selectedVariants[product.id] ?? ""} onChange={(event) => setSelectedVariants((current) => ({ ...current, [product.id]: event.target.value }))} className="mt-3 w-full border-b border-[var(--ink)] bg-transparent py-2 text-xs"><option value="">Seleccionar talle</option>{product.variants.map((variant) => <option key={variant.id} value={variant.id} disabled={product.availability === "IN_STOCK" && variant.stock === 0}>{variant.size}{product.availability === "IN_STOCK" ? ` · ${variant.stock} disponibles` : ""}</option>)}</select><button disabled={!selectedVariants[product.id]} onClick={() => setCart((current) => { const variantId = selectedVariants[product.id]; const existing = current.find((item) => item.productId === product.id && item.variantId === variantId); return existing ? current.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { productId: product.id, variantId, quantity: 1 }]; })} className="mt-3 w-full bg-[var(--ink)] py-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--paper)] disabled:opacity-40">{product.availability === "PREORDER" ? "Encargar" : "Sumar a la bolsa"}</button></div><strong className="text-sm">{money(product.price)}</strong></div></article>)}
        </div>
      </section>

      <section id="historia" className="border-y border-[var(--ink)] bg-[var(--coral)] px-5 py-16 lg:px-10 lg:py-24"><div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-2 lg:items-end"><p className="display-font max-w-[700px] text-6xl leading-[0.86] tracking-[-0.06em] sm:text-8xl">Diseño honesto para días reales<span className="text-[var(--lime)]">.</span></p><div className="max-w-[360px] justify-self-end text-sm leading-6"><p>Diseñamos menos piezas, pero mejores. Materiales que bancan el uso, siluetas que no dependen de una temporada y color para salir de automático.</p></div></div></section>
      <footer id="contacto" className="mx-auto flex max-w-[1440px] flex-col gap-10 px-5 py-12 lg:flex-row lg:justify-between lg:px-10"><div><a href="#inicio" className="display-font text-4xl tracking-[-0.06em]">NOVA<span className="text-[var(--coral)]">.</span></a><p className="mt-3 max-w-[260px] text-xs leading-5 text-[var(--muted)]">Ropa, calzado y accesorios para vivir en movimiento.</p></div><div className="flex gap-14 text-xs uppercase tracking-[0.12em]"><div className="flex flex-col gap-4"><b>Ayuda</b><a href="#contacto">Envíos</a><a href="#contacto">Cambios</a><a href="#contacto">Contacto</a></div><div className="flex flex-col gap-4"><b>Seguinos</b><a href="#contacto">Instagram</a><a href="#contacto">Pinterest</a><a href="#contacto">TikTok</a></div></div><p className="self-end text-[10px] uppercase tracking-[0.1em] text-[var(--muted)]">© 2026 Nova Studio</p></footer>
    </main>
  );
}
