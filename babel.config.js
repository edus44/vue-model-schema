module.exports = {
  env: {
    test: {
      presets: [
        ['@nuxt/babel-preset-app', { loose: true, modules: 'commonjs', useBuiltIns: false }],
      ],
    },
  },
}
