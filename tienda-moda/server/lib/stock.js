/* Ajusta el stock por talle (+ color, si el producto lo usa) de los items
   de una reserva. sign = -1 descuenta (crear/reactivar), +1 repone
   (cancelar/eliminar). Usado por orders.routes.js en crear, cambiar estado
   y eliminar — la misma logica en los tres casos.

   La clave del stock es "talle" o "talle|color" segun si el item trae
   color (ver src/lib/inventory.js, mismo criterio que usa el frontend). */
const keyFor = (it) => (it.color ? `${it.size}|${it.color}` : it.size)

export const adjustStockForItems = (client, items, sign) => Promise.all(
  items
    .filter((i) => i.availability === 'stock')
    .map(async (it) => {
      const r = await client.query('SELECT stock FROM products WHERE id=$1 FOR UPDATE', [it.productId])
      if (!r.rows.length) return
      const stock = r.rows[0].stock || {}
      const key = keyFor(it)
      stock[key] = Math.max(0, Number(stock[key] || 0) + sign * Number(it.qty))
      await client.query('UPDATE products SET stock=$1::jsonb, updated_at=now() WHERE id=$2',
        [JSON.stringify(stock), it.productId])
    }),
)
