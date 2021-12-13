import { ExpressHandler, NextFunction, Request, Response } from '../types'

export interface LoggerOptions {
  ignoreFavicon?: boolean
}
export const logger = (options: LoggerOptions = {}): ExpressHandler => {
  const { ignoreFavicon = true } = options

  return (req: Request, res: Response, next: NextFunction) => {
    if (ignoreFavicon && req.url === '/favicon.ico') return
    console.log(req.method, req.url)
  }
}
