const isPlainObject = require('lodash/isPlainObject')
const { getValidationsFromModel } = require('./validations')

class Model {
  constructor(name, fieldsDefs) {
    if (typeof name !== 'string') {
      fieldsDefs = name
      name = 'default'
    }
    this.name = name
    this.fields = {}
    this.identifier = 'id'
    this.defaultSort = 'createdAt'
    this.listable = []
    this.sortable = []
    this.filtrable = []

    for (const fieldName in fieldsDefs) {
      const field = normalizeField(fieldName, fieldsDefs[fieldName])
      if (field.identifier) this.identifier = fieldName
      if (field.defaultSort) this.defaultSort = fieldName
      if (field.listable) this.listable.push(field)
      if (field.sortable) this.sortable.push(field)
      if (field.filtrable) this.filtrable.push(field)

      this.fields[fieldName] = field
    }
    Object.freeze(this)
  }

  getField(fieldName) {
    const levels = Array.isArray(fieldName) ? fieldName : fieldName.split('.')
    const firstLevel = this.fields[levels[0]]
    if (levels.length > 1 && firstLevel && firstLevel.type instanceof Model) {
      return firstLevel.type.getField(levels.slice(1))
    } else {
      return firstLevel
    }
  }

  ns(fieldName) {
    return `${this.name}${fieldName ? '.' + fieldName : ''}`
  }

  getValidations(params, modifiers) {
    return getValidationsFromModel(this, params, modifiers)
  }
}

/**
 * Normalize field definition
 */
function normalizeField(name, def) {
  let field = def
  if (!isPlainObject(field)) field = { type: field }

  if (Array.isArray(field.type)) {
    field.type = field.type[0]
    field.isArray = true
  }

  if (!field.type) field.type = null

  field.name = name

  return Object.freeze(field)
}

module.exports = Model
