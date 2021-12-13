let _beforeAll: Function = () => {}
let _afterAll: Function = () => {}
const tests: { assertion: string; fnc: Function }[] = []
export const sym = () => {
  return {
    fail: '✘',
    pass: '✔',
    skip: '⚙'
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
export const expect = (t1: any) => {
  return {
    toBe: t2 => {
      const isTrue = t1 === t2
      if (isTrue) console.log(clr().lightGreen(`  ${sym().pass}`), clr().gray(`"${t1}" is "${t2}"`))
      else {
        const error = clr().red(`  ${sym().fail} "${t1}" is NOT "${t2}"`)
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
      console.log('-', t.assertion)
      await Promise.race([t.fnc(), pause(timeout, true)])
    } catch (err: any) {
      console.log('Error in Test:', err)
      errors.push(err)
    }
  }

  await _afterAll()
}
