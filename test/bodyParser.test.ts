import { TinyServerHttp, bodyParser } from '../lib/index.js'
import { nodeFetch } from '../scripts/nodeFetch.js'
import { describe, expect, test, errors, beforeAll, afterAll } from './test.mjs'

let server, port

beforeAll(async () => {
  server = new TinyServerHttp()
  server.route.use(bodyParser.json())
  server.route.post('/json', ctx => ctx.req.body)
  port = await server.listen()
})

describe('BodyParser JSON', async () => {
  const { body, headers } = await nodeFetch(`http://localhost:${port}/json`, {
    method: 'POST',
    body: JSON.stringify({ msg: 'json body' }),
    headers: { 'content-type': 'application/json' }
  })

  expect(body.msg).toBe('json body')
  expect(headers['content-type']).toBe('application/json')
})

describe('BodyParser JSON (is not json)', async () => {
  const { body, headers } = await nodeFetch(`http://localhost:${port}/json`, {
    method: 'POST',
    body: 'some simple text',
    headers: { 'content-type': 'application/json' }
  })

  expect(body).toBe('some simple text')
  expect(headers['content-type']).toBe('text/plain')
})

describe('BodyParser JSON (not sending json)', async () => {
  const { body, headers } = await nodeFetch(`http://localhost:${port}/json`, {
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
