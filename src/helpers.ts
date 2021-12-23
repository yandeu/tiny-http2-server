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

// https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
export const statusCode = (code: number) => {
  switch (code) {
    case 200:
      return 'OK'
    case 201:
      return 'Created'
    case 202:
      return 'Accepted'
    case 300:
      return 'Multiple Choices'
    case 301:
      return 'Moved Permanently'
    case 302:
      return 'Found'
    case 307:
      return 'Temporary Redirect'
    case 308:
      return 'Permanent Redirect'
    case 400:
      return 'Bad Request'
    case 401:
      return 'Unauthorized'
    case 402:
      return 'Payment Required'
    case 403:
      return 'Forbidden'
    case 404:
      return 'Not Found'
    case 405:
      return 'Method Not Allowed'
    case 406:
      return 'Not Acceptable'
    case 408:
      return 'Request Timeout'
    case 413:
      return 'Payload Too Large'
    case 414:
      return 'URI Too Long'
    case 415:
      return 'Unsupported Media Type'
    case 414:
      return 'URI Too Long'
    case 429:
      return 'Too Many Requests'
    case 431:
      return 'Request Header Fields Too Large'
    case 444:
      return 'No Response'
    case 500:
      return 'Internal Server Error'
    default:
      return code.toString()
  }
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
