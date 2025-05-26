<template>
  <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="选择数据" :visible.sync="visible"
    :close-on-click-modal="false" width="1300px">
    <div slot="title" class="el-dialog__title">
      选择数据
      <div class="flex-dialog-button">
        <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
        <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
      </div>
    </div>
    <el-form ref="elForm" :model="formData" label-suffix="：" label-width="110px">
      <el-row>
        <el-col :span="24">
          <el-row>
            <el-col :span="6">
              <el-form-item label="退料单号" prop="sourceCode" class="border-radius50">
                <el-input v-model="formData.sourceCode" placeholder="请输入退料单号" clearable
                  @keyup.enter.native="searchData" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="物料编码" prop="matlCode" class="border-radius50">
                <el-input v-model="formData.matlCode" placeholder="请输入物料编码" clearable
                  @keyup.enter.native="searchData" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="物料名称" prop="matlName" class="border-radius50">
                <el-input v-model="formData.matlName" placeholder="请输入物料名称" clearable
                  @keyup.enter.native="searchData" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="规格型号" prop="matlType" class="border-radius50">
                <el-input v-model="formData.matlType" placeholder="请输入规格型号" clearable
                  @keyup.enter.native="searchData" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="来源生产单号" prop="produceOrderCode" class="border-radius50">
                <el-input v-model="formData.produceOrderCode" placeholder="请输入来源生产单号" clearable
                  @keyup.enter.native="searchData" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="所属组织" prop="unitName" class="border-radius50">
                <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData"
                  :fieldData="{ fieldCode: 'unitName', fieldName: '所属组织' }" :appendToBody="false" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="来源项目编码" prop="projectCode" class="border-radius50">
                <el-input v-model="formData.projectCode" placeholder="请输入项目编码" clearable
                  @keyup.enter.native="searchData" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="来源项目名称" prop="projectName" class="border-radius50">
                <el-input v-model="formData.projectName" placeholder="请输入项目名称" clearable
                  @keyup.enter.native="searchData" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="创建人" prop="createUserName" class="border-radius50">
                <el-select v-model="formData.createUserName" @keyup.enter.native="searchData" placeholder="请选择创建人"
                  clearable style="width: 100%">
                  <el-option v-for="item in createUserList" :key="item.createUser" :label="item.createUserName"
                    :value="item.createUserName" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="创建日期" class="border-radius50">
                <el-date-picker v-model="createDate" size="small" value-format="yyyy-MM-dd" type="daterange"
                  style="width: 100%" range-separator="-" start-placeholder="起始" end-placeholder="截止">
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-form>

    <div class="table-wrapper">
      <el-table ref="tableRef" :row-style="changeDisabled" :data="tableData" row-key="sourceDetailId" border
        height="100%" v-loading="loading" @row-click="rowClick" @row-dblclick="dbClick"
        @selection-change="handleSelect">
        <el-table-column fixed="left" :selectable="isSelectable" align="center" key="selectable" type="selection"
          width="50" />
        <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
        <el-table-column prop="sourceCode" label="退料单号" align="left" show-overflow-tooltip min-width="170">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId, refName: 'productionRejectedOperate' })">{{
                row.sourceCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="sourceRowNum" label="材料行行号" align="left" show-overflow-tooltip min-width="170" />
        <el-table-column prop="produceOrderCode" label="来源生产单号" align="left" show-overflow-tooltip min-width="170">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.produceOrderId, refName: 'productionOrderOperate' })">{{
                row.produceOrderCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="produceDeptName" label="生产部门" align="left" show-overflow-tooltip min-width="170" />
        <el-table-column prop="matlCode" label="物料编码" align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, id: row.matlId, refName: 'materialArchivesOperate' })">{{
                row.matlCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="matlType" label="规格型号" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="matlUnit" label="计量单位" align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="qiNum" label="本次退料数量" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="unitName" label="所属组织" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="projectCode" label="来源项目编码" align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                row.projectCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="来源项目名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="createUserName" label="创建人" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="createDate" label="创建日期" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ parseTime(row.createDate) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <pagination v-if="visible" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />

    <template #footer>
      <el-button plain round type="primary" @click="saveSelection" v-preventReClick>确定</el-button>
      <el-button plain round @click.native="visible = false">取消</el-button>
    </template>
    <detail-dialog ref="detailDialogRef" />
  </Dialog>
