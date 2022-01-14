/**
 * quick testing section
 */

import { join, resolve } from 'path'
import { TinyServerHttp, bodyParser } from './'
import { Router } from './router'
import { nodeFetch } from '../scripts/nodeFetch'

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
routeI.get('/', _ => {
  return 'routeI /'
})
routeI.child('/child', postRouterII)
routeI.get('/:id', ctx => {
  return 'post id:' + ctx.req.params.id
})

routeII.get('/get', () => {
  return 'routeII get'
})

const main = async () => {
  const server = new TinyServerHttp()
  const route = server.route

  route.get('/get', ctx => {
    return 'hello'
  })

  route.get('/', ctx => {
    return 'root'
  })

  route.child('/posts', postRouterI)

  route.get('/another', ctx => {
    return 'another'
  })

  await server.listen(8080)
  console.log('HTTP: http://localhost:8080/')
  console.log('HTTPS: https://localhost:8080/')

  // test
  const tests: string[] = []
  const t = async (path: string, shouldBe: string) => {
    const response = await nodeFetch(`http://localhost:8080${path}`, { http2Stream: false, unsafe: false })

    tests.push('> TEST: ' + path + ' ' + (response.body === shouldBe).toString())
  }
  setTimeout(async () => {
    await t('/', 'root')
    await t('/get', 'hello')
    await t('/another', 'another')

    await t('/posts', 'routeI /')
    await t('/posts/get', 'hello from posts')

    await t('/posts/child', 'routeII')
    await t('/posts/child/get', 'routeII get')
    await t('/posts/child/gi', 'routeII gi')

    // // :params
    await t('/posts/1234', 'post id:1234')

    console.log('TEST RESULT:')
    tests.forEach(t => {
      console.log(t)
    })
  }, 200)
}

setTimeout(() => {
  main()
}, 1000)
