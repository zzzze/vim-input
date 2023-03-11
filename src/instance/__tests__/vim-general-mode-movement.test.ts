import { describe, expect, it } from 'vitest'
import { VimMode } from '../vim/init'
import { setup } from './utils'

describe('Vim GENERAL Mode Movement', () => {
  describe('switchModeTo(GENERAL)', () => {
    it('should select the correct character when switch to general mode - cursor at beginning of text', () => {
      /**
        |0123456789
        a-b+c,d.e/
        f{g}h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { getSelectedText } = setup({ switchModeTo: VimMode.GENERAL })
      expect(getSelectedText()).to.equal('0')
    })

    it('should select the correct character when switch to general mode - cursor at beginning of line', () => {
      /**
        0123456789
        |a-b+c,d.e/
        f{g}h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { getSelectedText } = setup({
        selectionStart: 11,
        selectionEnd: 11,
        switchModeTo: VimMode.GENERAL,
      })
      expect(getSelectedText()).to.equal('a')
    })

    it('should select the correct character when switch to general mode - cursor at middle of line', () => {
      /**
        0123456789
        |a-b+c,d.e/
        f{g}|h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { getSelectedText } = setup({
        selectionStart: 26,
        selectionEnd: 26,
        switchModeTo: VimMode.GENERAL,
      })
      expect(getSelectedText()).to.equal('}')
    })
  })

  describe('selectPrevCharacter', () => {
    it('should select previous character correct - cursor at middle of line', () => {
      /**
        0123456789
        a-b+c,d.e/
        f{g}|h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 26,
        selectionEnd: 26,
        switchModeTo: VimMode.GENERAL,
      })
      vim.selectPrevCharacter()
      expect(getSelectedText()).to.equal('g')
      vim.selectPrevCharacter()
      expect(getSelectedText()).to.equal('{')
    })

    it('should select previous character correctly - cursor at start of line', () => {
      /**
        0123456789
        a-b+c,d.e/
        |f{g}h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 22,
        selectionEnd: 22,
        switchModeTo: VimMode.GENERAL,
      })
      vim.selectPrevCharacter()
      expect(getSelectedText()).to.equal('f')
      vim.selectPrevCharacter()
      expect(getSelectedText()).to.equal('f')
    })

    it('should select previous character correctly - cursor at end of line', () => {
      /**
        0123456789
        a-b+c,d.e/
        f{g}h[i]?j|
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 32,
        selectionEnd: 32,
        switchModeTo: VimMode.GENERAL,
      })
      vim.selectPrevCharacter()
      expect(getSelectedText()).to.equal('?')
      vim.selectPrevCharacter()
      expect(getSelectedText()).to.equal(']')
    })

    it('should select previous character correctly', () => {
      /**
        01|23456789
        a-b+c,d.e/
        f{g}h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 2,
        selectionEnd: 2,
        switchModeTo: VimMode.GENERAL,
      })
      expect(getSelectedText()).to.equal('1')
      vim.selectPrevCharacter()
      expect(getSelectedText()).to.equal('0')
    })
  })

  describe('selectNextCharacter', () => {
    it('should select next character correctly - cursor at middle of line', () => {
      /**
        0123456789
        a-b+c,d.e/
        f{g}|h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 26,
        selectionEnd: 26,
        switchModeTo: VimMode.GENERAL,
      })
      vim.selectNextCharacter()
      expect(getSelectedText()).to.equal('h')
      vim.selectNextCharacter()
      expect(getSelectedText()).to.equal('[')
    })

    it('should select next character correctly - cursor at start of line', () => {
      /**
        0123456789
        a-b+c,d.e/
        |f{g}h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 22,
        selectionEnd: 22,
        switchModeTo: VimMode.GENERAL,
      })
      vim.selectNextCharacter()
      expect(getSelectedText()).to.equal('{')
      vim.selectNextCharacter()
      expect(getSelectedText()).to.equal('g')
    })

    it('should select next character correctly - cursor at end of line', () => {
      /**
        0123456789
        a-b+c,d.e/
        f{g}h[i]?j|
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 32,
        selectionEnd: 32,
        switchModeTo: VimMode.GENERAL,
      })
      vim.selectNextCharacter()
      expect(getSelectedText()).to.equal('j')
      vim.selectNextCharacter()
      expect(getSelectedText()).to.equal('j')
    })
  })

  describe('selectNextLine', () => {
    it('should select next line correctly - cursor at middle of line', () => {
      /**
        0123456789
        a-b+c,d.e/
        f{g}|h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 26,
        selectionEnd: 26,
        switchModeTo: VimMode.GENERAL,
      })
      vim.selectNextLine()
      expect(getSelectedText()).to.equal(')')
      vim.selectNextLine()
      expect(getSelectedText()).to.equal('^')
    })

    it('should select next line correctly - cursor at start of line', () => {
      /**
        0123456789
        a-b+c,d.e/
        |f{g}h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 22,
        selectionEnd: 22,
        switchModeTo: VimMode.GENERAL,
      })
      vim.selectNextLine()
      expect(getSelectedText()).to.equal('k')
      vim.selectNextLine()
      expect(getSelectedText()).to.equal('p')
    })

    it('should select next line correctly - cursor at end of line', () => {
      /**
        0123456789
        a-b+c,d.e/
        f{g}h[i]?j|
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 32,
        selectionEnd: 32,
        switchModeTo: VimMode.GENERAL,
      })
      vim.selectNextLine()
      expect(getSelectedText()).to.equal('*')
      vim.selectNextLine()
      expect(getSelectedText()).to.equal('@')
    })
  })

  describe('selectPrevLine', () => {
    it('should select previous line correctly - cursor at middle of line', () => {
      /**
        0123456789
        a-b+c,d.e/
        f{g}|h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 26,
        selectionEnd: 26,
        switchModeTo: VimMode.GENERAL,
      })
      vim.selectPrevLine()
      expect(getSelectedText()).to.equal('+')
      vim.selectPrevLine()
      expect(getSelectedText()).to.equal('3')
    })

    it('should select previous line correctly - cursor at start of line', () => {
      /**
        0123456789
        a-b+c,d.e/
        |f{g}h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 22,
        selectionEnd: 22,
        switchModeTo: VimMode.GENERAL,
      })
      vim.selectPrevLine()
      expect(getSelectedText()).to.equal('a')
      vim.selectPrevLine()
      expect(getSelectedText()).to.equal('0')
    })

    it('should select previous line correctly - cursor at end of line', () => {
      /**
        0123456789
        a-b+c,d.e/
        f{g}h[i]?j|
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 32,
        selectionEnd: 32,
        switchModeTo: VimMode.GENERAL,
      })
      vim.selectPrevLine()
      expect(getSelectedText()).to.equal('/')
      vim.selectPrevLine()
      expect(getSelectedText()).to.equal('9')
    })

    it('should record "offsetOfLineStart" - cursor at end of line', () => {
      /**
        0123456789
        a-b+c,d.e/
        f{g}h[i]?j|
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 32,
        selectionEnd: 32,
        switchModeTo: VimMode.GENERAL,
      })
      vim.moveToCurrentLineHead()
      expect(getSelectedText()).to.equal('f')
      vim.selectPrevLine()
      expect(getSelectedText()).to.equal('a')
      vim.selectNextLine()
      vim.selectNextLine()
      expect(getSelectedText()).to.equal('k')
    })
  })
})
