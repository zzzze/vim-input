import { describe, expect, test } from 'vitest'
import jsdom from 'jsdom'

describe('vim', () => {
  test('app', async () => {
    const dom = await jsdom.JSDOM.fromFile('tests/index.html', {
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
    const element = dom.window.document.getElementById('editor')
    expect(element).not.toBeNull()
    if (!(element instanceof dom.window.HTMLTextAreaElement)) {
      throw Error('element should be type of HTMLTextAreaElement')
    }
    element.focus()
    element.dispatchEvent(new dom.window.KeyboardEvent('keydown', {
      key: 'Escape',
    }))
    element.dispatchEvent(new dom.window.KeyboardEvent('keydown', {
      key: 'd',
    }))
    element.dispatchEvent(new dom.window.KeyboardEvent('keydown', {
      key: 'd',
    }))
    expect(element.value).toBe(`
I hope this letter finds you well. It's been a while since we've spoken, and I wanted to take this opportunity to catch up with you.

First of all, I wanted to congratulate you on your recent promotion! It's well-deserved, and I know you've worked hard to get to where you are. I'm really happy for you.

Secondly, I wanted to tell you about some exciting news on my end. I've decided to start my own business! It's been a dream of mine for a long time, and I finally took the leap. It's been a lot of work, but also very rewarding.

Anyway, I'd love to hear what's new with you. Let's catch up soon over a cup of coffee?

Take care,

Jane
`)
  })
})
