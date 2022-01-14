import { TinyServerHttp, Router } from '../lib/index.js'
import { nodeFetch } from '../scripts/nodeFetch.js'
import { describe, expect, test, errors } from './test.mjs'

describe('Nested Router', async () => {
  const server = new TinyServerHttp()
  const route = server.route

  const routerI = new Router()
  const routeI = routerI.route

  const routerII = new Router()
  const routeII = routerII.route

  routeII.get('/', _ => 'routeII root')
  routeII.get('/hey', _ => 'routeII hey')

  routeI.get('/', _ => 'routeI root')
  routeI.get('/hey', _ => 'routeI hey')
  routeI.child('/child', routerII)

  route.get('/', _ => 'root')
  route.get('/hey', _ => 'hey')
  route.child('/child', routerI)

  const port = await server.listen()

  const GET = async (path = '/') => {
    const { body } = await nodeFetch(`http://localhost:${port}${path}`, { method: 'GET' })
    return body
  }

  expect(await GET('/')).toBe('root')
  expect(await GET('/hey')).toBe('hey')
  expect(await GET('/child')).toBe('routeI root')
  expect(await GET('/child/hey')).toBe('routeI hey')
  expect(await GET('/child/child')).toBe('routeII root')
  expect(await GET('/child/child/hey')).toBe('routeII hey')

  await server.close()
})

test().then(() => {
  process.exit(errors.length === 0 ? 0 : 1)
})
