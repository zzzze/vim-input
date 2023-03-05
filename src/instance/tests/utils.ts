import { Vim } from '../vim/vim'
import { TextUtil } from '../text/text'
import { VimMode } from '../vim/init'

const value01 = `0123456789
a-b+c,d.e/
f{g}h[i]?j
k(l)m_n=o*
p&q^r%s#t@
u~v!w:x;yz`

export interface SetupOptions {
  selectionStart?: number
  selectionEnd?: number
  switchModeTo?: VimMode
}

export function setup (options: SetupOptions = {}) {
  const textarea = document.createElement('textarea')
  textarea.value = value01
  const tu = new TextUtil(textarea)
  const vim = new Vim(tu)
  vim.switchModeTo(VimMode.EDIT)
  textarea.selectionStart = options.selectionStart ?? 0
  textarea.selectionEnd = options.selectionEnd ?? 0
  if (options.switchModeTo !== undefined) {
    vim.switchModeTo(options.switchModeTo)
  }
  return {
    vim,
    textarea,
    getSelectedText () {
      return textarea.value.slice(textarea.selectionStart, textarea.selectionEnd)
    },
  }
}
