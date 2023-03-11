import { VimBase, VimMode } from './init'
import type { TextUtil } from '../text/text'
import type { Data } from '../app/app'

const _ENTER_ = '\n'

enum AddEmptyLinePlaceholderResult {
  NOT_EMPTY_LINE,
  NOT_NEED_TO_ADD,
  ADDED,
}

export class Vim extends VimBase {
  offsetOfLineStart: number | undefined
  textUtil: TextUtil
  constructor (tu: TextUtil) {
    super()
    this.textUtil = tu
  }

  resetVim () {
    this.replaceRequest = false
  }

  setTextUtil (tu: TextUtil) {
    this.textUtil = tu
  }

  isMode (modeName: VimMode) {
    return this.currentMode === modeName
  }

  private isAtBeginningOfLine (cursor: number) {
    return cursor === 0 || this.textUtil.getPrevSymbol(cursor) === _ENTER_
  }

  textLength () {
    return this.textUtil.getText().length
  }

  maybeAddEmptyLinePlaceholder (position: number) {
    const lineStart = this.textUtil.getCurrLineStartPos(position)
    if (this.textUtil.getSymbol(lineStart) === _ENTER_) {
      this.textUtil.insertText(' ', lineStart)
      return AddEmptyLinePlaceholderResult.ADDED
    }
    if (this.textUtil.getSymbol(lineStart) === ' ' && this.textUtil.getNextSymbol(lineStart) === _ENTER_) {
      return AddEmptyLinePlaceholderResult.NOT_NEED_TO_ADD
    }
    return AddEmptyLinePlaceholderResult.NOT_EMPTY_LINE
  }

  removeEmptyLinePlaceholder () {
    const sp = this.textUtil.getSelectionStart()
    const ep = this.textUtil.getSelectionEnd()
    if (this.textUtil.isCursorInEmptyLine()) {
      this.textUtil.delete(sp, ep)
      return true
    }
    return false
  }

  private handleSwitchToVisualMode () {
    const cursor = this.textUtil.getSelectionEnd()
    this.maybeAddEmptyLinePlaceholder(cursor)
    if (this.isAtBeginningOfLine(cursor) || this.textUtil.isSelectBackward()) {
      this.textUtil.select(cursor, cursor + 1)
    } else {
      this.textUtil.select(cursor - 1, cursor)
    }
    this.updateOffsetOfLineStart()
  }

  private handleSwitchToEditMode () {
    const selectionEnd = this.textUtil.getSelectionEnd()
    this.maybeAddEmptyLinePlaceholder(selectionEnd)
    if (this.textUtil.isSelectForward()) {
      this.textUtil.select(selectionEnd - 1, selectionEnd - 1)
    } else {
      this.textUtil.select(selectionEnd, selectionEnd)
    }
    this.updateOffsetOfLineStart()
  }

  switchModeTo (nextMode: VimMode) {
    if (this.currentMode === nextMode) {
      return
    }
    if (nextMode === VimMode.GENERAL || nextMode === VimMode.VISUAL) {
      this.handleSwitchToVisualMode()
    }
    if (nextMode === VimMode.EDIT) {
      this.handleSwitchToEditMode()
    }
    if ([VimMode.GENERAL, VimMode.COMMAND, VimMode.EDIT, VimMode.VISUAL].includes(nextMode)) {
      this.currentMode = nextMode
    }
  }

  resetCursorByMouse () {
    this.switchModeTo(VimMode.GENERAL)
    const cursorPosition: number = this.textUtil.getSelectionStart()
    const currentLineStart: number = this.textUtil.getCurrLineStartPos()
    const currentLineCharCount: number = this.textUtil.getCurrLineCount()
    if (cursorPosition === currentLineStart && currentLineCharCount === 0) {
      this.textUtil.appendText(' ', cursorPosition)
    }
    const ns = this.textUtil.getNextSymbol(cursorPosition - 1)
    if (ns !== undefined && ns !== _ENTER_) {
      this.textUtil.select(cursorPosition, cursorPosition + 1)
    } else {
      this.textUtil.select(cursorPosition - 1, cursorPosition)
    }
    this.updateOffsetOfLineStart()
  }

  private determineCursorInVisualMode (selectionStart: number, selectionEnd: number, nextSelectionEnd: number) {
    let start = selectionStart
    let end = nextSelectionEnd
    if (selectionStart < selectionEnd && selectionStart >= nextSelectionEnd) {
      start += 1
      if (selectionStart === selectionEnd - 1 && selectionStart === nextSelectionEnd) {
        end -= 1
      }
    } else if (selectionStart > selectionEnd && selectionStart <= nextSelectionEnd) {
      start -= 1
      if (selectionStart - 1 === selectionEnd && selectionStart === nextSelectionEnd) {
        end += 1
      }
    }
    if (end === start + 1) {
      [start, end] = [end, start]
    }
    return { start, end }
  }

