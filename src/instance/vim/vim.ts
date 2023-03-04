import { VimBase, VimMode } from './init'
import type { TextUtil } from '../text/text'
import type { Data } from '../app/app'

const _ENTER_ = '\n'

// var _ = require('../../util/helper.js');
// var extend = _.extend;
// var textUtil;

export class Vim extends VimBase {
  textUtil: TextUtil
  constructor (tu: TextUtil) {
    super()
    this.textUtil = tu
  }

  resetVim () {
    this.replaceRequest = false
    this.visualPosition = undefined
    this.visualCursor = undefined
  }

  setTextUtil (tu: TextUtil) {
    this.textUtil = tu
  }

  isMode (modeName: VimMode) {
    return this.currentMode === modeName
  }

  switchModeTo (modeName: VimMode) {
    if ([VimMode.GENERAL, VimMode.COMMAND, VimMode.EDIT, VimMode.VISUAL].includes(modeName)) {
      this.currentMode = modeName
    }
  }

  resetCursorByMouse () {
    this.switchModeTo(VimMode.GENERAL)
    const cursorPosition: number = this.textUtil.getCursorPosition()
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
  }

  selectNextCharacter () {
    let p: number = this.textUtil.getCursorPosition()
    if (this.isMode(VimMode.VISUAL) && this.visualCursor !== undefined) {
      p = this.visualCursor
    }
    if (this.isMode(VimMode.GENERAL) && this.textUtil.getNextSymbol(p) === _ENTER_) {
      return
    }
    if (this.isMode(VimMode.VISUAL) && this.textUtil.getNextSymbol(p - 1) === _ENTER_) {
      return
    }
    if (p + 1 <= this.textUtil.getText().length) {
      let s = p + 1
      let f1: number = 0
      let f2: number = 0
      let f3: number = 0
      if (this.isMode(VimMode.VISUAL)) {
        s = this.visualPosition ?? 0 // FIXME: undefined
        this.visualCursor = p + 1
        f1 = this.visualCursor
        f2 = this.visualPosition ?? 0
        f3 = this.textUtil.getCursorPosition()
      }
      // default
      this.textUtil.select(s, p + 2)
      // special
      if (this.isMode(VimMode.VISUAL)) {
        if (s === p) {
          this.textUtil.select(s, p + 2)
          this.visualCursor = p + 2
        } else {
          this.textUtil.select(s, p + 1)
        }
        if (f2 > f1 && f2 > f3) {
          this.textUtil.select(s, p + 1)
        } else if (f1 === f2 && f2 - f3 === 1) {
          // textUtil.select(s, p+1)
          this.visualPosition = f2 - 1
          this.visualCursor = p + 2
          this.textUtil.select(s - 1, p + 2)
        }
      }
    }
  }

  selectPrevCharacter () {
    let p: number = this.textUtil.getCursorPosition()
    if (this.isMode(VimMode.VISUAL) && this.visualCursor !== undefined) {
      p = this.visualCursor
    }
    if (this.textUtil.getPrevSymbol(p) === _ENTER_) {
      return
    }
    let s = p - 1
    if (this.isMode(VimMode.VISUAL)) {
      s = this.visualPosition ?? 0
      if (s < p && this.textUtil.getPrevSymbol(p - 1) === _ENTER_) {
        return
      }
      if (s === p) {
        p = p + 1
        s = s - 1
        this.visualPosition = p
        this.visualCursor = s
      } else if (p === s + 1) {
        s = s + 1
        p = p - 2
        this.visualPosition = s
        this.visualCursor = p
      } else if (p === s - 1) {
        p = s - 2
        this.visualCursor = p
      } else {
        // default
        if (!(s < p && (p + 1 === this.textUtil.getSelectEndPos()))) {
          p = p - 1
        }
        this.visualCursor = p
      }
    }
    if ((this.visualCursor ?? 0) < 0) {
      this.visualCursor = 0
    }
    if ((this.isMode(VimMode.GENERAL) && s >= 0) || this.isMode(VimMode.VISUAL)) {
      this.textUtil.select(s, p)
    }
  }

  append () {
    const p: number = this.textUtil.getCursorPosition()
    if (this.textUtil.removeEmptyLinePlaceholder()) {
      this.textUtil.select(p, p)
    } else {
      this.textUtil.select(p + 1, p + 1)
    }
  }

