const requestUpdateStore = {
  namespaced: true,
  // 需求更新
  state: {
    // 物资需求管理-需求填报-已选择物资列表
    selectedMaterialList: [],
    updateId:'',
  },
  mutations: {
  
    // 物资需求管理-需求填报-已选择物资列表
    SET_SELECTED_MATERIAL_LIST(state, data) {
      state.selectedMaterialList = data
    },
    SET_UPDATE_ID(state, data) {
      state.updateId = data
    },
  },
  actions: {
    // 物资需求管理-需求填报-已选择物资列表
    setSelectedMaterialList({ commit }, data) {
      commit('SET_SELECTED_MATERIAL_LIST', data)
    },
    setUpdateId({ commit }, data) {
      commit('SET_UPDATE_ID', data)
    }
  }
}

export default requestUpdateStore