import { AppBase } from './init'
import config from '../../config'
import { Router } from '../router/router'
import { TextUtil } from '../text/text'
import { Vim } from '../vim/vim'

// const GENERAL = 'general_mode';
// const VISUAL  = 'visual_mode';
const _ENTER_ = '\n'

export class App extends AppBase {
  currentEle: HTMLInputElement | HTMLTextAreaElement | undefined
  textUtil: TextUtil
  config: typeof config
  vim: Vim
  classes = {}
  _events: Record<string, (() => void) | undefined> | undefined
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
    // this.controller = this.createClass('Controller', this)
    //
    // this._log(this)
    // this._start()
  }

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
  _on (event: string, fn: () => void) {
    if (this._events === undefined) {
      this._events = {}
    }
    if (typeof fn === 'function') {
      this._events[event] = fn
    }
    return this
  }

  _fire (event: string, ...args: unknown[]) {
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

  _log (msg: string, debug?: boolean) {
    debug = debug !== undefined ? debug : this.config.debug
    if (debug) {
      console.log(msg)
    }
  }
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
  recordText (t?: string, p?: number) {
    t = (t === undefined) ? this.textUtil.getText() : t;
    p = (p === undefined) ? this.textUtil.getCursorPosition() : p;
    var data = {
        't':t,
        'p':p
    };
    var key = this.getEleKey();
    if (!this.doList[key]) {
        this.doList[key] = [];
    }
    if (this.doList[key].length >= this.doListDeep) {
        this.doList[key].shift();
    }
    this.doList[key].push(data);
    this._log(this.doList);
  }

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