</template>

<script>

import indexMixin from '@/views/mixins'
import { returnQuoteList, qiQuoteCreateUserList } from '@/api/projectManagement/productionRejected'

export default {
  mixins: [indexMixin],
  dicts: ['MeasureUnit'],
  components: {
    FormUnitId: () => import('@/views/components/form-unitId'),
    DetailDialog: () => import('@/views/components/DetailDialog')
  },
  data() {
    return {
      dialogParam: {},
      visible: false,
      formData: {
        sourceCode: '',
        matlCode: '',
        matlName: '',
        matlType: '',
        produceOrderCode: '',
        projectName: '',
        projectCode: '',
        createUserName: '',
        createDateStart: '',
        createDateEnd: '',
        unitName: '',
      },
      createDate: null,
      loading: false,
      tableData: [],
      total: 0,
      selectData: [],
      selected: [],
      createUserList: []
    }
  },
  methods: {
    changeDisabled({ row }) {
      const idList = this.selected.map((item) => item.sourceDetailId)
      return idList.includes(row.sourceDetailId) ? {
        opacity: "0.5",
        pointerEvents: "none"
      } : {}
    },
    isSelectable(row) {
      const idList = this.selected.map((item) => item.sourceDetailId)
      return !idList.includes(row.sourceDetailId)
    },
    open(arr) {
      this.visible = true;
      this.createDate = null
      this.selected = arr
      this.selectData = []
      this.$nextTick(() => {
        this.$refs.elForm.resetFields()
        this.tableData = []
        this.listQuery.pageNum = 1
        this.listQuery.pageSize = 500
        this.getList()
        this.qiQuoteCreateUserList()
      })
    },
    qiQuoteCreateUserList() {
      qiQuoteCreateUserList().then(({ data }) => {
        this.createUserList = data || []
      })
    },
    handleSelect(selectData) {
      this.selectData = selectData;
    },
    searchData() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    // 保存选择
    saveSelection() {
      if (!this.selectData.length) {
        this.$message.warning('请选择数据')
        return
      }
      this.$emit('selections', this.selectData)
      this.visible = false
    },
    // 物资列表双击添加到BOM清单
    dbClick(row) {
      const flag = this.selected.some(item => item.sourceDetailId === row.sourceDetailId)
      if (flag) {
        this.$message.warning('此条数据已经添加')
        return
      }
      this.$emit('selections', [row])
      this.visible = false
    },
    rowClick(row) {
      // 多选选中行
      // 根据id判断当前点击的是否被选中
      const selected = this.selectData.some(item => item.sourceDetailId === row.sourceDetailId)
      if (!selected) {
        // 选择
        this.selectData.push(row)
        this.$refs.tableRef.toggleRowSelection(row, true);
      } else {
        // 取消
        var finalArr = this.selectData.filter((item) => {
          return item.sourceDetailId !== row.sourceDetailId
        })
        // 取消后剩余选中的
        this.selectData = finalArr
        this.$refs.tableRef.toggleRowSelection(row, false);
      }
    },
    // 查询物资
    getList() {
      const createDate = this.createDate
      if (createDate && createDate.length) {
        this.formData.createDateStart = createDate[0]
        this.formData.createDateEnd = createDate[1]
      } else {
        this.formData.createDateStart = ''
        this.formData.createDateEnd = ''
      }
      this.loading = true
      returnQuoteList(Object.assign({}, this.formData, this.listQuery)).then(({ data }) => {
        this.tableData = data?.list || []
        this.total = data?.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    // 重置物资列表查询
    resetSearch() {
      // this.$refs.elForm.resetFields()
      this.formData = this.$options.data().formData
      this.createDate = null
      this.getList()
    }
  }
}
</script>

<style scoped lang="scss">
.table-wrapper {
  flex: 1;
}
</style>