  private selectNextCharacterInGeneralMode () {
    const cursorPosition = this.textUtil.getSelectionStart()
    if (this.textUtil.getNextSymbol(cursorPosition) === _ENTER_) {
      return
    }
    if (cursorPosition + 1 >= this.textLength()) {
      return
    }
    this.textUtil.select(cursorPosition + 1, cursorPosition + 2)
  }

  private selectNextCharacterInVisualMode () {
    const selectionStart = this.textUtil.getSelectionStart()
    const selectionEnd = this.textUtil.getSelectionEnd()
    const nextSelectionEnd = selectionEnd + 1
    if (nextSelectionEnd > this.textLength()) {
      return
    }
    const { start, end } = this.determineCursorInVisualMode(selectionStart, selectionEnd, nextSelectionEnd)
    if (start < end && this.textUtil.getPrevSymbol(end - 1) === _ENTER_) {
      return
    }
    this.textUtil.select(start, end)
  }

  selectNextCharacter () {
    if (this.isMode(VimMode.GENERAL)) {
      this.selectNextCharacterInGeneralMode()
    } else if (this.isMode(VimMode.VISUAL)) {
      this.selectNextCharacterInVisualMode()
    }
    this.updateOffsetOfLineStart()
  }

  private calcOffsetOfLineStart () {
    let cursorPosition: number | undefined
    if (this.isMode(VimMode.VISUAL)) {
      const selectionStart = this.textUtil.getSelectionStart()
      const selectionEnd = this.textUtil.getSelectionEnd()
      if (selectionStart > selectionEnd) {
        cursorPosition = selectionEnd
      } else if (selectionStart < selectionEnd) {
        cursorPosition = selectionEnd - 1
      }
    }
    return this.textUtil.getCountFromStartToPosInCurrLine(cursorPosition) - 1 ?? 0
  }

  updateOffsetOfLineStart (offset?: number) {
    if (offset !== undefined) {
      this.offsetOfLineStart = Math.max(offset, 0)
      return
    }
    this.offsetOfLineStart = this.calcOffsetOfLineStart()
  }

  private selectPrevCharacterInGeneralMode () {
    const selectionStart = this.textUtil.getSelectionStart()
    if (this.textUtil.getPrevSymbol(selectionStart) === _ENTER_) {
      return
    }
    const nextSelectionStart = selectionStart - 1
    if (nextSelectionStart < 0) {
      return
    }
    this.textUtil.select(nextSelectionStart, selectionStart)
  }

  private selectPrevCharacterInVisualMode () {
    const selectionStart = this.textUtil.getSelectionStart()
    const selectionEnd = this.textUtil.getSelectionEnd()
    const nextSelectionEnd = selectionEnd - 1
    if (selectionEnd < 0) {
      return
    }
    const { start, end } = this.determineCursorInVisualMode(selectionStart, selectionEnd, nextSelectionEnd)
    if (start > end && this.textUtil.getSymbol(end) === _ENTER_) {
      return
    }
    this.textUtil.select(start, end)
  }

  selectPrevCharacter () {
    if (this.isMode(VimMode.GENERAL)) {
      this.selectPrevCharacterInGeneralMode()
    } else if (this.isMode(VimMode.VISUAL)) {
      this.selectPrevCharacterInVisualMode()
    }
    this.updateOffsetOfLineStart()
  }

  append () {
    const p: number = this.textUtil.getSelectionStart()
    this.removeEmptyLinePlaceholder()
    this.textUtil.select(p, p + 1)
  }

  insert () {
    const p = this.textUtil.getSelectionStart()
    this.textUtil.select(p, p)
  }

  private selectNextLineInGeneralMode () {
    const selectionEnd = this.textUtil.getSelectionEnd()
    const nextLineStart = this.textUtil.getNextLineStart(selectionEnd)
    if (this.maybeAddEmptyLinePlaceholder(nextLineStart) > AddEmptyLinePlaceholderResult.NOT_EMPTY_LINE) {
      this.textUtil.select(nextLineStart, nextLineStart + 1)
      return
    }
    if (nextLineStart === this.textLength()) {
      return
    }
    const nextLineEnd = this.textUtil.getNextLineEnd(selectionEnd) ?? 0
    const nextLineCharCount = nextLineEnd - nextLineStart
    const currentCursorOffsetFromLineStart = (this.offsetOfLineStart ?? this.calcOffsetOfLineStart()) + 1
    const nextSelectionEnd = nextLineStart + (currentCursorOffsetFromLineStart > nextLineCharCount ? nextLineCharCount : currentCursorOffsetFromLineStart)
    this.textUtil.select(nextSelectionEnd - 1, nextSelectionEnd)
  }

