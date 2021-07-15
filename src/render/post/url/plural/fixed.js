const comment = require('../../../comment')
const note = require('../../../note/map')
const string = require('../../../string')

// Multivalue URL encoded post data without variable
function fixed(params) {
  return [description(params), value(params)].filter((item) => item).join(`\n`)
}

function value(params) {
  const spec = specify(params)
  const encoded = new URLSearchParams(spec).toString()
  return string(encoded)
}

function specify(params) {
  const spec = {}
  for (let [name, items] of params) {
    name = decodeURIComponent(name)
    if (items.size > 1) {
      spec[name] = [...items].map((item) => decodeURIComponent(item.value))
    } else {
      spec[name] = decodeURIComponent([...items][0].value)
    }
  }
  return spec
}

function description(params) {
  const content = note(params)
  if (content) {
    return comment(content)
  } else {
    return null
  }
}

module.exports = fixed
