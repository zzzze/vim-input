import { expect } from 'vitest'
import jsdom from 'jsdom'

export async function prepare (file: string, id: string = 'content') {
  const dom = await jsdom.JSDOM.fromFile(file, {
    resources: 'usable',
    runScripts: 'dangerously',
  })
  await new Promise((resolve, reject) => {
    dom.window.onerror = event => {
      reject(event)
    }
    dom.window.onload = () => {
      resolve(null)
    }
  })
  const element = dom.window.document.getElementById(id)
  expect(element).not.toBeNull()
  if (!(element instanceof dom.window.HTMLTextAreaElement) && !(element instanceof dom.window.HTMLInputElement)) {
    throw Error('element should be type of HTMLTextAreaElement or HTMLInputElement')
  }
  return { dom, element }
}
