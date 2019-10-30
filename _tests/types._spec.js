const Schema = require('../src/Schema')

describe('Schema types', () => {
  it.only('Boolean', () => {
    class Foo extends Schema {}

    Foo.field('a', Boolean)
    Foo.field('b', Boolean)

    // Initial casting
    const foo = new Foo({ a: 0, b: '0' })
    expect(foo.$.a).toEqual(false)
    expect(foo.$.b).toEqual(true)

    // Classic
    delete foo.$.a
    foo.$.b = 0
    const fooObj = foo.$toObject()
    expect(foo.$.b).toEqual(0)
    expect(fooObj.a).toBeUndefined()
    expect(fooObj.b).toEqual(false)
  })
  /*
  it('Array', () => {
    class Foo extends Schema {
      @field
      a = Array
    }
    const foo = new Foo({
      a: 0,
    })
    expect(foo.a).toEqual(expect.any(Array))
    expect(foo.a).toHaveLength(0)

    foo.$set('a', '123')
    expect(foo.a).toEqual(expect.any(Array))
    expect(foo.a).toHaveLength(3)
  })

  it('String', () => {
    class Foo extends Schema {
      @field
      a = String
    }
    const foo = new Foo({
      a: { foo: 1 },
    })
    expect(foo.a).toEqual('[object Object]')
    foo.$set('a', 2)
    expect(foo.a).toEqual('2')
  })

  it('Number', () => {
    class Foo extends Schema {
      @field
      a = Number
    }
    const foo = new Foo({
      a: { foo: 1 },
    })
    expect(foo.a).toEqual(NaN)
    foo.$set('a', '2')
    expect(foo.a).toEqual(2)
    foo.$set('a', null)
    expect(foo.a).toEqual(0)
    foo.$set('a', NaN)
    expect(foo.a).toEqual(NaN)
    foo.$set('a', '2.50')
    expect(foo.a).toEqual(2.5)
  })

  it('Object', () => {
    class Foo extends Schema {
      @field
      a = Object
    }
    const foo = new Foo({
      a: null,
    })
    expect(foo.a).toEqual({})
    foo.$set('a', '2')
    expect(foo.a).toEqual({})
    foo.$set('a', { bar: 1 })
    expect(foo.a).toHaveProperty('bar', 1)
    foo.$set('a', [1, 2, 3])
    expect(foo.a).toEqual({})
  })

  it('Date', () => {
    const iso = '2017-11-13T19:16:51+01:00'
    const ts = 1513610527293
    class Foo extends Schema {
      @field
      a = Date
      @field
      b = Date
    }
    const foo = new Foo({
      a: iso,
      b: ts,
    })

    expect(foo.a.isValid()).toEqual(true)
    expect(foo.a.toISOString()).toEqual('2017-11-13T18:16:51.000Z')

    expect(foo.b.isValid()).toEqual(true)
    expect(foo.b.toISOString()).toEqual('2017-12-18T15:22:07.293Z')

    foo.$set('a', 'bar')
    expect(foo.a.isValid()).toEqual(false)
    expect(foo.a.toISOString()).toEqual(null)
  })
  */
})
