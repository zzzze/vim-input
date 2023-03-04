import { HandlerKey } from './instance/controller'
import type { Router } from './instance/router/router'
import { VimMode } from './instance/vim/init'

export function ready (router: Router) {
  // ---------------------------
  // system feature keys:
  // ---------------------------

  router.code('End', 'End').action('End', HandlerKey.MoveToCurrentLineTail)
  router.code('Home', 'Home').action('Home', HandlerKey.MoveToCurrentLineHead)
  router.code('ArrowLeft', 'ArrowLeft').action('Left', HandlerKey.SelectPrevCharacter)
  router.code('ArrowUp', 'ArrowUp').action('Up', HandlerKey.SelectPrevLine)
  router.code('ArrowRight', 'ArrowRight').action('Right', HandlerKey.SelectNextCharacter)
  router.code('ArrowDown', 'ArrowDown').action('Down', HandlerKey.SelectNextLine)
  router.code('Insert', 'Insert').action('Insert', HandlerKey.Insert)
  router.code('Delete', 'Delete').action('Delete', HandlerKey.DelCharAfter)?.record(true)

  // ---------------------------
  // vim feature keys:
  // ---------------------------

  // 0:move to current line head
  router.code('0', '0').action(0, HandlerKey.MoveToCurrentLineHead)
  // $:move to current line tail
  router.code('$', '$').action('shift_$', HandlerKey.MoveToCurrentLineTail)
  // append
  router.code('a', 'a').action('a', HandlerKey.Append)?.action('A', HandlerKey.AppendLineTail)
  // insert
  router.code('i', 'i').action('i', HandlerKey.Insert)?.action('I', HandlerKey.InsertLineHead)
  // new line
  router.code('o', 'o').action('o', HandlerKey.AppendNewLine)?.action('O', HandlerKey.InsertNewLine)?.record(true)
  // replace
  router.code('r', 'r').action('r', HandlerKey.ReplaceChar)
  // down
  router.code('Enter', 'Enter').action('enter', HandlerKey.SelectNextLine)
  router.code('j', 'j').action('j', HandlerKey.SelectNextLine)
  // up
  router.code('k', 'k').action('k', HandlerKey.SelectPrevLine)
  // left
  router.code('h', 'h').action('h', HandlerKey.SelectPrevCharacter)
  // right
  router.code('l', 'l').action('l', HandlerKey.SelectNextCharacter)
  // paste
  router.code('p', 'p').action('p', HandlerKey.PasteAfter)?.action('P', HandlerKey.PasteBefore)?.record(true)
  // back
  router.code('u', 'u').action('u', HandlerKey.BackToHistory)
  // copy char
  router.code('y', 'y').action('y', HandlerKey.CopyChar)?.mode(VimMode.VISUAL)
  router.code('y_y', 'yy').action('yy', HandlerKey.CopyCurrentLine)
  // v
  router.code('v', 'v').action('v', HandlerKey.SwitchModeToVisual)?.action('V', HandlerKey.SwitchModeToVisual)
  // delete character
  router.code('x', 'x').action('x', HandlerKey.DelCharAfter)?.action('X', HandlerKey.DelCharBefore)?.record(true)
  router.code('s', 's').action('s', HandlerKey.DelCharAfter, VimMode.EDIT)?.record(true)
  // delete selected char in visual mode
  router.code('d', 'd').action('d', HandlerKey.DelCharAfter)?.mode(VimMode.VISUAL)?.record(true)
  // delete line
  router.code('d_d', 'dd').action('dd', HandlerKey.DelCurrLine)?.record(true)
  // G
  router.code('g', 'g').action('G', HandlerKey.MoveToLastLine)
  // gg
  router.code('g_g', 'gg').action('gg', HandlerKey.MoveToFirstLine)
  // move to next word
  router.code('w', 'w').action('w', HandlerKey.MoveToNextWord)?.action('W', HandlerKey.MoveToNextWord)
  // copy word
  router.code('y_w', 'yw').action('yw', HandlerKey.CopyWord) // FIXME: maybe could not use _ as connector
  // delete one word
  router.code('d_w', 'dw').action('dw', HandlerKey.DeleteWord)?.record(true)
}
