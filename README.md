# TinyServer-HTTP2

`tiny-http2-server`

A tiny (dependency less) wrapper around Node's http/http2.

## Getting Started

Create a simple http, https or http2 server.  
_http2 is always over https!_

```ts
import { TinyServerHttp, TinyServerHttps, TinyServerHttp2 } from 'tiny-server'

const server = new TinyServerHttp2() // or TinyServerHttp(), or TinyServerHttps()
const route = server.route

// classic
route.use(logger())

// minimal
route.logger()

// classic
route.get('/hello', ({ req, res }) => {
  return res.send.text('hello')
})

// minimal
route.get('/hello', _ => 'hello')

await server.listen(8443)
console.log('Server: https://localhost:8443/')
```

## Middleware

There are some fancy middleware includes.  
See: [./src/middleware](https://github.com/yandeu/tiny-http2-server/tree/main/src/middleware)

## Create a simple ssl certificate

```bash
# create certs
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 3560 -subj '/CN=localhost' \
 -keyout cert/localhost-privkey.pem -out cert/localhost-cert.pem
```

## Express Compatibility

Works with:

- [cors](https://www.npmjs.com/package/cors)
