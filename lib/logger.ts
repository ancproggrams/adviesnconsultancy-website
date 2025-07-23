

import fs from 'fs'
import path from 'path'

const LOG_FILE = path.join(process.cwd(), 'nextauth-debug.log')

export function logToFile(message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] ${message}${data ? ' | Data: ' + JSON.stringify(data, null, 2) : ''}\n`
  
  try {
    fs.appendFileSync(LOG_FILE, logEntry)
    console.log(`📝 LOGGED: ${message}`)
  } catch (error) {
    console.error('Failed to write to log file:', error)
  }
}

export function clearLogFile() {
  try {
    fs.writeFileSync(LOG_FILE, `=== NextAuth Debug Session Started at ${new Date().toISOString()} ===\n`)
    console.log('🗂️ Log file cleared and initialized')
  } catch (error) {
    console.error('Failed to clear log file:', error)
  }
}

export function readLogFile(): string {
  try {
    return fs.readFileSync(LOG_FILE, 'utf8')
  } catch (error) {
    return 'Log file not found or could not be read'
  }
}
