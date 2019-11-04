const set = require('lodash.set')
const validators = require('vuelidate/lib/validators')

function getValidationsFromModel(model, params) {
  const validations = {}
  const modifiers = typeof params === 'object' ? params : {}
  const fieldNames = Array.isArray(params) ? params : Object.keys(params)
  // Iterate fields
  for (const fieldName of fieldNames) {
    const fieldValidations = getFieldValidations(model, fieldName, modifiers[fieldName])
    if (fieldValidations) set(validations, fieldName, fieldValidations)
  }

  return validations
}

function getFieldValidations(model, fieldName, modifier = {}) {
  // Get validations from field definition
  const field = model.getField(fieldName)
  if (!field || !field.validations)
    throw new Error(`Validations for ${model.ns(fieldName)} not found`)
  const v = {}

  // Iterate over field validators
  for (const name in field.validations) {
    const args = modifier[name] || field.validations[name]
    const validator = getValidator(name, args)
    if (validator) v[name] = validator
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
