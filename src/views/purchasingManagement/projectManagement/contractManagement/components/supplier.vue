<template>
  <Dialog class="flex-dialog max-height-dialog" :visible.sync="openDataScope" width="60%"
             :close-on-click-modal="false" append-to-body title="选择供应商"  
  >
  <div slot="title" class="el-dialog__title" >
        选择供应商
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="handleReset">重置</el-button>
            </div>
        </div>
    <el-form ref="elForm" :model="formData" label-width="140px">
      <el-row>
        <el-col :span="8">
          <el-form-item label="供应商名称:" class="custom-form-item">
            <el-input size="small" placeholder="" clearable v-model="formData.suName"
                      @keyup.enter.native="handleQuery"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item   label="统一社会信用代码" class="custom-form-item">
            <el-input style="width: 100%" size="small" placeholder="" clearable v-model="formData.suUnicode"
                      @keyup.enter.native="handleQuery"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-table v-loading="loading" ref="multipleTable" border :data="tableData" height="100%" @row-click="handleRadio" @row-dblclick="dblclick">
      <el-table-column label="" align="center" width="50">
        <template slot-scope="scope">
          <el-radio v-model="selId" :label="scope.row.suId" @input="handleRadio(scope.row)"><span></span></el-radio>
        </template>
      </el-table-column>
      <el-table-column label="序号" align="left" type="index" width="50"/>
      <el-table-column label="供应商名称" align="left" prop="suName" min-width="150"></el-table-column>
      <el-table-column label="供应商简称" align="left" prop="suSimpleName" :show-overflow-tooltip="true"
                       min-width="120"
      ></el-table-column>
      <el-table-column label="统一社会信用代码" align="left" prop="suUnicode" :show-overflow-tooltip="true"
                       min-width="150"
      >
      </el-table-column>
      <el-table-column label="供应商类型" align="left" prop="suType" min-width="200">
        <template slot-scope="{row}">
            <span>{{ row.suType | orderTypeFilter(dict.type.supplierType) }}</span>
          </template>
      </el-table-column>
      <el-table-column label="是否限制" align="left" prop="banned" min-width="90">
        <template slot-scope="{row}">
            <span>{{ row.banned | orderTypeFilter(dict.type.YesNo) }}</span>
          </template>
      </el-table-column>
      <el-table-column label="创建人" align="left" prop="createName" min-width="100"></el-table-column>
      <el-table-column label="创建时间" align="center" prop="createDate" min-width="180">
        <template slot-scope="{row}">
          <span>{{ parseTime(row.createDate,  '{y}-{m}-{d}') }}</span>
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
import { PuSuList } from '@/api/purchasingManagement/supplier'
import indexMixin from '@/views/mixins'
export default {
  name: 'supperDialog',
  mixins: [indexMixin],
  dicts: ['supplierType', 'YesNo'],
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
        suName: '',
        suUnicode: ''
      },
      selId: null
    }
  },
  methods: {
    init(suId = null) {
      this.openDataScope = true
    
      this.$nextTick(() => {
        this.$refs.multipleTable.clearSelection()
        this.selId = suId
      })
      this.getList()
    },
    getList() {
      this.loading = true
      PuSuList(Object.assign({banned: 0, status: 3}, this.formData, this.listQuery)).then(({ data }) => {
        this.tableData = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleQuery() {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData)
      this.getList()
    },
    submitDataScope() {
      /*需要过滤掉选中的数据*/
      this.$emit('selectSupplier', this.selection)
      this.openDataScope = false
      this.selectRow = []
    },
    handleRadio(row) {
      this.selection = row
    },
    dblclick(row) {
      this.$emit('selectSupplier', row)
      this.openDataScope = false
      this.selectRow = []
    },
    handleReset() {
      this.formData.suName = ''
      this.formData.suUnicode = ''
      this.getList()
    }
  }
}
</script>
