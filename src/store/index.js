import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    previewUrl: '/api/system/getFile?key=', // 查看原图
    thumbnailUrl: '/api/system/image?key=',
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
