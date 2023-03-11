import { describe, expect, it } from 'vitest'
import { ElementController } from './utils/element-controller'
import { prepare } from './utils/prepare'

describe('selection and deletion (v)', () => {
  it('should delete selected characters - forward selection', async () => {
    const { dom, element } = await prepare('__tests__/fixtures/letter.html')
    const controller = new ElementController(dom, element, dom.window.app.vim)
    controller.focus()
    await controller.pressKey('Escape')
    await controller.pressKey('v')
    await controller.pressKey('l')
    await controller.pressKey('x')
    expect(element.value).toMatchSnapshot()
    expect(dom.window.app.vim.currentMode).to.equal('general_mode')
  })

  it('should delete selected characters - forward selected - multi-line', async () => {
    const { dom, element } = await prepare('__tests__/fixtures/letter.html')
    const controller = new ElementController(dom, element, dom.window.app.vim)
    controller.focus()
    await controller.pressKey('Escape')
    await controller.pressKey('v')
    await controller.pressKey('l', { repeatCount: 6 })
    await controller.pressKey('j', { repeatCount: 6 })
    await controller.pressKey('x')
    expect(element.value).toMatchSnapshot()
    expect(dom.window.app.vim.currentMode).to.equal('general_mode')
  })

  it('should delete selected characters - backward selection', async () => {
    const { dom, element } = await prepare('__tests__/fixtures/letter.html')
    const controller = new ElementController(dom, element, dom.window.app.vim)
    controller.focus()
    await controller.pressKey('Escape')
    await controller.pressKey('j', { repeatCount: 2 })
    await controller.pressKey('l', { repeatCount: 6 })
    await controller.pressKey('v')
    await controller.pressKey('h', { repeatCount: 6 })
    await controller.pressKey('x')
    expect(element.value).toMatchSnapshot()
    expect(dom.window.app.vim.currentMode).to.equal('general_mode')
  })
})