  insert () {
    const p = this.textUtil.getCursorPosition()
    this.textUtil.select(p, p)
  }

  selectNextLine () {
    let sp: number | undefined
    if (this.isMode(VimMode.VISUAL) && this.visualCursor !== undefined) {
      sp = this.visualCursor
    }
    const nextLineStart = this.textUtil.getNextLineStart(sp)
    const nextLineEnd = this.textUtil.getNextLineEnd(sp) ?? 0
    const nextLineCharCount = nextLineEnd - nextLineStart
    let currentCursorOffsetFromLineStart: number = this.textUtil.getCountFromStartToPosInCurrLine(sp)
    if (this.isMode(VimMode.VISUAL) && this.visualCursor !== undefined && (this.visualPosition ?? 0) < this.visualCursor) {
      currentCursorOffsetFromLineStart = currentCursorOffsetFromLineStart - 1
    }
    let nextCursorPosition = nextLineStart + (currentCursorOffsetFromLineStart > nextLineCharCount ? nextLineCharCount : currentCursorOffsetFromLineStart)
    if (nextCursorPosition <= this.textUtil.getText().length) {
      let s = nextCursorPosition - 1
      if (this.isMode(VimMode.VISUAL)) {
        s = this.visualPosition ?? 0
        if (s > nextCursorPosition) {
          nextCursorPosition = nextCursorPosition - 1
        }
        this.visualCursor = nextCursorPosition
        if (this.textUtil.getSymbol(nextLineStart) === _ENTER_) {
          this.textUtil.appendText(' ', nextLineStart)
          nextCursorPosition = nextCursorPosition + 1
          this.visualCursor = nextCursorPosition
          if (s > nextCursorPosition) {
            // 因为新加了空格符，导致字符总数增加，visual开始位置相应增加
            s += 1
            this.visualPosition = s
          }
        }
      }
      this.textUtil.select(s, nextCursorPosition)
      if (this.isMode(VimMode.GENERAL)) {
        if (this.textUtil.getSymbol(nextLineStart) === _ENTER_) {
          this.textUtil.appendText(' ', nextLineStart)
        }
      }
    }
  }

  selectPrevLine () {
    let sp: number | undefined
    if (this.isMode(VimMode.VISUAL) && this.visualCursor !== undefined) {
      sp = this.visualCursor
    }
    const pl = this.textUtil.getPrevLineStart(sp)
    const pr = this.textUtil.getPrevLineEnd(sp)
    let cc = this.textUtil.getCountFromStartToPosInCurrLine(sp)
    if (this.isMode(VimMode.VISUAL) && this.visualCursor !== undefined && (this.visualPosition ?? 0) < this.visualCursor) {
      cc = cc - 1
    }
    const pc = (pr ?? 0) - (pl ?? 0)
    const p = (pl ?? 0) + (cc > pc ? pc : cc)
    if (p >= 0) {
      let s = p - 1
      let e = p
      if (this.isMode(VimMode.VISUAL)) {
        s = this.visualPosition ?? 0
        if (this.textUtil.getPrevSymbol(p) !== _ENTER_ && s !== p - 1 && e < s) {
          e = p - 1
        }
        this.visualCursor = e
      }
      this.textUtil.select(s, e)
      if (this.isMode(VimMode.GENERAL)) {
        if (this.textUtil.getSymbol(pl ?? 0) === _ENTER_) {
          this.textUtil.appendText(' ', pl)
        }
      }
    }
  }

  moveToCurrentLineHead () {
    const p = this.textUtil.getCurrLineStartPos()
    if (this.isMode(VimMode.GENERAL)) {
      this.textUtil.select(p, p + 1)
    }
    if (this.isMode(VimMode.VISUAL)) {
      let sp = this.visualCursor
      if (sp === undefined) {
        sp = this.textUtil.getCursorPosition()
      }
      for (sp; sp > p; sp--) {
        this.selectPrevCharacter()
      }
    }
  }

  moveToCurrentLineTail () {
    let p = this.textUtil.getCurrLineEndPos()
    if (this.isMode(VimMode.GENERAL)) {
      this.textUtil.select(p - 1, p)
    }
    if (this.isMode(VimMode.VISUAL)) {
      let sp = this.visualCursor
      if (sp === undefined) {
        sp = this.textUtil.getCursorPosition()
      }
      p = this.textUtil.getCurrLineEndPos(sp)
      if (sp === p - 1) {
        p = p - 1
      }
      for (sp; sp < p; sp++) {
        this.selectNextCharacter()
      }
    }
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
    const cursorPosition = this.textUtil.getCursorPosition()
    const t = this.textUtil.delSelected()
    this.textUtil.select(cursorPosition, cursorPosition + 1)
    this.pasteInNewLineRequest = false
    return t
  }

