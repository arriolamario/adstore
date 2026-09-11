import { describe, it, expect } from 'vitest'
import { currency, addBusinessDays, uid, slugify } from './format'

describe('currency', () => {
  it('formatea un numero como pesos argentinos sin decimales', () => {
    expect(currency(189990)).toContain('189.990')
  })

  it('trata valores vacios/undefined como 0', () => {
    expect(currency(undefined)).toContain('0')
    expect(currency(0)).toContain('0')
  })
})

describe('addBusinessDays', () => {
  it('salta el fin de semana al sumar dias habiles', () => {
    // Viernes 2024-01-05 + 1 dia habil -> lunes 2024-01-08
    const friday = new Date('2024-01-05T12:00:00')
    const result = addBusinessDays(friday, 1)
    expect(result.getDay()).toBe(1) // lunes
    expect(result.getDate()).toBe(8)
  })

  it('suma 5 dias habiles saltando dos fines de semana si corresponde', () => {
    const monday = new Date('2024-01-01T12:00:00') // lunes
    const result = addBusinessDays(monday, 5)
    expect(result.getDay()).not.toBe(0)
    expect(result.getDay()).not.toBe(6)
    // lunes + 5 habiles = el lunes siguiente (8 de enero)
    expect(result.getDate()).toBe(8)
  })
})

describe('uid', () => {
  it('genera identificadores distintos en llamadas sucesivas', () => {
    const a = uid()
    const b = uid()
    expect(a).not.toBe(b)
    expect(a.length).toBeGreaterThan(0)
  })
})

describe('slugify', () => {
  it('pasa a minusculas y reemplaza espacios por guiones', () => {
    expect(slugify('Runner Pro Air')).toBe('runner-pro-air')
  })

  it('quita caracteres que no son letras ni numeros', () => {
    expect(slugify('Medias 35-38 (pack x3)')).toBe('medias-35-38-pack-x3')
  })
})
