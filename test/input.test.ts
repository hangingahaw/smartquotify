import { describe, it, expect, vi, beforeEach } from 'vitest'
import { smartquotifyInput } from '../src/input'

describe('smartquotifyInput', () => {
  describe('textarea element', () => {
    let textarea: HTMLTextAreaElement

    beforeEach(() => {
      textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
    })

    it('converts quotes on input event', () => {
      const cleanup = smartquotifyInput(textarea)

      textarea.value = '"hello"'
      textarea.dispatchEvent(new Event('input'))

      expect(textarea.value).toBe('\u201Chello\u201D')
      cleanup()
    })

    it('cleanup removes the listener', () => {
      const cleanup = smartquotifyInput(textarea)
      cleanup()

      textarea.value = '"hello"'
      textarea.dispatchEvent(new Event('input'))

      // Value should remain unchanged (straight quotes)
      expect(textarea.value).toBe('"hello"')
    })

    it('handles contractions', () => {
      const cleanup = smartquotifyInput(textarea)

      textarea.value = "don't"
      textarea.dispatchEvent(new Event('input'))

      expect(textarea.value).toBe('don\u2019t')
      cleanup()
    })
  })

  describe('input element', () => {
    it('works with input[type=text]', () => {
      const input = document.createElement('input')
      input.type = 'text'
      document.body.appendChild(input)

      const cleanup = smartquotifyInput(input)

      input.value = '"test"'
      input.dispatchEvent(new Event('input'))

      expect(input.value).toBe('\u201Ctest\u201D')
      cleanup()
    })
  })

  describe('error handling', () => {
    it('throws for non-editable elements', () => {
      const div = document.createElement('div')
      expect(() => smartquotifyInput(div)).toThrow()
    })
  })
})
