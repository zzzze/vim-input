import type { App as AppType, InputElement } from '@/instance/app/app'
import { VimMode } from '@/instance/vim/init'
import * as filter from '@/filter'

export default class EventBinder {
  app: AppType | undefined

  listen (app: AppType, inputElement?: InputElement) {
    this.app = app
    if (inputElement === undefined) {
      const boxes: InputElement[] = [].slice.call(window.document.querySelectorAll('input, textarea'))
      this.app.boxes = boxes
      for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i]
        box.onfocus = this.onFocus
        box.onclick = this.onClick
        box.onkeydown = this.onKeyDown
      }
    } else {
      inputElement.onfocus = this.onFocus
      inputElement.onclick = this.onClick
      inputElement.onkeydown = this.onKeyDown
    }
    this.app._on('reset_cursor_position', () => {
      if (this.app === undefined) {
        return
      }
      if (this.app.vim.isMode(VimMode.GENERAL) || this.app.vim.isMode(VimMode.VISUAL)) {
        this.app.vim.resetCursorByMouse()
      }
    })
    this.app._on('input', (e: KeyboardEvent, replaced: boolean) => {
      if (this.app === undefined) {
        return
      }
      let code: string = e.key.toLowerCase()
      this.app._log('mode:' + this.app.vim.currentMode)
      if (replaced) {
        this.app.recordText()
        return
      }
      if (filter.code(this.app, e.keyCode)) {
        const unionCode = this.app.isUnionCode(code, -1)
        const vimKeys = this.app.router.getKeys()
        if (unionCode !== undefined && (vimKeys[unionCode] != null)) {
          code = unionCode
        }
        this.app._log(`key code: ${code}`)
        const repeatCount = this.app.numberManager(code)
        this.app.parseRoute(code, e, repeatCount)
      }
    })
  }

  onFocus = (e: FocusEvent) => {
    if (this.app === undefined) {
      return
    }
    const target = e.target
    if (target === null || (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement))) {
      return
    }
    this.app.currentEle = target
    this.app.textUtil.setEle(target)
    this.app.vim.setTextUtil(this.app.textUtil)
    this.app.vim.resetVim()
    this.app.controller.setVim(this.app.vim)
    this.app.controller.setTextUtil(this.app.textUtil)
    this.app.initNumber()
  }

  onClick = (e: MouseEvent) => {
    if (this.app === undefined) {
      return
    }
    this.app._fire('reset_cursor_position', e)
  }

  onKeyDown = (e: KeyboardEvent) => {
    console.log(e)
    let replaced = false
    const key = e.key.toLowerCase()
    if (this.app === undefined) {
      return
    }
    if (this.app.key_code_white_list.includes(key)) {
      return
    }
    if (this.app.vim.isMode(VimMode.GENERAL) || this.app.vim.isMode(VimMode.VISUAL)) {
      if (this.app.vim.replaceRequest) {
        replaced = true
        this.app.vim.replaceRequest = false
        setTimeout(() => {
          this.app?.vim.selectPrevCharacter()
        }, 50)
      } else {
        e.preventDefault()
      }
    } else {
      if (key !== 'Escape'.toLowerCase()) {
        const p = this.app.textUtil.getSelectionStart()
        this.app.recordText(undefined, (p - 1 >= 0 ? p - 1 : p))
      }
    }
    this.app._fire('input', e, replaced)
  }
}
