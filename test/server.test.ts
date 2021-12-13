import { TinyServerHttp, TinyServerHttps, TinyServerHttp2 } from '../lib/index.js'
import { nodeFetch } from '../scripts/nodeFetch.js'
import { describe, expect, test, errors } from './test.mjs'

describe('Http', async () => {
  const server = new TinyServerHttp()
  server.route.get('/', ({ req, res }) => {
    res.send.text('Hello')
  })

  const port = await server.listen()
  const { body } = await nodeFetch(`http://localhost:${port}/`)

  expect(body).toBe('Hello')
  await server.close()
})

describe('Https', async () => {
  const server = new TinyServerHttps()
  server.route.get('/', ({ req, res }) => {
    res.send.text('Hello')
  })

  const port = await server.listen()
  const { body } = await nodeFetch(`https://localhost:${port}/`, { unsafe: true })

  expect(body).toBe('Hello')
  await server.close()
})

describe('Http2', async () => {
  const server = new TinyServerHttp2()
  server.route.get('/', ({ req, res }) => {
    res.send.text('Hello')
  })

  const port = await server.listen()
  const { body } = await nodeFetch(`https://localhost:${port}/`, { unsafe: true })

  expect(body).toBe('Hello')
  await server.close()
})

test().then(() => {
  process.exit(errors.length === 0 ? 0 : 1)
})
