const Schema = require('../src/Schema')
const { Any } = require('../src/types')

const field = (ctor, ...args) => Schema.field.apply(ctor, args)

describe('field decorator', () => {
  it('should be a function', () => {
    expect(field).toEqual(expect.any(Function))
  })

  it('should initialize fields store', () => {
    const constructor = {}
    field(constructor, 'foo', {})

    expect(constructor._fields).toEqual(expect.any(Object))
  })

  it('should set field type to Any if value is empty', () => {
    const constructor = {}
    field(constructor, 'foo')

    expect(constructor._fields.foo).toHaveProperty('type', Any)
  })

  it('should set field type to Any if type is not defined', () => {
    const constructor = {}
    const definition = {}
    field(constructor, 'foo', definition)

    expect(constructor._fields.foo).toHaveProperty('type', Any)
  })

  it('should set field type from primitive', () => {
    const constructor = {}
    const definition = String
    field(constructor, 'foo', definition)

    expect(constructor._fields.foo).toHaveProperty('type', String)
  })

  it('should set field from normal object', () => {
    const constructor = {}
    const definition = { type: String, default: 'bar' }
    field(constructor, 'foo', definition)

    expect(constructor._fields.foo).toHaveProperty('type', String)
    expect(constructor._fields.foo).toHaveProperty('default', 'bar')
  })

  it('should set two or more fields', () => {
    const constructor = {}
    field(constructor, 'foo', {})
    field(constructor, 'bar', {})

    expect(constructor._fields.foo).toHaveProperty('type', Any)
    expect(constructor._fields.bar).toHaveProperty('type', Any)
  })

  it('should support array fields without item', () => {
    const constructor = {}
    const definition = []
    field(constructor, 'foo', definition)

    expect(constructor._fields.foo).toHaveProperty('type', Any)
    expect(constructor._fields.foo).toHaveProperty('isArray', true)
  })

  it('should support array fields with type item', () => {
    const constructor = {}
    const definition = [String]
    field(constructor, 'foo', definition)

    expect(constructor._fields.foo).toHaveProperty('type', String)
    expect(constructor._fields.foo).toHaveProperty('isArray', true)
  })
})

describe.skip('virtual decorator', () => {
  it('should set virtual to true in descriptor', () => {
    const constructor = {}
    const definition = {}
    const descriptor = virtual(constructor, 'foo', definition)

    expect(constructor._fields.foo).toHaveProperty('virtual', true)
    expect(descriptor).toHaveProperty('set', expect.any(Function))
    expect(descriptor).toHaveProperty('get', expect.any(Function))
  })

  it('should save setter and getters in descriptor', () => {
    const constructor = {}
    const definition = {
      get() {},
      set() {},
    }
    const descriptor = virtual(constructor, 'foo', definition)

    expect(descriptor).toHaveProperty('set', expect.any(Function))
    expect(descriptor).toHaveProperty('get', expect.any(Function))
  })
})
