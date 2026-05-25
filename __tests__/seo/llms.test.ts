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
