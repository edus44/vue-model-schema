/* eslint-env jest */

import { field, Schema } from '../src'
import { getValidationsFromModel } from '../src/validationHelpers'

export default class Foo extends Schema {
  @field
  enums = {
    type: String,
    validations: {
      required: true,
      minLength: [2],
      custom() {},
    },
  }
  @field
  parent = class Bar extends Schema {
    @field
    firstChild = {
      type: String,
      validations: {
        required: true,
        minLenght: [2],
        custom() {},
      },
    }
    @field
    secondChild = {
      type: String,
      validations: {
        required: true,
        minLenght: [2],
        custom() {},
      },
    }
  }
}

it('should initialize', () => {
  const validations = getValidationsFromModel(Foo, ['enums'])
  console.log(validations)
  expect(validations).toHaveProperty('enums.required', expect.any(Function))
  expect(validations).toHaveProperty('enums.custom', Foo._fields.enums.validations.custom)
})

it('should initialize validation for nested fields', () => {
  const validations = getValidationsFromModel(Foo, ['parent.firstChild'])
  expect(validations).toHaveProperty('parent.firstChild.required', expect.any(Function))
  expect(validations).toHaveProperty(
    'parent.firstChild.custom',
    Foo._fields.parent.type._fields.firstChild.validations.custom
  )
})
