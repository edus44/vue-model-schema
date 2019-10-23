const { Any, TYPES } = require('./types')

/**
 * Normalize field definition
 * @param  {Function} initializer Descriptor initializer
 * @return {Object} Field
 */
function normalizeField(name, definition, ext) {
  let field = definition || { type: Any }

  if (Array.isArray(field)) {
    return normalizeField(name, field[0], { isArray: true })
  }

  // If value is type, wrap it
  if (typeof field == 'function') field = { type: field }

  // Default type to Any
  if (!field.type) field.type = Any

  field.name = name

  return Object.freeze(Object.assign(field, ext))
}

/**
 * Used to cast a value taking into account
 * its type and definition
 * @param  {Any} value
 * @param  {Object} field
 * @return {Any}
 */
function cast(value, field) {
  // Check if type is another schema
  if (field.type._isSchema) {
    if (field.nullable && value === null) {
      // it wont be a Schema anymore
      return null
    }
    return new field.type(value)
  }

  // Get type
  const type = TYPES[field.type.name]

  // Apply default value
  if (field.default !== undefined && value === undefined) {
    value = typeof field.default === 'function' ? field.default() : field.default
  }

  // Check if need casting
  if (value !== undefined && !type.is(value)) {
    if (field.nullable && value === null) return null
    value = type.cast(value)
  }

  return value
}

function mapArray(arr, fn) {
  return Array.isArray(arr) ? arr.map(fn) : []
}

function isMoment(obj) {
  return obj != null && obj._isAMomentObject != null
}

function getValue(val, field) {
  if (field.type._isSchema) {
    // Schema fields that can be nullable
    if (val === null) {
      return null
    } else if (typeof val.$toObject !== 'function') {
      // In case a field type Schema is nullable an the value was null, it will be a plain object
      return JSON.parse(JSON.stringify(val))
    } else {
      return val.$toObject()
    }
  } else if (isMoment(val)) {
    return val.toISOString()
  } else {
    return cast(val, field)
  }
}

module.exports = { normalizeField, cast, mapArray, getValue }
