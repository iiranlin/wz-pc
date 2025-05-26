<template>
  <Dialog class="flex-dialog max-height-dialog" :visible.sync="openDataScope" width="80%"
             :close-on-click-modal="false" append-to-body title="选择物料"  
  >
    <el-form ref="elForm" :model="formData" label-width="100px">
      <el-row>
        <el-col :span="6">
          <el-form-item label="物料编码:" class="custom-form-item">
            <el-input size="small" placeholder="" clearable v-model="formData.matlCode"
                      @keyup.enter.native="handleQuery"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="物料名称:" class="custom-form-item">
            <el-input size="small" placeholder="" clearable v-model="formData.matlName"
                      @keyup.enter.native="handleQuery"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="规格型号:" class="custom-form-item">
            <el-input size="small" placeholder="" clearable v-model="formData.matlType"
                      @keyup.enter.native="handleQuery"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6" style="text-align: center;">
          <el-button plain round class="search-btn" type="primary" @click="handleQuery">查询</el-button>
          <el-button plain round class="search-btn" @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </el-form>
    <el-table v-loading="loading" ref="multipleTable" border :data="tableData" height="100%"
              @selection-change="handleSelectionChange" @row-click="rowClick"
    >
      <el-table-column align="center" :selectable="selectable" :reserve-selection="true" type="selection" width="55"></el-table-column>
      <el-table-column label="序号" align="left" type="index" width="50"/>
      <el-table-column label="物料编码" align="left" prop="matlCode" min-width="150"></el-table-column>
      <el-table-column label="物料名称" align="left" prop="matlName" :show-overflow-tooltip="true" min-width="120"
      ></el-table-column>
      <el-table-column label="规格型号" align="left" prop="matlType" :show-overflow-tooltip="true" min-width="150">
      </el-table-column>
      <el-table-column label="计量单位" align="left" prop="matlUnit" min-width="100">
        <template slot-scope="{row}">
            <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
        </template>
      </el-table-column>
      <!--      <el-table-column label="状态" align="center" prop="matlNum" min-width="150"></el-table-column>-->
      <el-table-column label="创建时间" align="center" prop="createDate" min-width="150">
        <template slot-scope="{row}">
          <span>{{ parseTime(row.createDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="updateDate" min-width="150">
        <template slot-scope="{row}">
          <span>{{ parseTime(row.updateDate) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
                @pagination="getList"
    />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitDataScope">确 定</el-button>
      <el-button @click="openDataScope = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import { matlList } from '@/api/prodmgr-mm/matlMatl'
import indexMixin from '@/views/mixins'
export default {
  name: 'material',
  mixins: [indexMixin],
  dicts: ['MeasureUnit'],
  data() {
    return {
      loading: false,
      openDataScope: false,
      tableData: [],
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 10
      },
      formData: {
        matlCode: '',
        matlName: '',
        matlType: '',
      },
      selection: null,
      selectRow: [],
      multipleSelection: []
    }
  },
  methods: {
    init(row) {
      this.openDataScope = true
      this.selectRow = row
      this.$nextTick(() => {
        this.$refs.multipleTable.clearSelection()
      })
      this.getList()
    },
    getList() {
      this.loading = true
      matlList(Object.assign({}, this.formData, this.listQuery)).then(({ data }) => {
        this.tableData = data.list
        this.total = data.total
        if (this.selectRow.length) {
          const selectRowIdGroup = this.selectRow.map(item => item.matlCode)
          this.tableData.forEach(item => {
            if (selectRowIdGroup.includes(item.matlCode)) {
              this.$nextTick(() => {
                this.$refs.multipleTable.toggleRowSelection(item)
              })
            }
          })
        }
      }).finally(() => {
        this.loading = false
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    rowClick(row, column) {
      const selectRowIdGroup = this.selectRow.map(item => item.matlCode)
      if (selectRowIdGroup.includes(row.matlCode)) {
        return
      }
      const multipleSelectionCodeGroup = this.multipleSelection.map(item => item.matlCode)
      if (multipleSelectionCodeGroup.includes(row.matlCode)) {
        this.$refs.multipleTable.toggleRowSelection(row, false)
      } else {
        this.$refs.multipleTable.toggleRowSelection(row, true)
      }
    },
    handleQuery() {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData)
      this.getList()
    },
    handleReset() {
      this.formData.matlCode = ''
      this.formData.matlName = ''
      this.getList()
    },
    submitDataScope() {
      let filterArray = []
      this.multipleSelection.forEach(item => {
        const selectRowIdGroup = this.selectRow.map(item => item.matlCode)
        if (!selectRowIdGroup.includes(item.matlCode)) {
          filterArray.push(item)
        }
      })
      /*需要过滤掉选中的数据*/
      this.$emit('select', filterArray)
      this.openDataScope = false
      this.selectRow = []
    },
    selectable(row, index) {
      const selectRowIdGroup = this.selectRow.map(item => item.matlCode)
      return !selectRowIdGroup.includes(row.matlCode)
    }
  }
}
</script>
