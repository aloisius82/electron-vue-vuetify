const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      mainProcessFile: "src/main/background.ts",
      rendererProcessFile: "src/renderer/main.ts",
      removeElectronJunk: false,
    },
  },
})
