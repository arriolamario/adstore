/* Datos de contacto de la tienda, en un solo lugar para no repetir el
   numero/usuario en cada componente que los use. */

export const WHATSAPP_NUMBER = '5492664325416'
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`
export const INSTAGRAM_URL = 'https://instagram.com/ad.modayconfort'

/** Link de WhatsApp con un mensaje prellenado (el usuario igual tiene que tocar Enviar). */
export const whatsappLinkWithMessage = (message) =>
  `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`

/** Mensaje prellenado para avisar por WhatsApp que se confirmo una reserva. */
export const orderWhatsAppMessage = (order) =>
  `Hola! Quiero avisar que confirme mi reserva ${order.id} ` +
  `(${order.fulfillment === 'pickup' ? 'retiro en el local' : 'envio a domicilio'}). Gracias!`
