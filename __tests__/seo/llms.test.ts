import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, it, expect } from 'vitest'

const llms = readFileSync(resolve(process.cwd(), 'public/llms.txt'), 'utf-8')

describe('llms.txt', () => {
  it('contains a Keywords section', () => {
    expect(llms).toMatch(/## Keywords/)
  })

  it('includes key domain terms in keywords', () => {
    expect(llms).toMatch(/demurrage/)
    expect(llms).toMatch(/fitosanitario/)
    expect(llms).toMatch(/consignatario/)
  })

  it('contains a "What Agora is not" section', () => {
    expect(llms).toMatch(/## (Lo que Agora no es|What Agora is not)/)
  })

  it('clarifies Agora is not a freight forwarder', () => {
    expect(llms).toMatch(/freight forwarder|agente de carga/)
  })
})

const llmsFull = readFileSync(resolve(process.cwd(), 'public/llms-full.txt'), 'utf-8')

describe('llms-full.txt', () => {
  it('exists and has substantial content', () => {
    expect(llmsFull.length).toBeGreaterThan(2000)
  })

  it('includes the three product pillars', () => {
    expect(llmsFull).toMatch(/Información capturada|captura.*desde donde/)
    expect(llmsFull).toMatch(/Errores detectados|validado.*automáticamente/)
    expect(llmsFull).toMatch(/Visibilidad sin perseguir/)
  })

  it('includes concrete stats', () => {
    expect(llmsFull).toMatch(/18h/)
    expect(llmsFull).toMatch(/94%/)
    expect(llmsFull).toMatch(/cereza 2025/)
  })

  it('includes a domain glossary', () => {
    expect(llmsFull).toMatch(/## Glosario/)
    expect(llmsFull).toMatch(/demurrage/)
    expect(llmsFull).toMatch(/fitosanitario/)
  })

  it('includes ideal customer profile', () => {
    expect(llmsFull).toMatch(/## (Para quién es|Perfil de cliente)/)
  })

  it('includes a "not" section', () => {
    expect(llmsFull).toMatch(/## (Lo que Agora no es|What Agora is not)/)
  })

  it('references the company correctly', () => {
    expect(llmsFull).toMatch(/Agente Agora LLC/)
    expect(llmsFull).toMatch(/agenteagora\.com/)
  })
})
