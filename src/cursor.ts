/**
 * Cursor position preservation for input/textarea elements.
 *
 * When the value changes length (e.g. straight quote → prime collapses
 * two chars into one), the cursor position needs adjusting.
 */

export function saveCursor(el: HTMLInputElement | HTMLTextAreaElement): number {
  return el.selectionStart ?? el.value.length
}

export function restoreCursor(
  el: HTMLInputElement | HTMLTextAreaElement,
  position: number,
  oldLength: number,
  newLength: number,
): void {
  // Adjust position proportionally if length changed before cursor
  const delta = newLength - oldLength
  const adjusted = Math.max(0, Math.min(position + delta, newLength))
  el.setSelectionRange(adjusted, adjusted)
}
