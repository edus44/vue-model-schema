/* eslint-env jest */
import { field, virtual } from '../src'
import { Any } from '../src/types'

describe('field decorator', () => {
  it('should be a function', () => {
    expect(field).toEqual(expect.any(Function))
  })

  it('should initialize fields store', () => {
    const constructor = {}
    field({ constructor }, 'foo', {})

    expect(constructor._fields).toEqual(expect.any(Object))
  })

  it('should return valid descriptor', () => {
    const descriptor = field({ constructor: {} }, 'foo', {})

    expect(descriptor.initializer).toBeUndefined()
    expect(descriptor.writable).toEqual(true)
  })

  it('should set field type to Any if value is empty', () => {
    const constructor = {}
    field({ constructor }, 'foo', {})

    expect(constructor._fields.foo).toHaveProperty('type', Any)
  })

  it('should set field type to Any if type is not defined', () => {
    const constructor = {}
    const initializer = () => ({})
    field({ constructor }, 'foo', { initializer })

    expect(constructor._fields.foo).toHaveProperty('type', Any)
  })

  it('should set field type from primitive', () => {
    const constructor = {}
    const initializer = () => String
    field({ constructor }, 'foo', { initializer })

    expect(constructor._fields.foo).toHaveProperty('type', String)
  })

  it('should set field from normal object', () => {
    const constructor = {}
    const initializer = () => ({ type: String, default: 'bar' })
    field({ constructor }, 'foo', { initializer })

    expect(constructor._fields.foo).toHaveProperty('type', String)
    expect(constructor._fields.foo).toHaveProperty('default', 'bar')
  })

  it('should set two or more fields', () => {
    const constructor = {}
    field({ constructor }, 'foo', {})
    field({ constructor }, 'bar', {})

    expect(constructor._fields.foo).toHaveProperty('type', Any)
    expect(constructor._fields.bar).toHaveProperty('type', Any)
  })

  it('should support array fields without item', () => {
    const constructor = {}
    const initializer = () => []
    field({ constructor }, 'foo', { initializer })

    expect(constructor._fields.foo).toHaveProperty('type', Any)
    expect(constructor._fields.foo).toHaveProperty('isArray', true)
  })

  it('should support array fields with type item', () => {
    const constructor = {}
    const initializer = () => [String]
    field({ constructor }, 'foo', { initializer })

    expect(constructor._fields.foo).toHaveProperty('type', String)
    expect(constructor._fields.foo).toHaveProperty('isArray', true)
  })
})

describe('virtual decorator', () => {
  it('should set virtual to true in descriptor', () => {
    const constructor = {}
    const initializer = () => {}
    const descriptor = virtual({ constructor }, 'foo', { initializer })

    expect(constructor._fields.foo).toHaveProperty('virtual', true)
    expect(descriptor).toHaveProperty('set', expect.any(Function))
    expect(descriptor).toHaveProperty('get', expect.any(Function))
  })

  it('should save setter and getters in descriptor', () => {
    const constructor = {}
    const initializer = () => ({
      get() {},
      set() {},
    })
    const descriptor = virtual({ constructor }, 'foo', { initializer })

    expect(descriptor).toHaveProperty('set', expect.any(Function))
    expect(descriptor).toHaveProperty('get', expect.any(Function))
  })
})
