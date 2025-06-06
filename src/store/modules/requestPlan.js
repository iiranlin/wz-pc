const requestPlanStore = {
  namespaced: true,
  // 甲供计划选择新增计划预览数据
  state: {
    // 物资需求管理-需求填报-已选择物资列表
    selectList: [],
  },
  mutations: {
    // 物资需求管理-需求填报-已选择物资列表
    SET_SELECTED_LIST(state, data) {
      state.selectList = data
    },
  },
  actions: {
    // 物资需求管理-需求填报-已选择物资列表
    setSelectList({ commit }, data) {
      commit('SET_SELECTED_LIST', data)
    },
  }
}

export default requestPlanStore