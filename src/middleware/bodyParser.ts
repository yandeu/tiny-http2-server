import { Request, RequestHttp2 } from '../request'
import { ExpressHandler, NextFunction, Response } from '../types'

/** Parses body and adds content to req.body */
const parseBody = async (req: Request | RequestHttp2): Promise<void> =>
  new Promise((resolve, reject) => {
    let data = ''

    // check if is http2 stream
    const _req = (req as RequestHttp2).stream ? (req as RequestHttp2).stream : req

    _req
      .on('data', chunk => {
        data += chunk
      })
      .on('end', () => {
        req.body = data
        return resolve()
      })
      .on('error', () => {
        return reject()
      })
  })

export const bodyParser = {
  json: () =>
    (async (req: Request, res: Response, next: NextFunction) => {
      await parseBody(req)

      // isJSON
      if (req.headers['content-type'] !== 'application/json') return next()

      // replace body with json
      try {
        const json = JSON.parse(req.body)
        req.body = json
      } catch (error) {}

      return next()
    }) as ExpressHandler
}