  private selectNextLineInVisualMode () {
    const selectionStart = this.textUtil.getSelectionStart()
    const selectionEnd = this.textUtil.getSelectionEnd()
    const nextLineStart = this.textUtil.getNextLineStart(selectionEnd)
    if (nextLineStart === this.textLength()) {
      return
    }
    const nextLineEnd = this.textUtil.getNextLineEnd(selectionEnd) ?? 0
    const nextLineCharCount = nextLineEnd - nextLineStart
    const currentCursorOffsetFromLineStart = this.offsetOfLineStart ?? this.calcOffsetOfLineStart()
    let nextSelectionEnd = nextLineStart + (currentCursorOffsetFromLineStart > nextLineCharCount ? nextLineCharCount : currentCursorOffsetFromLineStart)
    if (this.maybeAddEmptyLinePlaceholder(nextLineStart) > AddEmptyLinePlaceholderResult.NOT_EMPTY_LINE) {
      nextSelectionEnd = nextLineStart
    }
    if (nextSelectionEnd > selectionStart) {
      nextSelectionEnd += 1
    }
    const { start, end } = this.determineCursorInVisualMode(selectionStart, selectionEnd, nextSelectionEnd)
    this.textUtil.select(start, end)
  }

  selectNextLine () {
    if (this.isMode(VimMode.GENERAL)) {
      this.selectNextLineInGeneralMode()
    } else if (this.isMode(VimMode.VISUAL)) {
      this.selectNextLineInVisualMode()
    }
  }

  private selectPrevLineInGeneralMode () {
    const selectionEnd = this.textUtil.getSelectionEnd()
    const prevLineStart = this.textUtil.getPrevLineStart(selectionEnd) ?? 0
    if (this.maybeAddEmptyLinePlaceholder(prevLineStart) > AddEmptyLinePlaceholderResult.NOT_EMPTY_LINE) {
      this.textUtil.select(prevLineStart, prevLineStart + 1)
      return
    }
    const prevLineEnd = this.textUtil.getPrevLineEnd(selectionEnd) ?? 0
    if (prevLineEnd === 0) {
      return
    }
    const nextLineCharCount = prevLineEnd - prevLineStart
    const currentCursorOffsetFromLineStart = (this.offsetOfLineStart ?? this.calcOffsetOfLineStart()) + 1
    const nextSelectionEnd = prevLineStart + (currentCursorOffsetFromLineStart > nextLineCharCount ? nextLineCharCount : currentCursorOffsetFromLineStart)
    this.textUtil.select(nextSelectionEnd - 1, nextSelectionEnd)
  }

  private selectPrevLineInVisualMode () {
    const selectionStart = this.textUtil.getSelectionStart()
    const selectionEnd = this.textUtil.getSelectionEnd()
    const prevLineStart = this.textUtil.getPrevLineStart(selectionEnd) ?? 0
    const prevLineEnd = this.textUtil.getPrevLineEnd(selectionEnd) ?? 0
    if (prevLineEnd === 0) {
      return
    }
    let nextLineCharCount = prevLineEnd - prevLineStart
    if (this.maybeAddEmptyLinePlaceholder(prevLineStart) > AddEmptyLinePlaceholderResult.NOT_EMPTY_LINE) {
      nextLineCharCount -= 1
    }
    const currentCursorOffsetFromLineStart = this.offsetOfLineStart ?? this.calcOffsetOfLineStart()
    const nextSelectionEnd = prevLineStart + (currentCursorOffsetFromLineStart > nextLineCharCount ? nextLineCharCount : currentCursorOffsetFromLineStart)
    const { start, end } = this.determineCursorInVisualMode(selectionStart, selectionEnd, nextSelectionEnd)
    this.textUtil.select(start, end)
  }

  selectPrevLine () {
    if (this.isMode(VimMode.GENERAL)) {
      this.selectPrevLineInGeneralMode()
    } else if (this.isMode(VimMode.VISUAL)) {
      this.selectPrevLineInVisualMode()
    }
  }

  moveToCurrentLineHead () {
    const selectionEnd = this.textUtil.getSelectionEnd()
    const startOfLine = this.textUtil.getCurrLineStartPos(selectionEnd)
    if (this.isMode(VimMode.GENERAL)) {
      this.textUtil.select(startOfLine, startOfLine + 1)
    }
    if (this.isMode(VimMode.VISUAL)) {
      const selectionStart = this.textUtil.getSelectionStart()
      if (selectionStart > selectionEnd || startOfLine < selectionStart) {
        this.textUtil.select(selectionStart, startOfLine)
      } else {
        this.textUtil.select(selectionStart, startOfLine + 1)
      }
    }
    this.updateOffsetOfLineStart(0)
  }

