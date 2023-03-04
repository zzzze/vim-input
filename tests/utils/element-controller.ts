import { VimMode } from '../../src/instance/vim/init'
import type { Vim } from '../../src/instance/vim/vim'
import type jsdom from 'jsdom'
import delay from './delay'

export interface PressKeyOptions {
  repeatCount: number
  delay?: number
}

export class ElementController {
  constructor (
    private readonly dom: jsdom.JSDOM,
    private readonly element: HTMLTextAreaElement | HTMLInputElement,
    private readonly vim: Vim,
  ) {}

  focus () {
    this.element.focus()
  }

  async pressKey (key: string, options: PressKeyOptions = { repeatCount: 1 }) {
    const eventOptions: KeyboardEventInit = {}
    key.toLowerCase().split('+').forEach(section => {
      switch (section) {
        case 'shift': {
          eventOptions.shiftKey = true
          break
        }
        case 'ctrl': {
          eventOptions.ctrlKey = true
          break
        }
        case 'alt': {
          eventOptions.altKey = true
          break
        }
        default: {
          eventOptions.key = section
        }
      }
    })
    const event = new this.dom.window.KeyboardEvent('keydown', eventOptions)
    for (let i = options.repeatCount; i > 0; i--) {
      if (i < options.repeatCount) {
        await delay(options.delay ?? 300)
      }
      this.element.dispatchEvent(event)
    }
  }

  async input (data: string) {
    if (!this.vim.isMode(VimMode.EDIT)) {
      return
    }
    const selectionStart = this.element.selectionStart
    if (selectionStart === null) {
      return
    }
    const selectionEnd = this.element.selectionStart ?? selectionStart
    const value = this.element.value
    this.element.value = `${value.slice(0, selectionStart)}${data}${value.slice(selectionEnd)}`
    this.element.dispatchEvent(new this.dom.window.Event('input', {
      bubbles: true,
      cancelable: true,
    }))
  }
}
