# smartquotify

[![npm](https://img.shields.io/npm/v/smartquotify)](https://www.npmjs.com/package/smartquotify)
[![license](https://img.shields.io/npm/l/smartquotify)](https://github.com/hangingahaw/smartquotify/blob/main/LICENSE)

Convert straight quotes to smart/curly quotes. Zero dependencies. TypeScript-first. Built for legal text, works everywhere.

Lawyers hate straight quotes, but LLMs and most legal tech output them everywhere. **smartquotify** fixes both display and input.

## Install

```bash
npm install smartquotify
```

## What It Converts

| Input | Output | Rule |
|-------|--------|------|
| `"hello"` | `“hello”` | Double quotes |
| `'world'` | `‘world’` | Single quotes |
| `don't` | `don’t` | Apostrophes |
| `'90s` | `’90s` | Abbreviated years |
| `the '604 patent` | `the ’604 patent` | Patent shorthand |
| `6'5"` | `6′5″` | Prime marks |
| `O'Brien` | `O’Brien` | Names |
| `(the "Seller")` | `(the “Seller”)` | Contract terms |

## Usage

### Core (any JS/TS)

```ts
import { smartquotify } from 'smartquotify'

smartquotify('"Don\'t stop"')
// → “Don’t stop”

smartquotify('the \'604 patent')
// → the ’604 patent

smartquotify('6\'2"')
// → 6′2″
```

### HTML Mode

Protects tag attributes and comments from conversion. All visible text (including inside `<code>` and `<pre>`) gets smart quotes.

```ts
smartquotify('<a href="url">"click"</a>', { html: true })
// → <a href="url">"click"</a>

smartquotify('<em>"The court held . . . that"</em>', { html: true })
// → <em>"The court held . . . that"</em>
```

### Markdown Mode

Skips fenced code blocks, inline code, and link URLs. Link text still gets converted.

```ts
smartquotify('He said "hello" and `"code"` here.', { markdown: true })
// → He said "hello" and `"code"` here.

smartquotify('["click here"](http://example.com)', { markdown: true })
// → ["click here"](http://example.com)
```

Both flags can be combined: `{ html: true, markdown: true }`.

### Input Enhancement (any framework)

Attach to any `<input>`, `<textarea>`, or `contenteditable` element. Users type straight quotes, see smart quotes. No cursor jumping.

```ts
import { smartquotifyInput } from 'smartquotify'

const textarea = document.querySelector('textarea')
const cleanup = smartquotifyInput(textarea)

// Later, detach:
cleanup()
```

### React (`smartquotify/react`)

```tsx
import { useSmartQuotify, SmartText } from 'smartquotify/react'

// Hook for controlled inputs
function ChatInput() {
  const { value, onChange, ref } = useSmartQuotify('')
  return <textarea ref={ref} value={value} onChange={onChange} />
}

// Component for displaying LLM output
function Response({ text }: { text: string }) {
  return <SmartText as="p">{text}</SmartText>
}
```

## Legal-Specific Edge Cases

This library is specifically designed for legal text. It correctly handles patterns that general-purpose smart quote libraries get wrong:

- **Patent shorthand**: `the '604 patent` → `the ’604 patent`
- **Contract defined terms**: `(the "Seller")` → `(the “Seller”)`
- **Em dash context**: `the court—"in its discretion"—ruled` → `the court—“in its discretion”—ruled`
- **Legal ellipses**: `"The court held . . . that"` → `“The court held . . . that”`
- **Bracketed edits**: `"[T]he defendant argued"` → `“[T]he defendant argued”`
- **Measurements in evidence**: `the 5'10" suspect` → `the 5′10″ suspect`

## API

### `smartquotify(text, options?)`

Pure string transform. Returns a new string with smart quotes.

**Options:**
- `primes` (boolean, default `true`) — Convert measurement marks to prime characters
- `html` (boolean, default `false`) — Skip HTML tag syntax and comments; converts all visible text
- `markdown` (boolean, default `false`) — Skip code blocks, inline code, and link URLs; converts link text

### `smartquotifyInput(element, options?)`

Attaches live smart-quote conversion to an input element. Returns a cleanup function.

Works with `<input>`, `<textarea>`, and `contenteditable` elements.

### `useSmartQuotify(initialValue?, options?)` (React)

Hook for controlled inputs. Returns `{ value, onChange, ref }`.

### `<SmartText>` (React)

Memoized display component. Props:
- `as` — HTML element to render (default: `'span'`)
- `options` — smartquotify options
- `children` — string to convert

## License

Apache-2.0
