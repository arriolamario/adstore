// Redimensiona y recomprime una foto antes de mandarla como base64 al backend.
// Sin esto, una foto de celular (varios MB) + 33% de overhead de base64 puede
// superar el limite duro de 4.5 MB por request que impone Vercel en las
// funciones serverless (ver README > Deploy en Vercel) y el POST/PUT falla
// en produccion aunque funcione en local.
const MAX_DIMENSION = 1200
const JPEG_QUALITY = 0.72

export function compressImageFile(file, { maxDimension = MAX_DIMENSION, quality = JPEG_QUALITY } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error || new Error('No se pudo leer el archivo.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('No se pudo leer la imagen.'))
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

// Estima el tamano (en bytes) que ocupara un data URL base64 dentro del JSON.
export function dataUrlSize(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return 0
  const base64 = dataUrl.split(',')[1] || ''
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.floor((base64.length * 3) / 4) - padding
}
