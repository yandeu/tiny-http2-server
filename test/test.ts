let _beforeAll: Function = () => {}
let _afterAll: Function = () => {}
const tests: { assertion: string; fnc: Function }[] = []
export const sym = () => {
  return {
    fail: '✘',
    pass: '✔',
    skip: '⚙'
    // run: '⠕'
  }
}
export const clr = () => {
  return {
    red: text => `\u001b[31m${text}\u001b[0m`,
    green: text => `\u001b[32m${text}\u001b[0m`,
    lightGreen: text => `\u001b[32;1m${text}\u001b[0m`,
    lightBlue: text => `\u001b[34;1m${text}\u001b[0m`,
    gray: text => `\u001b[90m${text}\u001b[0m`
  }
}
export const pause = (ms: number, timeout = false): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (timeout) return reject('timeout')
      else return resolve()
    }, ms)
  })
}
export const errors = []
export const beforeAll = (fnc: Function) => {
  _beforeAll = fnc
}
export const afterAll = (fnc: Function) => {
  _afterAll = fnc
}
export const describe = (assertion: string, fnc: Function) => {
  tests.push({ assertion, fnc })
}

export function expect(t1: any): {
  toBe: (t2: any) => void
}
export function expect(
  description: string,
  t1: any
): {
  toBe: (t2: any) => void
}
export function expect(a: any | string, b?: any) {
  return {
    toBe: t2 => {
      const t1 = b || a
      const isTrue = t1 === t2
      const description = b ? a : `Should be "${t2}"`
      if (isTrue) console.log(clr().lightGreen(`  ${sym().pass}`), clr().gray(`${description}, got "${t1}"`))
      else {
        const error = clr().red(`  ${sym().fail} ${description}, got "${t1}"`)
        console.log(error)
        errors.push(error)
      }
    }
  }
}

export interface TestConfig {
  timeout?: number
}
export const test = async (config: TestConfig = {}) => {
  const { timeout = 5_000 } = config

  await _beforeAll()

  for (const t of tests) {
    try {
      console.log('\n')
      console.log(clr().gray(`- ${t.assertion}`))
      await Promise.race([t.fnc(), pause(timeout, true)])
    } catch (err: any) {
      console.log(clr().red(` ${sym().fail} Error in Test::`), err)
      errors.push(err)
    }
  }

  await _afterAll()
}
