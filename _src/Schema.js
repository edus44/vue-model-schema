const { normalizeField, getValue, mapArray } = require('./field')

class Schema {
  constructor(obj) {
    if (!this.constructor.fields) {
      this.constructor.fields = {}
    }

    Object.defineProperty(this, '$$', {
      value: obj,
      enumerable: true,
    })
    this.$ = obj
    this.$cast()
  }

  static field(name, definition) {
    // Initialize fields store
    // Support inheritance
    if (!Object.prototype.hasOwnProperty.call(this, 'fields')) {
      this.fields = Object.create(this.fields || null)
    }

    this.fields[name] = normalizeField(name, definition)
  }

  /**
   * Cast every value through its field type
   * @return {this}
   */
  $cast() {
    this.$ = this.$toObject()
    return this
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
    for (const fieldName in ctor.fields) {
      // Get field definition
      const field = ctor.fields[fieldName]
      if (field.virtual && !virtuals) continue
      fn.call(this, fieldName, field)
    }
    return this
  }

  /**
   * Export schema content as object
   * @return {Object}
   */
  $toObject(opts) {
    const obj = {}
    this.$eachField((name, field) => {
      const val = this.$[name]
      if (field.isArray) {
        obj[name] = mapArray(val, x => getValue(x, field))
      } else {
        obj[name] = getValue(val, field)
      }
    }, opts)
    return obj
  }

  $clone() {
    return new this.constructor(this.$toObject())
  }
}

/**
 * Identify itself
 * @type {Boolean}
 */
Object.defineProperty(Schema, '_isSchema', {
  value: true,
})

module.exports = Schema
