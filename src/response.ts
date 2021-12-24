import { createReadStream } from 'fs'
import { OutgoingMessage, ServerResponse } from 'http'
import { stat } from 'fs/promises'
import { makeHtml, mime, statusCode } from './helpers'
import { Http2ServerResponse } from 'http2'

export class ResponseBase {
  statusCode!: number

  public status(statusCode: number) {
    this.statusCode = statusCode
    return this
  }

  protected __send(body: string, contentType = 'text/plain') {
    // @ts-ignore
    this.writeHead(this.statusCode || 200, { 'Content-Type': contentType })
    // @ts-ignore
    this.end(body)
  }

  public get send() {
    return {
      html: (html: string, addDoctype = false) => {
        this.__send(addDoctype ? makeHtml(html) : html, 'text/html')
      },
      text: (text: string) => {
        this.__send(text, 'text/plain')
      },
      json: (json: object) => {
        this.__send(JSON.stringify(json), 'application/json')
      },
      status: (status: number) => {
        // end without sending anything (just like nginx)
        if (status === 444) {
          this.status(444)
          // @ts-expect-error
          this.end()
        } else {
          this.status(status).send.text(statusCode(status))
        }
      },
      /**
       * Send a file.
       * Pass a relativePath (without leading slash) or an absolute path
       * Important: Returns a promise; Use "return res.send.file()";
       *
       * @example
       * // absolute path
       * return res.send.file(join(resolve(), 'assets/styles.css')))
       * // relative path
       * return res.send.file('assets/styles.css')
       */
      file: async (filePath: string) => {
        let isFile = false
        try {
          // check file
          const stats = await stat(filePath)
          isFile = stats.isFile()
          if (!isFile) return new Error()

          // prepare response
          const contentType = mime(filePath)
          // @ts-ignore
          this.writeHead(200, { 'Content-Type': contentType })

          // send file
          // @ts-ignore
          createReadStream(filePath).pipe(this, { end: true })
        } catch (err: any) {
          return err
        }
      }
    }
  }
}

// http/https
class Response extends ServerResponse implements ResponseBase {}
interface Response extends ResponseBase {}
applyMixins(Response, [ResponseBase])
export { Response }

// http2
class ResponseHttp2 extends Http2ServerResponse implements ResponseBase {}
interface ResponseHttp2 extends ResponseBase {}
applyMixins(ResponseHttp2, [ResponseBase])
export { ResponseHttp2 }

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
