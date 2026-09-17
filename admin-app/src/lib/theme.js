/* Paleta y tokens, calcados de tienda-moda/src/styles/theme.css para que la
   app se sienta parte de la misma marca. Si cambia el sitio web, replicar aca. */
export const colors = {
  brand50: '#fdf0ec',
  brand100: '#f8d9cf',
  brand300: '#e8ac97',
  brand500: '#cf8368',
  brand600: '#a8583f',
  brand700: '#854432',
  accent500: '#c9974b',

  bg: '#fffaf6',
  bgSubtle: '#fbeee2',
  bgMuted: '#f5e2d1',
  surface: '#ffffff',
  border: '#efdccb',
  borderStrong: '#e0c1a8',

  text: '#2e1a15',
  textSoft: '#6b4b3d',
  textMuted: '#a68b7c',
  textInvert: '#ffffff',

  success: '#15803d',
  successBg: '#dcfce7',
  warning: '#b45309',
  warningBg: '#fef3c7',
  danger: '#b91c1c',
  dangerBg: '#fee2e2',
}

export const radius = { sm: 8, md: 14, lg: 22, pill: 999 }
export const spacing = (n) => n * 4
