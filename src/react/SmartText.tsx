import { memo, type ElementType, type ComponentPropsWithoutRef } from 'react'
import { smartquotify } from '../core.js'
import type { SmartQuotifyOptions } from '../types.js'

type SmartTextProps<T extends ElementType = 'span'> = {
  /** The HTML element to render. Default: 'span' */
  as?: T
  /** smartquotify options */
  options?: SmartQuotifyOptions
  /** Text content (children) to convert */
  children: string
} & Omit<ComponentPropsWithoutRef<T>, 'children'>

/**
 * Memoized component that renders text with smart quotes.
 * Useful for displaying LLM output or any dynamic text.
 *
 * @example
 * <SmartText>{aiResponse}</SmartText>
 * <SmartText as="p">{paragraph}</SmartText>
 */
function SmartTextInner<T extends ElementType = 'span'>({
  as,
  options,
  children,
  ...rest
}: SmartTextProps<T>) {
  const Component = as ?? 'span'
  return <Component {...rest}>{smartquotify(children, options)}</Component>
}

export const SmartText = memo(SmartTextInner) as typeof SmartTextInner
