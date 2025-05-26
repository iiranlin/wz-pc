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
        <el-col :span="20" :xs="24" class="container_flex">
          <el-form :model="formData" ref="queryForm" label-width="110px" :inline="true">
            <el-form-item label="所属组织" prop="unitName" class="border-radius50">
              <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData"
                :fieldData="{ fieldCode: 'unitName', fieldName: '所属组织' }" :appendToBody="false" />
            </el-form-item>
            <el-form-item label="退料单号" prop="returnCode" class="border-radius50">
              <el-input v-model="formData.returnCode" placeholder="请输入退料单号" clearable
                @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="来源生产单号" prop="orderRawCode" class="border-radius50">
              <el-input v-model="formData.orderRawCode" placeholder="请输入来源生产单号" clearable
                @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="来源出库单号" prop="outCode" class="border-radius50">
              <el-input v-model="formData.outCode" placeholder="请输入来源出库单号" clearable
                @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="物料编码" prop="matlCode" class="border-radius50">
              <el-input v-model="formData.matlCode" placeholder="请输入物料编码" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="物料名称" prop="matlName" class="border-radius50">
              <el-input v-model="formData.matlName" placeholder="请输入物料名称" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="创建人" prop="createUserName" class="border-radius50">
              <el-input v-model="formData.createUserName" placeholder="请输入创建人" clearable
                @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="创建日期" prop="createDate" class="border-radius50">
              <el-date-picker v-model="formData.createDate" type="daterange" value-format="yyyy-MM-dd"
                range-separator="-" style="width:217px !important"></el-date-picker>
            </el-form-item>
          </el-form>
          <el-table ref="tableRef" class="container_table" v-loading="loading" border row-key="returnDetailId"
            v-if="openDataScope" :data="tableData" height="100%" @row-click="rowClick"
            @sort-change="sortableColumnChange" @row-dblclick="dbClick" @selection-change="handleSelect"
            :row-style="changeDisabled">
            <el-table-column align="center" width="50" v-if="singleMode" key="radio">
              <template v-slot="{ row }">
                <el-radio v-model="selectDataRow" :label="row.returnDetailId" class="table-radio"></el-radio>
              </template>
            </el-table-column>
            <el-table-column v-else align="center" :selectable="isSelectable" key="selectable" :reserve-selection="true"
              type="selection" width="50" />
            <el-table-column label="所属组织" prop="unitName" key="unitName" sortable="custom" align="left"
              :show-overflow-tooltip="true" min-width="150" />
            <el-table-column label="退料单号" prop="returnCode" key="returnCode" :show-overflow-tooltip="true" align="left"
              min-width="150">
              <template slot-scope="{row}">
                <el-button type="text" size="small"
                  @click="clickRouterInDialog($refs.detailDialogRef, { id: row.returnDetailId, refName: 'productionRejectedOperate' })">{{
                    row.returnCode }}</el-button>
              </template>
            </el-table-column>
            <el-table-column label="来源生产单号" prop="orderRawCode" key="orderRawCode" :show-overflow-tooltip="true"
              align="left" min-width="150">
              <template slot-scope="{row}">
                <el-button type="text" size="small"
                  @click="clickRouterInDialog($refs.detailDialogRef, { id: row.orderRawId, tableType: '2', refName: 'productionOrderOperate' })">{{
                    row.orderRawCode }}</el-button>
              </template>
            </el-table-column>
            <el-table-column label="来源出库单号" prop="outCode" key="outCode" :show-overflow-tooltip="true" align="left"
              min-width="150">
              <template slot-scope="{row}">
                <el-button type="text" size="small"
                  @click="clickRouterInDialog($refs.detailDialogRef, { id: row.outId, refName: 'outboundMaintenanceOperate' })">{{
                    row.outCode }}</el-button>
              </template>
            </el-table-column>
            <el-table-column label="生产部门" prop="produceDeptName" key="produceDeptName" sortable="custom" align="left"
              :show-overflow-tooltip="true" min-width="150" />
            <el-table-column prop="matlCode" label="物料编码" min-width="150" align="left">
              <template slot-scope="{row}">
                <el-button type="text" size="small"
                  @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, id: row.matlId, refName: 'materialArchivesOperate' })">{{
                    row.matlCode }}</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip min-width="150" />
            <el-table-column prop="matlType" label="规格型号" min-width="150" align="left" />
            <el-table-column prop="matlUnit" label="计量单位" align="left" show-overflow-tooltip min-width="150">
              <template slot-scope="{row}">
                <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="本次退料数量" prop="returnNum" key="returnNum" sortable="custom" align="left"
              min-width="150" />
            <el-table-column label="创建人" prop="createUserName" key="createUserName" sortable="custom" align="left"
              :show-overflow-tooltip="true" min-width="150">
            </el-table-column>
            <el-table-column label="创建日期" prop="createDate" key="createDate" sortable="custom" align="center"
              :show-overflow-tooltip="true" min-width="150">
              <template slot-scope="{row}">
                <span>{{ parseTime(row.createDate) }}</span>
              </template>
            </el-table-column>

          </el-table>
          <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        </el-col>
      </el-row>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button plain round type="primary" @click="confirmClick" v-preventReClick>确 定</el-button>
      <el-button plain round @click="openDataScope = false">取 消</el-button>
    </div>
    <detail-dialog ref="detailDialogRef" />
  </Dialog>
