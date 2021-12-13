import { readdir, rename } from 'fs/promises'
import { join, resolve } from 'path'
import { spawn } from './spawn.mjs'

const args = process.argv.slice(2)

// https://stackoverflow.com/a/45130990
async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true })
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name)
    if (dirent.isDirectory()) {
      yield* getFiles(res)
    } else {
      yield res
    }
  }
}

const fileMatchesArgument = file => (args[0] ? new RegExp(args[0], 'i').test(file) : true)

// rename .js to .mjs
const renameFiles = async path => {
  for await (const file of getFiles(path)) {
    const reg = /test\.js$/
    if (reg.test(file)) rename(file, file.replace(reg, 'test.mjs'))
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
  for await (const file of getFiles(path)) {
    if (/test\.tsx?$/.test(file) && fileMatchesArgument(file)) {
      try {
        const cmd = tsc(file)
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
  for await (const file of getFiles(path)) {
    if (/test\.mjs$/.test(file) && fileMatchesArgument(file)) {
      try {
        await spawn(`node ${file}`)
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
