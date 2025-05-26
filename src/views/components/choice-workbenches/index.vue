<template>
  <Dialog class="flex-dialog max-height-dialog" title="选择工作台" :visible.sync="visible" :close-on-click-modal="false"
    :close-on-press-escape="false" tabindex='1' width="1300px" append-to-body>
    <div slot="title" class="el-dialog__title">
      选择工作台
      <div class="flex-dialog-button">
        <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
        <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
      </div>
    </div>
    <el-form ref="searchInfo" :model="formData" label-suffix="：" label-width="105px">
      <el-row>
        <el-col :span="24">
          <el-row>
            <el-col :span="6">
              <el-form-item label="应用编码" prop="applyCode" class="border-radius50">
                <el-input v-model="formData.applyCode" placeholder="请输入应用编码" @keyup.enter.native="searchData"
                  clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="应用名称" prop="applyName" class="border-radius50">
                <el-input v-model="formData.applyName" placeholder="请输入应用名称" @keyup.enter.native="searchData"
                  clearable />
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-form>

    <div class="table-wrapper" v-if="visible">
      <el-table ref="contractCommonTable" :row-style="changeDisabled" :data="dataList" border height="100%"
        @row-dblclick="dbClick" @selection-change="handleSelectChange" v-loading="loading" row-key="id"
        @row-click="rowClick" @sort-change="sortableColumnChange">
        <el-table-column align="center" width="50" v-if="singleMode" fixed="left">
          <template v-slot="{ row }">
            <el-radio v-model="selectDataRow" :label="row.applyCode" class="table-radio"></el-radio>
          </template>
        </el-table-column>
        <el-table-column :selectable="isSelectable" :reserve-selection="true" type="selection" align="center" width="50"
          fixed="left" v-else></el-table-column>
        <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
        <el-table-column prop="applyCode" label="应用编码" align="center" show-overflow-tooltip min-width="200">
          <template slot-scope="{row}">
            <el-button type="text" size="small" @click="$refs.applicataionOperate.init('view', { id: row.applyId });">{{ row.applyCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="applyName" label="应用名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="applyType" label="应用类型" align="center" show-overflow-tooltip min-width="150">
          <!-- <template slot-scope="{row}">
            <span :class="`span_apply_type${row.applyType}`">{{ row.applyType | orderTypeFilter(dict.type.applyCategory) }}</span>
          </template> -->
          <template slot-scope="{row}">
            <div v-if="row.applyCategory == '1'">
              <span :class="checkFrameTypeCircle(row.applyType)"></span>
              <span class="frameType-font">{{ row.applyType | orderTypeFilter(dict.type.frameType) }}</span>
            </div>
            <span v-else :class="checkWorkbenchApplyTypeStyle(row.applyType)">
              {{ row.applyType | orderTypeFilter(dict.type.workbenchApplyType) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="machineType" label="机器类型" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <div>
              <span :class="checkFrameTypeCircle(row.machineType)"></span>
              <span class="frameType-font">{{ row.machineType | orderTypeFilter(dict.type.frameType) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createUserName" label="创建人" align="center" show-overflow-tooltip min-width="150" />
        <el-table-column prop="createDate" label="创建时间" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ parseTime(row.createDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateDate" label="修改时间" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ parseTime(row.updateDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="getList" />
    <template #footer>
      <el-button plain round type="primary" @click="saveSelection" v-preventReClick>保存</el-button>
      <el-button plain round @click.native="visible = false">取消</el-button>
    </template>
    <detail-dialog ref="detailDialogRef" />
    <applicataionOperate ref="applicataionOperate"></applicataionOperate>
  </Dialog>
</template>

<script>

import indexMixin from '@/views/mixins'
import inMixin from '@/views/components/mixins'
import { baseApplyList } from '@/api/warehouseManage/intelligentApplication'
export default {
  name: 'ChoiceWorkbenches',
  dicts: ['frameType', 'workbenchApplyType'],
  components: {
    DetailDialog: () => import('@/views/components/DetailDialog'),
    applicataionOperate: () => import('@/views/warehouseManage/warehousFundamentals/intelligentApplication/components/applicataionOperate')
  },
  mixins: [indexMixin, inMixin],
  props: {
    filterCondition: {
      type: Object,
      default: function () {
        return {}
      }
    },
    singleMode: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      visible: false,
      formData: {
        applyCode: '',
        applyName: '',
        machineType: ''
      },
      loading: false,
      tableData: [],
      selectDataRow: null,
      total: 0,
      selectData: [],
      selected: [],
    }
  },
  filters: {
    reviewMethodFilter(val, code) {
      for (let key of code) {
        if (key.value == val) {
          return key.label
        }
      }
    }
  },
  methods: {
    checkWorkbenchApplyTypeStyle(value) {
      if (value == '1') {
        return 'workbenchApplyType-1'
      } else if (value == '2') {
        return 'workbenchApplyType-2'
      } else if (value == '3') {
        return 'workbenchApplyType-3'
      }
    },
    checkFrameTypeCircle(value) {
      if (value == '1') {
        return 'frameType-1'
      } else if (value == '2') {
        return 'frameType-2'
      } else if (value == '4') {
        return 'frameType-4'
      }
    },
    handleSelectChange(arr) {
      this.selectData = arr
    },
    changeDisabled({ row }) {
      const idList = this.selected.map((item) => item.applyCode)
      return idList.includes(row.applyCode) ? {
        opacity: "0.5",
        pointerEvents: "none"
      } : {}
    },
    isSelectable(row) {
      const idList = this.selected.map((item) => item.applyCode)
      return !idList.includes(row.applyCode)
    },
    init(applyCode = null, selected = [], { frameType }) {
      this.formData.machineType = frameType
      this.visible = true
      this.selectDataRow = null
      if (this.singleMode) {
        this.selectDataRow = applyCode
      } else {
        this.selected = [...selected]
      }
      this.$nextTick(() => {
        this.$refs.searchInfo.resetFields()
        this.tableData = []
        this.getList()
      })
    },
    searchData() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    // 保存选择
    saveSelection() {
      if (this.singleMode) {
        if (!this.selectDataRow) {
          this.$message.warning('请选择工作台')
          return
        }
        const data = this.tableData.find(item => item.applyCode === this.selectDataRow)
        this.$emit('selections', data)
      } else {
        if (!this.selectData.length) {
          this.$message.warning('请选择工作台')
          return
        }
        this.$emit('selections', this.selectData)
      }

      this.visible = false
    },
    dbClick(row) {
      if (!this.singleMode) {
        const flag = this.selected.some(item => item.applyCode === row.applyCode)
        if (flag) {
          this.$message.warning('此条数据已经添加')
          return
        }
      }
      this.$emit('selections', this.singleMode ? row : [row])
      this.visible = false
    },
    rowClick(row) {
      if (this.singleMode) {
        // 单选选中行
        this.selectDataRow = row.applyCode
      } else {
        const idList = this.selected.map((item) => item.applyCode)
        if (idList.includes(row.applyCode)) {
          return
        }
        // 多选选中行
        // 根据id判断当前点击的是否被选中
        const selected = this.selectData.some(item => item.applyCode === row.applyCode)
        if (!selected) {
          // 选择
          this.selectData.push(row)
          this.$refs.contractCommonTable.toggleRowSelection(row, true)
        } else {
          // 取消
          var finalArr = this.selectData.filter((item) => {
            return item.applyCode !== row.applyCode
          })
          // 取消后剩余选中的
          this.selectData = finalArr
          this.$refs.contractCommonTable.toggleRowSelection(row, false)
        }
      }
    },
    getList() {
      const param = Object.assign({}, this.formData, this.listQuery, this.filterCondition)
      this.loading = true
      baseApplyList(param).then(({ data }) => {
        this.tableData = data?.list || []
        this.dataList = data?.list || []
        this.total = data?.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    resetSearch() {
      this.$refs.searchInfo.resetFields()
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

.workbenchApplyType-1 {
  display: inline-block;
  padding: 0 8px;
  background-color: #feffd7;
  border: 1px solid #facd91;
  border-radius: 4px;
  box-sizing: border-box;
  white-space: nowrap;
  font-size: 12px;
  line-height: 26px;
  height: 26px;
}

.workbenchApplyType-2 {
  display: inline-block;
  padding: 0 8px;
  background-color: #dafe9e;
  border: 1px solid #95f204;
  border-radius: 4px;
  box-sizing: border-box;
  white-space: nowrap;
  font-size: 12px;
  line-height: 26px;
  height: 26px;
}

.workbenchApplyType-3 {
  display: inline-block;
  padding: 0 8px;
  background-color: #caffff;
  border: 1px solid #80ffff;
  border-radius: 4px;
  box-sizing: border-box;
  white-space: nowrap;
  font-size: 12px;
  line-height: 26px;
  height: 26px;
}

.frameType-1 {
  display: inline-block;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #81d3f8;
  margin-right: 5px;
  transform: translateY(2px);
}

.frameType-2 {
  display: inline-block;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #c280ff;
  margin-right: 5px;
  transform: translateY(2px);
}

.frameType-4 {
  display: inline-block;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #d8001b;
  margin-right: 5px;
  transform: translateY(2px);
}

.frameType-font {
  width: 70px;
  display: inline-block;
}
</style>
