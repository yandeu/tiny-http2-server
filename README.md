# TinyServer

A tiny wrapper around Node's http/http2.

```bash
# create certs
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 3560 -subj '/CN=localhost' \
 -keyout cert/localhost-privkey.pem -out cert/localhost-cert.pem
```
