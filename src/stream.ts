/* eslint-disable no-redeclare */
import { ServerHttp2Stream } from 'http2'
import { isFile, mime } from './helpers'
import { NextFunction } from './types'
import { ResponseBase } from './response'

/** Makes http2 stream compatible with http/https response. */
export class Stream extends ResponseBase {
  finished = false
  statusCode = 200

  private _headers: { [header: string]: string[] } = {}

  /** Backwards compatibility with http v1 */
  get headersSent() {
    return this.finished
  }

  constructor(public stream: ServerHttp2Stream) {
    super()
    // overwrites
    this.send.file = this._sendFile
  }

  /**
   *
   * @example
   * response.setHeader('Content-Type', 'text/html; charset=utf-8');
   *
   * response.setHeader('Set-Cookie', ['type=ninja', 'language=javascript']);
   */
  public setHeader(header: string, ...value: string[]) {
    this._headers = { ...this._headers, [header]: value }
  }

  public status(statusCode: number) {
    this.statusCode = statusCode
    return this
  }

  protected __send(body: string, contentType = 'text/plain') {
    this.finished = true
    this.stream.respond({
      ...this._headers,
      'content-type': contentType,
      ':status': 200
    })
    this.stream.end(body)
  }

  /**
   * Send a file.
   * Pass a relativePath (without leading slash) or an absolute path
   *
   * @example
   * // absolute path
   * res.send.file(join(resolve(), 'assets/styles.css')))
   * // relative path
   * res.send.file('assets/styles.css')
   */
  // overwrites this.send.file()
  private async _sendFile(filePath: string) {
    if ((await isFile(filePath)) === false) return

    const statCheck = (stat: any, headers: any) => {
      headers['last-modified'] = stat.mtime.toUTCString()
    }

    const contentType = mime(filePath)
    this.finished = true

    this.stream.respondWithFile(
      filePath,
      {
        ...this._headers,
        'content-type': contentType
      },
      { statCheck }
    )
  }
}
