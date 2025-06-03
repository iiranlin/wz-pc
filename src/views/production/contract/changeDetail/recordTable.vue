<template>
  <div>
    <el-table :data="tableData" border style="width: 100%">
      <!-- 序号 -->
      <el-table-column type="index" label="序号" align="center" width="80px">
      </el-table-column>
      <el-table-column
        prop="updateContent"
        label="变更内容"
        align="center"
        width="150px"
      >
      </el-table-column>
      <el-table-column
        prop="updateType"
        label="变更类型"
        align="center"
        width="150px"
      >
      </el-table-column>
      <el-table-column
        prop="updateBefore"
        label="变更前"
        align="center"
      >
      </el-table-column>
      <el-table-column
        prop="updateAfter"
        label="变更后"
        align="center"
      >
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  // 记录变更表格
  name: "recordTable",
  props: {
    tableData: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    id () {
      return this.$route.query.id;
    }
  },
  data () {
    return {
    }
  },
  methods: {
    handleDetails (row) {
      this.$router.push({
        name: 'changeDetailContract',
        query: {
          // id 合同名称 
          id: this.id,
          recordId: row.id,
          type: 'view'
        }
      })
    },
    open (data) {
      this.tableData = data;
    },
  }
}
</script>

<style lang="scss" scoped>
.slotIcon-color-content {
  color: red;
}

.slotIcon-color {
  color: #1890ff;
}

.ml-20 {
  margin-left: 20px !important;
}

.mt-20 {
  margin-top: 20px !important;
}
</style>