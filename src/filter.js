async function filter(parsed, options) {
  const archive = Object.assign({}, parsed)
  archive.log = Object.assign({}, archive.log)
  if (options.only) {
    archive.log.entries = parsed.log.entries.filter((entry) => {
      const url = new URL(entry.request.url)
      return options.only.includes(url.hostname)
    })
  }
  return archive
}

module.exports = filter
