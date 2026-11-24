// Next.js 12 does not include dynamically located Chromium binaries in API traces.
const fs = require('fs')
const path = require('path')

const tracePath = path.join(
  process.cwd(),
  '.next/server/pages/api/social-image.js.nft.json'
)
const trace = JSON.parse(fs.readFileSync(tracePath, 'utf8'))
const files = [
  'chromium.br',
  'al2023.tar.br',
  'fonts.tar.br',
  'swiftshader.tar.br'
]
for (const name of files) {
  const archive = path.join(
    process.cwd(),
    'node_modules/@sparticuz/chromium/bin',
    name
  )
  if (!fs.existsSync(archive))
    throw new Error(`Missing Chromium archive: ${name}`)
  const relative = path
    .relative(path.dirname(tracePath), archive)
    .split(path.sep)
    .join('/')
  if (!trace.files.includes(relative)) trace.files.push(relative)
}
fs.writeFileSync(tracePath, JSON.stringify(trace))
console.log(
  `Added ${files.length} Chromium archives to the social image trace.`
)
