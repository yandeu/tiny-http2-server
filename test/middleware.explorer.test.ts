import { TinyServerHttp } from '../lib/index.js'
import { nodeFetch } from '../scripts/nodeFetch.js'
import { describe, expect, test, errors } from './test.mjs'

describe('Explorer', async () => {
  const server = new TinyServerHttp()
  server.route.explorer()

  const port = await server.listen()
  const { body, headers } = await nodeFetch(`http://localhost:${port}/`)

  expect(headers['content-type']).toBe('text/html')

  expect(/^<!DOCTYPE html>/gm.test(body)).toBe(true)
  expect((body as string).includes('<a href="/README.md">README.md</a>')).toBe(true)
  expect(/<\/body>$/gm.test(body)).toBe(true)

  await server.close()
})

describe('Explorer (is file)', async () => {
  const server = new TinyServerHttp()
  server.route.explorer()

  const port = await server.listen()
  const { body, headers } = await nodeFetch(`http://localhost:${port}/LICENSE`)

  expect(headers['content-type']).toBe('text/plain')

  expect(/^BSD 3-Clause License/gm.test(body)).toBe(true)
  expect((body as string).includes('All rights reserved.')).toBe(true)

  await server.close()
})

describe('Explorer (404 | not found)', async () => {
  const server = new TinyServerHttp()
  server.route.explorer()

  const port = await server.listen()
  const { body, headers } = await nodeFetch(`http://localhost:${port}/somewhere`)

  expect(headers['content-type']).toBe('text/html')

  expect(/^<!DOCTYPE html>/gm.test(body)).toBe(true)
  expect((body as string).includes('404')).toBe(true)
  expect((body as string).includes('not found')).toBe(true)
  expect(/<\/body>$/gm.test(body)).toBe(true)

  await server.close()
})

test().then(() => {
  process.exit(errors.length === 0 ? 0 : 1)
})
