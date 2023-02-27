import type { App as AppType, Data } from './app/app'
import type { TextUtil } from './text/text'
import { VimMode } from './vim/init'
import type { Vim } from './vim/vim'
// const GENERAL = 'general_mode';
// const COMMAND = 'command_mode';
// const EDIT    = 'edit_mode';
// const VISUAL  = 'visual_mode';
const _ENTER_ = '\n'

export class Controller {
  App: AppType
  vim: Vim
  textUtil: TextUtil

  constructor (app: AppType) {
    this.App = app
    this.vim = app.vim
    this.textUtil = app.textUtil
  }

  setVim (v: Vim) {
    this.vim = v
  }

  setTextUtil (tu: TextUtil) {
    this.textUtil = tu
  }

  selectPrevCharacter (num: number) {
    this.App.repeatAction(() => {
      this.vim.selectPrevCharacter()
      return undefined
    }, num)
  }

  selectNextCharacter (num: number) {
    this.App.repeatAction(() => {
      this.vim.selectNextCharacter()
      return undefined
    }, num)
  }

  switchModeToGeneral () {
    const cMode = this.vim.currentMode
    if (this.vim.isMode(VimMode.GENERAL)) {
      return
    }
    this.vim.switchModeTo(VimMode.GENERAL)
    const p = this.textUtil.getCursorPosition()
    const sp = this.textUtil.getCurrLineStartPos()
    if (p === sp) {
      const c = this.textUtil.getCurrLineCount()
      if (c === 0) {
        this.textUtil.appendText(' ', p)
      }
      this.vim.selectNextCharacter()
      this.vim.selectPrevCharacter()
      if (this.textUtil.getCurrLineCount() === 1) {
        this.textUtil.select(p, p + 1)
      }
    } else {
      if (cMode === VimMode.VISUAL) {
        this.vim.selectNextCharacter()
      }
      this.vim.selectPrevCharacter()
    }
  }

  switchModeToVisual () {
    if (this.vim.isMode(VimMode.VISUAL)) {
      const s = this.vim.visualCursor
      if (s === undefined) {
        return
      }
      const p = this.vim.visualPosition
      if ((p ?? 0) < s) {
        this.textUtil.select(s - 1, s)
      } else {
        this.textUtil.select(s, s + 1)
      }
      if (this.textUtil.getPrevSymbol(s) === _ENTER_) {
        this.textUtil.select(s, s + 1)
      }
      this.vim.switchModeTo(VimMode.GENERAL)
      return
    }
    this.vim.switchModeTo(VimMode.VISUAL)
    this.vim.visualPosition = this.textUtil.getCursorPosition()
    this.vim.visualCursor = undefined
  }

  append () {
    this.vim.append()
    setTimeout(() => {
      this.vim.switchModeTo(VimMode.EDIT)
    }, 100)
  }

  appendLineTail () {
    this.vim.moveToCurrentLineTail()
    this.append()
  }

  insert () {
    this.vim.insert()
    setTimeout(() => {
      this.vim.switchModeTo(VimMode.EDIT)
    }, 100)
  }

  insertLineHead () {
    this.vim.moveToCurrentLineHead()
    this.insert()
  }

  selectNextLine (num: number) {
    this.App.repeatAction(() => {
      this.vim.selectNextLine()
      return undefined
    }, num)
  }

  selectPrevLine (num: number) {
    this.App.repeatAction(() => {
      this.vim.selectPrevLine()
      return undefined
    }, num)
  }

  copyChar () {
    this.vim.pasteInNewLineRequest = false
    this.App.clipboard = this.textUtil.getSelectedText()
    if (this.vim.isMode(VimMode.VISUAL)) {
      this.switchModeToGeneral()
    }
  }

  copyCurrentLine (num: number) {
    const _data: Data = {
      p: undefined,
      t: '',
    }
    this.App.repeatAction(() => {
      _data.t = this.vim.copyCurrentLine(_data.p)
      _data.p = this.textUtil.getNextLineStart(_data.p)
      return _data.t
    }, num)
  }

  pasteAfter () {
    if (this.App.clipboard !== undefined) {
      if (this.vim.pasteInNewLineRequest) {
        const ep = this.textUtil.getCurrLineEndPos()
        this.textUtil.appendText(_ENTER_ + this.App.clipboard, ep, true, true)
      } else {
        this.textUtil.appendText(this.App.clipboard, undefined, true, false)
      }
    }
  }

