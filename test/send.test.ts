import { TinyServerHttp } from '../lib/index.js'
import { nodeFetch } from '../scripts/nodeFetch.js'
import { describe, expect, test, errors, beforeAll, afterAll } from './test.mjs'

const server = new TinyServerHttp()

server.route.get('/file', ({ req, res }) => {
  return res.send.file('test/data/text.txt')
})
server.route.get('/html', ({ req, res }) => {
  res.send.html('<h1>Hello</h1>', true)
})
server.route.get('/json', ({ req, res }) => {
  res.send.json({ msg: 'hello' })
})
server.route.get('/text', ({ req, res }) => {
  res.send.text('Simple Text')
})
server.route.get('/status/200', ({ req, res }) => {
  res.send.status(200)
})
server.route.get('/status/404', ({ req, res }) => {
  res.send.status(404)
})
server.route.get('/status/444', ({ req, res }) => {
  res.send.status(444)
})
server.route.get('/status/499', ({ req, res }) => {
  res.send.status(499)
})

let toUrl: (path: string) => string

beforeAll(async () => {
  const port = await server.randomPort()
  await server.listen(port)
  toUrl = (path: string) => {
    return `http://localhost:${port}${path}`
  }
})

describe('File', async () => {
  const { body } = await nodeFetch(toUrl('/file'))
  expect(body).toBe('TextFile')
})

describe('Html', async () => {
  const { body } = await nodeFetch(toUrl('/html'))
  expect('Html should in include DOCTYPE', /^<!DOCTYPE html>/gm.test(body)).toBe(true)
  expect('<h1>Hello</h1> should be inside Html file', /<h1>Hello<\/h1>/gm.test(body)).toBe(true)
  expect('Last part of HTML should be closing </body>', /<\/body>$/gm.test(body)).toBe(true)
})
describe('Json', async () => {
  const { body } = await nodeFetch(toUrl('/json'))
  expect(body.msg).toBe('hello')
})
describe('Text', async () => {
  const { body } = await nodeFetch(toUrl('/text'))
  expect(body).toBe('Simple Text')
})
describe('Status 200', async () => {
  const { body, status } = await nodeFetch(toUrl('/status/200'))
  expect(status).toBe(200)
  expect(body).toBe('OK')
})
describe('Status 404', async () => {
  const { body, status } = await nodeFetch(toUrl('/status/404'))
  expect(status).toBe(404)
  expect(body).toBe('Not Found')
})
describe('Status 444', async () => {
  const { body, status } = await nodeFetch(toUrl('/status/444'))
  expect(status).toBe(444)
  expect(body).toBe('')
})
describe('Status 499', async () => {
  const { body, status } = await nodeFetch(toUrl('/status/499'))
  expect(status).toBe(499)
  expect(body).toBe('499')
})

afterAll(async () => {
  await server.close()
})

test().then(() => {
  process.exit(errors.length === 0 ? 0 : 1)
})
