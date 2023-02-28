import { AppBase } from '@/instance/app/init'
import { Router } from '@/instance/router/router'
import { TextUtil } from '@/instance/text/text'
import { Vim } from '@/instance/vim/vim'
import { Controller } from '@/instance/controller'
import EventBinder from '@/event-binder'
import * as routes from '@/routes'
import { VimMode } from '@/instance/vim/init'
import config from '@/config'

const _ENTER_ = '\n'

export interface Data {
  t: string
  p?: number
}

export type Options = Omit<typeof config, 'key_code_white_list'> & {
  key_code_white_list?: string[]
}

export class App extends AppBase {
  currentEle?: HTMLInputElement | HTMLTextAreaElement
  textUtil: TextUtil
  config: typeof config
  router: Router
  controller: Controller
  vim: Vim
  classes = {}
  doList: Data[][] = []
  clipboard?: string
  _events: Record<string, ((...args: any[]) => void) | undefined> | undefined
  constructor (options: Options) {
    super()
    this.config = {
      ...config,
      ...options,
    }
    this.key_code_white_list = config.key_code_white_list
    this.router = new Router()
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
    new EventBinder().listen(this)
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

  isUnionCode (code: string, maxTime?: number) {
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
  parseRoute (code: string, ev: KeyboardEvent | InputEvent, num?: number) {
    const c = this.controller
    const param = num
    console.log(param)
    const prefix = 'c.'
    const suffix = '(param)'
    const vimKeys = this.router.getKeys()
    if (code === 'Escape'.toLowerCase()) {
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
}
