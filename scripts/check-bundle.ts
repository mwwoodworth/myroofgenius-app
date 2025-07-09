import fs from 'fs'
import path from 'path'

const manifestPath = path.join('.next', 'build-manifest.json')
if (!fs.existsSync(manifestPath)) {
  console.error('build-manifest.json not found. Run next build first.')
  process.exit(1)
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, any>
const pages: Record<string, string[]> = manifest.pages || {}
let fail = false

function sizeOf(files: string[]) {
  return files
    .filter((f) => f.endsWith('.js'))
    .reduce((total, f) => {
      const p = path.join('.next', f)
      if (fs.existsSync(p)) {
        total += fs.statSync(p).size
      }
      return total
    }, 0) / 1024
}

for (const [route, files] of Object.entries(pages)) {
  if (route.startsWith('/_')) continue
  const kb = sizeOf(files as string[])
  if (kb > 150) {
    console.error(`Route ${route} JS bundle is ${kb.toFixed(1)}kb`) 
    fail = true
  }
}

if (fail) process.exit(1)
else console.log('All route JS bundles within 150kb')
