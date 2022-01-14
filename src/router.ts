import { logger, LoggerOptions, serveExplorer, ServeExplorerConfig, serveStatic } from '.'
import { isPromise } from './helpers'
import { Request } from './request'
import { Response } from './response'
import type { ExpressHandler, Handler, Method, Path, Route, Routes, UseMiddleware } from './types'

const DEBUG = false

export class Router {
  /** The relative root route of this Router */
  private _relativeRoot = '/'
  /** The absolute root route of this Router */
  private _absoluteRoot = '/'
  /** Array of all routes of this Router */
  private _routes: Routes = []
  /** The children router (if it has some) */
  private _children: Router[] = []
  /** The parent router (if it has one) */
  private _parent!: Router

  /** Traverse all down all children and from there traverse up all parents and adjust the _absoluteRoot */
  adjustAbsoluteRoot() {
    this._absoluteRoot = this._relativeRoot
    this._absoluteRoot.replace(/\/+/gm, '/')
    if (this._parent) {
      // TODO(yandeu): Infinite traverse parent router
      this._absoluteRoot = this._parent._relativeRoot + this._absoluteRoot
      this._absoluteRoot = this._absoluteRoot.replace(/\/+/gm, '/')
      if (this._parent._parent) {
        this._absoluteRoot = this._parent._parent._relativeRoot + this._absoluteRoot
        this._absoluteRoot = this._absoluteRoot.replace(/\/+/gm, '/')
      }
    }

    this._children.forEach(c => {
      c.adjustAbsoluteRoot()
    })
  }

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
      child: (path: string, router: Router) => {
        router._relativeRoot = path
        router._parent = this
        this._children.push(router)
        this._routes.push(router)
        this.adjustAbsoluteRoot()
      },
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
            if (DEBUG) console.log('route.path', route.path)
            route.path = route.path.replace('/', '\\/')
            route.path = route.path.replace(/\/:([^/]+)/gm, '/(?<$1>[^\\/]+)')
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
    const RouterPathRel = this._relativeRoot
    const RouterPathAbs = this._absoluteRoot
    const url = req.url
    let fullPath

    if (DEBUG)
      console.log({
        RouterPathRel,
        RouterPathAbs,
        url
      })

    routesLoop: for (let i = 0; i < this._routes.length; i++) {
      if (res.headersSent) break routesLoop

      if (DEBUG) console.log('->')
      const route = this._routes[i]

      if (route instanceof Router) {
        if (DEBUG) console.log('isRouter')
        if (req.url.startsWith(route._absoluteRoot)) {
          await route.handle(req, res)
        }
        continue
      }

      // @ts-ignore
      fullPath = (RouterPathAbs + route.path).replace(/\/+/gm, '/').replace(/\/$/, '')
      if (fullPath.length === 0) fullPath = '/'
      // @ts-ignore
      if (DEBUG) console.log('isRoute', route.path)
      if (DEBUG) console.log('fullPath', fullPath)

      const pathIsAsterisk = typeof route !== 'function' && route.path === '*'
      const pathIsRegex = typeof route !== 'function' && route.path instanceof RegExp // && url.match(route.path) !== null
      const pathIsExact = typeof route !== 'function' && fullPath === url
      const pathMatches = typeof route !== 'function' && typeof route.path === 'string' && url.startsWith(route.path)

      // get the current params of the request
      const currentParams = req.params
      // reset params
      const resetParams = () => {
        // reset params: for example if the request will be handled by another route using next() or returning undefined.
        req.params = currentParams
      }

      // TODO(yandeu): next is not handled yet (should probably be called "error" instead of "next"?)
      const next = (err?: any) => {
        if (DEBUG) console.log('NEXT')
        resetParams()
      }

      // adjust full path if is regex
      if (DEBUG) {
        if (pathIsAsterisk) console.log('pathIsAsterisk', pathIsAsterisk)
        if (pathIsRegex) console.log('pathIsRegex', pathIsRegex)
        if (pathIsExact) console.log('pathIsExact', pathIsExact)
        if (pathMatches) console.log('pathMatches', pathMatches)
      }

      // is handle without path
      if (typeof route === 'function') {
        await route({ req, res, next })
      } else {
        // pass some data to the request
        const { handler, ...rest } = route
        req.route = rest

        // is middleware
        if (route.isMiddleware) {
          if (pathIsAsterisk || pathMatches || pathIsExact || pathIsRegex) {
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
            const path = ('/' + url.replace(new RegExp(`^${RouterPathAbs}`), '')).replace(/\/+/gm, '/')
            const matchesIterator = path.matchAll(route.path as any)
            const matches = Array.from(matchesIterator)

            if (matches.length === 0) continue

            // adjust the current request's params
            for (const match of matches) {
              req.params = { ...req.params, ...match.groups }
            }
          }

          if (route.method === method || route.method === 'any') {
            const result = await (route.handler as Handler)({ req, res, next })

            if (DEBUG) console.log('result:', result)

            if (typeof result === 'undefined') {
              resetParams()
            }

            if (typeof result !== 'undefined') {
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
}
