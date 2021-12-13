import { extname } from 'path'
import { stat } from 'fs/promises'
import { types } from 'util'

export const { isPromise } = types

export const isFile = async (absolutePath: string) => {
  const stats = await stat(absolutePath)
  const isFile = stats.isFile()
  return isFile
}

export const fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"

// https://github.com/nginx/nginx/blob/master/conf/mime.types
export const mime = (fileName: string) => {
  switch (extname(fileName)) {
    case '.txt':
      return 'text/plain'
    case '.css':
      return 'text/css'
    case '.js':
      return 'application/javascript'
    case '.html':
      return 'text/html'
    case '.json':
      return 'application/json'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.svg':
    case '.svgz':
      return 'image/svg+xml'
    default:
      return 'text/plain'
  }
}

export const escapeHtml = (unsafe: string) => {
  if (unsafe && typeof unsafe === 'string')
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  return unsafe
}

export const makeHtml = (body: string, more: { head?: string[] } = {}) => {
  const { head = [] } = more

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${head.join('\n')}
  </head>
  <body>
    ${body}
  </body>
</html>`
}
