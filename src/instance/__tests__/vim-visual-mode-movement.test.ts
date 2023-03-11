import { describe, expect, it } from 'vitest'
import { VimMode } from '../vim/init'
import { setup } from './utils'

describe('Vim VISUAL Mode Movement', () => {
  describe('[EDIT] switchModeTo(VISUAL)', () => {
    it('should select the correct character when switch to visual mode - cursor at beginning of text', () => {
      /**
        |0123456789
        a-b+c,d.e/
        f{g}h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup()
      vim.switchModeTo(VimMode.VISUAL)
      const text = getSelectedText()
      expect(text).to.equal('0')
    })

    it('should select the correct character when switch to visual mode - cursor at beginning of line', () => {
      /**
        0123456789
        |a-b+c,d.e/
        f{g}h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 11,
        selectionEnd: 11,
      })
      vim.switchModeTo(VimMode.VISUAL)
      const text = getSelectedText()
      expect(text).to.equal('a')
    })

    it('should select the correct character when switch to visual mode - cursor at middle of line', () => {
      /**
        0123456789
        |a-b+c,d.e/
        f{g}|h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 26,
        selectionEnd: 26,
      })
      vim.switchModeTo(VimMode.VISUAL)
      const text = getSelectedText()
      expect(text).to.equal('}')
    })
  })

  describe('[GENERAL] switchModeTo(VISUAL)', () => {
    it('should select the correct character when switch to visual mode - cursor at beginning of text', () => {
      /**
        |0123456789
        a-b+c,d.e/
        f{g}h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({ switchModeTo: VimMode.GENERAL })
      vim.switchModeTo(VimMode.VISUAL)
      const text = getSelectedText()
      expect(text).to.equal('0')
    })

    it('should select the correct character when switch to visual mode - cursor at beginning of line', () => {
      /**
        0123456789
        |a-b+c,d.e/
        f{g}h[i]?j
        k(l)m_n=o*
        p&q^r%s#t@
        u~v!w:x;yz
       */
      const { vim, getSelectedText } = setup({
        selectionStart: 11,
        selectionEnd: 11,
        switchModeTo: VimMode.GENERAL,
      })
      vim.switchModeTo(VimMode.VISUAL)
      const text = getSelectedText()
      expect(text).to.equal('a')
    })

    it('should select the correct character when switch to visual mode - cursor at middle of line', () => {
      /**
        0123456789
        |a-b+c,d.e/
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
      vim.switchModeTo(VimMode.VISUAL)
      const text = getSelectedText()
      expect(text).to.equal('}')
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
        switchModeTo: VimMode.VISUAL,
      })
      vim.selectPrevCharacter()
      expect(getSelectedText()).to.equal('g}')
      vim.selectPrevCharacter()
      expect(getSelectedText()).to.equal('{g}')
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
        switchModeTo: VimMode.VISUAL,
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
        switchModeTo: VimMode.VISUAL,
      })
      vim.selectPrevCharacter()
      expect(getSelectedText()).to.equal('?j')
      vim.selectPrevCharacter()
      expect(getSelectedText()).to.equal(']?j')
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
        switchModeTo: VimMode.VISUAL,
      })
      vim.selectNextCharacter()
      expect(getSelectedText()).to.equal('}h')
      vim.selectNextCharacter()
      expect(getSelectedText()).to.equal('}h[')
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
        switchModeTo: VimMode.VISUAL,
      })
      vim.selectNextCharacter()
      expect(getSelectedText()).to.equal('f{')
      vim.selectNextCharacter()
      expect(getSelectedText()).to.equal('f{g')
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
        switchModeTo: VimMode.VISUAL,
      })
      vim.selectNextCharacter()
      expect(getSelectedText()).to.equal('j\n')
      vim.selectNextCharacter()
      expect(getSelectedText()).to.equal('j\n')
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
        switchModeTo: VimMode.VISUAL,
      })
      vim.selectNextLine()
      expect(getSelectedText()).to.equal('}h[i]?j\nk(l)')
      vim.selectNextLine()
      expect(getSelectedText()).to.equal('}h[i]?j\nk(l)m_n=o*\np&q^')
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
        switchModeTo: VimMode.VISUAL,
      })
      vim.selectNextLine()
      expect(getSelectedText()).to.equal('f{g}h[i]?j\nk')
      vim.selectNextLine()
      expect(getSelectedText()).to.equal('f{g}h[i]?j\nk(l)m_n=o*\np')
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
        switchModeTo: VimMode.VISUAL,
      })
      vim.selectNextLine()
      expect(getSelectedText()).to.equal('j\nk(l)m_n=o*')
      vim.selectNextLine()
      expect(getSelectedText()).to.equal('j\nk(l)m_n=o*\np&q^r%s#t@')
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
        switchModeTo: VimMode.VISUAL,
      })
      vim.selectPrevLine()
      expect(getSelectedText()).to.equal('+c,d.e/\nf{g}')
      vim.selectPrevLine()
      expect(getSelectedText()).to.equal('3456789\na-b+c,d.e/\nf{g}')
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
        switchModeTo: VimMode.VISUAL,
      })
      vim.selectPrevLine()
      expect(getSelectedText()).to.equal('a-b+c,d.e/\nf')
      vim.selectPrevLine()
      expect(getSelectedText()).to.equal('0123456789\na-b+c,d.e/\nf')
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
        switchModeTo: VimMode.VISUAL,
      })
      vim.selectPrevLine()
      expect(getSelectedText()).to.equal('/\nf{g}h[i]?j')
      vim.selectPrevLine()
      expect(getSelectedText()).to.equal('9\na-b+c,d.e/\nf{g}h[i]?j')
    })
  })
})
