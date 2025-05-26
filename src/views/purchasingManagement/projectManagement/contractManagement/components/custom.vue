<template>
  <Dialog class="flex-dialog max-height-dialog" :visible.sync="openDataScope" width="80%"
             :close-on-click-modal="false" append-to-body title="选择客户"  
  >
    <div slot="title" class="el-dialog__title">
        选择客户
        <div class="flex-dialog-button">
            <el-button plain round class="search-btn" type="primary" @click="handleQuery">查询</el-button>
            <el-button plain round class="search-btn" @click="handleReset">重置</el-button>
        </div>
    </div>
    <el-form ref="elForm" :model="formData" label-width="100px">
      <el-row>
        <el-col :span="6">
          <el-form-item label="客户编号:" class="custom-form-item border-radius50">
            <el-input size="small" placeholder="" clearable v-model="formData.cuCode"
                      @keyup.enter.native="handleQuery"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="客户名称:" class="custom-form-item border-radius50">
            <el-input size="small" placeholder="" clearable v-model="formData.cuName"
                      @keyup.enter.native="handleQuery"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-table v-loading="loading" ref="multipleTable" border row-key="cuCode" :data="dataList" height="100%" @row-click="rowClick" @row-dblclick="dblclick" @sort-change="sortableColumnChange">
     
      <el-table-column fixed="left" align="center" width="50" v-if="singleMode" key="radio">
          <template v-slot="{ row }">
              <el-radio v-model="selectDataRow" :label="row.cuCode" class="table-radio"></el-radio>
          </template>
      </el-table-column>
      <el-table-column v-else fixed="left" align="center" :selectable="isSelectable" key="selectable"
          :reserve-selection="true" type="selection" width="50" />    
      <el-table-column label="序号" align="left" type="index" width="50"/>
      <el-table-column label="客户编号" align="left" prop="cuCode" min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, {id: row.id, refName: 'customerProfileAdd'})">{{ row.cuCode }}</el-button>
          </template> 
      </el-table-column>
      <el-table-column label="客户名称" align="left" prop="cuName" :show-overflow-tooltip="true" min-width="120"
      ></el-table-column>
      <el-table-column label="客户简称" sortable="custom" :filters="[]" :render-header="(h, obj) => renderSpecNameHeader(h, obj, {fieldType: 'String', fieldFormatArr: [], fieldFormat: ''})" align="left" prop="csName" :show-overflow-tooltip="true" min-width="150">
      </el-table-column>
      <el-table-column label="统一社会信用代码" sortable="custom" :filters="[]" :render-header="(h, obj) => renderSpecNameHeader(h, obj, {fieldType: 'String', fieldFormatArr: [], fieldFormat: ''})" align="left" prop="socialCode" min-width="200">
      </el-table-column>
      <el-table-column label="客户分类" align="left" sortable="custom" :filters="[]" :render-header="(h, obj) => renderSpecNameHeader(h, obj, {fieldType: 'dict', fieldFormatArr: dict.type.customerType, fieldFormat: ''})" prop="cuType" min-width="150">
        <template slot-scope="{row}">
          <span>{{ row.cuType | orderTypeFilter(dict.type.customerType) }}</span>
        </template>
      </el-table-column>
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
        <el-button plain round type="primary" @click="submitDataScope">确 定</el-button>
        <el-button plain round @click.native="openDataScope = false">取 消</el-button>
    </div>
    <detail-dialog ref="detailDialogRef"/>
  </Dialog>
</template>

<script>
import { getProfileList } from '@/api/saleManage/customerProfile'
import indexMixin from '@/views/mixins';
import inMixin from '@/views/components/mixins'

export default {
  name: 'custom',
  dicts: ['customerType'],
  mixins: [indexMixin, inMixin],
  components: {
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
      loading: false,
      openDataScope: false,
      tableData: [],
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 10
      },
      formData: {
        cuCode: '',
        cuName: '',
        status: '3'
      },
      selectDataRow: null,
      selectDatas: []
    }
  },
  methods: {
    isSelectable(row) {
            return true
        },
    init(id=null, selects=[]) {
      this.openDataScope = true
      this.selectDataRow = null
      this.selectDatas = []
      if (this.singleMode) {
                    this.selectDataRow = id
                } else {
                    this.selectDatas = selects
                }
      // this.$nextTick(() => {
      //   this.$refs.multipleTable.clearSelection()
      // })
      this.getList()
    },
    getList() {
      this.loading = true
      getProfileList(Object.assign({}, this.formData, this.listQuery)).then(({ data }) => {
        this.tableData = data.list
        this.dataList = data.list
        this.total = data.total
        if (this.selectDatas.length) {
                    const selectRowIdGroup = this.selectDatas.map(item => item.cuCode)
                    this.tableData.forEach(item => {
                        if (selectRowIdGroup.includes(item.cuCode)) {
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
    handleQuery() {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData)
      this.getList()
    },
    submitDataScope() {
      if (this.singleMode) {
                if (this.selectDataRow == null) {
                    this.$message.warning('请选择客户')
                    return
                }
                const data = this.tableData.find(item => item.cuCode === this.selectDataRow)
                this.$emit('selectCustom', data)
            } else {
                if (!this.selectDatas.length) {
                    this.$message.warning('请选择客户')
                    return
                }
                this.$emit('selectCustom', this.selectDatas)
            }
            this.openDataScope = false
    },
    rowClick(row) {
            if (this.singleMode) {
                // 单选选中行
                this.selectDataRow = row.cuCode
            } else {
              
                const idList = this.selectDatas.map((item) => item.cuCode)
                if (idList.includes(row.cuCode)) {
                    return
                }
                // 多选选中行
                // 根据id判断当前点击的是否被选中
                const selected = this.selectDatas.some(item => item.cuCode === row.cuCode)
                if (!selected) {
                    // 选择
                    this.selectDatas.push(row)
                    this.$refs.multipleTable.toggleRowSelection(row, true)
                } else {
                    // 取消
                    var finalArr = this.selectDatas.filter((item) => {
                        return item.cuCode !== row.cuCode
                    })
                    // 取消后剩余选中的
                    this.selectDatas = finalArr
                    this.$refs.multipleTable.toggleRowSelection(row, false)
                }
            }
        },
    dblclick(row) {

      if (!this.singleMode) {
                const flag = this.selectDatas.some(item => item.cuCode === row.cuCode)
                if (flag) {
                    this.$message.warning('此条数据已经添加')
                    return
                }
            }
            this.$emit('selectCustom', this.singleMode ? row : [row])
            this.openDataScope = false
    },
    handleReset() {
      this.formData.cuCode = ''
      this.formData.cuName = ''
      this.getList()
    },
    emitAblFilter () {
      this.getList()
    }
  }
}
</script>
