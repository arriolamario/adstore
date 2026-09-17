/* Envio de emails transaccionales (bienvenida, confirmacion y cambios de
   estado de reserva) via Resend. Es un extra, no un requisito: si no hay
   RESEND_API_KEY configurada, se omite el envio (con un log) en vez de
   romper el registro o la reserva — nunca debe tumbar la operacion real. */
import { Resend } from 'resend'
import { statusLabel } from '../../src/lib/orders.js'
import { currency, formatDate } from '../../src/lib/format.js'

const FROM = process.env.RESEND_FROM_EMAIL || 'AD Moda & Confort <onboarding@resend.dev>'
const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '')

const WHATSAPP_URL = 'https://wa.me/5492664325416'
const INSTAGRAM_URL = 'https://instagram.com/ad.modayconfort'

let client = null
if (process.env.RESEND_API_KEY) {
  try {
    client = new Resend(process.env.RESEND_API_KEY)
  } catch (err) {
    console.error('[email] RESEND_API_KEY invalida, se omiten los envios:', err.message)
  }
}

/* ---------- layout compartido (tabla, para compatibilidad con clientes de mail) ---------- */
const layout = (preheader, bodyHtml) => `
<!doctype html>
<html lang="es">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
  <body style="margin:0;padding:0;background:#fffaf6;font-family:Arial,Helvetica,sans-serif;color:#2e1a15;">
    <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffaf6;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #efdccb;">
          <tr><td style="background:linear-gradient(120deg,#a8583f,#c9974b);padding:24px 32px;">
            <span style="color:#fff;font-size:18px;font-weight:800;">AD Moda & Confort</span>
          </td></tr>
          <tr><td style="padding:32px;">${bodyHtml}</td></tr>
          <tr><td style="padding:20px 32px;border-top:1px solid #efdccb;font-size:12px;color:#a68b7c;">
            <p style="margin:0 0 8px;">Av. Fuerza Aerea 2778</p>
            <p style="margin:0;">
              <a href="${WHATSAPP_URL}" style="color:#a8583f;text-decoration:none;">WhatsApp</a>
              &nbsp;·&nbsp;
              <a href="${INSTAGRAM_URL}" style="color:#a8583f;text-decoration:none;">Instagram</a>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`

const button = (href, label) => `
  <a href="${href}" style="display:inline-block;background:#a8583f;color:#fff;text-decoration:none;
    padding:12px 24px;border-radius:999px;font-weight:600;font-size:14px;margin-top:16px;">${label}</a>`

const itemsTable = (items) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;font-size:14px;">
    ${items.map((i) => `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid #f5e2d1;">${i.qty}× ${i.name} <span style="color:#a68b7c;">(talle ${i.size})</span></td>
        <td style="padding:6px 0;border-bottom:1px solid #f5e2d1;text-align:right;white-space:nowrap;">${currency(i.price * i.qty)}</td>
      </tr>`).join('')}
    <tr>
      <td style="padding:10px 0 0;font-weight:700;">Subtotal</td>
      <td style="padding:10px 0 0;font-weight:700;text-align:right;">${currency(items.reduce((n, i) => n + i.price * i.qty, 0))}</td>
    </tr>
  </table>`

/* ---------- plantillas (exportadas por separado para poder testearlas sin red) ---------- */
export const welcomeEmailHtml = (user) => layout(
  `Bienvenido a AD Moda & Confort, ${user.name}`,
  `
    <h1 style="font-size:22px;margin:0 0 12px;">Hola ${user.name.split(' ')[0]} 👋</h1>
    <p style="font-size:15px;line-height:1.6;color:#6b4b3d;margin:0;">
      Gracias por crear tu cuenta en AD Moda & Confort. Ya podes reservar calzado
      y ropa para retirar por el local o recibir en tu casa.
    </p>
    ${SITE_URL ? button(`${SITE_URL}/catalogo`, 'Ver catalogo') : ''}
  `,
)

export const orderConfirmationHtml = (order) => layout(
  `Tu reserva ${order.id} fue confirmada`,
  `
    <h1 style="font-size:22px;margin:0 0 12px;">Reserva confirmada ✅</h1>
    <p style="font-size:15px;line-height:1.6;color:#6b4b3d;margin:0;">
      Codigo <strong>${order.id}</strong>. Te contactamos para coordinar
      ${order.fulfillment === 'pickup' ? 'el retiro por el local' : 'el envio'}.
      Disponible aproximadamente el <strong>${formatDate(order.estimatedReadyAt)}</strong>.
    </p>
    ${itemsTable(order.items || [])}
    ${SITE_URL ? button(`${SITE_URL}/cuenta/pedidos`, 'Ver mis pedidos') : ''}
  `,
)

export const orderStatusEmailHtml = (order) => layout(
  `Tu reserva ${order.id} esta ${statusLabel(order)}`,
  `
    <h1 style="font-size:22px;margin:0 0 12px;">Actualizacion de tu reserva</h1>
    <p style="font-size:15px;line-height:1.6;color:#6b4b3d;margin:0;">
      La reserva <strong>${order.id}</strong> ahora esta:
    </p>
    <p style="margin:12px 0;">
      <span style="display:inline-block;background:#fdf0ec;color:#854432;font-weight:700;
        padding:6px 14px;border-radius:999px;font-size:14px;">${statusLabel(order)}</span>
    </p>
    ${itemsTable(order.items || [])}
    ${SITE_URL ? button(`${SITE_URL}/cuenta/pedidos`, 'Ver mis pedidos') : ''}
  `,
)

/* ---------- envio ---------- */
async function send({ to, subject, html }) {
  if (!to) return
  if (!client) {
    console.log(`[email] RESEND_API_KEY no configurada, se omite el envio a ${to}: "${subject}"`)
    return
  }
  try {
    await client.emails.send({ from: FROM, to, subject, html })
  } catch (err) {
    // Un email que falla no debe tumbar el registro ni la reserva.
    console.error('[email] Error al enviar:', err.message)
  }
}

export const sendWelcomeEmail = (user) =>
  send({ to: user.email, subject: 'Bienvenido a AD Moda & Confort', html: welcomeEmailHtml(user) })

export const sendOrderConfirmationEmail = (order) =>
  send({ to: order.customer?.email, subject: `Reserva confirmada · ${order.id}`, html: orderConfirmationHtml(order) })

export const sendOrderStatusEmail = (order) =>
  send({ to: order.customer?.email, subject: `Tu reserva ${order.id} esta ${statusLabel(order)}`, html: orderStatusEmailHtml(order) })
