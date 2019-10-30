import isPlainObject from 'lodash.isplainobject'
import moment from 'moment'

export const Any = { name: 'Any' }

export default {
  Any: {
    is: () => true,
    // cast: x => x,
  },
  Boolean: {
    is: x => x === true || x === false,
    cast: Boolean,
  },
  Array: {
    is: Array.isArray,
    cast: x => (x ? Array.from(x) : []),
  },
  String: {
    is: x => typeof x === 'string',
    cast: str => (str ? String(str) : ''),
  },
  Number: {
    is: x => typeof x === 'number',
    cast: Number,
  },
  Object: {
    is: () => false,
    cast: x => (isPlainObject(x) ? JSON.parse(JSON.stringify(x)) : {}),
  },
  Date: {
    is: x => moment.isMoment(x),
    cast(x) {
      if (typeof x === 'number') {
        return moment(x)
      } else {
        return moment(x, moment.ISO_8601)
      }
    },
  },
}
