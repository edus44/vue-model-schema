const resource = require('../src/resource')

it('should work', () => {
  const client = jest.fn()

  const Users = resource({
    client,
    config: {
      url: '/projects',
      data: {
        a: true,
      },
    },
    actions: {
      test: {
        appendUrl: '/admin',
      },
    },
  })

  Users.test({
    urlParams: {
      id: 'caca',
    },
  })
})
