/**
 * quick testing section
 */

import { join, resolve } from 'path'
import { TinyServerHttp, bodyParser } from './'
import { Router } from './router'

const postRouterI = new Router()
const routeI = postRouterI.route

const postRouterII = new Router()
const routeII = postRouterII.route

routeII.get('/gi', () => {
  return 'routeII gi'
})
routeII.get('/', () => {
  return 'routeII'
})

routeI.get('/get', _ => {
  return 'hello from posts'
})
routeI.child('/child', postRouterII)

const main = async () => {
  const server = new TinyServerHttp()
  const route = server.route

  route.get('/', ctx => {
    return 'hello'
  })

  route.child('/posts', postRouterI)

  await server.listen(8443)
  console.log('HTTP: http://localhost:8080/')
  console.log('HTTPS: https://localhost:8080/')

  // const response = await nodeFetch('https://localhost:8443/www/script.js', { http2Stream: true, unsafe: true })
  // console.log(response)
}

main()
