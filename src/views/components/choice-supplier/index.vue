<template>
  <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="选择数据" :visible.sync="visible"
    :close-on-click-modal="false" width="1300px" >
    <div slot="title" class="el-dialog__title">
      选择数据
      <div class="flex-dialog-button">
        <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
        <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
      </div>
    </div>
    <el-form ref="elForm" :model="formData" label-suffix="：" label-width="110px">
      <el-row>
        <el-col :span="20">
          <el-row>
            <el-col :span="7">
              <el-form-item label="供应商编码" prop="suCode" class="border-radius50">
                <el-input v-model="formData.suCode" placeholder="请输入供应商编码" clearable
                  @keyup.enter.native="searchData" />
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="供应商名称" prop="suName" class="border-radius50">
                <el-input v-model="formData.suName" placeholder="请输入供应商名称" clearable @keyup.enter.native="searchData" />
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="供应商类型" prop="suType" class="border-radius50">
                <el-select v-model="formData.suType" clearable placeholder="请选择供应商类型" style="width: 100%">
                  <el-option v-for="(item, key)  in dict.type.supplierType" :key="key" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
        <!-- <el-col :span="4" style="text-align: right">
          <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
          <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <div class="table-wrapper">
      <el-table ref="tableRef" :data="tableData" border height="100%" row-key="suId" v-loading="loading"
        @row-click="rowClick" @row-dblclick="dbClick">
        <el-table-column fixed="left" align="center" width="50" key="radio">
          <template v-slot="{ row }">
            <el-radio v-model="selectDataRow" :label="row" class="table-radio"></el-radio>
          </template>
        </el-table-column>
        <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
        <el-table-column prop="suCode" label="供应商编码" align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
              <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, {id: row.suId, refName: 'supplierOperate'})">{{ row.suCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="suName" label="供应商名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="suType" label="供应商类型" align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.suType | orderTypeFilter(dict.type.supplierType) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="suUnicode" label="统一社会信用代码" align="left" show-overflow-tooltip min-width="150" />
      </el-table>
    </div>

    <pagination v-if="visible" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />

    <template #footer>
      <el-button plain round type="primary" @click="saveSelection" v-preventReClick>确定</el-button>
      <el-button plain round @click.native="visible = false">取消</el-button>
    </template>
    <detail-dialog ref="detailDialogRef"/>
  </Dialog>
</template>

<script>

import indexMixin from '@/views/mixins'
import { PuSuList } from '@/api/purchasingManagement/supplier'

export default {
  mixins: [indexMixin],
  dicts: ['supplierType'],
  components: {
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
  data() {
    return {
      visible: false,
      formData: {
        suName: '',
        suCode: '',
        suType: ""
      },
      loading: false,
      tableData: [],
      total: 0,
      selectDataRow: null,
    }
  },
  methods: {
    open(id = null) {
      this.visible = true;
      this.selectDataRow = id;
      this.$nextTick(() => {
        this.$refs.elForm.resetFields()
        this.tableData = []
        this.listQuery.pageNum = 1
        this.listQuery.pageSize = 30
        this.getList()
      })
    },
    searchData() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    // 保存选择
    saveSelection() {
      this.$emit('selections', this.selectDataRow)
      this.visible = false
    },
    // 物资列表双击添加到BOM清单
    dbClick(row) {
      this.$emit('selections', row)
      this.visible = false
    },
    rowClick(row) {
      // 单选选中行
      this.selectDataRow = row;
    },
    // 查询供应商
    getList() {
      this.loading = true
      PuSuList(Object.assign({}, this.formData, this.listQuery)).then(({ data }) => {
        this.tableData = data?.list || []
        this.total = data?.total || 0
        if (this.selectDataRow) {
          this.$nextTick(() => {
            for (let i = 0; i < this.tableData.length; i++) {
              if (this.tableData[i].suId == this.selectDataRow) {
                this.selectDataRow = this.tableData[i]
                break;
              }
            }
          })
        }
      }).finally(() => {
        this.loading = false
      })
    },
    // 重置物资列表查询
    resetSearch() {
      this.$refs.elForm.resetFields()
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
