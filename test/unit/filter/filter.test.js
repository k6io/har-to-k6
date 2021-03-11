import test from 'ava'
import filter from 'filter'

function makeFixture(urls) {
  return {
    log: {
      entries: urls.map((url) => {
        return {
          request: { url },
        }
      }),
    },
  }
}

test('nil', async (t) => {
  const fixture = makeFixture(['https://example.com/'])
  const compare = makeFixture(['https://example.com/'])
  t.deepEqual(compare, await filter(fixture, { only: null }))
})

test('filter', async (t) => {
  const fixture = makeFixture([
    'https://example.com/foo',
    'https://bar.com/bat',
    'https://bat.com/boo',
  ])
  const compare = makeFixture([
    'https://example.com/foo',
    'https://bat.com/boo',
  ])
  t.deepEqual(
    compare,
    await filter(fixture, { only: ['example.com', 'bat.com'] })
  )
})
