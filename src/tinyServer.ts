import { readFileSync } from 'fs'

import { Server as HttpServer } from 'http'
import { Server as HttpsServer } from 'https'
import { Http2SecureServer as Http2Server } from 'http2'

import { createServer as createHttpServer } from 'http'
import { createServer as createHttpsServer } from 'https'
import { createSecureServer as createHttp2Server } from 'http2'

import { Request, RequestHttp2 } from './request'
import { Response, ResponseHttp2 } from './response'
import { Stream } from './stream'

import { TinyServerBase } from './tinyServer.base'

export class TinyServerHttp extends TinyServerBase<HttpServer, Request, Response> {
  protected createServer() {
    const server = createHttpServer(
      {
        IncomingMessage: Request,
        ServerResponse: Response
      },
      async (_req, _res) => {
        const req = _req as Request
        const res = _res as Response

        // console.log('/* NEW REQUEST */')

        const result = (await this.router.handle(req, res)) as any

        // notfound/error
        if (!res.headersSent) {
          if (result instanceof Error) {
            res.status(500).send.text('500: Error')
          } else {
            res.status(404).send.text('404: Not Found')
          }
        }
      }
    )

    return server
  }
}

export class TinyServerHttps extends TinyServerBase<HttpsServer, Request, Response> {
  protected createServer() {
    const server = createHttpsServer(
      {
        key: readFileSync('cert/localhost-privkey.pem'),
        cert: readFileSync('cert/localhost-cert.pem'),
        IncomingMessage: Request,
        ServerResponse: Response
      },
      async (_req, _res) => {
        const req = _req as Request
        const res = _res as Response

        const result = (await this.router.handle(req, res)) as any

        // notfound/error
        if (!res.headersSent) {
          if (result instanceof Error) {
            res.status(500).send.text('500: Error')
          } else {
            res.status(404).send.text('404: Not Found')
          }
        }
      }
    )

    return server
  }
}

export class TinyServerHttp2 extends TinyServerBase<Http2Server, Request, Response> {
  protected createServer() {
    const server = createHttp2Server(
      {
        allowHTTP1: true,
        key: readFileSync('cert/localhost-privkey.pem'),
        cert: readFileSync('cert/localhost-cert.pem'),
        Http2ServerRequest: RequestHttp2,
        Http2ServerResponse: ResponseHttp2,
        Http1IncomingMessage: Request,
        Http1ServerResponse: Response
      },
      async (_req, _res) => {
        // stream will be handled by server.on('stream', ... )
        if (_req.stream) return

        // return
        const req = _req as RequestHttp2
        const res = _res as ResponseHttp2

        const result = (await this.router.handle(req as any, res as any)) as any

        // notfound/error
        if (!res.headersSent) {
          if (result instanceof Error) {
            res.status(500).send.text('500: Error')
          } else {
            res.status(404).send.text('404: Not Found')
          }
        }
      }
    )

    server.on('stream', async (stream, headers) => {
      const req: any = {
        authority: headers[':authority'],
        method: headers[':method'],
        path: headers[':path'],
        scheme: headers[':scheme'],
        headers: Object.entries(headers)
          .filter(([key, value]) => typeof key === 'string' && !key.startsWith(':'))
          .reduce((prev, curr) => {
            return { ...prev, [curr[0]]: curr[1] }
          }, {}) as any,
        stream
      }
      req.headers.host = req.authority
      req.url = req.path

      const res: any = new Stream(stream)

      const result = (await this.router.handle(req, res)) as any

      if (!res.headersSent) {
        if (result instanceof Error) {
          res.status(500).send.text('500: Error')
        } else {
          res.status(404).send.text('404: Not Found')
        }
      }
    })

    return server
  }
}
