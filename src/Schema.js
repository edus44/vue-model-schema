/* eslint-disable new-cap */
import TYPES from './types'
import sortBy from 'lodash.sortby'
import extendWith from 'lodash.assigninwith'
import extend from 'lodash.assignin'
import { getValidationsFromModel } from './validationHelpers'
import moment from 'moment'

export default class Schema {
  /**
   * Initialize every field
   * @param  {Object} obj
   * @return {this}
   */
  constructor(obj) {
    // Shim fields store
    if (!this.constructor._fields) {
      this.constructor._fields = {}
    }

    Object.defineProperty(this, '$', {
      value: obj,
    })
    this.$setObject(obj)
  }

  /**
   * Identify itself
   * @type {Boolean}
   */
  @hidden
  static _isSchema = true

  /**
   * Return all fieldNames sorted by order property (inherited also)
   * @return {Array<String>}
   */
  static getFieldNames() {
    if (!Object.prototype.hasOwnProperty.call(this, '_fieldNames')) {
      const tmp = []
      for (const fieldName in this._fields) tmp.push(fieldName)

      this._fieldNames = sortBy(tmp, x => this._fields[x].order || 0)
    }
    return this._fieldNames
  }

  static getFields() {
    return this._fields
  }

  static getField(name) {
    const levels = name.split('.')
    const firstLevel = this._fields[levels[0]]
    if (firstLevel && firstLevel.type._isSchema) {
      return firstLevel.type.getField(levels.slice(1).join('.'))
    } else {
      return firstLevel
    }
  }

  static getFieldsInfo() {
    if (!Object.prototype.hasOwnProperty.call(this, '_fieldsInfo')) {
      const fieldNames = this._fieldNames || this.getFieldNames()
      this._fieldsInfo = fieldNames.reduce(
        (acc, fieldName) => {
          const field = this._fields[fieldName]
          if (field.filtrable) acc.filtrable.push(field)
          if (field.sortable) acc.sortable.push(field)
          if (field.listable) acc.listable.push(field)
          return acc
        },
        {
          sortable: [],
          filtrable: [],
          listable: [],
        }
      )
      Object.freeze(this._fieldsInfo)
    }
    return this._fieldsInfo
  }

  /**
   * As getFieldsInfo but with optional fields to extend
   * over own fields
   * Creates a virtual model merging own an extended fields to
   * then sort and returns info
   * @param  {Object} extendFields Same format as _fields
   * @return {Object} Like getFieldsInfo
   */
  static getFieldsInfoExtended(extendFields) {
    if (typeof extendFields !== 'object') return this.getFieldsInfo()

    const virtualModel = {
      _fields: extendWith({}, this._fields, extendFields, (a, b, name) => {
        return extend({ name }, a, b)
      }),
    }
    this.getFieldNames.call(virtualModel)
    return this.getFieldsInfo.call(virtualModel)
  }

  static get namespace() {
    return this._resource.namespace
  }

  static ns(fieldName) {
    fieldName = fieldName ? '.' + fieldName : ''
    return `${this.namespace}${fieldName}`
  }

  /**
   * Clone or create a new instance
   * @param  {Object} obj Optional
   * @return {Object} Instance of itself
   */
  static from(obj) {
    if (obj instanceof this) return obj.$clone()
    else return new this(obj)
  }

  static getValidations(fieldNames) {
    return getValidationsFromModel(this, fieldNames)
  }

  /**
   * Set a key and cast its value
   * @param {String} key
   * @param {Any} val
   * @return {this}
   */
  $set(key, val) {
    const field = this.constructor._fields[key]
    if (!field) throw new Error(`Field ${key} does not exist in ${this.constructor.name}`)

    if (field.isArray) {
      this[key] = mapArray(val, x => cast(x, field))
    } else {
      this[key] = cast(val, field)
    }
    return this
  }

  /**
   * Set a property as undefined
   * @param  {String} key
   * @return {this}
   */
  $unset(key) {
    delete this[key]
    return this
  }

  /**
   * Add a value to a array field
   * @param {String} key isArray Field
   * @param {Any} val
   * @return {this}
   */
  $add(key, val) {
    const field = this.constructor._fields[key]
    if (!field) throw new Error(`Field ${key} does not exist in ${this.constructor.name}`)
    if (!field.isArray) throw new Error(`Field ${key} in ${this.constructor.name} is not array`)
    this[key].push(cast(val, field))
    return this
  }

  /**
   * Cast every value through its field type
   * @return {this}
   */
  $cast() {
    this.$eachField(name => {
      this.$set(name, this[name])
    })
    return this
  }

  /**
   * Assign values recursively
   * overriding every one
   * @param {Object} obj
   * @return {this}
   */
  $setObject(obj = {}) {
    // Initalize field values
    this.$eachField(name => {
      this.$set(name, obj[name])
    })

    return this
  }

  /**
   * Export schema content as object
   * @return {Object}
   */
  $toObject(opts) {
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
      } else if (moment.isMoment(val)) {
        return val.toISOString()
      } else {
        return cast(val, field)
      }
    }

    const obj = {}
    this.$eachField((name, field) => {
      const val = this[name]
      if (field.isArray) {
        obj[name] = mapArray(val, x => getValue(x, field))
      } else {
        obj[name] = getValue(val, field)
      }
    }, opts)

    if (typeof this.constructor.$transform === 'function')
      return this.constructor.$transform(obj, opts)

    return obj
  }

  /**
   * Iterate over fields
   * @param  {Function} fn Arguments: name,definition,isSchema
   * @return {this}
   */
  $eachField(fn, opts) {
    // Get constructor function
    const ctor = this.constructor
    const virtuals = opts && opts.virtuals === true

    // Iterate over fields
    for (const fieldName in ctor._fields) {
      // Get field definition
      const field = ctor._fields[fieldName]
      if (field.virtual && !virtuals) continue
      fn.call(this, fieldName, field)
    }
    return this
  }

  $clone() {
    return new this.constructor(this.$toObject())
  }

  $id() {
    return this[this.constructor._resource.rowId]
  }

  $isNew() {
    return !this.$id()
  }

  $getSchema() {
    return this.constructor
  }
}

/**
 * Decorator to set a property as
 * non writable nor enumerable
 */
function hidden(target, name, descriptor) {
  descriptor.writable = false
  descriptor.enumerable = false
  return descriptor
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