  deletePrevious () {
    const p = this.textUtil.getCursorPosition()
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
      this.textUtil.select(this.visualPosition ?? 0, 0)
      this.visualCursor = 0
    }
  }

  moveToLastLine () {
    const lp = this.textUtil.getText().length
    const sp = this.textUtil.getCurrLineStartPos(lp - 1)
    if (this.isMode(VimMode.GENERAL)) {
      this.textUtil.select(sp, sp + 1)
    } else if (this.isMode(VimMode.VISUAL)) {
      this.textUtil.select(this.visualPosition ?? 0, sp + 1)
      this.visualCursor = sp + 1
    }
  }

  moveToNextWord () {
    let p
    if (this.isMode(VimMode.VISUAL)) {
      p = this.visualCursor
    }
    const poses = this.textUtil.getCurrWordPos(p)
    // poses[1] is next word`s start position
    const sp = poses[1]
    if (sp !== undefined) {
      if (this.isMode(VimMode.GENERAL)) {
        this.textUtil.select(sp, sp + 1)
      } else if (this.isMode(VimMode.VISUAL)) {
        this.textUtil.select(this.visualPosition ?? 0, sp + 1)
        this.visualCursor = sp + 1
      }
    }
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

// exports._init = function (tu) {
//     extend(this, require('./init.js'));
//     textUtil = tu;
// };
//
// exports.resetVim = function() {
//     this.replaceRequest = false;
//     this.visualPosition = undefined;
//     this.visualCursor = undefined;
// }
//
// exports.setTextUtil = function(tu) {
//     textUtil = tu;
// }
//
// exports.isMode = function (modeName) {
//     return this.currentMode === modeName
// };
//
// exports.switchModeTo = function (modeName) {
//     if (modeName === GENERAL || modeName === COMMAND || modeName === EDIT || modeName === VISUAL) {
//         this.currentMode = modeName;
//     }
// };
//
// exports.resetCursorByMouse = function() {
//     this.switchModeTo(GENERAL);
//     var p = textUtil.getCursorPosition();
//     var sp = textUtil.getCurrLineStartPos();
//     var c = textUtil.getCurrLineCount();
//     if (p === sp && !c) {
//         textUtil.appendText(' ', p);
//     }
//     var ns = textUtil.getNextSymbol(p-1);
//     if (ns && ns !== _ENTER_) {
//         textUtil.select(p, p+1);
//     } else {
//         textUtil.select(p-1, p);
//     }
// };
//
// exports.selectNextCharacter = function() {
//     var p = textUtil.getCursorPosition();
//     if (this.isMode(VISUAL) && this.visualCursor !== undefined) {
//         p = this.visualCursor;
//     }
//     if (this.isMode(GENERAL) && textUtil.getNextSymbol(p) == _ENTER_) {
//         return;
//     }
//     if (this.isMode(VISUAL) && textUtil.getNextSymbol(p-1) == _ENTER_) {
//         return;
//     }
//     if (p+1 <= textUtil.getText().length) {
//         var s = p+1;
//         if (this.isMode(VISUAL)) {
//             s = this.visualPosition;
//             this.visualCursor = p+1;
//             var f1 = this.visualCursor;
//             var f2 = this.visualPosition;
//             var f3 = textUtil.getCursorPosition();
//         }
//         //default
//         textUtil.select(s, p+2);
//         //special
//         if (this.isMode(VISUAL)) {
//             if (s == p) {
//                 textUtil.select(s, p+2);
//                 this.visualCursor = p+2;
//             } else {
//                 textUtil.select(s, p+1);
//             }
//             if (f2 > f1 && f2 > f3) {
//                 textUtil.select(s, p+1);
//             } else if (f1 == f2 && f2 - f3 == 1) {
//                 //textUtil.select(s, p+1);
//                 this.visualPosition = f2-1;
//                 this.visualCursor = p+2;
//                 textUtil.select(s-1, p+2);
//             }
//         }
//     }
// };
// exports.selectPrevCharacter = function() {
//     var p = textUtil.getCursorPosition();
//     if (this.isMode(VISUAL) && this.visualCursor !== undefined) {
//         p = this.visualCursor;
//     }
//     if (textUtil.getPrevSymbol(p) == _ENTER_) {
//         return;
//     }
//     var s = p-1;
//     if (this.isMode(VISUAL)) {
//         s = this.visualPosition;
//         if (s < p && textUtil.getPrevSymbol(p-1) == _ENTER_) {
//             return;
//         }
//         if (s == p) {
//             p = p+1;
//             s = s-1;
//             this.visualPosition = p;
//             this.visualCursor = s;
//         } else if (p == s+1) {
//             s = s+1;
//             p = p-2;
//             this.visualPosition = s;
//             this.visualCursor = p;
//         } else if (p == s-1) {
//             p = s-2;
//             this.visualCursor = p;
//         } else {
//             //default
//             if (!(s < p && (p+1 == textUtil.getSelectEndPos()))) {
//                 p = p-1;
//             }
//             this.visualCursor = p;
//         }
//     }
//     if (this.visualCursor < 0) {
//         this.visualCursor = 0;
//     }
//     if ((this.isMode(GENERAL) && s>=0) || this.isMode(VISUAL)) {
//         textUtil.select(s, p);
//     }
// };
//
//
// exports.append = function () {
//     var p = textUtil.getCursorPosition();
//     textUtil.select(p+1, p+1);
// };
//
// exports.insert = function () {
//     var p = textUtil.getCursorPosition();
//     textUtil.select(p, p);
// };
//
// exports.selectNextLine = function () {
//     var sp = undefined;
//     if (this.isMode(VISUAL) && this.visualCursor !== undefined) {
//         sp = this.visualCursor;
//     }
//     var nl = textUtil.getNextLineStart(sp);
//     var nr = textUtil.getNextLineEnd(sp);
//     var nc = nr - nl;
//     var cc = textUtil.getCountFromStartToPosInCurrLine(sp);
//     if (this.isMode(VISUAL) && this.visualCursor != undefined && this.visualPosition < this.visualCursor) {
//         cc = cc-1;
//     }
//     var p = nl + (cc > nc ? nc : cc);
//     if (p <= textUtil.getText().length) {
//         var s = p-1;
//         if (this.isMode(VISUAL)) {
//             s = this.visualPosition;
//             if (s > p) {
//                 p = p-1;
//             }
//             this.visualCursor = p;
//             if (textUtil.getSymbol(nl) == _ENTER_) {
//                 textUtil.appendText(' ', nl);
//                 p = p+1;
//                 this.visualCursor = p;
//                 if (s > p) {
//                     //因为新加了空格符，导致字符总数增加，visual开始位置相应增加
//                     s += 1;
//                     this.visualPosition = s;
//                 }
//             }
//         }
//         textUtil.select(s, p);
//         if (this.isMode(GENERAL)) {
//             if (textUtil.getSymbol(nl) == _ENTER_) {
//                 textUtil.appendText(' ', nl);
//             }
//         }
//     }
// };
//
// exports.selectPrevLine = function () {
//     var sp = undefined;
//     if (this.isMode(VISUAL) && this.visualCursor !== undefined) {
//         sp = this.visualCursor;
//     }
//     var pl = textUtil.getPrevLineStart(sp);
//     var pr = textUtil.getPrevLineEnd(sp);
//     var cc = textUtil.getCountFromStartToPosInCurrLine(sp);
//     if (this.isMode(VISUAL) && this.visualCursor != undefined && this.visualPosition < this.visualCursor) {
//         cc = cc-1;
//     }
//     var pc = pr - pl;
//     var p = pl + (cc > pc ? pc : cc);
//     if (p >= 0) {
//         var s = p-1;
//         var e = p;
//         if (this.isMode(VISUAL)) {
//             s = this.visualPosition;
//             if (textUtil.getPrevSymbol(p) != _ENTER_ && s != p-1 && e < s) {
//                 e = p-1;
//             }
//             this.visualCursor = e;
//         }
//         textUtil.select(s, e);
//         if (this.isMode(GENERAL)) {
//             if (textUtil.getSymbol(pl) == _ENTER_) {
//                 textUtil.appendText(' ', pl);
//             }
//         }
//     }
// };
//
// exports.moveToCurrentLineHead = function () {
//     var p = textUtil.getCurrLineStartPos();
//     if (this.isMode(GENERAL)) {
//         textUtil.select(p, p+1);
//     }
//     if (this.isMode(VISUAL)) {
//         var sp = this.visualCursor;
//         if (sp === undefined) {
//             sp = textUtil.getCursorPosition();
//         }
//         for (sp;sp>p;sp--) {
//             this.selectPrevCharacter();
//         }
//     }
// };
//
// exports.moveToCurrentLineTail = function () {
//     var p = textUtil.getCurrLineEndPos();
//     if (this.isMode(GENERAL)) {
//         textUtil.select(p - 1, p);
//     }
//     if (this.isMode(VISUAL)) {
//         var sp = this.visualCursor;
//         if (sp === undefined) {
//             sp = textUtil.getCursorPosition();
//         }
//         p = textUtil.getCurrLineEndPos(sp);
//         if (sp == p-1) {
//             p = p-1
//         }
//         for (sp;sp<p;sp++){
//             this.selectNextCharacter();
//         }
//     }
// };
//
// exports.appendNewLine = function () {
//     var p = textUtil.getCurrLineEndPos();
//     textUtil.appendText(_ENTER_ + " ", p);
//     textUtil.select(p+1, p+1);
// };
//
// exports.insertNewLine = function () {
//     var p = textUtil.getCurrLineStartPos();
//     textUtil.appendText(" " + _ENTER_, p);
//     textUtil.select(p, p);
// };
//
// exports.deleteSelected = function () {
//     var p = textUtil.getCursorPosition();
//     var t = textUtil.delSelected();
//     textUtil.select(p, p+1);
//     this.pasteInNewLineRequest = false;
//     return t;
// };
//
// exports.copyCurrentLine = function (p) {
//     var sp = textUtil.getCurrLineStartPos(p);
//     var ep = textUtil.getCurrLineEndPos(p);
//     //clipboard = textUtil.getText(sp, ep);
//     this.pasteInNewLineRequest= true;
//     return textUtil.getText(sp, ep+1);
// };
//
// exports.backToHistory = function (list) {
//     if (list) {
//         var data = list.pop();
//         if (data !== undefined) {
//             textUtil.setText(data.t);
//             textUtil.select(data.p, data.p+1);
//         }
//     }
// };
//
// exports.delCurrLine = function () {
//     var sp = textUtil.getCurrLineStartPos();
//     var ep = textUtil.getCurrLineEndPos();
//     var t = textUtil.delete(sp, ep+1);
//     textUtil.select(sp, sp+1);
//     this.pasteInNewLineRequest = true;
//     return t;
// };
//
// exports.moveToFirstLine = function () {
//     if (this.isMode(GENERAL)) {
//         textUtil.select(0,1);
//     } else if (this.isMode(VISUAL)) {
//         textUtil.select(this.visualPosition, 0);
//         this.visualCursor = 0;
//     }
// };
//
// exports.moveToLastLine = function () {
//     var lp = textUtil.getText().length;
//     var sp = textUtil.getCurrLineStartPos(lp-1);
//     if (this.isMode(GENERAL)) {
//         textUtil.select(sp, sp+1);
//     } else if (this.isMode(VISUAL)) {
//         textUtil.select(this.visualPosition, sp+1);
//         this.visualCursor = sp+1;
//     }
// };
//
// exports.moveToNextWord = function () {
//     var p;
//     if (this.isMode(VISUAL)) {
//         p = this.visualCursor;
//     }
//     var poses = textUtil.getCurrWordPos(p);
//     //poses[1] is next word`s start position
//     var sp = poses[1];
//     if (sp) {
//         if (this.isMode(GENERAL)) {
//             textUtil.select(sp, sp+1);
//         } else if (this.isMode(VISUAL)) {
//             textUtil.select(this.visualPosition, sp+1);
//             this.visualCursor = sp+1;
//         }
//     }
// };
//
// exports.copyWord = function (p) {
//     var poses = textUtil.getCurrWordPos(p);
//     return poses[1];
// };
//
// exports.deleteWord = function () {
//     var t;
//     var poses = textUtil.getCurrWordPos();
//     if (poses[1]) {
//         t = textUtil.delete(poses[0], poses[1]);
//         textUtil.select(poses[0], poses[0]+1)
//     }
//     return t;
// };
