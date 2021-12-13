import { TinyServerHttp2 } from '../lib/index.js'
import { nodeFetch } from '../scripts/nodeFetch.js'
import { describe, expect, test, errors } from './test.mjs'

describe('Response to Http2 Request', async () => {
  const server = new TinyServerHttp2()
  const route = server.route

  route.get('/text', _ => {
    return 'Hello'
  })

  route.get('/json', _ => {
    return { msg: 'Hello' }
  })

  const port = await server.listen()

  const { body: body_text } = await nodeFetch(`https://localhost:${port}/text`, { http2Stream: true, unsafe: true })
  expect(body_text).toBe('Hello')

  const { body: body_json } = await nodeFetch(`https://localhost:${port}/json`, { http2Stream: true, unsafe: true })
  expect(body_json.msg).toBe('Hello')

  await server.close()
})

test().then(() => {
  process.exit(errors.length === 0 ? 0 : 1)
})
