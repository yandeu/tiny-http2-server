import { TinyServerHttp2, bodyParser } from '../lib/index.js'
import { nodeFetch } from '../scripts/nodeFetch.js'
import { describe, expect, test, errors, beforeAll, afterAll } from './test.mjs'

let server, port

beforeAll(async () => {
  server = new TinyServerHttp2()
  server.route.use(bodyParser.json())
  server.route.post('/json', ctx => ctx.req.body)
  port = await server.listen()
})

describe('BodyParser[http2] JSON', async () => {
  const { body, headers } = await nodeFetch(`https://localhost:${port}/json`, {
    http2Stream: true,
    unsafe: true,
    method: 'POST',
    body: JSON.stringify({ msg: 'json body' }),
    headers: { 'content-type': 'application/json' }
  })

  expect(body.msg).toBe('json body')
  expect(headers['content-type']).toBe('application/json')
})

describe('BodyParser[http2] JSON (is not json)', async () => {
  const { body, headers } = await nodeFetch(`https://localhost:${port}/json`, {
    http2Stream: true,
    unsafe: true,
    method: 'POST',
    body: 'some simple text',
    headers: { 'content-type': 'application/json' }
  })

  expect(body).toBe('some simple text')
  expect(headers['content-type']).toBe('text/plain')
})

describe('BodyParser[http2] JSON (not sending json)', async () => {
  const { body, headers } = await nodeFetch(`https://localhost:${port}/json`, {
    http2Stream: true,
    unsafe: true,
    method: 'POST',
    body: 'some simple text',
    headers: { 'content-type': 'text/plain' }
  })

  expect(body).toBe('some simple text')
  expect(headers['content-type']).toBe('text/plain')
})

afterAll(async () => {
  await server.close()
})

test().then(() => {
  process.exit(errors.length === 0 ? 0 : 1)
})
