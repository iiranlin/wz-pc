<template>
  <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="项目选择" :visible.sync="visible"
    :close-on-click-modal="false" :close-on-press-escape="false" width="1300px" append-to-body>
    <div slot="title" class="el-dialog__title">
      项目选择
      <div class="flex-dialog-button">
        <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
        <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
      </div>
    </div>
    <el-form ref="formData" :model="formData" label-suffix="：" label-width="110px">
      <el-col :span="6">
        <el-form-item label="项目编号" prop="projectCode">
          <el-input class="border-radius50" v-model="formData.projectCode" placeholder="请输入项目编号" clearable
            @keyup.enter.native="searchData" />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="项目名称" prop="projectName">
          <el-input class="border-radius50" v-model="formData.projectName" placeholder="请输入项目名称" clearable
            @keyup.enter.native="searchData" />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="所属组织" v-if="propsFormData.unitId" prop="unitName">
          <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData" :fieldData="{fieldCode: 'unitName', fieldName: '所属组织'}" z-index="99999" />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="项目负责人" prop="directorName">
          <el-input class="border-radius50" v-model="formData.directorName" placeholder="请输入项目负责人" clearable
            @keyup.enter.native="searchData" />
        </el-form-item>
      </el-col>
    </el-form>

    <div class="table-wrapper">
      <el-table ref="tableRef" :data="dataList" border height="100%" @row-click="rowClick" @row-dblclick="dbClick"
        @sort-change="sortableColumnChange" v-loading="loading" v-if="visible">
        <el-table-column align="center" width="50">
          <template v-slot="{ row }">
            <el-radio v-model="selectDataRow" :label="row.id" class="table-radio"></el-radio>
          </template>
        </el-table-column>
        <el-table-column label="序号" align="center" type="index" :index="tableIndex" width="60" />
        <el-table-column prop="projectCode" label="项目编号" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.id, refName: 'projectManagementOperate' })">{{
                row.projectCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="项目名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column v-if="propsFormData.unitId" prop="unitName" label="所属组织" align="left" show-overflow-tooltip
          min-width="150" />
        <el-table-column prop="approvalDeptName" label="业务部门" sortable="custom" :filters="[]"
          :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
          align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="directorName" label="项目负责人" sortable="custom" :filters="[]"
          :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
          align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="projectStartDate" label="项目开始时间" align="center" show-overflow-tooltip min-width="130">
          <template slot-scope="{row}">
            <span>{{ parseTime(row.projectStartDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="projectEndDate" label="项目结束时间" align="center" show-overflow-tooltip min-width="130">
          <template slot-scope="{row}">
            <span>{{ parseTime(row.projectEndDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <pagination v-if="visible" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />

    <template #footer>
      <el-button plain round type="primary" @click="saveSelection" v-preventReClick>保存</el-button>
      <el-button plain round @click.native="visible = false">取消</el-button>
    </template>
    <detail-dialog ref="detailDialogRef" />
  </Dialog>
</template>

<script>

import indexMixin from '@/views/mixins'
import inMixin from '@/views/components/mixins'
import { projectAllList, projectContactQuotePageList } from '@/api/projectManagement/projectManager'
import FormUnitId from '@/views/components/form-unitId'

export default {
  name: 'selectProduct',
  mixins: [indexMixin, inMixin],
  components: {
    FormUnitId,
    DetailDialog: () => import('@/views/components/DetailDialog')
  },
  props: {
    singleMode: {
      type: Boolean,
      required: false,
      default: false
    },
    typeUrl: {
      type: String,
      required: false,
      default: ''
    },
    propsFormData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      dialogParam: {},
      visible: false,
      formData: {
        projectCode: '',
        projectName: '',
        directorName: '',
        unitName: '',
      },
      loading: false,
      tableData: [],
      total: 0,
      selectDataRow: null,
      selectArr: []
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.$refs.formData.resetFields()
        this.tableData = []
      } else {
        this.$nextTick(() => {
          this.$refs.formData.resetFields()
          this.tableData = []
          this.listQuery.pageNum = 1
          this.listQuery.pageSize = 30
          this.getList()
        })
      }
    }
  },
  methods: {
    init(id = null, arr = []) {
      this.selectDataRow = null
      if (this.singleMode) {
        this.selectDataRow = id
      } else {
        this.selectArr = arr
      }
      this.visible = true
    },
    rowClick(row) {
      if (this.singleMode) {
        // 单选选中行
        this.selectDataRow = row.id
      } else {
        if (this.selectArr.includes(row.id)) {
          return false
        }
        const idList = this.tableData.map((item) => item.id)
        if (idList.includes(row.id)) {
          return
        }
        // 多选选中行
        // 根据id判断当前点击的是否被选中
        const selected = this.selectArr.some(item => item.id === row.id)
        if (!selected) {
          // 选择
          this.selectArr.push(row)
          this.$refs.tableRef.toggleRowSelection(row, true)
        } else {
          // 取消
          var finalArr = this.selectArr.filter((item) => {
            return item.id !== row.id
          })
          // 取消后剩余选中的
          this.selectArr = finalArr
          this.$refs.tableRef.toggleRowSelection(row, false)
        }
      }
    },
    searchData() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    // 保存选择
    saveSelection() {
      if (this.singleMode) {
        if (this.selectDataRow == null) {
          this.$message.warning('请选择项目')
          return
        }
        const data = this.tableData.find(item => item.id === this.selectDataRow)
        this.$emit('selections', data)
      } else {
        if (!this.selectArr.length) {
          this.$message.warning('请选择项目')
          return
        }
        this.$emit('selections', this.selectArr)
      }
      this.visible = false
    },
    // 物资列表双击添加到BOM清单
    dbClick(row) {
      if (!this.singleMode) {
        const flag = this.tableData.some(item => item.id === row.id)
        if (flag) {
          this.$message.warning('此条数据已经添加')
          return
        }
      }
      this.$emit('selections', this.singleMode ? row : [row])
      this.visible = false
    },
    // 查询物资
    getList() {
      this.loading = true
      const url = this.typeUrl === 'projectContactQuotePageList' ? projectContactQuotePageList : projectAllList
      url(Object.assign({}, this.formData, this.listQuery, { status: '3' }, this.propsFormData)).then(({ data }) => {
        this.tableData = data?.list || []
        this.dataList = data?.list || []
        this.total = data?.total || 0
        // if (this.selectArr.length) {
        //   const selectRowIdGroup = this.selectArr.map(item => item.id)
        //   this.tableData.forEach(item => {
        //     if (selectRowIdGroup.includes(item.id)) {
        //       this.$nextTick(() => {
        //         this.$refs.tableRef.toggleRowSelection(item)
        //       })
        //     }
        //   })
        // }
      }).finally(() => {
        this.loading = false
      })
    },
    // 重置物资列表查询
    resetSearch() {
      this.$refs.formData.resetFields()
      this.getList()
    },
    emitAblFilter() {
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
