import { isFile } from '../../lib/helpers.js'
import { describe, expect, test, errors } from '../test.mjs'
import { resolve, join } from 'path'

describe('isFile()', async () => {
  const packageJson = await isFile(join(resolve(), 'package.json'))
  const src = await isFile(join(resolve(), 'src'))

  expect(packageJson).toBe(true)
  expect(src).toBe(false)
})

test().then(() => {
  process.exit(errors.length === 0 ? 0 : 1)
})
