const colors = require('ansi-colors')

module.exports = function formatForVisualStudio(file, error) {
  let location
  const line = error.location ? error.location.start.line : undefined
  if (line !== undefined) {
    const { column } = error.location.start
    location = `${file}(${line},${column})`
  } else {
    location = file
  }
  return colors.magenta(location) +
    colors.yellow(': error: failed JSON validation')
}
