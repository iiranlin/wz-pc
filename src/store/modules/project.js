const projectStore = {
  state: {
    projectId: '',
  },
  mutations: {
    SET_PROJECT_ID(state, id) {
      state.projectId = id
    },
  },
  actions: {
    setProjectId({ commit }, id) {
      commit('SET_PROJECT_ID', id)
    },
  }
}

export default projectStore