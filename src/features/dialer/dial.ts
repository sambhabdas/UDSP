/**
 * Ask the Dialer to call somebody.
 *
 * The widget lives in the shell, not in any page, so pages reach it through a
 * window event rather than a shared hook. That keeps the call button on a page
 * from having to know where the dialer is mounted, and keeps the dialer's state
 * out of every page's tree.
 */
export interface DialOptions {
  /** Shown under the name — usually the person's local time. */
  local?: string
  /** The route they are on, if they are out. */
  route?: string
}

export function dial(name: string, number: string, opts: DialOptions = {}) {
  window.dispatchEvent(new CustomEvent('udsp-dial', { detail: { name, number, ...opts } }))
}
