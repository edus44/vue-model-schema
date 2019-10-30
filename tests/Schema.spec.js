/* eslint-env jest */
import { field, virtual, Schema } from '../src'

describe('Schema class', () => {
  it('should be a function', () => {
    expect(Schema).toEqual(expect.any(Function))
  })

  it('should have hidden identify static property', () => {
    const descriptor = Object.getOwnPropertyDescriptor(Schema, '_isSchema')
    expect(descriptor.enumerable).toEqual(false)
    expect(descriptor.writable).toEqual(false)
    expect(descriptor.value).toEqual(true)
  })
})

describe('Schema normal field instantiation', () => {
  it('should evaluate', () => {
    class Foo extends Schema {
      @field name = String
    }
    expect(Foo._fields.name).toHaveProperty('type', String)
  })

  it('should instance with default value', () => {
    class Foo extends Schema {
      @field name = { default: 'Bob' }
    }
    const foo = new Foo()
    expect(foo).toBeInstanceOf(Foo)
    expect(foo.name).toBe('Bob')
  })

  it('should instance with value', () => {
    class Foo extends Schema {
      @field name = { default: 'Bob' }
    }
    const foo = new Foo({ name: 'Alice' })
    expect(foo.name).toBe('Alice')
  })

  it('should change a value', () => {
    class Foo extends Schema {
      @field name
    }
    const foo = new Foo({ name: 'Alice' })
    foo.$set('name', 'Bob')
    expect(foo.name).toBe('Bob')
  })

  it('should fail setting a non-exist key', () => {
    class Foo extends Schema {}
    const foo = new Foo()
    expect(() => foo.$set('name', 'Bob')).toThrow('Field name does not exist in Foo')
  })

  it('should instance without fields', () => {
    class Foo extends Schema {}
    const foo = new Foo({ name: 'Alice' })
    expect(foo.name).toBeUndefined()
  })

  it('should export to object', () => {
    class Address extends Schema {
      @field city
    }
    class Foo extends Schema {
      @field name
      @field address = Address
    }
    const foo = new Foo({ name: 'Bob', address: { city: 'NY' } })
    const obj = foo.$toObject()

    expect(obj).toHaveProperty('name', 'Bob')
    expect(obj).toHaveProperty('address.city', 'NY')
    expect(foo.address).toBeInstanceOf(Address)
  })

  it('should return fields', async () => {
    class Foo extends Schema {
      @field name
    }
    expect(Foo.getFields()).toBe(Foo._fields)
  })

  it('should return fields from a string path', async () => {
    class Foo extends Schema {
      @field name
      @field properties = class Properties extends Schema {
        @field surname
      }
    }
    expect(Foo.getField('name')).toBe(Foo._fields.name)
    expect(Foo.getField('properties.surname')).toBe(Foo._fields.properties.type._fields.surname)
  })

  it.skip('should return namespace', async () => {
    @resource({
      name: 'Foo',
    })
    class Foo extends Schema {}
    expect(Foo.ns()).toBe('model.Foo')
    expect(Foo.ns('name')).toBe('model.Foo.name')
  })

  it('should clone object', async () => {
    class Foo extends Schema {
      @field name
    }
    const foo = new Foo({ name: 'alice' })
    const cloned = Foo.from(foo)

    expect(cloned).not.toBe(foo)
    expect(cloned.$toObject()).toEqual(foo.$toObject())
  })

  it('should create from object', async () => {
    class Foo extends Schema {
      @field name
    }
    const foo = Foo.from({ name: 'alice' })

    expect(foo).toBeInstanceOf(Foo)
    expect(foo.name).toBe('alice')
  })
})

describe('Fields properties', () => {
  it('should save fields properties', async () => {
    const def = {
      type: String,
      sortable: true,
      listable: true,
      filtrable: true,
      validations: {},
      order: 100,
    }
    class Foo extends Schema {
      @field name = def
    }
    expect(Foo._fields.name).toMatchObject(def)
  })

  it('should collect fields info', async () => {
    class Foo extends Schema {
      @field a = { sortable: true }
      @field b = { listable: true }
      @field c = { filtrable: true }
    }
    expect(Foo.getFieldsInfo()).toMatchSnapshot()
  })

  it('should extend fields info', async () => {
    class Foo extends Schema {
      @field a = { sortable: true }
      @field b = { listable: true }
      @field c = { filtrable: true }
    }
    expect(
      Foo.getFieldsInfoExtended({
        d: { listable: true },
        c: { filtrable: false },
      })
    ).toMatchSnapshot()
  })
})

