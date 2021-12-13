import { mime } from '../../lib/helpers.js'
import { describe, expect, test, errors } from '../test.mjs'

describe('mime()', async () => {
  expect(mime('logs.txt')).toBe('text/plain')
  expect(mime('styles.css')).toBe('text/css')
  expect(mime('bundle.js')).toBe('application/javascript')
  expect(mime('bundle.min.js')).toBe('application/javascript')
  expect(mime('config.json')).toBe('application/json')
  expect(mime('index.html')).toBe('text/html')
  expect(mime('logo.jpg')).toBe('image/jpeg')
  expect(mime('logo.jpeg')).toBe('image/jpeg')
  expect(mime('logo.png')).toBe('image/png')
  expect(mime('vector.svg')).toBe('image/svg+xml')
  expect(mime('vector.svgz')).toBe('image/svg+xml')
  expect(mime('LICENSE')).toBe('text/plain')
})

test().then(() => {
  process.exit(errors.length === 0 ? 0 : 1)
})
