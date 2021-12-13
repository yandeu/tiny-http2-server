import { TinyServerHttp } from '../lib/index.js'
import { nodeFetch } from '../scripts/nodeFetch.js'
import { describe, expect, test, errors } from './test.mjs'

// mock console.log
const logs: string[] = []
var log = console.log
console.log = (...msg: string[]) => {
  logs.push(msg.join(' '))
  log(...msg)
}

describe('Logger', async () => {
  const server = new TinyServerHttp()
  server.route.logger()

  const port = await server.listen()
  await nodeFetch(`http://localhost:${port}/`)
  await nodeFetch(`http://localhost:${port}/api/posts/558`)

  expect(logs.includes('GET /')).toBe(true)
  expect(logs.includes('GET /api/posts/558')).toBe(true)

  await server.close()
})

test().then(() => {
  process.exit(errors.length === 0 ? 0 : 1)
})
