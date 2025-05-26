<template>
  <div style="height: 100%;">
    <el-form :inline="true">
      <el-form-item label="表名">
        <el-input v-model="queryParam.tableName" placeholder=""></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row style="height: 90%">
      <el-table class="select__table__gen" ref="table" :data="tableList" border height="100%" @select="selectRow">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column label="表名" prop="tableName" align="left"></el-table-column>
        <el-table-column label="描述" prop="tableComment" align="left"></el-table-column>
        <el-table-column label="创建时间" prop="createTime" align="center"></el-table-column>
        <el-table-column label="修改时间" prop="updateTime" align="center"></el-table-column>
      </el-table>
    </el-row>
  </div>
</template>

<script>
import { listDbTable } from '@/api/tool/gen'
export default {
  props: {
    selectedTableName: String,
    selectTableChange: Function
  },
  data() {
    return {
      queryParam: {
        tableName: ''
      },
      tableList: []
    }
  },
  created() {
    this.list()
  },
  methods: {
    //列表
    list() {
      listDbTable(this.queryParam).then(res => {
        this.tableList = res.data.list
        this.$nextTick(() => {
          this.tableList.forEach((item, index) => {
            if (item.tableName === this.selectedTableName) {
              this.$refs.table.toggleRowSelection(item)
            }
          });
        })
      })
    },
    //查询
    handleQuery() {
      // this.list()
      this.$refs.table.toggleRowSelection({tableName: 'matl_dict'}, true)
    },
    //重置
    resetQuery() {
      this.queryParam.tableName = ''
      this.tableName = ''
      this.list()
    },
    //列选择
    selectRow(selection, row) {
      this.$emit('selectTableChange', row.tableName)
      if (selection.length > 1) {
        this.$refs.table.toggleRowSelection(selection[0], false)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.select__table__gen{
    ::v-deep .el-table__header-wrapper .el-checkbox {
        display: none
    }
}
</style>