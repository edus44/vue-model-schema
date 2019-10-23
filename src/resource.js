const merge = require('lodash/merge')

function resource({ client, actions = {}, methods = {}, config = {} }) {
  Object.assign(actions, resource.configuration.actions)
  Object.assign(methods, resource.configuration.methods)

  for (const actionName in actions) {
    methods[actionName] = inputConfig => {
      return request(inputConfig, actions[actionName], config)
    }
  }

  return methods
}

resource.configuration = {
  methods: {
    findOne() {},
  },
  actions: {
    list: {
      method: 'get',
    },
    detail: {
      method: 'get',
      prependUrl: '/:id',
    },
    create: {
      method: 'post',
    },
    update: {
      method: 'put',
      prependUrl: '/:id',
    },
    delete: {
      method: 'delete',
      prependUrl: '/:id',
    },
    multiDelete: {
      method: 'delete',
    },
  },
}

function request(inputConfig, actionConfig, resourceConfig) {
  // Merge configs, sort by precedence
  const config = merge({}, resourceConfig, actionConfig, inputConfig)

  // Compose url
  const fullUrl = `${config.appendUrl || ''}${config.url || ''}${config.prependUrl || ''}`
  config.url = interpolate(fullUrl, config.urlParams)
  console.log(config)
  return config
}

function interpolate(str, values) {
  for (const key in values) str = str.replace(`:${key}`, encodeURIComponent(values[key]))
  return str
}

module.exports = resource
