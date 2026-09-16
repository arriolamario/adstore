/* Ajusta el stock por talle de los items de una reserva. sign = -1 descuenta
   (crear/reactivar), +1 repone (cancelar/eliminar). Usado por orders.routes.js
   en crear, cambiar estado y eliminar — la misma logica en los tres casos. */
export const adjustStockForItems = (client, items, sign) => Promise.all(
  items
    .filter((i) => i.availability === 'stock')
    .map(async (it) => {
      const r = await client.query('SELECT stock FROM products WHERE id=$1 FOR UPDATE', [it.productId])
      if (!r.rows.length) return
      const stock = r.rows[0].stock || {}
      stock[it.size] = Math.max(0, Number(stock[it.size] || 0) + sign * Number(it.qty))
      await client.query('UPDATE products SET stock=$1::jsonb, updated_at=now() WHERE id=$2',
        [JSON.stringify(stock), it.productId])
    }),
)
