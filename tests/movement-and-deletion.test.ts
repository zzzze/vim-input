import { describe, expect, it } from 'vitest'
import { ElementController } from './utils/element-controller'
import { prepare } from './utils/prepare'
import delay from './utils/delay'

describe('movement and deletion (dd)', () => {
  it('should delete first line', async () => {
    const { dom, element } = await prepare('tests/fixtures/letter.html')
    const controller = new ElementController(dom, element, dom.window.app.vim)
    controller.focus()
    await controller.pressKey('Escape')
    await controller.pressKey('d', { repeatCount: 2 })
    expect(element.value).toMatchSnapshot()
    expect(dom.window.app.vim.currentMode).to.equal('general_mode')
  })

  it('should delete second line', async () => {
    const { dom, element } = await prepare('tests/fixtures/letter.html')
    const controller = new ElementController(dom, element, dom.window.app.vim)
    controller.focus()
    await controller.pressKey('Escape')
    await controller.pressKey('j')
    await controller.pressKey('d', { repeatCount: 2 })
    expect(element.value).toMatchSnapshot()
    expect(dom.window.app.vim.currentMode).to.equal('general_mode')
  })

  it('should delete last line', async () => {
    const { dom, element } = await prepare('tests/fixtures/letter.html')
    const controller = new ElementController(dom, element, dom.window.app.vim)
    controller.focus()
    await controller.pressKey('Escape')
    await controller.pressKey('shift+g')
    await controller.pressKey('d', { repeatCount: 2 })
    expect(element.value).toMatchSnapshot()
    expect(dom.window.app.vim.currentMode).to.equal('general_mode')
  })
})

describe('movement and deletion (x)', () => {
  it('should delete first character of first line', async () => {
    const { dom, element } = await prepare('tests/fixtures/letter.html')
    const controller = new ElementController(dom, element, dom.window.app.vim)
    controller.focus()
    await controller.pressKey('Escape')
    await controller.pressKey('x')
    expect(element.value).toMatchSnapshot()
    expect(dom.window.app.vim.currentMode).to.equal('general_mode')
  })

  it('should not delete a empty line', async () => {
    const { dom, element } = await prepare('tests/fixtures/letter.html')
    const controller = new ElementController(dom, element, dom.window.app.vim)
    controller.focus()
    await controller.pressKey('Escape')
    await controller.pressKey('j')
    await controller.pressKey('x', { repeatCount: 10 })
    expect(element.value).toMatchSnapshot()
    expect(dom.window.app.vim.currentMode).to.equal('general_mode')
  })

  it('should delete second character', async () => {
    const { dom, element } = await prepare('tests/fixtures/letter.html')
    const controller = new ElementController(dom, element, dom.window.app.vim)
    controller.focus()
    await controller.pressKey('Escape')
    await controller.pressKey('l')
    await controller.pressKey('x')
    expect(element.value).toMatchSnapshot()
    expect(dom.window.app.vim.currentMode).to.equal('general_mode')
  })
})

describe('movement and deletion (s)', () => {
  it('should delete first character of first line', async () => {
    const { dom, element } = await prepare('tests/fixtures/letter.html')
    const controller = new ElementController(dom, element, dom.window.app.vim)
    controller.focus()
    await controller.pressKey('Escape')
    await controller.pressKey('s')
    expect(element.value).toMatchSnapshot()
    await delay(200)
    expect(dom.window.app.vim.currentMode).to.equal('edit_mode')
  })

  it('should not delete a empty line', async () => {
    const { dom, element } = await prepare('tests/fixtures/letter.html')
    const controller = new ElementController(dom, element, dom.window.app.vim)
    controller.focus()
    await controller.pressKey('Escape')
    await controller.pressKey('j')
    await controller.pressKey('s')
    expect(element.value).toMatchSnapshot()
    await delay(200)
    expect(dom.window.app.vim.currentMode).to.equal('edit_mode')
  })
})
