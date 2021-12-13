import { TinyServerHttp } from '../lib/index.js'
import { nodeFetch } from '../scripts/nodeFetch.js'
import { describe, expect, test, errors, beforeAll, afterAll } from './test.mjs'

const server = new TinyServerHttp()
const port = server.randomPort()
server.route.get('/file', ({ req, res }) => {
  return res.send.file('test/data/text.txt')
})
server.route.get('/html', ({ req, res }) => {
  res.send.html('<h1>Hello</h1>')
})
server.route.get('/json', ({ req, res }) => {
  res.send.json({ msg: 'hello' })
})
server.route.get('/text', ({ req, res }) => {
  res.send.text('Simple Text')
})

const toUrl = (path: string) => {
  return `http://localhost:${port}${path}`
}

beforeAll(async () => {
  await server.listen(port)
})

describe('File', async () => {
  const { body } = await nodeFetch(toUrl('/file'))
  expect(body).toBe('TextFile')
})

describe('Html', async () => {
  const { body } = await nodeFetch(toUrl('/html'))
  expect(/^<!DOCTYPE html>/gm.test(body)).toBe(true)
  expect(/<h1>Hello<\/h1>/gm.test(body)).toBe(true)
  expect(/<\/body>$/gm.test(body)).toBe(true)
})
describe('Json', async () => {
  const { body } = await nodeFetch(toUrl('/json'))
  expect(body.msg).toBe('hello')
})
describe('Text', async () => {
  const { body } = await nodeFetch(toUrl('/text'))
  expect(body).toBe('Simple Text')
})

afterAll(async () => {
  await server.close()
})

test().then(() => {
  process.exit(errors.length === 0 ? 0 : 1)
})