</template>

<script>
import indexMixin from '@/views/mixins'
import { queryDetailInfoList } from '@/api/prodmgr-sa/return'

export default {
  mixins: [indexMixin],
  dicts: ['MeasureUnit'],
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
      title: '退料单选择',
      openDataScope: false,
      treeLoading: false,
      loading: false,
      formData: {
        unitName: '',
        returnCode: '',
        orderRawCode: '',
        outCode: '',
        matlCode: '',
        matlName: '',
        createUserName: '',
        createDate: null,
      },
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 30
      },
      tableData: [],
      selectData: [],
      saleOrderDetails: [],
      selectDataRow: null,
      matlCodeArr: [],
      selected: []
    }
  },
  mounted() {
  },
  methods: {
    changeDisabled({ row }) {
      const idList = this.selected.map((item) => item.returnDetailId)
      return idList.includes(row.returnDetailId) ? {
        opacity: "0.5",
        pointerEvents: "none"
      } : {}
    },
    isSelectable(row) {

      const idList = this.selected.map((item) => item.returnDetailId)
      return !idList.includes(row.returnDetailId)
    },
    init(id = null, saleOrderDetails = [], matlCodeArr = []) {
      this.selectData = []
      this.saleOrderDetails = []
      this.selectDataRow = null
      this.openDataScope = true
      this.matlCodeArr = matlCodeArr
      this.selected = matlCodeArr
      this.$nextTick(() => {
        this.$refs.queryForm.resetFields()
        if (this.singleMode) {
          this.selectDataRow = id
        } else {
          this.saleOrderDetails = saleOrderDetails
        }
        this.getList()
      })
    },
    getList() {
      this.loading = true
      const param = Object.assign({}, this.listQuery, this.formData)
      if (param.createDate && !!param.createDate.length) {
        param[`createDateStart`] = param.createDate[0]
        param[`createDateEnd`] = param.createDate[1]
        delete param.createDate
      }
      queryDetailInfoList(param).then(({ data }) => {
        this.tableData = data.list
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
        this.selectDataRow = row.returnDetailId
      } else {
        if (this.matlCodeArr.includes(row.returnDetailId)) {
          return false
        }
        const idList = this.saleOrderDetails.map((item) => item.returnDetailId)
        if (idList.includes(row.returnDetailId)) {
          return
        }
        // 多选选中行
        // 根据id判断当前点击的是否被选中
        const selected = this.selectData.some(item => item.returnDetailId === row.returnDetailId)
        if (!selected) {
          // 选择
          this.selectData.push(row)
          this.$refs.tableRef.toggleRowSelection(row, true)
        } else {
          // 取消
          var finalArr = this.selectData.filter((item) => {
            return item.returnDetailId !== row.returnDetailId
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
    confirmClick() {
      if (this.singleMode) {
        if (this.selectDataRow == null) {
          this.$message.warning('请选择单据')
          return
        }
        const data = this.tableData.find(item => item.returnDetailId === this.selectDataRow)
        this.$emit('confirm', data)
      } else {
        if (!this.selectData.length) {
          this.$message.warning('请选择单据')
          return
        }
        this.$emit('confirm', this.selectData)
      }
      this.openDataScope = false
    },
    dbClick(row) {
      if (!this.singleMode) {
        const flag = this.saleOrderDetails.some(item => item.returnDetailId === row.returnDetailId)
        if (flag) {
          this.$message.warning('此条数据已经添加')
          return
        }
      }
      this.$emit('choiceMaterialClick', this.singleMode ? row : [row])
      this.openDataScope = false
    },
    emitAblFilter() {
      this.getList()
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
}
</style>
