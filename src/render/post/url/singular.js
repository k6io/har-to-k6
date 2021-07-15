const { isString } = require('../../../aid')
const object = require('../../object')
const text = require('../../text')

function singular(params) {
  const entries = []
  for (const [name, items] of params) {
    for (const item of items) {
      entries.push(entry(name, item))
    }
  }
  return object(entries)
}

function entry(name, item) {
  name = decodeURIComponent(name)
  const result = { name }
  if (isString(item.value)) {
    result.value = text(decodeURIComponent(item.value))
  }
  if (item.comment || item.contentType || item.fileName) {
    result.comment = comment(item)
  }
  return result
}

function comment(item) {
  const sections = []
  if (item.comment) {
    sections.push(item.comment)
  }
  if (item.contentType) {
    sections.push(`Content type: ${item.contentType}`)
  }
  if (item.fileName) {
    sections.push(`File name: ${item.fileName}`)
  }
  return sections.join('\n')
}

module.exports = singular
