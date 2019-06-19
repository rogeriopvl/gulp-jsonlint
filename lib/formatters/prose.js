const colors = require('ansi-colors')

module.exports = function formatForVisualStudio(file, error) {
  let location
  const line = error.location ? error.location.start.line : undefined
  if (line !== undefined) {
    const { column } = error.location.start
    location = colors.magenta(` at line ${line}, column ${column}`)
  } else {
    location = ''
  }
  return colors.yellow('File ') + colors.magenta(file) +
    colors.yellow(' failed JSON validation') + location + colors.yellow('.')
}
