import { describe, expect, it } from 'vitest'
import { dataUrlSize } from './image'

describe('dataUrlSize', () => {
  it('devuelve 0 para valores vacios o invalidos', () => {
    expect(dataUrlSize('')).toBe(0)
    expect(dataUrlSize(null)).toBe(0)
    expect(dataUrlSize(undefined)).toBe(0)
  })

  it('estima el tamano real que ocupa el base64 decodificado', () => {
    // 'aGVsbG8=' = base64 de 'hello' (5 bytes)
    expect(dataUrlSize('data:image/jpeg;base64,aGVsbG8=')).toBe(5)
  })
})
