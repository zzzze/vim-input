import type { App as AppType, Data } from './app/app'
import type { TextUtil } from './text/text'
import { VimMode } from './vim/init'
import type { Vim } from './vim/vim'
const _ENTER_ = '\n'

export enum HandlerKey {
  SelectPrevCharacter = 'selectPrevCharacter',
  SelectNextCharacter = 'selectNextCharacter',
  SwitchModeToGeneral = 'switchModeToGeneral',
  SwitchModeToVisual = 'switchModeToVisual',
  Append = 'append',
  AppendLineTail = 'appendLineTail',
  Insert = 'insert',
  InsertLineHead = 'insertLineHead',
  SelectNextLine = 'selectNextLine',
  SelectPrevLine = 'selectPrevLine',
  CopyChar = 'copyChar',
  CopyCurrentLine = 'copyCurrentLine',
  PasteAfter = 'pasteAfter',
  PasteBefore = 'pasteBefore',
  MoveToCurrentLineHead = 'moveToCurrentLineHead',
  MoveToCurrentLineTail = 'moveToCurrentLineTail',
  ReplaceChar = 'replaceChar',
  AppendNewLine = 'appendNewLine',
  InsertNewLine = 'insertNewLine',
  DelCharAfter = 'delCharAfter',
  DelCharBefore = 'delCharBefore',
  BackToHistory = 'backToHistory',
  DelCurrLine = 'delCurrLine',
  MoveToFirstLine = 'moveToFirstLine',
  MoveToLastLine = 'moveToLastLine',
  MoveToNextWord = 'moveToNextWord',
  CopyWord = 'copyWord',
  DeleteWord = 'deleteWord',
}

export interface HandlerArgs {
  repeatCount?: number
}
export type Handler = (args: HandlerArgs) => void

export class Controller {
  App: AppType
  vim: Vim
  textUtil: TextUtil

  constructor (app: AppType) {
    this.App = app
    this.vim = app.vim
    this.textUtil = app.textUtil
    this.App.registerHandler(HandlerKey.SelectPrevCharacter, this.selectPrevCharacter)
    this.App.registerHandler(HandlerKey.SelectNextCharacter, this.selectNextCharacter)
    this.App.registerHandler(HandlerKey.SwitchModeToGeneral, this.switchModeToGeneral)
    this.App.registerHandler(HandlerKey.SwitchModeToVisual, this.switchModeToVisual)
    this.App.registerHandler(HandlerKey.Append, this.append)
    this.App.registerHandler(HandlerKey.AppendLineTail, this.appendLineTail)
    this.App.registerHandler(HandlerKey.Insert, this.insert)
    this.App.registerHandler(HandlerKey.InsertLineHead, this.insertLineHead)
    this.App.registerHandler(HandlerKey.SelectNextLine, this.selectNextLine)
    this.App.registerHandler(HandlerKey.SelectPrevLine, this.selectPrevLine)
    this.App.registerHandler(HandlerKey.CopyChar, this.copyChar)
    this.App.registerHandler(HandlerKey.CopyCurrentLine, this.copyCurrentLine)
    this.App.registerHandler(HandlerKey.PasteAfter, this.pasteAfter)
    this.App.registerHandler(HandlerKey.PasteBefore, this.pasteBefore)
    this.App.registerHandler(HandlerKey.MoveToCurrentLineHead, this.moveToCurrentLineHead)
    this.App.registerHandler(HandlerKey.MoveToCurrentLineTail, this.moveToCurrentLineTail)
    this.App.registerHandler(HandlerKey.ReplaceChar, this.replaceChar)
    this.App.registerHandler(HandlerKey.AppendNewLine, this.appendNewLine)
    this.App.registerHandler(HandlerKey.InsertNewLine, this.insertNewLine)
    this.App.registerHandler(HandlerKey.DelCharAfter, this.delCharAfter)
    this.App.registerHandler(HandlerKey.DelCharBefore, this.delCharBefore)
    this.App.registerHandler(HandlerKey.BackToHistory, this.backToHistory)
    this.App.registerHandler(HandlerKey.DelCurrLine, this.delCurrLine)
    this.App.registerHandler(HandlerKey.MoveToFirstLine, this.moveToFirstLine)
    this.App.registerHandler(HandlerKey.MoveToLastLine, this.moveToLastLine)
    this.App.registerHandler(HandlerKey.MoveToNextWord, this.moveToNextWord)
    this.App.registerHandler(HandlerKey.CopyWord, this.copyWord)
    this.App.registerHandler(HandlerKey.DeleteWord, this.deleteWord)
  }

  setVim (v: Vim) {
    this.vim = v
  }

  setTextUtil (tu: TextUtil) {
    this.textUtil = tu
  }

  selectPrevCharacter = (args: HandlerArgs) => {
    this.App.repeatAction(() => {
      this.vim.selectPrevCharacter()
      return undefined
    }, args.repeatCount)
  }

