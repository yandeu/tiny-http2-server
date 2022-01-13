import { IncomingMessage } from 'http'
import { Http2ServerRequest } from 'http2'
import { Route } from './types'

class RequestBase {
  params: { [param: string]: string } = {}
  route!: Omit<Route, 'handler'>
  url!: string
  body!: any
}
class Request extends IncomingMessage implements RequestBase {
  params!: { [param: string]: string }
  route!: Omit<Route, 'handler'>
  url!: string
  body: any

  // TODO(yandeu): untrust proxy by default
  get ip() {
    return (this.headers['x-forwarded-for'] as string)?.split(',').shift() || this.socket?.remoteAddress || ''
  }
}
class RequestHttp2 extends Http2ServerRequest implements RequestBase {
  params!: { [param: string]: string }
  route!: Omit<Route, 'handler'>
  url!: string
  body: any

  // TODO(yandeu): untrust proxy by default
  get ip() {
    return (this.headers['x-forwarded-for'] as string)?.split(',').shift() || this.socket?.remoteAddress || ''
  }
}

interface Request extends RequestBase {}
interface RequestHttp2 extends RequestBase {}

applyMixins(Request, [RequestBase])
applyMixins(RequestHttp2, [RequestBase])

export { Request }
export { RequestHttp2 }

// This can live anywhere in your codebase:
function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null)
      )
    })
  })
}
