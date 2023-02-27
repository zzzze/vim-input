import { AppBase } from './init'
import config from '../../config'
import { Router } from '../router/router'
import { TextUtil } from '../text/text'
import { Vim } from '../vim/vim'
import { Controller } from '../controller'
import Bind from '@/bind'
import * as routes from '@/routes'
import { VimMode } from '../vim/init'

// const GENERAL = 'general_mode';
// const VISUAL  = 'visual_mode';
const _ENTER_ = '\n'
export interface Data {
  t: string
  p?: number
}

export class App extends AppBase {
  currentEle: HTMLInputElement | HTMLTextAreaElement | undefined
  textUtil: TextUtil
  config: typeof config
  router: Router
  controller: Controller
  vim: Vim
  classes = {}
  doList: Data[][] = []
  clipboard?: string
  _events: Record<string, ((...args: any[]) => void) | undefined> | undefined
  constructor (options: typeof config) {
    super()
    this.config = options
    this.key_code_white_list = config.key_code_white_list

    this.router = new Router()
    if (this.currentEle === undefined) {
      throw Error('currentEle undefined')
    }
    this.textUtil = new TextUtil(this.currentEle)
    this.vim = new Vim(this.textUtil)
    this.controller = new Controller(this)

    this._log(this)
    this._start()
  }

  _start () {
    this._route()
    this._bind()
  }

  _route () {
    routes.ready(this.router)
  }

  _bind () {
    new Bind().listen(this)
  }

  _on (event: string, fn: (...args: any[]) => void) {
    if (this._events === undefined) {
      this._events = {}
    }
    if (typeof fn === 'function') {
      this._events[event] = fn
    }
    return this
  }

  _fire (event: string, ...args: any[]) {
    if (this._events === undefined || this._events[event] === undefined) {
      return
    }
    const fn = this._events[event]
    if (fn === undefined) {
      return
    }
    fn.apply(this, args)
    return this
  }

  _log (msg: unknown, debug?: boolean) {
    debug = debug !== undefined ? debug : this.config.debug
    if (debug) {
      console.log(msg)
    }
  }

  repeatAction (action: () => string | undefined, num?: number) {
    let res: string | undefined
    if (num === undefined || isNaN(num)) {
      num = 1
    }
    for (let i = 0; i < num; i++) {
      res = action.apply(null)
      if (res !== undefined && res !== '') {
        if (i === 0) {
          this.clipboard = ''
        }
        if (i === num - 1) {
          // remove line break char
          res = res.replace(_ENTER_, '')
        }
        this.clipboard = `${this.clipboard ?? ''}${res}`
      }
    }
  }

  recordText (t?: string, p?: number) {
    t = (t === undefined) ? this.textUtil.getText() : t
    p = (p === undefined) ? this.textUtil.getCursorPosition() : p
    const data: Data = { t, p }
    const key = this.getEleKey()
    let list = this.doList[key]
    if (!Array.isArray(list)) {
      list = []
      this.doList[key] = list
    }
    if (list.length >= this.doListDeep) {
      list.shift()
    }
    list.push(data)
    this._log(this.doList)
  }

  getEleKey () {
    if (this.currentEle === undefined) {
      return -1
    }
    return this.boxes.indexOf(this.currentEle)
  }

  numberManager (code: number | string) {
    if (typeof code === 'string') {
      code = 0
    }
    if (code === 68 || code === 89) {
      // 防止ndd和nyy时候数值计算错误,如当code为68时，
      // 如果不拦截，则会在后面执行initNumber()，导致dd时无法获取数值
      return undefined
    }
    const num = parseFloat(String.fromCharCode(code))
    if (!isNaN(num) && num >= 0 && num <= 9) {
      this._number = `${this._number}${num}`
      this._log(`number: ${this._number}`)
    } else {
      const n = this._number
      this.initNumber()
      if (n !== '') {
        return parseInt(n)
      }
    }
    return undefined
  }

  initNumber () {
    this._number = ''
  }