  selectNextCharacter = (args: HandlerArgs) => {
    this.App.repeatAction(() => {
      this.vim.selectNextCharacter()
      return undefined
    }, args.repeatCount)
  }

  switchModeToGeneral = () => {
    this.vim.switchModeTo(VimMode.GENERAL)
  }

  switchModeToVisual = () => {
    this.vim.switchModeTo(VimMode.VISUAL)
  }

  append = () => {
    this.vim.append()
    setTimeout(() => {
      this.vim.switchModeTo(VimMode.EDIT)
    }, 100)
  }

  appendLineTail = () => {
    this.vim.moveToCurrentLineTail()
    this.append()
  }

  insert = () => {
    this.vim.insert()
    setTimeout(() => {
      this.vim.switchModeTo(VimMode.EDIT)
    }, 100)
  }

  insertLineHead = () => {
    this.vim.moveToCurrentLineHead()
    this.insert()
  }

  selectNextLine = (args: HandlerArgs) => {
    this.App.repeatAction(() => {
      this.vim.selectNextLine()
      return undefined
    }, args.repeatCount)
  }

  selectPrevLine = (args: HandlerArgs) => {
    this.App.repeatAction(() => {
      this.vim.selectPrevLine()
      return undefined
    }, args.repeatCount)
  }

  copyChar = () => {
    this.vim.pasteInNewLineRequest = false
    this.App.clipboard = this.textUtil.getSelectedText()
    if (this.vim.isMode(VimMode.VISUAL)) {
      this.switchModeToGeneral()
    }
  }

  copyCurrentLine = (args: HandlerArgs) => {
    const _data: Data = {
      p: undefined,
      t: '',
    }
    this.App.repeatAction(() => {
      _data.t = this.vim.copyCurrentLine(_data.p)
      _data.p = this.textUtil.getNextLineStart(_data.p)
      return _data.t
    }, args.repeatCount)
  }

  pasteAfter = () => {
    if (this.App.clipboard !== undefined) {
      if (this.vim.pasteInNewLineRequest) {
        const ep = this.textUtil.getCurrLineEndPos()
        this.textUtil.appendText(_ENTER_ + this.App.clipboard, ep, true, true)
      } else {
        this.textUtil.appendText(this.App.clipboard, undefined, true, false)
      }
    }
  }

  pasteBefore = () => {
    if (this.App.clipboard !== undefined) {
      if (this.vim.pasteInNewLineRequest) {
        const sp = this.textUtil.getCurrLineStartPos()
        this.textUtil.insertText(this.App.clipboard + _ENTER_, sp, true, true)
      } else {
        this.textUtil.insertText(this.App.clipboard, undefined, true, false)
      }
    }
  }

  moveToCurrentLineHead = () => {
    this.vim.moveToCurrentLineHead()
  }

  moveToCurrentLineTail = () => {
    this.vim.moveToCurrentLineTail()
  }

  replaceChar = () => {
    this.vim.replaceRequest = true
  }

  appendNewLine = () => {
    this.vim.appendNewLine()
    setTimeout(() => {
      this.vim.switchModeTo(VimMode.EDIT)
    }, 100)
  }

  insertNewLine = () => {
    this.vim.insertNewLine()
    setTimeout(() => {
      this.vim.switchModeTo(VimMode.EDIT)
    }, 100)
  }

  delCharAfter = (args: HandlerArgs) => {
    this.App.repeatAction(() => {
      return this.vim.deleteSelected()
    }, args.repeatCount)
    this.switchModeToGeneral()
  }

  delCharBefore = (args: HandlerArgs) => {
    this.App.repeatAction(() => {
      return this.vim.deletePrevious()
    }, args.repeatCount)
    this.switchModeToGeneral()
  }

  backToHistory = () => {
    const key = this.App.getEleKey()
    const list = this.App.doList[key]
    this.vim.backToHistory(list)
  }

  delCurrLine = (args: HandlerArgs) => {
    this.App.repeatAction(() => {
      return this.vim.delCurrLine()
    }, args.repeatCount)
  }

  moveToFirstLine = () => {
    this.vim.moveToFirstLine()
  }

  moveToLastLine = () => {
    this.vim.moveToLastLine()
  }

  moveToNextWord = (args: HandlerArgs) => {
    this.App.repeatAction(() => {
      this.vim.moveToNextWord()
      return undefined
    }, args.repeatCount)
  }

  copyWord = (args: HandlerArgs) => {
    this.vim.pasteInNewLineRequest = false
    const sp = this.textUtil.getCursorPosition()
    let ep: number | undefined
    this.App.repeatAction(() => {
      ep = this.vim.copyWord(ep)
      return undefined
    }, args.repeatCount)
    this.App.clipboard = this.textUtil.getText(sp, ep)
  }

  deleteWord = (args: HandlerArgs) => {
    this.vim.pasteInNewLineRequest = false
    this.App.repeatAction(() => {
      return this.vim.deleteWord()
    }, args.repeatCount)
  }
}
