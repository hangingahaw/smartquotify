import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { SmartText } from '../../src/react/SmartText'

describe('SmartText', () => {
  it('renders with smart quotes', () => {
    const html = renderToString(<SmartText>{'"hello"'}</SmartText>)
    expect(html).toContain('\u201Chello\u201D')
  })

  it('renders as span by default', () => {
    const html = renderToString(<SmartText>{'"test"'}</SmartText>)
    expect(html).toMatch(/^<span.*>/)
  })

  it('renders with custom element via as prop', () => {
    const html = renderToString(<SmartText as="p">{'"test"'}</SmartText>)
    expect(html).toMatch(/^<p.*>/)
  })

  it('handles contractions', () => {
    const html = renderToString(<SmartText>{"don't stop"}</SmartText>)
    expect(html).toContain('don\u2019t')
  })

  it('passes through additional props', () => {
    const html = renderToString(
      <SmartText className="legal-text">{'"test"'}</SmartText>,
    )
    expect(html).toContain('legal-text')
  })
})