  isUnionCode (code: number, maxTime?: number) {
    if (maxTime === undefined) {
      maxTime = 600
    }
    const ct = Date.now()
    const pt = this.prevCodeTime
    const pc = this.prevCode
    this.prevCode = code
    this.prevCodeTime = ct
    if (pc !== undefined && (maxTime < 0 || ct - pt <= maxTime)) {
      if (pc === code) {
        this.prevCode = undefined
      }
      return `${pc}_${code}`
    }
    return undefined
  }

  // FIXME: no eval
  parseRoute (code: number | string, ev: KeyboardEvent | InputEvent, num?: number) {
    const c = this.controller
    const param = num
    console.log(param)
    const prefix = 'c.'
    const suffix = '(param)'
    const vimKeys = this.router.getKeys()
    if (code === 27) {
      c.switchModeToGeneral()
      return
    }
    if ((vimKeys[code] != null) && (this.vim.isMode(VimMode.GENERAL) || this.vim.isMode(VimMode.VISUAL))) {
      const mode = vimKeys[code]?.mode
      if (mode !== undefined && mode !== '' && !this.vim.isMode(mode)) {
        return false
      }
      let keyName = vimKeys[code]?.name
      if (keyName === undefined) {
        return
      }
      if (ev instanceof KeyboardEvent && ev.shiftKey) {
        if (keyName === keyName.toUpperCase()) {
          keyName = `shift_${keyName}`
        } else {
          keyName = keyName.toUpperCase()
        }
      }
      const key = vimKeys[code.toString()]
      if (key === undefined) {
        return
      }
      this._log(`${key.actions[keyName] ?? ''}${suffix}`)
      // record
      if (key.record) {
        this.recordText()
      }
      eval(`${prefix}${key.actions[keyName]}${suffix}`) // eslint-disable-line no-eval
      // init number
      this.initNumber()
    }
  }

// exports.class = function (name, fn) {
//     if (!name) {
//         throw new Error('first param is required');
//     }
//     if (typeof fn !== 'function') {
//         throw new Error('second param must be a function');
//     }
//     this.classes[name] = fn;
// }
//
// exports.createClass = function(name, arg) {
//     var fn = this.classes[name];
//     if (typeof fn !== 'function') {
//         throw new Error('class '+name+' not define');
//     }
//     return new fn(arg);
// }
}

