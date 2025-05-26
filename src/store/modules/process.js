const process = {
  state: {
    nodeMap: new Map(),
    isEdit: null,
    selectedNode: {},
    selectFormItem: null,
    design:{},
    runningList: [],
    noTakeList: [],
    endList: [],
    diagramMode: 'design',
  },

  mutations: {
    selectedNode(state, val) {
      state.selectedNode = val
    },
    loadForm(state, val){
      state.design = val
    },
    setIsEdit(state, val){
      state.isEdit = val
    }
  },

  actions: {

  }
}

export default process
