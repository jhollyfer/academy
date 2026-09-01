import { describe, expect, it } from 'vitest'
import { slugify } from './utils'

describe('slugify', () => {
  it('remove acento em vez de trocar a letra por hífen', () => {
    expect(slugify('Cerâmica e Barro')).toBe('ceramica-e-barro')
  })

  it('colapsa pontuação e espaço em um hífen só', () => {
    expect(slugify('Casa  ,  Decoração!')).toBe('casa-decoracao')
  })

  it('traduz o & como o backend traduz', () => {
    // O `string.slug` do AdonisJS tem tabela de símbolos, e quem grava é ele.
    // Divergir aqui faz a tela prometer um endereço e a vitrine servir outro.
    expect(slugify('Casa  &  Decoração!')).toBe('casa-and-decoracao')
  })

  it('não passa do teto da coluna', () => {
    expect(slugify('%'.repeat(200))).toHaveLength(0)
    expect(slugify('a'.repeat(300))).toHaveLength(254)
  })

  it('não deixa hífen sobrando nas pontas', () => {
    expect(slugify('  --Óleos Vegetais--  ')).toBe('oleos-vegetais')
  })

  it('devolve string vazia quando não sobra nada', () => {
    expect(slugify('---')).toBe('')
  })
})