  pasteBefore () {
    if (this.App.clipboard !== undefined) {
      if (this.vim.pasteInNewLineRequest) {
        const sp = this.textUtil.getCurrLineStartPos()
        this.textUtil.insertText(this.App.clipboard + _ENTER_, sp, true, true)
      } else {
        this.textUtil.insertText(this.App.clipboard, undefined, true, false)
      }
    }
  }

  moveToCurrentLineHead () {
    this.vim.moveToCurrentLineHead()
  }

  moveToCurrentLineTail () {
    this.vim.moveToCurrentLineTail()
  }

  replaceChar () {
    this.vim.replaceRequest = true
  }

  appendNewLine () {
    this.vim.appendNewLine()
    setTimeout(() => {
      this.vim.switchModeTo(VimMode.EDIT)
    }, 100)
  }

  insertNewLine () {
    this.vim.insertNewLine()
    setTimeout(() => {
      this.vim.switchModeTo(VimMode.EDIT)
    }, 100)
  }

  delCharAfter (num: number) {
    this.App.repeatAction(() => {
      return this.vim.deleteSelected()
    }, num)
    this.switchModeToGeneral()
  }

  backToHistory () {
    const key = this.App.getEleKey()
    const list = this.App.doList[key]
    this.vim.backToHistory(list)
  }

  delCurrLine (num: number) {
    this.App.repeatAction(() => {
      return this.vim.delCurrLine()
    }, num)
  }

  moveToFirstLine () {
    this.vim.moveToFirstLine()
  }

  moveToLastLine () {
    this.vim.moveToLastLine()
  }

  moveToNextWord (num: number) {
    this.App.repeatAction(() => {
      this.vim.moveToNextWord()
      return undefined
    }, num)
  }

  copyWord (num: number) {
    this.vim.pasteInNewLineRequest = false
    const sp = this.textUtil.getCursorPosition()
    let ep: number | undefined
    this.App.repeatAction(() => {
      ep = this.vim.copyWord(ep)
      return undefined
    }, num)
    this.App.clipboard = this.textUtil.getText(sp, ep)
  }

  deleteWord (num: number) {
    this.vim.pasteInNewLineRequest = false
    this.App.repeatAction(() => {
      return this.vim.deleteWord()
    }, num)
  }
}

