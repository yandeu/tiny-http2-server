import { escapeHtml } from '../../lib/helpers.js'
import { describe, expect, test, errors } from '../test.mjs'

describe('escapeHtml()', async () => {
  expect(escapeHtml('<div>Hello</div>')).toBe('&lt;div&gt;Hello&lt;/div&gt;')
})

describe('escapeHtml() (empty)', async () => {
  // @ts-expect-error: escapeHtml needs one string
  expect(escapeHtml()).toBe(undefined)
})

test().then(() => {
  process.exit(errors.length === 0 ? 0 : 1)
})