describe('Schema basic instance methods', () => {
  it.skip('should return id', async () => {
    @resource({
      name: 'Foo',
      rowId: 'myId',
    })
    class Foo extends Schema {
      @field myId
    }
    const foo = new Foo({ myId: 'bar' })
    expect(foo.$id()).toBe('bar')
  })

  it.skip('should if is new', async () => {
    @resource({
      name: 'Foo',
      rowId: 'myId',
    })
    class Foo extends Schema {
      @field myId
    }
    const foo1 = new Foo({ myId: 'bar' })
    const foo2 = new Foo({})
    expect(foo1.$isNew()).toBe(false)
    expect(foo2.$isNew()).toBe(true)
  })

  it('should return own schema', async () => {
    class Foo extends Schema {}
    const foo = new Foo()
    expect(foo.$getSchema()).toBe(Foo)
  })
})

describe('Schema types', () => {
  it('Boolean', () => {
    class Foo extends Schema {
      @field a = Boolean
      @field b = Boolean
    }

    // Initial casting
    const foo = new Foo({ a: 0, b: '0' })
    expect(foo.a).toEqual(false)
    expect(foo.b).toEqual(true)

    // Using setters
    foo.$set('a', 1)
    foo.$unset('b')
    expect(foo.a).toEqual(true)
    expect(foo.b).toBeUndefined()

    // Classic
    delete foo.a
    foo.b = 0
    const fooObj = foo.$toObject()
    expect(foo.b).toEqual(0)
    expect(fooObj.a).toBeUndefined()
    expect(fooObj.b).toEqual(false)
  })

  it('Array', () => {
    class Foo extends Schema {
      @field a = Array
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
      @field a = String
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
      @field a = Number
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
      @field a = Object
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
      @field a = Date
      @field b = Date
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
})

describe('Schema array field instantiation', () => {
  it('should evaluate', () => {
    class Foo extends Schema {
      @field names = [String]
    }
    expect(Foo._fields.names).toHaveProperty('type', String)
    expect(Foo._fields.names).toHaveProperty('isArray', true)
  })

  it('should instantiate with simple type', () => {
    class Foo extends Schema {
      @field names = [String]
    }
    const foo = new Foo({ names: ['Alice', 'Bob'] })
    expect(foo).toBeInstanceOf(Foo)
    expect(foo.names).toHaveLength(2)
    expect(foo.names[0]).toEqual('Alice')
    expect(foo.names[1]).toEqual('Bob')
  })

  it('should instantiate always as array', () => {
    class Foo extends Schema {
      @field names = [String]
      @field cities = []
    }
    const foo = new Foo({ names: 'foo', cities: { ny: true } })
    expect(foo).toBeInstanceOf(Foo)
    expect(foo.names).toEqual(expect.any(Array))
    expect(foo.names).toHaveLength(0)
    expect(foo.cities).toEqual(expect.any(Array))
    expect(foo.cities).toHaveLength(0)
  })

  it('should instantiate with Schema type', () => {
    class Name extends Schema {
      @field first
      @field second
    }
    class Foo extends Schema {
      @field names = [Name]
    }
    const foo = new Foo({ names: [{ first: 'John', second: 'Doe' }] })
    expect(foo.names[0]).toBeInstanceOf(Name)
    expect(foo.names[0]).toHaveProperty('first', 'John')
    expect(foo.names[0]).toHaveProperty('second', 'Doe')
  })

  it('should instantiate with Schema type in type property', () => {
    class Name extends Schema {
      @field first
      @field second
    }
    class Foo extends Schema {
      @field names = [
        {
          type: Name,
        },
      ]
    }
    const foo = new Foo({ names: [{ first: 'John', second: 'Doe' }] })
    expect(foo.names[0]).toBeInstanceOf(Name)
    expect(foo.names[0]).toHaveProperty('first', 'John')
    expect(foo.names[0]).toHaveProperty('second', 'Doe')
  })

  it('should export with Schema type', () => {
    class Name extends Schema {
      @field first
      @field second
    }
    class Foo extends Schema {
      @field names = [Name]
    }
    const foo = new Foo({ names: [{ first: 'John', second: 'Doe' }] })
    const obj = foo.$toObject()
    expect(obj.names[0]).toHaveProperty('first', 'John')
    expect(obj.names[0]).toHaveProperty('second', 'Doe')
  })

  it('should add a casted item to array', () => {
    class Foo extends Schema {
      @field a = [Number]
    }
    const foo = new Foo({ a: [1, '2', ['3']] })
    foo.$add('a', '4')
    expect(foo.a).toEqual([1, 2, 3, 4])
    foo.a.push({})

    const fooObj = foo.$toObject()
    expect(fooObj.a).toEqual([1, 2, 3, 4, NaN])
  })

  it('should cast values setted without set method', () => {
    class Foo extends Schema {
      @field a = Boolean
      @field b = [Number]
    }
    const foo = new Foo()
    foo.a = 1
    foo.b = ['1', ['2']]
    foo.$cast()
    expect(foo.a).toEqual(true)
    expect(foo.b).toEqual([1, 2])
  })
})

it('should check nullable schema type field', () => {
  class Name extends Schema {
    @field name
  }
  class Fullname extends Schema {
    @field first = {
      type: Name,
    }
    @field last = {
      type: Name,
      nullable: true,
    }
  }
  const fullname = new Fullname()
  fullname.first.name = 'Bat'
  fullname.last.name = null
  fullname.$cast()
  expect(fullname.first).toEqual({ name: 'Bat' })
  expect(fullname.last).toEqual({ name: null })
})

it('should break null schema field not nullable', () => {
  class Name extends Schema {
    @field name
  }
  class Fullname extends Schema {
    @field first = {
      type: Name,
    }
    @field last = {
      type: Name,
      nullable: false,
    }
  }
  const fullname = new Fullname()
  fullname.first.name = 'Bat'
  fullname.last = null
  try {
    fullname.$cast()
  } catch (error) {
    expect(error).toBeDefined()
  }
  expect(fullname.first).toEqual({ name: 'Bat' })
})

describe('Schema inheritance', () => {
  it('should inherit fields from other Schema', () => {
    class Base extends Schema {
      @field x = { type: Number, default: 0 }
      @field y = { type: Number, default: 0 }
    }
    class Cube extends Base {
      @field width = { type: Number, default: 0 }
      @field height = { type: Number, default: 0 }
    }
    const cube = new Cube({ x: 1, height: 1 })
    const cubeObj = cube.$toObject()
    const expected = { width: 0, height: 1, x: 1, y: 0 }

    // Each class has its own fields
    expect(Object.keys(Base._fields)).toEqual(['x', 'y'])
    expect(Object.keys(Cube._fields)).toEqual(['width', 'height'])

    // This method return the proto chain fields
    expect(Base.getFieldNames()).toEqual(['x', 'y'])
    expect(Cube.getFieldNames()).toEqual(['width', 'height', 'x', 'y'])

    // Cube fields handling includes all proto chain fields
    expect(cube).toMatchObject(expected)
    expect(cubeObj).toMatchObject(expected)
  })

  it('should inherit methods', () => {
    class Base extends Schema {
      isBase() {
        return true
      }
    }
    class Cube extends Base {
      isCube() {
        return true
      }
    }
    const cube = new Cube()
    expect(cube.isBase()).toEqual(true)
    expect(cube.isCube()).toEqual(true)
  })

  it.skip('should inherit same resource', () => {
    @resource({ name: 'Base', service: 'foo' })
    class Base extends Schema {}
    class Cube extends Base {}

    expect(Cube._resource).toEqual(Base._resource)
  })
})

describe('Schema virtuals', () => {
  it('should inherit fields from other Schema', () => {
    class Foo extends Schema {
      @field x
      @virtual
      bar = {
        type: String,
        get() {
          return this.x * 2
        },
      }
    }
    const foo = new Foo({ x: 1 })
    expect(foo.bar).toBe(2)
    expect(foo.$toObject()).toMatchObject({ x: 1 })
    expect(foo.$toObject({ virtuals: true })).toMatchObject({ x: 1, bar: '2' })
  })
})

describe('Schema namespace', () => {
  it.skip('should get namespace ', () => {
    @resource({
      name: 'Foo',
      service: 'core',
    })
    class Foo extends Schema {
      @field bar = String
    }
    expect(Foo.ns('bar')).toBe('model.Foo.bar')
  })
})
