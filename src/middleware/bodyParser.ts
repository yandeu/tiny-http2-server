import { Request, RequestHttp2 } from '../request'
import { ExpressHandler, NextFunction, Response } from '../types'

/** Parses body and adds content to req.body */
const parse = async (req: Request | RequestHttp2): Promise<Buffer | string> =>
  new Promise((resolve, reject) => {
    let buffers: Buffer[] = []
    let string: string = ''

    // check if is http2 stream
    const _req = (req as RequestHttp2).stream ? (req as RequestHttp2).stream : req

    _req
      .on('data', chunk => {
        if (Buffer.isBuffer(chunk)) buffers.push(chunk)
        else if (typeof chunk === 'string') string += chunk
      })
      .on('end', () => {
        const data = buffers.length > 0 ? Buffer.concat(buffers) : string
        return resolve(data)
      })
      .on('error', () => {
        return reject()
      })
  })

export const bodyParser = {
  parse: parse,
  /** Parse json and text. */
  json: (text = true) =>
    (async (req: Request, res: Response, next: NextFunction) => {
      // is json or text
      const isJSON = req.headers['content-type'] === 'application/json'
      const isText = text && req.headers['content-type']?.startsWith('text/')
      if (!isJSON && !isText) return next()

      // parse
      const body = await parse(req)

      // replace body with json
      try {
        // to string
        const string = (body as Buffer | string).toString()
        req.body = string
        // to json
        if (isJSON) {
          const json = JSON.parse(string)
          req.body = json
        }
      } catch (error) {}

      return next()
    }) as ExpressHandler
}
