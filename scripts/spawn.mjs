import { spawn as _spawn } from 'child_process'

// isWin
const isWin = process.platform === 'win32'

export const spawn = cmd => {
  return new Promise((resolve, reject) => {
    // command
    const command = isWin ? `powershell.exe ${cmd}` : cmd

    // spawn
    const s = _spawn(command, {
      shell: true,
      stdio: 'inherit',
      cwd: process.cwd()
    })

    // close
    s.on('close', code => {
      if (code !== 0) return reject(code)
      return resolve()
    })
  })
}
