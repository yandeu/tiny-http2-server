import { TinyServerHttp } from '../lib/index.js'
import { nodeFetch } from '../scripts/nodeFetch.js'
import { describe, expect, test, errors } from './test.mjs'
import { join, resolve } from 'path'

describe('Static', async () => {
  const server = new TinyServerHttp()
  server.route.static('/static', join(resolve(), 'test/data'))

  const port = await server.listen()
  const { body, headers } = await nodeFetch(`http://localhost:${port}/static/text.txt`)

  expect(body).toBe('TextFile')
  expect(headers['content-type']).toBe('text/plain')
  await server.close()
})

describe('Static (no regex)', async () => {
  const server = new TinyServerHttp()
  server.route.static(/^(static|www)/, join(resolve(), 'test/data'))
  server.route.get('/static/text.txt', _ => 'ok')

  console.log(/^(static|www)/ instanceof RegExp)

  const port = await server.listen()
  const { body, headers } = await nodeFetch(`http://localhost:${port}/static/text.txt`)

  expect(body).toBe('ok')
  expect(headers['content-type']).toBe('text/plain')
  await server.close()
})

test().then(() => {
  process.exit(errors.length === 0 ? 0 : 1)
})
