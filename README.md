# smartquotify

Convert straight quotes to smart/curly quotes. Zero dependencies. TypeScript-first. Built for legal text, works everywhere.

Lawyers hate straight quotes, but LLMs and most legal tech output them everywhere. **smartquotify** fixes both display and input.

## Install

```bash
npm install smartquotify
```

## What It Converts

| Input | Output | Rule |
|-------|--------|------|
| `"hello"` | \u201Chello\u201D | Double quotes |
| `'world'` | \u2018world\u2019 | Single quotes |
| `don't` | don\u2019t | Apostrophes |
| `'90s` | \u201990s | Abbreviated years |
| `the '604 patent` | the \u2019604 patent | Patent shorthand |
| `6'5"` | 6\u20325\u2033 | Prime marks |
| `O'Brien` | O\u2019Brien | Names |
| `(the "Seller")` | (the \u201CSeller\u201D) | Contract terms |

## Usage

### Core (any JS/TS)

```ts
import { smartquotify } from 'smartquotify'

smartquotify('"Don\'t stop"')
// \u2192 \u201CDon\u2019t stop\u201D

smartquotify('the \'604 patent')
// \u2192 the \u2019604 patent

smartquotify('6\'2"')
// \u2192 6\u20322\u2033
```

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

- **Patent shorthand**: `the '604 patent` \u2192 apostrophe, not opening quote
- **Contract defined terms**: `(the "Seller")` \u2192 correct open/close after parens
- **Em dash context**: `the court\u2014"in its discretion"\u2014ruled` \u2192 correct open/close
- **Legal ellipses**: `"The court held . . . that"` \u2192 quotes preserved across spaced periods
- **Bracketed edits**: `"[T]he defendant argued"` \u2192 opening quote before bracket
- **Measurements in evidence**: `the 5'10" suspect` \u2192 prime marks, not curly quotes

## API

### `smartquotify(text, options?)`

Pure string transform. Returns a new string with smart quotes.

**Options:**
- `primes` (boolean, default `true`) \u2014 Convert measurement marks to prime characters

### `smartquotifyInput(element, options?)`

Attaches live smart-quote conversion to an input element. Returns a cleanup function.

Works with `<input>`, `<textarea>`, and `contenteditable` elements.

### `useSmartQuotify(initialValue?, options?)` (React)

Hook for controlled inputs. Returns `{ value, onChange, ref }`.

### `<SmartText>` (React)

Memoized display component. Props:
- `as` \u2014 HTML element to render (default: `'span'`)
- `options` \u2014 smartquotify options
- `children` \u2014 string to convert

## License

MIT
