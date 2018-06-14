const fs = require('fs')
const previewPath = './preview'

function getEntry(path) {
  const entry = {}
  const dirList = fs.readdirSync(path)
  if (!dirList) { return }
  for (const dir of dirList) {
    let path = previewPath + '/' + dir + '/preview.ts'
    if (fs.existsSync(path)) {
      entry[dir] = previewPath + '/' + dir + '/preview'
    }
  }
  return entry
}
exports.getEntry = getEntry