  moveToCurrentLineTail () {
    const selectionEnd = this.textUtil.getSelectionEnd()
    const endOfLine = this.textUtil.getCurrLineEndPos(selectionEnd)
    if (this.isMode(VimMode.GENERAL)) {
      this.textUtil.select(endOfLine - 1, endOfLine)
    }
    if (this.isMode(VimMode.VISUAL)) {
      const selectionStart = this.textUtil.getSelectionStart()
      if (selectionStart > selectionEnd || endOfLine > selectionStart) {
        this.textUtil.select(selectionStart, endOfLine)
      } else {
        this.textUtil.select(selectionStart, endOfLine - 1)
      }
    }
    this.updateOffsetOfLineStart(Number.MAX_SAFE_INTEGER)
  }

  appendNewLine () {
    const p = this.textUtil.getCurrLineEndPos()
    this.textUtil.appendText(_ENTER_ + ' ', p)
    this.textUtil.select(p + 1, p + 1)
  }

  insertNewLine () {
    const p = this.textUtil.getCurrLineStartPos()
    this.textUtil.appendText(' ' + _ENTER_, p)
    this.textUtil.select(p, p)
  }

  deleteSelected () {
    const selectionStart = this.textUtil.getSelectionStart()
    const selectionEnd = this.textUtil.getSelectionEnd()
    const isSelectForward = this.textUtil.isSelectForward()
    const t = this.textUtil.delSelected()
    if (isSelectForward) {
      this.textUtil.select(selectionStart, selectionStart + 1)
    } else {
      this.textUtil.select(selectionEnd, selectionEnd + 1)
    }
    this.pasteInNewLineRequest = false
    return t
  }

  deletePrevious () {
    const p = this.textUtil.getSelectionStart()
    const t = this.textUtil.delPrevious()
    this.textUtil.select(p - 1, p)
    this.pasteInNewLineRequest = false
    return t
  }

  copyCurrentLine (p?: number) {
    const sp = this.textUtil.getCurrLineStartPos(p)
    const ep = this.textUtil.getCurrLineEndPos(p)
    // clipboard = textUtil.getText(sp, ep);
    this.pasteInNewLineRequest = true
    return this.textUtil.getText(sp, ep + 1)
  }

  backToHistory (list?: Data[]) {
    if (Array.isArray(list) && list.length > 0) {
      const data = list.pop()
      if (data !== undefined) {
        this.textUtil.setText(data.t)
        this.textUtil.select(data.p ?? 0, (data.p ?? 0) + 1)
      }
    }
  }

  delCurrLine () {
    const sp = this.textUtil.getCurrLineStartPos()
    const ep = this.textUtil.getCurrLineEndPos()
    const t = this.textUtil.delete(sp, ep + 1)
    this.textUtil.select(sp, sp + 1)
    this.pasteInNewLineRequest = true
    return t
  };

  moveToFirstLine () {
    if (this.isMode(VimMode.GENERAL)) {
      this.textUtil.select(0, 1)
    } else if (this.isMode(VimMode.VISUAL)) {
      this.textUtil.select(this.textUtil.getSelectionStart(), 0)
    }
  }

  moveToLastLine () {
    const lp = this.textLength()
    const sp = this.textUtil.getCurrLineStartPos(lp - 1)
    if (this.isMode(VimMode.GENERAL)) {
      this.textUtil.select(sp, sp + 1)
    } else if (this.isMode(VimMode.VISUAL)) {
      this.textUtil.select(this.textUtil.getSelectionStart(), sp + 1)
    }
  }

  moveToNextWord () {
    let p
    if (this.isMode(VimMode.VISUAL)) {
      p = this.textUtil.getSelectionEnd()
    }
    const poses = this.textUtil.getCurrWordPos(p)
    // poses[1] is next word`s start position
    const sp = poses[1]
    if (sp !== undefined) {
      if (this.isMode(VimMode.GENERAL)) {
        this.textUtil.select(sp, sp + 1)
      } else if (this.isMode(VimMode.VISUAL)) {
        const selectionStart = this.textUtil.getSelectionStart()
        this.textUtil.select(selectionStart, selectionStart > sp ? sp : sp + 1)
      }
    }
    this.updateOffsetOfLineStart()
  }

  copyWord (p?: number) {
    const poses = this.textUtil.getCurrWordPos(p)
    return poses[1]
  }

  deleteWord () {
    let t
    const [start, end] = this.textUtil.getCurrWordPos()
    if (end !== undefined) {
      t = this.textUtil.delete(start, end)
      this.textUtil.select(start, end + 1)
    }
    return t
  }
}
