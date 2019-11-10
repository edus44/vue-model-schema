# vue-model-schema

Fields schema to use as base for ui components.

##### Basic usage example

```js
const model = require('vue-model-schema')
// import model from 'vue-model-schema'

const user = model('user', {
  id: {
    type: String,
    identifier: true,
  },
  address: model({
    city: String,
    country: String,
  }),
  name: {
    type: String,
    filtrable: true
    sortable:true,
  }
  createdAt: {
    type: Date,
    sortable:true,
    defaultSort: true,
  },

  fullName: String,
  tags: [String],
  metadata: null
})

console.log(user.name) // "user"
console.log(user.identifier) // "id"
console.log(user.defaultSort) // "createdAt"

console.log(user.fields) // { allDefs }
console.log(user.fields.name) // { def }
console.log(user.fields.name.type) // String

console.log(user.listable) // [ def, def, ...]
console.log(user.filtrable) // [ def, def, ...]
console.log(user.sortable) // [ def, def, ...]
```

#### Get field info

```js
const field = user.getField('address.city')
console.log(field.type) // String
```

#### Get field namespace

```js
const namespace = user.ns('fullName')
console.log(namespace) // "user.fullName"
```

#### Validations

Uses [vuelidate built-in validators](https://vuelidate.netlify.com/#sub-builtin-validators) and its [validations() system](https://vuelidate.netlify.com/#sub-basic-form)

```js
const user = model({
  name: {
    type: String,
    validations: {
      required: true, // Translate to required()
      minLength: [2], // Translate to minLength(2)
      noAdmin(value) {
        return value !== 'admin'
      },
    },
  },

  address: model({
    city: {
      type: String,
      validations: {
        required: true,
      },
    },
  }),
})

console.log(user.getValidations(['name', 'address.city']))
/*
{ 
  name: { 
    required: [Function],
    minLength: [Function],
    noAdmin: [Function: noAdmin] 
  },
  address: { 
    city: { 
      required: [Function] 
    } 
  } 
}
*/
```

#### Usage with vue and vuelidate

```js
import { validationMixin } from 'vuelidate'
import user from './user'

export default {
  mixins: [validationMixin],
  data: () => ({
    input: {
      name: '',
      address: {
        city: '',
      },
    },
  }),
  validations(){
    return{
      input: {
        ...user.getValidations(['name', 'address.city']),
      },
    },
  }
}
```

#### Dynamic validators

```js
const user = model({
  name: {
    type: String,
    validations: {
      minLength: [2], // Default arguments
      maxLength: null, // Ignored
    },
  },
})

export default {
  data: () => ({
    min: 5,
    max: 20,
    name: '',
  }),
  validations() {
    return {
      ...user.getValidations(['name'], {
        name: {
          minLength: [this.min],
          maxLength: [this.max],
        },
      }),
    }
  },
}
```
