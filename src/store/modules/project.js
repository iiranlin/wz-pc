const projectStore = {
  state: {
    projectId: '',
    contractChangeDetail: [],
    backChangeData: {},
    //合同变更前内容
    selectList:[]
  },
  mutations: {
    SET_PROJECT_ID(state, id) {
      state.projectId = id
    },
    SET_CONTRACT_CHANGE_DETAIL(state, data) {
      state.contractChangeDetail = data
    },
    SET_BACK_CHANGE_DATA(state, data) {
      state.backChangeData = data
    },
    SET_SELECTED_LIST(state, data) {
      state.selectList = data
    }
  },
  actions: {
    setProjectId({ commit }, id) {
      commit('SET_PROJECT_ID', id)
    },
    setContractChangeDetail({ commit }, data) {
      commit('SET_CONTRACT_CHANGE_DETAIL', data)
    },
    setBackChangeData({ commit }, data) {
      commit('SET_BACK_CHANGE_DATA', data)
    },
    setSelectList({ commit }, data) {
      commit('SET_SELECTED_LIST', data)
    }
  }
}

export default projectStore