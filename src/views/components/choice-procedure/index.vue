<template>
  <Dialog :title="title" class="max-height-dialog flex-dialog" :visible.sync="openDataScope" tabindex="1"
    :close-on-click-modal="false" width="1300px" append-to-body>
    <div slot="title" class="el-dialog__title">
      {{ title }}
      <div class="flex-dialog-button">
        <el-button plain round type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button plain round type="info" icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </div>
    </div>
    <div class="app-container">
      <el-row type="flex" :gutter="20" class="container_h">
        <!--部门数据-->
        <el-col :span="4" :xs="24" class="container_flex_overflow">
          <div class="head-container">
            <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
            </el-input>
            <el-tree v-loading="treeLoading" node-key="classifyId" class="drawer-tree" :indent="0"
              :filter-node-method="filterNode" :data="deptOptions" :props="defaultProps" :expand-on-click-node="false"
              ref="tree" :highlight-current="true" @node-click="handleNodeClick" />
          </div>
        </el-col>
        <el-col :span="20" :xs="24" class="container_flex">
          <el-form :model="formData" ref="queryForm" label-width="100px" size="small" :inline="true">
            <el-col :span="6">
              <el-form-item label="工序编码" prop="processCode" class="border-radius50 form-item-flex-row">
                <el-input v-model="formData.processCode" placeholder="请输入工序编码" clearable
                  @keyup.enter.native="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="工序名称" prop="processName" class="border-radius50 form-item-flex-row">
                <el-input v-model="formData.processName" placeholder="请输入工序名称" clearable
                  @keyup.enter.native="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="工序类型" prop="processType" class="border-radius50 form-item-flex-row">
                <el-select v-model="formData.processType" placeholder="请选择工序类型" clearable>
                  <el-option v-for="item in dict.type.processType" :label="item.label" :value="item.value"
                    :key="item.value"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="加工部门" prop="processDeptName" class="border-radius50 form-item-flex-row">
                <el-input v-model="formData.processDeptName" placeholder="请输入加工部门" clearable
                  @keyup.enter.native="handleQuery" />
              </el-form-item>
            </el-col>

          </el-form>
          <el-table ref="tableRef" class="container_table" v-loading="loading" border row-key="processCode"
            v-if="openDataScope" :data="dataList" height="100%" @row-click="rowClick" @row-dblclick="dbClick"
            :row-style="changeDisabled" @selection-change="handleSelect">
            <el-table-column align="center" width="50" v-if="singleMode" key="radio">
              <template v-slot="{ row }">
                <el-radio v-model="selectDataRow" :label="row.processCode" class="table-radio"></el-radio>
              </template>
            </el-table-column>
            <el-table-column v-else align="center" :selectable="isSelectable" key="selectable" :reserve-selection="true"
              type="selection" width="50" />
            <el-table-column label="工序编码" prop="processCode" key="processCode" :show-overflow-tooltip="true"
              align="center" min-width="150">
              <template slot-scope="{row}">
                <el-button type="text" size="small"
                  @click="clickRouterInDialog($refs.detailDialogRef, { id: row.processId, refName: 'standardProcessCreate' })">{{
                    row.processCode }}</el-button>
              </template>
            </el-table-column>
            <el-table-column label="工序名称" prop="processName" key="processName" align="left"
              :show-overflow-tooltip="true" min-width="150" />
            <el-table-column label="工序描述" prop="processDesc" key="processDesc" align="left"
              :show-overflow-tooltip="true" min-width="150" />
            <el-table-column label="技术要求" prop="techRequire" key="techRequire" align="left"
              :show-overflow-tooltip="true" min-width="150" />
            <el-table-column label="工序类型" prop="processType" align="center" :show-overflow-tooltip="true" min-width="150">
              <template slot-scope="scope">
                <span>{{ scope.row.processType | orderTypeFilter(dict.type.processType) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="加工部门" prop="processDeptName" align="left" :show-overflow-tooltip="true"
              min-width="150" />
          </el-table>
          <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        </el-col>
      </el-row>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button plain round type="primary" @click="choiceClick" v-preventReClick>确 定</el-button>
      <el-button plain round @click="openDataScope = false">取 消</el-button>
    </div>
    <detail-dialog ref="detailDialogRef" />
  </Dialog>
</template>

<script>
import { getList, classTree } from '@/api/prodmgr-mm/standardProcess'
import indexMixin from '@/views/mixins'

export default {
  mixins: [indexMixin],
  dicts: ['processType'],
  components: {
    DetailDialog: () => import('@/views/components/DetailDialog')
  },
  props: {
    singleMode: {
      type: Boolean,
      required: false,
      default: false
    },
    isLend: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      dialogParam: {},
      title: '工序选择',
      openDataScope: false,
      treeLoading: false,
      loading: false,
      // 部门树选项
      deptOptions: undefined,
      defaultProps: {
        children: 'children',
        label: 'classifyName'
      },
      formData: {
        processCode: '',
        processName: '',
        processType: '',
        processDeptName: ''
      },
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 30
      },
      dataList: [],
      treeCurrentKey: '',
      filterText: '',
      selectData: [],
      saleOrderDetails: [],
      selectDataRow: null,
      selected: []

    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  mounted() {
  },
  methods: {
    changeDisabled({ row }) {
      const idList = this.selected.map((item) => item.processCode)
      return idList.includes(row.processCode) ? {
        opacity: "0.5",
        pointerEvents: "none"
      } : {}
    },
    isSelectable(row) {
      const idList = this.selected.map((item) => item.processCode)
      return !idList.includes(row.processCode)
    },
    filterNode(value, data) {
      if (!value) return true
      return !!this.$py.match(data.classifyName, value) || data.classifyId.indexOf(value) !== -1
    },
    init(id = null, saleOrderDetails = []) {
      this.selectData = []
      this.saleOrderDetails = []
      this.selectDataRow = null
      this.openDataScope = true
      this.selected = saleOrderDetails
      this.formData = {
        processCode: '',
        processName: '',
        processType: '',
        processDeptName: ''
      }
      this.$nextTick(() => {
        this.$refs.queryForm.resetFields()
        if (this.singleMode) {
          this.selectDataRow = id
        } else {
          this.saleOrderDetails = saleOrderDetails
        }
        this.classTree()

      })
    },
    classTree() {
      this.treeLoading = true
      classTree().then(({ data }) => {
        this.deptOptions = data || []
        this.getList()
        // if (!!data.length) {
        //   const key = data[0]['matlClassifyId']
        //   const code = data[0]['matlClassifyCode'] 
        //   this.$nextTick(() => {
        //     this.$refs.tree.setCurrentKey(key)
        //     this.formData.processClassify = code
        //     this.getList()
        //   })

        // }

      }).finally(() => {
        this.treeLoading = false
      })
    },
    getList() {
      this.loading = true
      getList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.dataList = data.list
        this.total = data.total
        this.loading = false
        // if (this.saleOrderDetails.length) {
        //   const selectRowIdGroup = this.saleOrderDetails.map(item => item.processCode)
        //   this.dataList.forEach(item => {
        //     if (selectRowIdGroup.includes(item.processCode)) {
        //       this.$nextTick(() => {
        //         this.$refs.tableRef.toggleRowSelection(item)
        //       })
        //     }
        //   })
        // }
      })
    },
    handleSelect(selectData) {
      this.selectData = selectData
    },
    rowClick(row) {
      if (this.singleMode) {
        // 单选选中行
        this.selectDataRow = row.processCode
      } else {
        const idList = this.saleOrderDetails.map((item) => item.processCode)
        if (idList.includes(row.processCode)) {
          return
        }
        // 多选选中行
        // 根据id判断当前点击的是否被选中
        const selected = this.selectData.some(item => item.processCode === row.processCode)
        if (!selected) {
          // 选择
          this.selectData.push(row)
          this.$refs.tableRef.toggleRowSelection(row, true)
        } else {
          // 取消
          var finalArr = this.selectData.filter((item) => {
            return item.processCode !== row.processCode
          })
          // 取消后剩余选中的
          this.selectData = finalArr
          this.$refs.tableRef.toggleRowSelection(row, false)
        }
      }
    },
    // 节点单击事件
    handleNodeClick(data) {
      if (data.classifyId === this.treeCurrentKey) {
        // 再次点击当前节点取消选中,查询全部
        // this.formData.matlClassifyId = null
        // this.$refs.tree.setCurrentKey(null)
        // this.treeCurrentKey = ''
      } else {
        this.treeCurrentKey = data.classifyId
        this.formData.processClassify = data.classifyId

      }
      this.getList()
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$refs.tree.setCurrentKey(null)
      this.treeCurrentKey = ''
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    choiceClick() {
      if (this.singleMode) {
        if (this.selectDataRow == null) {
          this.$message.warning('请选择工序')
          return
        }
        const data = this.dataList.find(item => item.processCode === this.selectDataRow)
        this.$emit('change', data)
      } else {
        if (!this.selectData.length) {
          this.$message.warning('请选择工序')
          return
        }
        this.$emit('change', this.selectData)
      }
      this.openDataScope = false
    },
    dbClick(row) {
      if (!this.singleMode) {
        const flag = this.saleOrderDetails.some(item => item.processCode === row.processCode)
        if (flag) {
          this.$message.warning('此条数据已经添加')
          return
        }
      }
      this.$emit('change', this.singleMode ? row : [row])
      this.openDataScope = false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  height: 100%;

  .container_flex_overflow {
    width: 210px;
  }

  .form-item-flex-row {
    display: flex;
    flex-direction: row;
  }
}
</style>
