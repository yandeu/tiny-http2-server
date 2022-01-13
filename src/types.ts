import type { Http2Server, Http2SecureServer } from 'http2'
export type { Http2Server, Http2SecureServer }

import type { Request, RequestHttp2 } from './request'
import type { Response, ResponseHttp2 } from './response'
import type { Router } from './router'
export type { Request, RequestHttp2, Response, ResponseHttp2 }

export type Path = string | RegExp
export type Method = 'any' | 'get' | 'patch' | 'post' | 'put' | 'delete'
export type Context = {
  req: Request
  res: Response
}
export interface NextFunction {
  (err?: any): void
}
export interface Handler {
  (ctx: Context): string | number | object | void | Promise<any>
}
export interface ExpressHandler {
  (req: Request, res: Response, next: NextFunction): string | number | object | void | Promise<any>
}
export interface Route {
  handler: Handler | ExpressHandler
  path: Path
  method?: Method
  isMiddleware?: boolean
}
export type Routes = (Route | Handler | Router)[]
export type UseMiddleware = {
  (handler: ExpressHandler): void
  (path: Path, handler: ExpressHandler): void
}
