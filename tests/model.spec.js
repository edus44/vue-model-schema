const model = require('../src')
const Model = require('../src/Model')

describe('basics', () => {
  it('should be a function', () => {
    expect(model).toEqual(expect.any(Function))
  })

  it('should return an instance of model', () => {
    const foo = model()
    expect(foo).toBeInstanceOf(Model)
  })
})

describe('creation', () => {
  it('should create with no type', () => {
    const foo = model({
      name: null,
    })
    expect(foo.fields.name).toHaveProperty('type', null)
  })

  it('should create with short mode', () => {
    const foo = model({
      name: String,
    })
    expect(foo.fields.name).toHaveProperty('type', String)
  })

  it('should create with normal fields', () => {
    const foo = model({
      name: {
        type: String,
      },
    })
    expect(foo.fields.name).toHaveProperty('type', String)
  })
  it('should create with nested models', () => {
    const foo = model({
      name: model({
        first: String,
      }),
    })
    expect(foo.fields.name.type.fields.first).toHaveProperty('type', String)
  })
})

describe('creation array mode', () => {
  it('should create with no type in array mode', () => {
    const foo = model({
      name: [null],
    })
    expect(foo.fields.name).toHaveProperty('type', null)
    expect(foo.fields.name).toHaveProperty('isArray', true)
  })

  it('should create with short mode in array mode', () => {
    const foo = model({
      name: [String],
    })
    expect(foo.fields.name).toHaveProperty('type', String)
    expect(foo.fields.name).toHaveProperty('isArray', true)
  })

  it('should create with normal fields in array mode', () => {
    const foo = model({
      name: {
        type: [String],
      },
    })
    expect(foo.fields.name).toHaveProperty('type', String)
    expect(foo.fields.name).toHaveProperty('isArray', true)
  })
})

describe('namespace', () => {
  it('should have default namespace', () => {
    const foo = model()
    expect(foo.name).toBe('default')
    expect(foo.ns()).toBe('default')
  })
  it('should create with namespace', () => {
    const foo = model('foo', {
      name: String,
    })
    expect(foo.name).toBe('foo')
    expect(foo.ns()).toBe('foo')
    expect(foo.fields.name).toHaveProperty('type', String)
  })
  it('should return namespaced field', () => {
    const foo = model('foo', {
      name: String,
    })
    expect(foo.ns('name')).toBe('foo.name')
  })
  it('should return default namespaced field', () => {
    const foo = model({
      name: String,
    })
    expect(foo.ns('name')).toBe('default.name')
  })
})

describe('getField helper', () => {
  it('should return field info', () => {
    const foo = model({
      name: [String],
    })
    const field = foo.getField('name')
    expect(field).toHaveProperty('type', String)
    expect(field).toHaveProperty('isArray', true)
  })
  it('should return nested field info', () => {
    const foo = model({
      name: model({
        first: String,
      }),
    })
    const field = foo.getField('name.first')
    expect(field).toHaveProperty('type', String)
  })
})

describe('attributes', () => {
  it('should have default values', () => {
    const foo = model()
    expect(foo).toHaveProperty('identifier', 'id')
    expect(foo).toHaveProperty('defaultSort', 'createdAt')
  })
  it('should have settted values', () => {
    const foo = model({
      name: {
        defaultSort: true,
      },
      email: {
        identifier: true,
      },
    })
    expect(foo).toHaveProperty('identifier', 'email')
    expect(foo).toHaveProperty('defaultSort', 'name')
  })
  it('should index able-properties', () => {
    const foo = model({
      name: {
        listable: true,
      },
      email: {
        listable: true,
        sortable: true,
      },
      createdAt: {
        listable: true,
        sortable: true,
        filtrable: true,
      },
    })
    expect(foo.listable).toEqual([foo.fields.name, foo.fields.email, foo.fields.createdAt])
    expect(foo.sortable).toEqual([foo.fields.email, foo.fields.createdAt])
    expect(foo.filtrable).toEqual([foo.fields.createdAt])
  })
})

describe('validations', () => {
  it('should return validations object', () => {
    const foo = model({
      enums: {
        type: String,
        validations: {
          required: true,
          minLength: [2],
          custom() {},
        },
      },
      parent: model({
        firstChild: {
          type: String,
          validations: {
            required: true,
            minLenght: [2],
            custom() {},
          },
        },
        secondChild: {
          type: String,
          validations: {
            required: true,
            minLenght: [2],
            custom() {},
          },
        },
      }),
    })

    const validations = foo.getValidations(['enums', 'parent.firstChild'])
    expect(validations).toHaveProperty('enums.required', expect.any(Function))
    expect(validations).toHaveProperty('enums.custom', foo.fields.enums.validations.custom)

    expect(validations).toHaveProperty('parent.firstChild.required', expect.any(Function))
    expect(validations).toHaveProperty(
      'parent.firstChild.custom',
      foo.fields.parent.type.fields.firstChild.validations.custom
    )
  })

  it('should return validations object with modifier', () => {
    const foo = model({
      address: model({
        city: {
          type: String,
          validations: {
            custom() {},
          },
        },
      }),
    })
    const custom2 = () => {}

    const validations = foo.getValidations(['address.city'], {
      'address.city': { custom: custom2 },
    })
    expect(validations).toHaveProperty('address.city.custom', custom2)
  })

  it('should expand $each validators', () => {
    const foo = model({
      tags: {
        type: [String],
        validations: {
          required: true,
          $each: {
            minLength: [2],
          },
        },
      },
    })

    const validations = foo.getValidations(['tags'])
    expect(validations).toHaveProperty('tags.required', expect.any(Function))
    expect(validations).toHaveProperty('tags.$each.minLength', expect.any(Function))
  })

  it('should respect $each for isArray types', () => {
    const foo = model({
      tags: {
        type: [
          model({
            name: {
              type: String,
              validations: {
                minLength: [2],
              },
            },
          }),
        ],
        validations: {
          required: true,
        },
      },
    })

    const validations = foo.getValidations(['tags', 'tags.name'])
    expect(validations).toHaveProperty('tags.required', expect.any(Function))
    expect(validations).toHaveProperty('tags.$each.name.minLength', expect.any(Function))
  })
})
