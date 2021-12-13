import { readdir, stat } from 'fs/promises'
import { basename, extname, join, resolve } from 'path'
import { fontFamily, makeHtml } from '../helpers'
import type { Request, Response, NextFunction } from '../types'

const styles = `
<style>
html {
  margin: 0;
  padding: 0;
}
body {
  font-family: ${fontFamily};
  margin: 0;
  padding: 2.5% 5%;
}
h1 {
  margin-left: 24px;
  margin-bottom: 36px;
  font-size: 26px;
}
p.not-found {
  margin-left: 24px;
  font-size: 20px;
}
ul {
  display: flex;
  flex-direction: column;
  list-style: none;
}
li {
  padding: 4px 0px;
}
li::before {
  content: "\\2022";
  color: black;
  display: inline-block;
  width: 1em;
  margin-left: -1em;
}
li.directory::before {
  font-weight:bold;
  content: "/";
}
a {
  color: blue;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
</style>`

const send404Page = (req: Request, res: Response) => {
  try {
    const html = `
  ${styles}
  <h1>${req.url.split('/').join(' / ')}</h1>
  <p class="not-found" style="margin: 0px; position: absolute; top: 40%;left: 50%; transform: translate(-50%, -50%);">
    <span style="font-size: 36px; font-weight: bold;">
      404
    </span>
    <span style="
      margin-left: 14px;
      margin-right: 16px;
      border-left: 1px black solid;
      font-size: 36px;
      position: relative;
      top: 0px;"
    >
    </span>
    <span style="position: relative; top: -1px;">
      not found
    </span>
  </p>
 `
    return res.send.html(makeHtml(html))
  } catch (err) {
    return err
  }
}

export interface ServeExplorerConfig {
  dotFiles?: boolean
  notFound?: boolean
}
export const serveExplorer = (config: ServeExplorerConfig = {}) => {
  const { dotFiles = false, notFound = true } = config

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.method !== 'GET') return next()

      const absolutePath = join(resolve(), req.url)
      const stats = await stat(absolutePath)

      // isFile()
      if (await stats?.isFile()) {
        return res.send.file(absolutePath)
      }

      // isDirectory()
      else if (await stats?.isDirectory()) {
        let files = await readdir(absolutePath)
        if (!dotFiles) files = files.filter(f => !basename(f).startsWith('.'))

        const html = `
        ${styles}
        <h1>~ ${req.url.split('/').join(' / ')}</h1>
        <ul>
          ${files
            .sort((a: string, b: string) => {
              if (!extname(a) && !extname(b)) return 0
              if (!extname(a)) return -1
              else return 1
            })
            .map(f => {
              const url = `${req.url}/${f}`.replace(/\/+/gm, '/')
              return `<li class="${!extname(f) ? 'directory' : ''}"><a href="${url}">${f}</a></li>`
            })
            .join('')}
        </ul>`

        return res.send.html(makeHtml(html))
      }

      next()
    } catch (err: any) {
      // notFound is true
      if (notFound) {
        const err = send404Page(req, res)
        if (err) return next()
      }

      return next()
    }
  }
}
