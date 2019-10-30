import set from 'lodash.set'
import * as validators from 'vuelidate/lib/validators'

export function getValidationsFromModel(model, params) {
  const v = {}
  const modifiers = typeof params === 'object' ? params : {}
  const fieldNames = Array.isArray(params) ? params : Object.keys(params)
  // Iterate fields
  for (const fieldName of fieldNames) {
    const fieldValidations = getFieldValidations(model, fieldName, modifiers[fieldName], this)
    if (fieldValidations) set(v, fieldName, fieldValidations)
  }

  return v
}

function getFieldValidations(model, fieldName, modifier = {}, vm) {
  // Get validations from field definition
  const field = model.getField(fieldName)
  const validations = field && typeof field.validations === 'object' && field.validations
  if (!validations) return
  const v = {}

  // Iterate over field validators
  for (const name in validations) {
    const args = modifier[name] || validations[name]
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
