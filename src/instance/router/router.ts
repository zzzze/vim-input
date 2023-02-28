import type { VimMode } from '../vim/init'

interface Key {
  name: string
  mode: VimMode | ''
  record: boolean
  actions: Record<string, string>
}

export class Router {
  currentCode: string | number | undefined
  _keys: Record<string, Key | undefined>

  constructor () {
    this.currentCode = undefined
    this._keys = {}
  }

  code (code: string, name: string) {
    const lowerCaseCode = code.toLowerCase()
    let key = this._keys[lowerCaseCode]
    if (key === undefined) {
      key = { name: '', mode: '', record: false, actions: {} }
      this._keys[lowerCaseCode] = key
    }
    key.name = name
    key.mode = ''
    key.record = false
    this.currentCode = lowerCaseCode
    return this
  }

  action (name: string | number, methodName: string) {
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
