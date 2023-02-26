export function extend (to: any, form: any) {
  for (const key in form) {
    to[key] = form[key]
  }
  return to
}

export function indexOf (array: unknown[], key: unknown[]) {
  return array.indexOf(key)
}

export function currentTime () {
  return new Date().getTime()
}
