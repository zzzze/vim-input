import type { VimMode } from '../vim/init'

interface Key {
  name: string
  mode: VimMode | ''
  record: boolean
  actions: Record<string, string>
}

export class Router {
  currentCode: string | undefined
  _keys: Record<string, Key | undefined>

  constructor () {
    this.currentCode = undefined
    this._keys = {}
  }

  code (code: string, name: string) {
    let key = this._keys[code]
    if (key === undefined) {
      key = { name: '', mode: '', record: false, actions: {} }
      this._keys[code] = key
    }
    key.name = name
    key.mode = ''
    key.record = false
    this.currentCode = code
    return this
  }

  action (name: string, methodName: string) {
    if (this.currentCode === undefined) {
      return
    }
    const key = this._keys[this.currentCode]
    if (key === undefined) {
      return
    }
    key.actions[name] = methodName
    return this
  }

  mode (mode: VimMode) {
    if (this.currentCode === undefined) {
      return
    }
    const key = this._keys[this.currentCode]
    if (key === undefined) {
      return
    }
    key.mode = mode
    return this
  }

  record (isRecord: boolean) {
    if (this.currentCode === undefined) {
      return
    }
    const key = this._keys[this.currentCode]
    if (key === undefined) {
      return
    }
    key.record = isRecord
    return this
  }

  getKeys () {
    return this._keys
  }
}

// exports._init = function() {
//     this.currentCode = undefined;
//     this._keys = {};
// }
//
// exports.code = function (code, name) {
//     if (!this._keys[code]) {
//         this._keys[code] = {}
//     }
//     this._keys[code]['name'] = name;
//     this._keys[code]['mode'] = '';
//     this._keys[code]['record'] = false;
//     this.currentCode = code;
//     return this;
// }
//
// exports.action = function (name, methodName) {
//     if (!this.currentCode) {
//         return
//     }
//     this._keys[this.currentCode][name] = methodName;
//     return this;
// }
//
// exports.mode = function(mode) {
//     if (!this.currentCode) {
//         return
//     }
//     this._keys[this.currentCode]['mode'] = mode;
//     return this;
// }
//
// exports.record = function(isRecord) {
//     if (!this.currentCode) {
//         return
//     }
//     this._keys[this.currentCode]['record'] = isRecord;
//     return this;
// }
//
// exports.getKeys = function() {
//     return this._keys;
// }
