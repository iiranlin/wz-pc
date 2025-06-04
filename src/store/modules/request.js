const requestStore = {
  namespaced: true,
  state: {
    // 物资需求管理-需求填报-已选择物资列表
    selectedMaterialList: [],
  },
  mutations: {
  
    // 物资需求管理-需求填报-已选择物资列表
    SET_SELECTED_MATERIAL_LIST(state, data) {
      state.selectedMaterialList = data
    }
  },
  actions: {
    // 物资需求管理-需求填报-已选择物资列表
    setSelectedMaterialList({ commit }, data) {
      commit('SET_SELECTED_MATERIAL_LIST', data)
    }
  }
}

export default requestStore