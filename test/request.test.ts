import { TinyServerHttp, TinyServerHttps, TinyServerHttp2 } from '../lib/index.js'
import { nodeFetch } from '../scripts/nodeFetch.js'
import { describe, expect, test, errors } from './test.mjs'

describe('Http', async () => {
  const server = new TinyServerHttp()
  const route = server.route

  route.get('/', ({ req, res }) => {
    res.send.text('Hello (via GET)')
  })

  route.post('/', ({ req, res }) => {
    res.send.text('Hello (via POST)')
  })

  const port = await server.listen()

  const GET = async () => {
    const { body } = await nodeFetch(`http://localhost:${port}/`, { method: 'GET' })
    expect(body).toBe('Hello (via GET)')
  }

  const POST = async () => {
    const { body } = await nodeFetch(`http://localhost:${port}/`, { method: 'POST' })
    expect(body).toBe('Hello (via POST)')
  }

  await GET()
  await POST()

  await server.close()
})

test().then(() => {
  process.exit(errors.length === 0 ? 0 : 1)
})
