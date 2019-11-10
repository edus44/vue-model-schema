const set = require('lodash.set')
const validators = require('vuelidate/lib/validators')

function getValidationsFromModel(model, fieldNames, modifiers = {}) {
  const validations = {}
  // Iterate fields
  for (const fieldName of fieldNames) {
    const field = model.getField(fieldName)
    if (field && field.validations) {
      const validators = getValidators(field.validations, modifiers[fieldName])
      const path = getPath(model, fieldName)
      set(validations, path, validators)
    }
  }
  return validations
}

function getPath(model, fieldName) {
  const levels = fieldName.split('.')
  const parent = model.getField(levels.slice(0, -1))
  if (parent && parent.isArray) {
    levels.splice(-1, 0, '$each')
  }
  return levels
}

function getValidators(fieldValidations, modifier = {}) {
  const v = {}

  // Iterate over field validators
  for (const name in fieldValidations) {
    const args = modifier[name] || fieldValidations[name]
    if (name === '$each') {
      v[name] = getValidators(args)
    } else {
      const validator = getValidator(name, args)
      if (validator) v[name] = validator
    }
  }
  return v
}

/**
 * Get vuelidate validator
 * @param  {String} name
 * @param  {Any} args If function return itself
 *                    If array apply to found validator
 *                    If truthy return found validator
 *                    If falsey return undefined
 * @return {Function} Validator function or undefined
 */
function getValidator(name, args) {
  if (!args) return

  if (typeof args === 'function') return args

  const fn = validators[name]

  if (!fn) return

  if (Array.isArray(args)) {
    return fn(...args)
  }

  return fn
}

module.exports = { getValidationsFromModel }
