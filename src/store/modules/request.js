const requestStore = {
  namespaced: true,
  state: {
    // 物资需求管理-需求填报-已选择物资列表
    selectedMaterialList: [],
    //发货选择的物资
    selectedItemList:[]
  },
  mutations: {
  
    // 物资需求管理-需求填报-已选择物资列表
    SET_SELECTED_MATERIAL_LIST(state, data) {
      state.selectedMaterialList = data
    },
    // 供应管理管理-发货-已选择物资列表
    SET_SELECTED_ITEM_LIST(state, data) {
      state.selectedItemList = data
    }
  },
  actions: {
    // 物资需求管理-需求填报-已选择物资列表
    setSelectedMaterialList({ commit }, data) {
      commit('SET_SELECTED_MATERIAL_LIST', data)
    },
     // 供应管理管理-发货-已选择物资列表
     setSelectedItemList({ commit }, data) {
      commit('SET_SELECTED_ITEM_LIST', data)
    }
  }
}

export default requestStore