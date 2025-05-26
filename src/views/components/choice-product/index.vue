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
      <el-form :model="formData" ref="queryForm" label-width="120px">
        <el-col :span="6">
          <el-form-item label="所属组织" prop="unitName" class="border-radius50">
            <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData"
              :fieldData="{ fieldCode: 'unitName', fieldName: '所属组织' }" :appendToBody="false" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="生产编码" prop="orderCode" class="border-radius50">
            <el-input v-model="formData.orderCode" placeholder="请输入生产编码" clearable @keyup.enter.native="handleQuery" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="生产名称" prop="orderName" class="border-radius50">
            <el-input v-model="formData.orderName" placeholder="请输入生产名称" clearable @keyup.enter.native="handleQuery" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="创建日期" prop="createDate" class="border-radius50">
            <el-date-picker v-model="formData.createDate" type="daterange" value-format="yyyy-MM-dd" range-separator="-"
              style="width:100%"></el-date-picker>
          </el-form-item>
        </el-col>

      </el-form>
      <el-table ref="tableRef" class="container_table" v-loading="loading" border row-key="orderId" v-if="openDataScope"
        :data="dataList" height="100%" @row-click="rowClick" @row-dblclick="dbClick" :row-style="changeDisabled"
        @selection-change="handleSelect">
        <el-table-column align="center" width="50" v-if="singleMode" key="radio">
          <template v-slot="{ row }">
            <el-radio v-model="selectDataRow" :label="row.orderId" class="table-radio"></el-radio>
          </template>
        </el-table-column>
        <el-table-column v-else align="center" :selectable="isSelectable" key="selectable" :reserve-selection="true"
          type="selection" width="50" />
        <el-table-column label="所属组织" prop="unitName" key="unitName" align="left" :show-overflow-tooltip="true"
          min-width="150" />
        <el-table-column label="生产编码" prop="orderCode" key="orderCode" :show-overflow-tooltip="true" align="center"
          min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.processId, refName: 'standardProcessCreate' })">{{
                row.orderCode }}</el-button>
          </template>

        </el-table-column>
        <el-table-column label="生产名称" prop="orderName" key="orderName" align="left" :show-overflow-tooltip="true"
          min-width="150" />
        <el-table-column label="生产部门" prop="ownerDeptName" key="ownerDeptName" align="left"
          :show-overflow-tooltip="true" min-width="150" />

        <el-table-column label="创建人" prop="createUserName" key="createUserName" align="left"
          :show-overflow-tooltip="true" min-width="150" />
        <el-table-column label="创建日期" prop="createDate" align="left" :show-overflow-tooltip="true" min-width="150">
          <template slot-scope="{row}">
            <span>{{ parseTime(row.createDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
        @pagination="getList" />
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button plain round type="primary" @click="choiceClick" v-preventReClick>确 定</el-button>
      <el-button plain round @click="openDataScope = false">取 消</el-button>
    </div>
    <detail-dialog ref="detailDialogRef" />
  </Dialog>
</template>

<script>
import { getList } from '@/api/projectManagement/productionOrder'
import indexMixin from '@/views/mixins'

export default {
  mixins: [indexMixin],
  dicts: ['processType'],
  components: {
    FormUnitId: () => import('@/views/components/form-unitId'),
    DetailDialog: () => import('@/views/components/DetailDialog')
  },
  props: {
    singleMode: {
      type: Boolean,
      required: false,
      default: false
    },
  },
  data() {
    return {
      dialogParam: {},
      title: '选择生产单',
      openDataScope: false,
      loading: false,
      // 部门树选项
      formData: {
        unitName: '',
        orderCode: '',
        orderName: '',
        createDate: null
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
  mounted() {
  },
  methods: {
    changeDisabled({ row }) {
      const idList = this.selected.map((item) => item.orderId)
      return idList.includes(row.orderId) ? {
        opacity: "0.5",
        pointerEvents: "none"
      } : {}
    },
    isSelectable(row) {
      const idList = this.selected.map((item) => item.orderId)
      return !idList.includes(row.orderId)
    },
    init(id = null, saleOrderDetails = []) {
      this.selectData = []
      this.saleOrderDetails = []
      this.selectDataRow = null
      this.openDataScope = true
      this.selected = saleOrderDetails
      this.formData = {
        unitName: '',
        orderCode: '',
        orderName: '',
        createDate: null
      }
      this.$nextTick(() => {
        this.$refs.queryForm.resetFields()
        if (this.singleMode) {
          this.selectDataRow = id
        } else {
          this.saleOrderDetails = saleOrderDetails
        }
      })
    },

    getList() {
      this.loading = true
      const param = Object.assign({}, this.listQuery, this.formData)
      if (param.createDate) {
        param.createDateStart = param.createDate[0]
        param.createDateEnd = param.createDate[1]
        delete param.createDate
      }
      getList(param).then(({ data }) => {
        this.dataList = data.list
        this.total = data.total
        this.loading = false
      })
    },
    handleSelect(selectData) {
      this.selectData = selectData
    },
    rowClick(row) {
      if (this.singleMode) {
        // 单选选中行
        this.selectDataRow = row.orderId
      } else {
        const idList = this.saleOrderDetails.map((item) => item.orderId)
        if (idList.includes(row.orderId)) {
          return
        }
        // 多选选中行
        // 根据id判断当前点击的是否被选中
        const selected = this.selectData.some(item => item.orderId === row.orderId)
        if (!selected) {
          // 选择
          this.selectData.push(row)
          this.$refs.tableRef.toggleRowSelection(row, true)
        } else {
          // 取消
          var finalArr = this.selectData.filter((item) => {
            return item.orderId !== row.orderId
          })
          // 取消后剩余选中的
          this.selectData = finalArr
          this.$refs.tableRef.toggleRowSelection(row, false)
        }
      }
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    choiceClick() {
      if (this.singleMode) {
        if (this.selectDataRow == null) {
          this.$message.warning('请选择订单')
          return
        }
        const data = this.dataList.find(item => item.orderId === this.selectDataRow)
        this.$emit('change', data)
      } else {
        if (!this.selectData.length) {
          this.$message.warning('请选择订单')
          return
        }
        this.$emit('change', this.selectData)
      }
      this.openDataScope = false
    },
    dbClick(row) {
      if (!this.singleMode) {
        const flag = this.saleOrderDetails.some(item => item.orderId === row.orderId)
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
