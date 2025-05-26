const permission = {
  state: {
    bomData: [],
    copyBomData: []
  },
  mutations: {
    SET_BOM_DATA: (state, routes) => {
      state.bomData = routes
    },
    SET_COPY_BOM_DATA: (state, routes) => {
      state.copyBomData = routes
    },
  },
  actions: {
    setBomData({ commit }, device) {
      commit('SET_BOM_DATA', device)
    },
    setCopyBomData({ commit }, device) {
      commit('SET_COPY_BOM_DATA', device)
    }
  }
}

export default permission