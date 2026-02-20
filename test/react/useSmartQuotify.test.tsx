import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSmartQuotify } from '../../src/react/useSmartQuotify'

describe('useSmartQuotify', () => {
  it('converts initial value', () => {
    const { result } = renderHook(() => useSmartQuotify('"hello"'))
    expect(result.current.value).toBe('\u201Chello\u201D')
  })

  it('converts on change', () => {
    const { result } = renderHook(() => useSmartQuotify(''))

    act(() => {
      const fakeEvent = {
        target: { value: '"world"' },
      } as React.ChangeEvent<HTMLInputElement>
      result.current.onChange(fakeEvent)
    })

    expect(result.current.value).toBe('\u201Cworld\u201D')
  })

  it('handles contractions', () => {
    const { result } = renderHook(() => useSmartQuotify("don't"))
    expect(result.current.value).toBe('don\u2019t')
  })

  it('provides a ref callback', () => {
    const { result } = renderHook(() => useSmartQuotify(''))
    expect(typeof result.current.ref).toBe('function')
  })

  it('starts with empty string by default', () => {
    const { result } = renderHook(() => useSmartQuotify())
    expect(result.current.value).toBe('')
  })
})
