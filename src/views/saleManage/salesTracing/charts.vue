<template>
  <div class="app-container container_flex" ref="charts">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
      @newButton="handleButton"></button-top>
    <div class="charts_content" :style="{ 'width': '100%', 'height': height + 'px' }">
      <RelationGraph ref="graphRef" :options="graphOptions" :on-node-click="handleNodeClick"
        :on-line-click="handleLineClick">
      </RelationGraph>
    </div>
     <detail-dialog ref="detailDialogRef" />
  </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import RelationGraph from 'relation-graph'
import { chartsData } from '@/api/prodmgr-pu/Ct'
export default {
  name: 'charts',
  components: {
    RelationGraph,
     DetailDialog: () => import('@/views/components/DetailDialog')
  },
  mixins: [indexMixin],
  data() {
    return {
      queryName: '',
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
      ],
      height: 0,
      treeData: [],
      graphOptions: {
        defaultJunctionPoint: 'lr',
        defaultLineShape: 4,
        defaultFocusRootNode: false,
        allowShowRefreshButton: false,
        allowShowDownloadButton: false,
        disableZoom: true,
        graphOffset_y: 0,
        layout: {
          layoutName: 'tree',
          from: 'left',
          min_per_width: 300,
          max_per_width: 300,
        },
      }
    }
  },
  computed: {
  },
  async created() {
  },
  mounted() {

    this.init()
  },
  methods: {
    treeToArray(treeNodes, rootId) {
      const that = this
      const lines = []
      const nodes = []
      function traverse(node, idx, arr, parent, pn) {
        const rNode = that.renderNode(node, false, idx)
        const newNode = {
          ...node,
          text: node.name,
          nodeShape: 1,
          disableDrag: true,
          disableDefaultClickEffect: true,
          ...rNode
        };
        delete newNode.children;

        nodes.push(newNode)
        if (parent && parent.id !== node.id) {
          lines.push({
            from: parent.id,
            to: node.id,
            lineWidth: 2,
            color: '#1086fc',
            // showStartArrow: rootId == parent.id,
            showEndArrow: true,
          })
        }

        if (node.children && node.children.length) {
          node.children.forEach((n, i, a) => traverse(n, i, a, node, n));
        }
      }

      treeNodes.forEach((n, i, a) => traverse(n, i, a, null, null));
      const treeData = { rootId: rootId, nodes: nodes, lines: lines };
      return treeData
    },
    // 加载数据
    async initRender(id) {
      const data = await this.loadData(id)
      const arr = []
      let rootNode = data
      // if (Array.isArray(data.children) && !!data.children.length) {
      //   data.children.forEach(function (item, index, arr) {
      //     if (item.type == "WLXQJH") {
      //       rootNode = arr.splice(index, 1);
      //     }
      //   });
      // }
      function deep(list) {
        for (let i = 0; i < list.length; i++) {
          const item = list[i]
          if (Array.isArray(item.children) && !!item.children.length) {
            !!item.type && arr.push(item)
            deep(item.children)
          } else {
            !!item.type && arr.push(item)
          }
        }
      }
      if (Array.isArray(rootNode) && !!rootNode.length) {
        // deep(rootNode)
        const nextArr = arr.reverse()
        for (let j = 0; j < nextArr.length; j++) {
          nextArr[j]['children'] = [nextArr[j + 1] || data]
        }
        rootNode = nextArr[0]
      }
      this.treeData = this.treeToArray([rootNode], data.id)
      this.showGraph()

    },
    async loadData(id) {
      try {
        const { data } = await chartsData(id)
        return data
      } catch (err) {
        console.error(err)
      }
    },
    // 加载初始化数据
    async init() {
      this.height = this.isDialog ? 700 : this.$refs.charts.offsetHeight - 52
      let { type, name, id } = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryName = name
      this.initRender(id)
    },
    // 表单按钮权限设置
    buttonShow({ buttonCode, type }) {
      if (type.includes(this.queryType)) {
        return true
      }
      return false
    },
    // 顶部按钮事件处理器
    handleButton(buttonCode, formId, buttonData) {

      switch (buttonCode) {
        case 'cancel':
          this.handleCancel()
          break;
        default:
      }
    },
    // 取消事件处理器
    handleCancel() {
      this.$tab.closeOpenPage({ name: this.queryName })
    },
    showGraph() {
      this.$refs.graphRef.setJsonData(this.treeData, (graphInstance) => {
        this._graphInstance = graphInstance
        this._graphInstance.animateToZoom(80, 300)
      })
    },
    renderNode(node, expanded = false, idx = 0) {
      let innerHTML = ``
      node.width = 220
      node.height = 62
      const bgColors = {
        XM: '#f4f0ff',  // 项目
        HT: 'antiquewhite', // 合同
        XSDD: '#e6fdff', //  销售订单
        WLXQJH: '#ddfaf0', // 物料需求计划
        XSCH: '#e6fddd', // 销售出货
        XSTH: '#caf982', // 销售退货
        SCDD: '#f59a23', // 生产订单
      }

      const bc = bgColors[node.type]

      innerHTML = `
                    <div class='node-item-card' id="node-${node.id}" style='background-color:${bc};width:${node.width}px;height:${node.height}px;'>
                        <div class='node-item-content'>
                            <div class='node-item-content-t'>${node.name}</div>
                            <div class='node-item-content-b'><span>单号:</span> ${node.code}</div>
                        </div>
                    </div>
                `
      if (node.type === 'XM') {
        let inner = ''
        if (node.properties) {
          const keys = Object.keys(node.properties)
          node.height = node.height + 20 * keys.length
          const maxLen = 8
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            let val = `${node.properties[key]}`
            const len = val.length
            if (len > maxLen) {
              val = val.substring(0, maxLen) + '...'
            }
            inner = inner + `<div class='node-item-content-b'><span>${key}:</span> ${val}</div>`
          }

        }
        innerHTML = `
                    <div class='node-item-card' id="node-${node.id}" style='background-color:${bc};width:${node.width}px;height:${node.height}px;'>
                        <div class='node-item-content'>
                            <div class='node-item-content-t'>${node.name}</div>
                             ${inner}
                        </div>
                    </div>
                `
      }
      if (node.type === 'HT') {
        let inner = ''
        if (node.properties) {
          const keys = Object.keys(node.properties)
          node.height = node.height + 20 * keys.length
          const maxLen = 8
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            let val = `${node.properties[key]}`
            const len = val.length
            if (len > maxLen) {
              val = val.substring(0, maxLen) + '...'
            }
            inner = inner + `<div class='node-item-content-b'><span>${key}:</span> ${val}</div>`
          }

        }
        innerHTML = `
                    <div class='node-item-card' id="node-${node.id}" style='background-color:${bc};width:${node.width}px;height:${node.height}px;'>
                        <div class='node-item-content'>
                            <div class='node-item-content-t'>${node.name}</div>
                             ${inner}
                        </div>
                    </div>
                `
      }
      return { html: innerHTML, data: node }
    },
    handleNodeClick(node, $event) {
      const { type, id } = node.data
      const router = {
        XM: { name: 'projectManagementOperate', param: { id: id } },  // 项目
        SCDD: { name: 'productionOrderOperate', param: { id: id, tableType: 2 } }, // 生产订单
        HT: { name: 'contractManagementOperate', param: { id: id } }, // 销售订单
        XSDD: { name: 'saleOrderOperate', param: { id: id } }, // 销售订单
        WLXQJH: { name: 'demandPlanWorkbenchOperate', param: { id: id } }, // 物料需求计划
        XSCH: { name: 'saleShipmentMaintainOperate', param: { id: id } }, //  销售出货
        XSTH: { name: 'salesReturnOperate', param: { id: id } }, //  销售退货

      }[type]
      if (this.isDialog) {
        this.clickRouterInDialog(this.$refs.detailDialogRef, {...router.param , refName: router.name })
      } else {
        this.$router.push({
          name: router.name,
          query: {
            name: 'productionOrderCharts',
            type: 'view',
            ...router.param
          }
        })
      }

    },
    handleLineClick(lineObject, $event) {
      console.log('onLineClick:', lineObject)

    },
  }
}
</script>


<style lang="scss">
.charts_content {
  width: 100%;
}

.charts_content .relation-graph .rel-toolbar-h-right {
  left: 15px;
}

.assas {
  display: none;
}

.charts_content .relation-graph .rel-toolbar-h-right {
  left: 15px;
}

.node-item-card {
  color: #333;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  padding: 11px 18px;
  left: -6px;

  .node-item-content {
    margin-left: 8px;

    .node-item-content-t {
      font-weight: 600;
      color: #081733;
      font-size: 16px;
      height: 22px;
      line-height: 22px;
      text-align: left;
    }

    .node-item-content-b {
      margin-top: 2px;
      color: #1989fa;
      font-size: 12px;
      height: 17px;
      line-height: 17px;
      text-align: left;

      span {
        color: #081733;
      }
    }
  }
}

.node-item-card:hover {
  cursor: pointer;
}
</style>