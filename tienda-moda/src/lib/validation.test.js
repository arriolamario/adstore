import { describe, it, expect } from 'vitest'
import { sanitizePhone, isValidPhone } from './validation'

describe('sanitizePhone', () => {
  it('quita letras y deja solo digitos', () => {
    expect(sanitizePhone('11abc5555 5555')).toBe('1155555555')
  })

  it('quita simbolos como + o guiones', () => {
    expect(sanitizePhone('+54 (11) 5555-5555')).toBe('541155555555')
  })

  it('recorta a un maximo de 15 digitos', () => {
    expect(sanitizePhone('1234567890123456789')).toHaveLength(15)
  })
})

describe('isValidPhone', () => {
  it('acepta entre 8 y 15 digitos', () => {
    expect(isValidPhone('1155555555')).toBe(true)
  })

  it('rechaza numeros muy cortos', () => {
    expect(isValidPhone('123')).toBe(false)
  })

  it('rechaza cualquier caracter que no sea digito', () => {
    expect(isValidPhone('1155-5555')).toBe(false)
  })
})
