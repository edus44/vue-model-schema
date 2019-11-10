const isPlainObject = require('lodash.isplainobject')
const get = require('lodash.get')
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
    if (!fieldName) return
    fieldName = Array.isArray(fieldName) ? fieldName.join('.') : fieldName
    const path = fieldName.replace(/\./g, '.type.fields.')
    return get(this.fields, path)
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
