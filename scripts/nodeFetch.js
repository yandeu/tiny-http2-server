const http = require('http')
const https = require('https')
const http2 = require('http2')
const { URL } = require('url')

const { HTTP2_HEADER_PATH, HTTP2_HEADER_METHOD } = http2.constants

const httpRequest = async (url, config = {}) =>
  new Promise((resolve, reject) => {
    const { method = 'GET', unsafe = false, body = undefined } = config
    let { headers = {} } = config

    // add content-length
    if (body) headers = { ...headers, 'content-length': body.length }

    const module = /^https/.test(url) ? https.request : http.request
    const _url = new URL(url)

    const req = module(
      {
        host: _url.host,
        hostname: _url.hostname,
        port: _url.port,
        path: _url.pathname,

        method,
        body,
        headers,

        // insecure (https://stackoverflow.com/questions/10888610/ignore-invalid-self-signed-ssl-certificate-in-node-js-with-https-request)
        rejectUnauthorized: !unsafe
        // requestCert: false
        // agent: false
      },
      res => {
        let data = ''

        res
          .on('data', chunk => {
            data += chunk.toString()
          })
          .on('end', () => {
            try {
              let json = JSON.parse(data)
              if (typeof json === 'number') json = json.toString()
              return resolve({ body: json, status: res.statusCode, rawHeaders: res.rawHeaders, headers: res.headers })
            } catch (error) {
              return resolve({ body: data, status: res.statusCode, rawHeaders: res.rawHeaders, headers: res.headers })
            }
          })
      }
    )

    req.on('error', error => {
      return reject(error)
    })

    if (body) req.write(body)
    req.end()
  })

/** In Development */
const http2Request = (url, config = {}) =>
  new Promise((resolve, reject) => {
    try {
      const { method = 'GET', unsafe = false, body = undefined, headers = {} } = config

      const _url = new URL(url)
      const { origin, pathname } = _url

      const client = http2.connect(origin, { rejectUnauthorized: !unsafe })
      const buffer = body ? Buffer.from(body) : null

      const req = client.request({
        // [http2.constants.HTTP2_HEADER_SCHEME]: 'https',
        [HTTP2_HEADER_METHOD]: method,
        [HTTP2_HEADER_PATH]: pathname,

        'content-length': buffer?.length || 0,
        ...headers
        // rejectUnauthorized: false
      })

      // req.setEncoding('utf8')

      let data = ''
      let status
      let _headers = {}

      req
        .on('data', chunk => {
          data += chunk.toString()
        })

        .on('response', (headers, flags) => {
          for (const name in headers) {
            if (name === ':status') {
              status = parseInt(headers[name])
            } else {
              _headers = { ..._headers, [name]: headers[name] }
            }
          }
        })
        .on('end', () => {
          try {
            const json = JSON.parse(data)
            resolve({ body: json, status, headers: _headers })
            client.close()
            return
          } catch (error) {
            resolve({ body: data, status, headers: _headers })
            client.close()
            return
          }
        })

      if (buffer) req.write(buffer)
      req.end()
    } catch (err) {
      console.log('Error:', err.message)
      return reject(err)
    }
  })

/** Make a simple GET request */
const nodeFetch = async (url, config = {}) => {
  // config and headers
  const { body = undefined, headers = {}, http2Stream = false } = config
  if (body) config.headers = { ...headers, 'content-length': body.length }

  if (!http2Stream) return httpRequest(url, config)
  else return http2Request(url, config)
}

module.exports = { nodeFetch }
