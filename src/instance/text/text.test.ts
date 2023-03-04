import { describe, expect, it } from 'vitest'
import { TextUtil } from './text'

describe('TextUtil', () => {
  it('', () => {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = `hello

world`
    textarea.setSelectionRange(5, 6)
    const tu = new TextUtil(textarea)
    tu.delSelected()
    console.log(textarea.value)
    expect(textarea.value).to.equal(`hello
world`)
  })
})
