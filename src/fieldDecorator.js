import { Any } from './types'

/**
 * Field properties
 * 
    type: Function,
    sortable: Boolean || Object,
    listable: Boolean || Object,
    filtrable: Boolean || Object,
    validations: Object,
    order: Number
 */

/**
 * Normalize field definition
 * @param  {Function} initializer Descriptor initializer
 * @return {Object} Field
 */
function normalizeField(name, initializer, ext) {
  let field
  // If not initial value return default def
  if (typeof initializer === 'function') field = initializer()
  else field = { type: Any }

  if (Array.isArray(field)) {
    const arrayField = normalizeField(name, () => field[0], { isArray: true })
    return arrayField
  }

  // If value is type, wrap it
  if (typeof field !== 'object') field = { type: field }

  // Default type to Any
  if (!field.type) field.type = Any

  field.name = name

  return Object.freeze(Object.assign(field, ext))
}

/**
 * Field decorator for Model classes
 * @param  {Function} target
 * @param  {String} name
 * @param  {Object} descriptor
 * @return {Object}
 */
export function fieldDecorator(target, name, descriptor) {
  const ctor = target.constructor

  // Initialize fields store
  // Support inheritance
  if (!Object.prototype.hasOwnProperty.call(ctor, '_fields')) {
    ctor._fields = Object.create(ctor._fields || null)
  }

  // Save field definition
  ctor._fields[name] = normalizeField(name, descriptor.initializer)

  return {
    configurable: false,
    enumerable: true,
    writable: true,
  }
}

/**
 * Virtual field decorator for Model classes
 * @param  {Function} target
 * @param  {String} name
 * @param  {Object} descriptor
 * @return {Object}
 */
export function virtualFieldDecorator(target, name, descriptor) {
  const ctor = target.constructor

  // Initialize fields store
  // Support inheritance
  if (!Object.prototype.hasOwnProperty.call(ctor, '_fields')) {
    ctor._fields = Object.create(ctor._fields || null)
  }

  // Save field definition
  ctor._fields[name] = normalizeField(name, descriptor.initializer, { virtual: true })

  const get = typeof ctor._fields[name].get === 'function' ? ctor._fields[name].get : () => {}
  const set = typeof ctor._fields[name].set === 'function' ? ctor._fields[name].set : () => {}

  return {
    configurable: false,
    enumerable: true,
    get,
    set,
  }
}