// var App;
// var vim;
// var textUtil;
//
// exports._init = function (app) {
//     App = app;
//     vim = app.vim;
//     textUtil = app.textUtil;
// }
//
// exports.setVim = function(v) {
//     vim = v;
// }
//
// exports.setTextUtil = function(tu) {
//     textUtil = tu;
// }
//
// exports.selectPrevCharacter = function (num) {
//     App.repeatAction(function(){
//         vim.selectPrevCharacter();
//     }, num);
// };
//
// exports.selectNextCharacter = function (num) {
//     App.repeatAction(function(){
//         vim.selectNextCharacter();
//     }, num);
// };
//
// exports.switchModeToGeneral = function () {
//     var cMode= vim.currentMode;
//     if (vim.isMode(GENERAL)) {
//         return;
//     }
//     vim.switchModeTo(GENERAL);
//     var p = textUtil.getCursorPosition();
//     var sp = textUtil.getCurrLineStartPos();
//     if (p === sp) {
//         var c = textUtil.getCurrLineCount();
//         if (!c) {
//             textUtil.appendText(' ', p);
//         }
//         vim.selectNextCharacter();
//         vim.selectPrevCharacter();
//         if (textUtil.getCurrLineCount() === 1) {
//             textUtil.select(p, p+1);
//         }
//     } else {
//         if (cMode === VISUAL) {
//             vim.selectNextCharacter();
//         }
//         vim.selectPrevCharacter();
//     }
// };
//
// exports.switchModeToVisual = function () {
//     if (vim.isMode(VISUAL)) {
//         var s = vim.visualCursor;
//         if (s === undefined) {
//             return;
//         }
//         var p = vim.visualPosition;
//         if (p < s) {
//             textUtil.select(s-1, s);
//         } else {
//             textUtil.select(s, s+1);
//         }
//         if (textUtil.getPrevSymbol(s) == _ENTER_) {
//             textUtil.select(s, s+1);
//         }
//         vim.switchModeTo(GENERAL);
//         return;
//     }
//     vim.switchModeTo(VISUAL);
//     vim.visualPosition = textUtil.getCursorPosition();
//     vim.visualCursor = undefined;
// };
//
// exports.append = function() {
//     vim.append();
//     setTimeout(function () {
//         vim.switchModeTo(EDIT);
//     }, 100);
// };
//
// exports.appendLineTail = function () {
//     vim.moveToCurrentLineTail();
//     this.append();
// };
//
// exports.insert = function() {
//     vim.insert();
//     setTimeout(function () {
//         vim.switchModeTo(EDIT);
//     }, 100);
// };
//
// exports.insertLineHead = function () {
//     vim.moveToCurrentLineHead();
//     this.insert();
// };
//
// exports.selectNextLine = function (num) {
//     App.repeatAction(function(){
//         vim.selectNextLine();
//     }, num);
// };
//
// exports.selectPrevLine = function (num) {
//     App.repeatAction(function(){
//         vim.selectPrevLine();
//     }, num);
// };
//
// exports.copyChar = function() {
//     vim.pasteInNewLineRequest = false;
//     App.clipboard = textUtil.getSelectedText();
//     if (vim.isMode(VISUAL)) {
//         this.switchModeToGeneral();
//     }
// };
//
// exports.copyCurrentLine = function(num) {
//     var _data = {p:undefined, t:''};
//     App.repeatAction(function () {
//         _data.t = vim.copyCurrentLine(_data.p);
//         _data.p = textUtil.getNextLineStart(_data.p);
//         return _data.t;
//     }, num);
// };
//
// exports.pasteAfter = function () {
//     if (App.clipboard !== undefined) {
//         if(vim.pasteInNewLineRequest){
//             var ep = textUtil.getCurrLineEndPos();
//             textUtil.appendText(_ENTER_ + App.clipboard, ep, true, true);
//         } else {
//             textUtil.appendText(App.clipboard, undefined, true, false)
//         }
//     }
// };
//
// exports.pasteBefore = function () {
//     if (App.clipboard !== undefined) {
//         if(vim.pasteInNewLineRequest){
//             var sp = textUtil.getCurrLineStartPos();
//             textUtil.insertText(App.clipboard + _ENTER_, sp, true, true);
//         } else {
//             textUtil.insertText(App.clipboard, undefined, true, false)
//         }
//     }
// };
//
// exports.moveToCurrentLineHead = function () {
//     vim.moveToCurrentLineHead();
// };
//
// exports.moveToCurrentLineTail = function () {
//     vim.moveToCurrentLineTail();
// };
//
// exports.replaceChar = function () {
//     vim.replaceRequest = true;
// };
//
// exports.appendNewLine = function () {
//     vim.appendNewLine();
//     setTimeout(function () {
//         vim.switchModeTo(EDIT);
//     }, 100);
// };
//
// exports.insertNewLine = function () {
//     vim.insertNewLine();
//     setTimeout(function () {
//         vim.switchModeTo(EDIT);
//     }, 100);
// };
//
// exports.delCharAfter = function (num) {
//     App.repeatAction(function(){
//        return vim.deleteSelected();
//     }, num);
//     this.switchModeToGeneral()
// };
//
// exports.backToHistory = function () {
//     var key = App.getEleKey();
//     var list = App.doList[key];
//     vim.backToHistory(list);
// };
//
// exports.delCurrLine = function (num) {
//     App.repeatAction(function () {
//        return vim.delCurrLine();
//     }, num);
// };
//
// exports.moveToFirstLine = function () {
//     vim.moveToFirstLine();
// };
//
// exports.moveToLastLine = function () {
//     vim.moveToLastLine();
// };
//
// exports.moveToNextWord = function (num) {
//     App.repeatAction(function(){
//         vim.moveToNextWord();
//     }, num);
// };
//
// exports.copyWord = function (num) {
//     vim.pasteInNewLineRequest = false;
//     var sp = textUtil.getCursorPosition();
//     var ep;
//     App.repeatAction(function(){
//         ep = vim.copyWord(ep);
//     }, num);
//     App.clipboard = textUtil.getText(sp,ep);
// };
//
// exports.deleteWord = function (num) {
//     vim.pasteInNewLineRequest = false;
//     App.repeatAction(function () {
//        return vim.deleteWord();
//     }, num);
// };
