import type { App as AppType } from './instance/app/app'
import { VimMode } from './instance/vim/init'

// const GENERAL = 'general_mode'
// const VISUAL = 'visual_mode'
// let App: AppType

export default class Bind {
  App: AppType | undefined

  listen (app: AppType) {
    this.App = app
    const boxes: Array<HTMLInputElement | HTMLTextAreaElement> = [].slice.call(window.document.querySelectorAll('input, textarea'))
    this.App.boxes = boxes
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i]
      box.onfocus = this.onFocus
      box.onclick = this.onClick
      box.onkeydown = this.onKeyDown
    }
    this.App._on('reset_cursor_position', () => {
      if (this.App === undefined) {
        return
      }
      if (this.App.vim.isMode(VimMode.GENERAL) || this.App.vim.isMode(VimMode.VISUAL)) {
        this.App.vim.resetCursorByMouse()
      }
    })
    this.App._on('input', (ev: InputEvent, replaced: boolean) => {
      if (this.App === undefined) {
        return
      }
      let code = this.getCode(ev)
      this.App._log('mode:' + this.App.vim.currentMode)
      if (replaced) {
        this.App.recordText()
        return
      }
      if (filter.code(this.App, code)) {
        const unionCode = this.App.isUnionCode(code, -1)
        const vimKeys = this.App.router.getKeys()
        if (unionCode && (vimKeys[unionCode] != null)) {
          code = unionCode
        }
        this.App._log('key code:' + code)
        const num = this.App.numberManager(code)
        this.App.parseRoute(code, ev, num)
      }
    })
  }

  onFocus (e: FocusEvent) {
    if (this.App === undefined) {
      return
    }
    const target = e.target
    if (target === null || (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement))) {
      return
    }
    this.App.currentEle = target
    this.App.textUtil.setEle(target)
    this.App.vim.setTextUtil(this.App.textUtil)
    this.App.vim.resetVim()
    this.App.controller.setVim(this.App.vim)
    this.App.controller.setTextUtil(this.App.textUtil)
    this.App.initNumber()
  }

  onClick (e: MouseEvent) {
    if (this.App === undefined) {
      return
    }
    this.App._fire('reset_cursor_position', e)
  }

  onKeyDown (e: KeyboardEvent) {
    let replaced = false
    const code = this.getCode(e)
    if (this.App === undefined) {
      return
    }
    if (!this.App.key_code_white_list.includes(code)) {
      return
    }
    if (this.App.vim.isMode(VimMode.GENERAL) || this.App.vim.isMode(VimMode.VISUAL)) {
      if (this.App.vim.replaceRequest) {
        replaced = true
        this.App.vim.replaceRequest = false
        setTimeout(() => {
          this.App?.vim.selectPrevCharacter()
        }, 50)
      } else {
        e.preventDefault()
      }
    } else {
      if (code !== 27) {
        const p = this.App.textUtil.getCursorPosition()
        this.App.recordText(undefined, (p - 1 >= 0 ? p - 1 : p))
      }
    }
    this.App._fire('input', e, replaced)
  }

  getCode (ev: KeyboardEvent | InputEvent) {
    // eslint-disable-next-line
    return ev.keyCode || ev.which || ev.charCode
  }
}

// var _ = require('./util/helper.js');
// var filter = require('./filter.js');
// var App;
//
// exports.listen = function(app) {
//     App = app;
//     var boxes = window.document.querySelectorAll('input, textarea');
//     App.boxes = boxes;
//     for (var i = 0; i<boxes.length;i++) {
//         var box = boxes[i];
//         box.onfocus = onFocus;
//         box.onclick = onClick;
//         box.onkeydown = onKeyDown;
//     }
//     App._on('reset_cursor_position', function (e) {
//         if (App.vim.isMode(GENERAL) || App.vim.isMode(VISUAL)) {
//             App.vim.resetCursorByMouse();
//         }
//     });
//     App._on('input', function(ev, replaced){
//         var code = getCode(ev);
//         App._log('mode:'+App.vim.currentMode);
//         if (replaced) {
//             App.recordText();
//             return;
//         }
//         if (filter.code(App, code)) {
//             var unionCode = App.isUnionCode(code, -1);
//             var vimKeys = App.router.getKeys();
//             if (unionCode && vimKeys[unionCode]) {
//                 code = unionCode;
//             }
//             App._log('key code:'+code);
//             var num = App.numberManager(code);
//             App.parseRoute(code, ev, num);
//         }
//     });
// }
//
// function onFocus() {
//     App.currentEle = this;
//     App.textUtil.setEle(this);
//     App.vim.setTextUtil(App.textUtil);
//     App.vim.resetVim();
//     App.controller.setVim(App.vim);
//     App.controller.setTextUtil(App.textUtil);
//     App.initNumber();
// }
//
// function onClick(e) {
//     var ev = e || event || window.event;
//     App._fire('reset_cursor_position', ev);
// }
//
// function onKeyDown(e) {
//     var replaced = false;
//     var ev = getEvent(e);
//     var code = getCode(e);
//     if (_.indexOf(App.key_code_white_list, code) !== -1) {
//         return;
//     }
//     if (App.vim.isMode(GENERAL) || App.vim.isMode(VISUAL)) {
//         if (App.vim.replaceRequest) {
//             replaced = true;
//             App.vim.replaceRequest = false;
//             setTimeout(function () {
//                 App.vim.selectPrevCharacter();
//             }, 50);
//         } else {
//             if (ev.preventDefault) {
//                 ev.preventDefault();
//             } else {
//                 ev.returnValue = false;
//             }
//         }
//     } else {
//         if(code != 27){
//             var p = App.textUtil.getCursorPosition();
//             App.recordText(undefined, (p-1>=0 ? p-1:p));
//         }
//     }
//     App._fire('input', ev, replaced);
// }
//
// function getEvent(e) {
//     return e || event || window.event;
// }
//
// function getCode(ev) {
//     var e = getEvent(ev);
//     return e.keyCode || e.which || e.charCode;
// }
