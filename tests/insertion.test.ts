import { describe, expect, it } from 'vitest'
import { ElementController } from './utils/element-controller'
import { prepare } from './utils/prepare'
import delay from './utils/delay'

describe('insertion (o)', async () => {
  it('should append new line after current line', async () => {
    const { dom, element } = await prepare('tests/fixtures/letter.html')
    const controller = new ElementController(dom, element, dom.window.app.vim)
    controller.focus()
    await controller.pressKey('Escape')
    await controller.pressKey('o')
    expect(element.value).toMatchSnapshot()
    await delay(200)
    expect(dom.window.app.vim.currentMode).to.equal('edit_mode')
  })

  it('should append new line before current line', async () => {
    const { dom, element } = await prepare('tests/fixtures/letter.html')
    const controller = new ElementController(dom, element, dom.window.app.vim)
    controller.focus()
    await controller.pressKey('Escape')
    await controller.pressKey('shift+o')
    expect(element.value).toMatchSnapshot()
    await delay(200)
    expect(dom.window.app.vim.currentMode).to.equal('edit_mode')
  })
})

describe('insertion (a)', async () => {
  it('should append characters in most front of empty line', async () => {
    const { dom, element } = await prepare('tests/fixtures/letter.html')
    const controller = new ElementController(dom, element, dom.window.app.vim)
    controller.focus()
    await controller.pressKey('Escape')
    await controller.pressKey('j')
    await controller.pressKey('a')
    await delay(200)
    await controller.input('hello world')
    expect(element.value).toMatchSnapshot()
  })

  it('should restore empty line placeholder if nothing appended to the empty line', async () => {
    const { dom, element } = await prepare('tests/fixtures/letter.html')
    const controller = new ElementController(dom, element, dom.window.app.vim)
    controller.focus()
    await controller.pressKey('Escape')
    await controller.pressKey('j')
    const selectionStart = element.selectionStart
    const selectionEnd = element.selectionEnd
    await controller.pressKey('a')
    await delay(200)
    await controller.pressKey('Escape')
    await delay(200)
    expect(element.value).toMatchSnapshot()
    expect(element.selectionStart).to.equal(selectionStart)
    expect(element.selectionEnd).to.equal(selectionEnd)
  })
})
