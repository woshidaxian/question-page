const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  assetsDir: 'static',
  productionSourceMap: false,
  devServer: {
    proxy: 'http://localhost:9898'
    // proxy: 'http://192.168.5.99:9898'
    // proxy: 'https://www.wghuang.icu'
  }
})
