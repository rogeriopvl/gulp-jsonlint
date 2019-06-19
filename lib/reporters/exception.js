const colors = require('ansi-colors')

module.exports = function reportException(file, error) {
  const lines = error.message.split(/\r?\n/)
  let message
  if (lines.length > 2) {
    message = lines
      .splice(1)
      .map(function (line, index) {
        var color = index > 0 ? 'red' : 'black'
        return colors[color](line)
      })
      .join('\n')
  } else {
    message = error.message
  }
  return colors.red(message)
}
