<template>
  <div>
    <Dialog title="引用表单" :visible.sync="dialogFlag" width="1000px"  >
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="表单编号">
          <el-input v-model="searchForm.formCode" placeholder="表单编号"></el-input>
        </el-form-item>
        <el-form-item label="表单名称">
          <el-input v-model="searchForm.formName" placeholder="表单名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button type="primary" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData">
        <el-table-column prop="formCode" label="表单编号" align="left">
        </el-table-column>
        <el-table-column prop="formName" label="表单名称" align="left">
        </el-table-column>
        <el-table-column label="表单内容" align="left">
          <template slot-scope="{row}">
            <el-link type="primary" round @click="$parent.previewForm([row])">预览</el-link>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="{row}">
            {{ row.status == 0 ? '启用' : '停用' }}
          </template>
        </el-table-column>
        <el-table-column prop="formName" label="操作" align="center" width="180">
          <template slot-scope="{row}">
            <el-button size="mini" plain type="primary" v-if="formIdList.indexOf(row.id) == -1"
              @click="add(row)">引用</el-button>
            <el-button size="mini" plain type="danger" v-else @click="del(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="page.total > 0" :total="page.total" :page.sync="page.pageNum" :limit.sync="page.pageSize"
      @pagination="getFormList" />
    </Dialog>
  </div>
</template>
<script>
import { list as fromList } from '@/api/form/form'
export default {
  props: {
    formIdList: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      dialogFlag: false,
      searchForm: {},
      tableData: [],
      page: {
        pageNum: 1,
        pageSize: 10
      }
    }
  },
  methods: {
    init() {
      this.searchForm = {}
      this.$nextTick(() => {
        this.getFormList()
      });
    },
    getFormList() {
      fromList(Object.assign({}, this.searchForm, this.page)).then(res => {
        this.page["total"] = res.data.total
        this.tableData = res.data.list
        this.dialogFlag = true
      })
    },
    search() {
      this.getFormList()
    },
    reset() {
      this.searchForm = {}
      this.getFormList()
    },
    add(row) {
      this.$parent.addChildForm(row);
    },
    del(row) {
      this.$parent.delChildForm(row);
    },
    handleSizeChange(val) {
      this.page = { pageSize: val, pageNum: 1 }
      this.getFormList()
    },
    handleCurrentChange(val) {
      this.page["pageNum"] = val
      this.getFormList()
    }
  }
}
</script>
<style lang="scss" scoped>
.el-table__row .el-button--primary {
  margin-right: 0px
}
::v-deep .el-dialog__body {
  flex: 1;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
}
::v-deep .el-dialog__body .el-table {
  flex: 1;
  overflow-y: scroll;
}
</style>