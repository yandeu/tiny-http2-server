import { readdir, rename } from 'fs/promises'
import { join, resolve } from 'path'
import { spawn } from './spawn.mjs'

const args = process.argv.slice(2)

const fileMatchesArgument = file => (args[0] ? new RegExp(args[0], 'i').test(file) : true)

// rename .js to .mjs
const renameFiles = async path => {
  for (const file of await readdir(path)) {
    const reg = /test\.js$/
    if (reg.test(file)) {
      rename(join(path, file), join(path, file.replace(reg, 'test.mjs')))
    }
  }
}

const main = async () => {
  console.log('\n')

  const tsc = file => `tsc --skipLibCheck --target ES2019 --moduleResolution node --declaration ${file}`

  const path = join(resolve(), 'test')

  // compile test.ts
  try {
    const cmd = tsc(join(path, 'test.ts'))
    await spawn(cmd)
  } catch (err) {
    console.log('Error:', err.message)
  }

  // .js to .mjs
  await renameFiles(path)

  // compile .ts to .js
  for (const file of await readdir(path)) {
    if (/test\.tsx?$/.test(file) && fileMatchesArgument(file)) {
      try {
        const cmd = tsc(join(path, file))
        await spawn(cmd)
      } catch (err) {
        console.log('Error:', err.message)
      }
    }
  }

  // .js to .mjs
  await renameFiles(path)

  // execute all .mjs
  let failedTests = 0
  for (const file of await readdir(path)) {
    if (/test\.mjs$/.test(file) && fileMatchesArgument(file)) {
      try {
        await spawn(`node ${join(path, file)}`)
      } catch (err) {
        failedTests++
        // console.log(err)
      }
    }
  }

  if (failedTests > 0) {
    console.log('\nFailed Tests: ', failedTests, '\n')
    process.exit(1)
  } else console.log('\nAll tests SUCCESSFUL\n')
}

main()
