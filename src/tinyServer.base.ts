import { Server as HttpServer } from 'http'
import { Server as HttpsServer } from 'https'
import { Http2SecureServer as Http2Server } from 'http2'

import { Request } from './request'
import { Response } from './response'
import { Stream } from './stream'

import { Router } from './router'
import { serveStatic } from './middleware/serveStatic'
import { AddressInfo, Socket } from 'net'

type Port = number

export abstract class TinyServerBase<
  Srv extends HttpServer | HttpsServer | Http2Server,
  Req extends Request,
  Res extends Response
> {
  public router = new Router()
  private server!: Srv
  /** alias for this.router.route */
  public r = this.router.route
  /** alias for this.router.route */
  public route = this.router.route

  constructor() {}

  /**
   * Serve static files.
   * @param directory Has to be an absolute path.
   */
  static static(directory: string) {
    return serveStatic(directory)
  }

  protected abstract createServer(): Srv

  randomPort = () => {
    return Math.floor(Math.random() * (65535 - 1024) + 1024)
  }

  public listen(port: Port = this.randomPort()): Promise<Port> {
    return new Promise(resolve => {
      this.server = this.createServer() as Srv
      this.server.listen(port, () => {
        // graceful shutdown
        process.on('SIGTERM', async () => {
          console.log('Server is closing...')
          await this.close()
        })
        const { port } = this.server.address() as AddressInfo
        resolve(port)
      })
    })
  }

  public close(): Promise<void> {
    return new Promise(resolve => {
      this.server.close(() => {
        resolve()
      })
    })
  }
}
