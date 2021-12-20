import { Request, RequestHttp2 } from '../request'
import { ExpressHandler, NextFunction, Response } from '../types'

/** Parses body and adds content to req.body */
const parseBody = async (req: Request | RequestHttp2): Promise<void> =>
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
        req.body = data
        return resolve()
      })
      .on('error', () => {
        return reject()
      })
  })

export const bodyParser = {
  /** Parse json and text. */
  json: () =>
    (async (req: Request, res: Response, next: NextFunction) => {
      await parseBody(req)

      // isJSON
      const isJSON = req.headers['content-type'] === 'application/json'
      const isText = req.headers['content-type']?.startsWith('text/')
      if (!isJSON && !isText) return next()

      // replace body with json
      try {
        // to string
        const string = (req.body as Buffer | string).toString()
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
