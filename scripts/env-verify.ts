import fs from 'fs'

const examplePath = '.env.example'
const contents = fs.readFileSync(examplePath, 'utf-8')

const required = contents
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'))
  .map(line => line.split('=')[0])

let missing: string[] = []
for (const key of required) {
  if (!process.env[key]) {
    missing.push(key)
  }
}

if (missing.length) {
  console.error('Missing environment variables:', missing.join(', '))
  process.exit(1)
}

console.log('All environment variables loaded')
