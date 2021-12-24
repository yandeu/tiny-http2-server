import { logger, LoggerOptions, serveExplorer, ServeExplorerConfig, serveStatic } from '.'
import { isPromise } from './helpers'
import { Request } from './request'
import { Response } from './response'
import type { ExpressHandler, Handler, Method, Path, Route, Routes, UseMiddleware } from './types'

export class Router {
  private _routes: Routes = []

  get route() {
    /** Add a middleware */
    const use: UseMiddleware = (a: Path | ExpressHandler, b?: ExpressHandler): void => {
      if (typeof a === 'string' && typeof b === 'function') {
        this.routes.add({ path: a, handler: b, isMiddleware: true })
      } else if (a instanceof RegExp && typeof b === 'function') {
        this.routes.add({ path: a, handler: b, isMiddleware: true })
      } else if (typeof a === 'function') {
        this.routes.add({ path: '/', handler: a, isMiddleware: true })
      }
    }

    return {
      use: use,
      // add route
      add: (method: Method, path: Path, handler: Handler) => {
        this.routes.add({ method, path, handler })
      },
      // methods
      any: (path: Path, handler: Handler) => this.route.add('any', path, handler),
      get: (path: Path, handler: Handler) => this.route.add('get', path, handler),
      patch: (path: Path, handler: Handler) => this.route.add('patch', path, handler),
      post: (path: Path, handler: Handler) => this.route.add('post', path, handler),
      put: (path: Path, handler: Handler) => this.route.add('put', path, handler),
      delete: (path: Path, handler: Handler) => this.route.add('delete', path, handler),
      // middleware
      static: (path: Path, absolutePath: string) => this.route.use(path, serveStatic(absolutePath)),
      logger: (options?: LoggerOptions) => this.route.use(logger(options)),
      explorer: (config?: ServeExplorerConfig) => this.route.use(serveExplorer(config))
    }
  }

  get routes() {
    return {
      add: (route: Handler | Route) => {
        // if has params, convert to RegEx
        if (typeof route !== 'function' && typeof route.path === 'string' && route.path.includes('/:')) {
          try {
            route.path = route.path.replace('/', '\\/')
            route.path = route.path.replace(/\/:([^/]+)/gm, '\\/(?<$1>[^\\/]+)')
            route.path = new RegExp(`^${route.path}$`, 'gm')
          } catch (err: any) {
            console.log('WARNING:', err.message)
          }
        }
        this._routes.push(route)
      }
    }
  }

  async handle(req: Request, res: Response) {
    const method = req.method?.toLowerCase() as Method

    routesLoop: for (let i = 0; i < this._routes.length; i++) {
      if (res.headersSent) break routesLoop

      const route = this._routes[i]
      const url = req.url as string

      const pathIsAsterisk = typeof route !== 'function' && route.path === '*'
      const pathIsRegex = typeof route !== 'function' && route.path instanceof RegExp // && url.match(route.path) !== null
      const pathIsExact = typeof route !== 'function' && route.path === req.url
      const pathMatches = typeof route !== 'function' && typeof route.path === 'string' && url.startsWith(route.path)

      // is handle without path
      if (typeof route === 'function') {
        await route({ req, res })
      } else {
        // pass some data to the request
        const { handler, ...rest } = route
        req.route = rest

        // is middleware
        if (route.isMiddleware) {
          if (pathIsAsterisk || pathMatches || pathIsExact || pathIsRegex) {
            const next = (err?: any) => {} // console.log('FROM NEXT', err)
            const handle = (route.handler as ExpressHandler)(req, res, next)
            if (isPromise(handle))
              try {
                await handle
              } catch (err: any) {
                return next(err)
              }
          }
        }

        // is route
        else if (pathIsAsterisk || pathIsExact || pathIsRegex) {
          // get all regex capture groups and pass them as params to req.params
          if (pathIsRegex) {
            //const array = [...req.url.matchAll(route.path as RegExp)]
            const matchesIterator = req.url.matchAll(route.path as RegExp)
            const matches = Array.from(matchesIterator)

            if (matches.length === 0) continue

            for (const match of matches) {
              req.params = { ...match.groups }
            }
          }

          if (route.method === method || route.method === 'any') {
            const result = await (route.handler as Handler)({ req, res })
            if (typeof result === 'string') return res.send.text(result)
            // TODO(yandeu): Only use sendStatus() if number is one of status code.
            else if (typeof result === 'number') return res.send.status(result)
            else if (typeof result === 'object') return res.send.json(result)
          }
        }
      }
    }
  }
}
