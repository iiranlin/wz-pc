<template>
  <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="选择数据" :visible.sync="visible"
    :close-on-click-modal="false" append-to-body width="1300px">
    <div slot="title" class="el-dialog__title">
      选择数据
      <div class="flex-dialog-button">
        <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
        <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
      </div>
    </div>
    <el-form ref="elForm" :model="formData" label-width="110px">
      <el-row>
        <el-col :span="6">
          <el-form-item label="供应商编码" prop="suCode" class="border-radius50">
            <el-input v-model="formData.suCode" placeholder="请输入供应商编码" clearable
              @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="供应商名称" prop="suName" class="border-radius50">
            <el-input v-model="formData.suName" placeholder="请输入供应商名称" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="来源单号" prop="inSourceCode" class="border-radius50">
            <el-input v-model="formData.inSourceCode" placeholder="请输入来源单号" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="入库单号" prop="inCode" class="border-radius50">
            <el-input v-model="formData.inCode" placeholder="请输入入库单号" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="物料编码" prop="matlCode" class="border-radius50">
            <el-input v-model="formData.matlCode" placeholder="请输入物料编码" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="物料名称" prop="matlName" class="border-radius50">
            <el-input v-model="formData.matlName" placeholder="请输入物料名称" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="规格型号" prop="matlType" class="border-radius50">
            <el-input v-model="formData.matlType" placeholder="请输入规格型号" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="项目编码" prop="projectCode" class="border-radius50">
            <el-input v-model="formData.projectCode" placeholder="请输入项目编码" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="项目名称" prop="projectName" class="border-radius50">
            <el-input v-model="formData.projectName" placeholder="请输入项目名称" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="入库完成日期" class="border-radius50">
            <el-date-picker v-model="inFinishDateRange" type="daterange" value-format="yyyy-MM-dd" range-separator="-" style="width: 100%;" start-placeholder="开始日期" end-placeholder="结束日期" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="table-wrapper">
      <el-table ref="tableRef" :data="tableData" border row-key="inDetailId" v-loading="loading" @row-click="rowClick" height="100%" @row-dblclick="dbClick">
        <el-table-column align="center" width="50" fixed="left">
          <template v-slot="{ row }">
            <el-radio v-model="selectDataRow" :label="row.inDetailId" class="table-radio"></el-radio>
          </template>
        </el-table-column>
        <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
        <el-table-column prop="unitName" label="所属组织" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="projectCode" label="项目编码" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
                @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{ row.projectCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="项目名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="inSource" label="入库来源" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.inSource | orderTypeFilter(dict.type.inMaintenance) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="inSourceCode" label="来源单号" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, { id: row.inSourceId, refName: getRouteByInsource(row.inSource) })">{{ row.inSourceCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="inSourceRowNum" label="来源行号" align="center" show-overflow-tooltip min-width="150" />
        <el-table-column prop="suCode" label="供应商编码" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, { id: row.suId, refName: 'supplierOperate' })">{{ row.suCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="suName" label="供应商名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="inCode" label="入库单号" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, { id: row.inId, refName: 'createInventoryMaintenance' })">{{ row.inCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" label="物料编码" prop="matlCode" show-overflow-tooltip width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{ row.matlCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column align="left" label="物料名称" prop="matlName" show-overflow-tooltip min-width="150"></el-table-column>
        <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip min-width="150"></el-table-column>
        <el-table-column align="center" label="计量单位" prop="matlUnit" show-overflow-tooltip width="150">
          <template slot-scope="{row}">
            {{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}
          </template>
        </el-table-column>
        <el-table-column prop="inNum" label="合格品入库数量" align="right" show-overflow-tooltip min-width="150" />
        <el-table-column prop="warehouseName" label="合格品入库仓库" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="inFinishDate" label="入库完成日期" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ parseTime(row.inFinishDate, '{y}-{m}-{d}') }}</span>
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
import inMixin from '@/views/components/mixins'
import { adjustInQuote } from '@/api/prodmgr-inv/adjustIn'
import { getRouteByInsource } from '@/utils'
export default {
  mixins: [indexMixin, inMixin],
  dicts: ['MeasureUnit', 'inMaintenance'],
  components: {
    DetailDialog: () => import('@/views/components/DetailDialog')
  },
  props: {
    propsFormData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogParam: {},
      visible: false,
      formData: {
        suCode: '',
        suName: '',
        inSourceCode: '',
        inCode: '',
        matlCode: '',
        matlName: '',
        matlType: '',
        projectCode: '',
        projectName: ''
      },
      inFinishDateRange: [],
      loading: false,
      tableData: [],
      total: 0,
      selectDataRow: null,
      getRouteByInsource
    }
  },
  methods: {
    init(inDetailId = null) {
      this.visible = true
      this.selectDataRow = inDetailId
      this.$nextTick(() => {
        this.$refs.elForm.resetFields()
        this.formData.inFinishDateStart = ''
        this.formData.inFinishDateEnd = ''
        this.inFinishDateRange = []
        this.tableData = []
        this.listQuery.pageNum = 1
        this.listQuery.pageSize = 30
      })
    },
    getList() {
      this.loading = true
      if (!!this.inFinishDateRange.length) {
          this.formData.inFinishDateStart = this.inFinishDateRange[0]
          this.formData.inFinishDateEnd = this.inFinishDateRange[1]
      }
      adjustInQuote(Object.assign({}, this.formData, this.listQuery, this.propsFormData)).then(({ data }) => {
        this.tableData = data?.list || []
        this.total = data?.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    searchData() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    rowClick(row) {
      this.selectDataRow = row.inDetailId
    },
    dbClick(row) {
      this.$emit('selections', row)
      this.visible = false
    },
    saveSelection() {
      if (!this.selectDataRow) {
        this.$message.warning('请选择数据')
        return
      }
      let row = this.tableData.find((item) => {
        return item.inDetailId == this.selectDataRow
      })
      this.$emit('selections', row)
      this.visible = false
    },
    resetSearch() {
      this.$refs.elForm.resetFields()
      this.getList()
    },
  }
}
</script>
<style scoped lang="scss">
.table-wrapper {
  flex: 1;
}
</style>