// var _ = require('../../util/helper.js');
// var config = require('../../config.js');
// var routes = require('../../routes.js');
// var bind = require('../../bind.js');
// var extend = _.extend;
//
// exports.classes = {}
//
// exports._init = function (options) {
//     extend(this, require('./init.js'));
//
//     this.config = extend(config, options);
//     this.key_code_white_list = config.key_code_white_list;
//
//     this.router = this.createClass('Router');
//     this.textUtil = this.createClass('TextUtil', this.currentEle);
//     this.vim = this.createClass('Vim', this.textUtil);
//     this.controller = this.createClass('Controller', this);
//
//     this._log(this);
//     this._start();
// }
//
// exports._start = function () {
//     this._route();
//     this._bind();
// }
//
// exports._route = function () {
//     routes.ready(this.router);
// }
//
// exports._bind = function() {
//     bind.listen(this);
// }
//
// exports._on = function (event, fn) {
//     if (!this._events) {
//         this._events = {}
//     }
//     if (typeof  fn === 'function') {
//         this._events[event] = fn;
//     }
//     return this;
// }
//
// exports._fire = function (event) {
//     if (!this._events || !this._events[event]) {
//         return;
//     }
//     var args = Array.prototype.slice.call(arguments, 1) || [];
//     var fn = this._events[event];
//     fn.apply(this, args);
//     return this;
// }
//
// exports._log = function(msg, debug) {
//     debug = debug ? debug : this.config.debug;
//     if (debug) {
//         console.log(msg)
//     }
// }
//
// exports.repeatAction = function(action, num) {
//     if (typeof action !== 'function') {
//         return;
//     }
//     var res = undefined;
//     if (num === undefined || isNaN(num)) {
//         num = 1;
//     }
//     for (var i=0;i<num;i++) {
//         res = action.apply();
//         if (res) {
//             if (!i) {
//                 this.clipboard = '';
//             }
//             if (i == num-1) {
//                 //remove line break char
//                 res = res.replace(_ENTER_, '');
//             }
//             this.clipboard = this.clipboard + res;
//         }
//     }
// }
//
// exports.recordText = function(t, p) {
//     t = (t === undefined) ? this.textUtil.getText() : t;
//     p = (p === undefined) ? this.textUtil.getCursorPosition() : p;
//     var data = {
//         't':t,
//         'p':p
//     };
//     var key = this.getEleKey();
//     if (!this.doList[key]) {
//         this.doList[key] = [];
//     }
//     if (this.doList[key].length >= this.doListDeep) {
//         this.doList[key].shift();
//     }
//     this.doList[key].push(data);
//     this._log(this.doList);
// }
//
// exports.getEleKey = function() {
//     return _.indexOf(this.boxes, this.currentEle);
// }
//
// exports.numberManager = function(code) {
//     if (code == 68 || code == 89) {
//         //防止ndd和nyy时候数值计算错误,如当code为68时，
//         //如果不拦截，则会在后面执行initNumber()，导致dd时无法获取数值
//         return undefined;
//     }
//     var num = String.fromCharCode(code);
//     if (!isNaN(num) && num >=0 && num <=9) {
//         this._number = this._number + '' + num;
//         this._log('number:' + this._number);
//     } else {
//         var n = this._number;
//         this.initNumber();
//         if (n) {
//             return parseInt(n);
//         }
//     }
//     return undefined;
// }
//
// exports.initNumber = function() {
//     this._number = '';
// }
//
// exports.isUnionCode = function (code, maxTime) {
//     if (maxTime === undefined) {
//         maxTime = 600;
//     }
//     var ct = _.currentTime();
//     var pt = this.prevCodeTime;
//     var pc = this.prevCode;
//     this.prevCode = code;
//     this.prevCodeTime = ct;
//     if (pc && (maxTime < 0 || ct - pt <= maxTime)) {
//         if (pc == code) {
//             this.prevCode = undefined;
//         }
//         return pc + '_' + code;
//     }
//     return undefined;
// }
//
// exports.parseRoute = function(code, ev, num) {
//     var c = this.controller;
//     var param = num;
//     var prefix = 'c.';
//     var suffix = '(param)';
//     var vimKeys = this.router.getKeys();
//     if (code === 27) {
//         c.switchModeToGeneral();
//         return;
//     }
//     if (vimKeys[code] && (this.vim.isMode(GENERAL) || this.vim.isMode(VISUAL))) {
//         var mode = vimKeys[code]['mode'];
//         if (mode && !this.vim.isMode(mode)) {
//             return false;
//         }
//         var keyName = vimKeys[code]['name'];
//         if (ev.shiftKey) {
//             if (keyName == keyName.toUpperCase()) {
//                 keyName = 'shift_' + keyName;
//             } else {
//                 keyName = keyName.toUpperCase();
//             }
//         }
//         this._log(vimKeys[code][keyName] + suffix);
//         if (vimKeys[code][keyName]) {
//             //record
//             if (vimKeys[code]['record']) {
//                 this.recordText();
//             }
//             eval(prefix + vimKeys[code][keyName] + suffix);
//             //init number
//             this.initNumber();
//         }
//     }
// }
//
// exports.class = function (name, fn) {
//     if (!name) {
//         throw new Error('first param is required');
//     }
//     if (typeof fn !== 'function') {
//         throw new Error('second param must be a function');
//     }
//     this.classes[name] = fn;
// }
//
// exports.createClass = function(name, arg) {
//     var fn = this.classes[name];
//     if (typeof fn !== 'function') {
//         throw new Error('class '+name+' not define');
//     }
//     return new fn(arg);
// }
