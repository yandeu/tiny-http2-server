/**
 * quick testing section
 */

import { createServer } from 'http'
import { join, resolve } from 'path'

import { TinyServerHttp2, serveExplorer, bodyParser, logger } from '../'
import { nodeFetch } from '../../scripts/nodeFetch'

const httpsRedirect = () => {
  const httpsRedirect = createServer((req, res) => {
    const url = new URL(req.url as string, `http://${req.headers.host}`)

    url.port = '8443'
    url.protocol = 'https:'

    res.statusCode = 302
    res.setHeader('Location', url.href)

    res.end()
  })
  httpsRedirect.listen(8080, () => {
    console.log('HTTP:  http://localhost:8080/')
  })
}

const main = async () => {
  httpsRedirect()

  const server = new TinyServerHttp2()
  const route = server.route
  route.logger()
  route.static('/static', join(resolve(), 'www'))
  route.get('/static/bla', _ => {
    return 'bla'
  })
  route.get('/hello', ctx => {
    return ctx.res.send.text('hello')
  })
  route.get('/user/:user/:id/hello', async ({ req, res }) => {
    // console.log('Params:', req.url, req.params)
    return `user ${req.params.user} #${req.params.id}`
  })
  route.get('/hello2', ctx => {
    return ctx.res.send.text('hello2')
  })
  route.get('/hello3', _ => {
    return { msg: 'hello3' }
  })
  route.use(bodyParser.json())
  route.post('/', ctx => {
    return ctx.res.send.text(`hello from POST, ${ctx.req.body.isJSON}`)
  })
  route.explorer()
  await server.listen(8443)
  console.log('HTTPS: https://localhost:8443/')

  // const response = await nodeFetch('https://localhost:8443/www/script.js', { http2Stream: true, unsafe: true })
  // console.log(response)
}

main()
