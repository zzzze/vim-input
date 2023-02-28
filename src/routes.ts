import type { Router } from './instance/router/router'
import { VimMode } from './instance/vim/init'

export function ready (router: Router) {
  // ---------------------------
  // system feature keys:
  // ---------------------------

  router.code('End', 'End').action('End', 'moveToCurrentLineTail')
  router.code('Home', 'Home').action('Home', 'moveToCurrentLineHead')
  router.code('ArrowLeft', 'ArrowLeft').action('Left', 'selectPrevCharacter')
  router.code('ArrowUp', 'ArrowUp').action('Up', 'selectPrevLine')
  router.code('ArrowRight', 'ArrowRight').action('Right', 'selectNextCharacter')
  router.code('ArrowDown', 'ArrowDown').action('Down', 'selectNextLine')
  router.code('Insert', 'Insert').action('Insert', 'insert')
  router.code('Delete', 'Delete').action('Delete', 'delCharAfter')?.record(true)

  // ---------------------------
  // vim feature keys:
  // ---------------------------

  // 0:move to current line head
  router.code('0', '0').action(0, 'moveToCurrentLineHead')
  // &:move to current line tail
  router.code('4', '4').action('shift_4', 'moveToCurrentLineTail')
  // append
  router.code('a', 'a').action('a', 'append')?.action('A', 'appendLineTail')
  // insert
  router.code('i', 'i').action('i', 'insert')?.action('I', 'insertLineHead')
  // new line
  router.code('o', 'o').action('o', 'appendNewLine')?.action('O', 'insertNewLine')?.record(true)
  // replace
  router.code('r', 'r').action('r', 'replaceChar')
  // down
  router.code('Enter', 'Enter').action('enter', 'selectNextLine')
  router.code('j', 'j').action('j', 'selectNextLine')
  // up
  router.code('k', 'k').action('k', 'selectPrevLine')
  // left
  router.code('h', 'h').action('h', 'selectPrevCharacter')
  // right
  router.code('l', 'l').action('l', 'selectNextCharacter')
  // paste
  router.code('p', 'p').action('p', 'pasteAfter')?.action('P', 'pasteBefore')?.record(true)
  // back
  router.code('u', 'u').action('u', 'backToHistory')
  // copy char
  router.code('y', 'y').action('y', 'copyChar')?.mode(VimMode.VISUAL)
  router.code('y_y', 'yy').action('yy', 'copyCurrentLine')
  // v
  router.code('v', 'v').action('v', 'switchModeToVisual')?.action('V', 'switchModeToVisual')
  // delete character
  router.code('x', 'x').action('x', 'delCharAfter')?.action('X', 'delCharBefore')?.record(true)
  // delete selected char in visual mode
  router.code('d', 'd').action('d', 'delCharAfter')?.mode(VimMode.VISUAL)?.record(true)
  // delete line
  router.code('d_d', 'dd').action('dd', 'delCurrLine')?.record(true)
  // G
  router.code('g', 'g').action('G', 'moveToLastLine')
  // gg
  router.code('g_g', 'gg').action('gg', 'moveToFirstLine')
  // move to next word
  router.code('w', 'w').action('w', 'moveToNextWord')?.action('W', 'moveToNextWord')
  // copy word
  router.code('y_w', 'yw').action('yw', 'copyWord') // FIXME: maybe could not use _ as connector
  // delete one word
  router.code('d_w', 'dw').action('dw', 'deleteWord')?.record(true)
}
