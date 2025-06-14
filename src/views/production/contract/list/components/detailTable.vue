<template>
  <div>
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column
        prop="contractVersion"
        label="版本"
        align="center"
        width="80px"
      >
      </el-table-column>
      <el-table-column
        prop="contractName"
        label="合同名称"
        align="center"
        width="150px"
      >
      </el-table-column>
      <el-table-column
        prop="contractNo"
        label="合同编号"
        align="center"
        width="150px"
      >
      </el-table-column>
      <el-table-column
        prop="complementName"
        label="补充合同名称"
        align="center"
        width="200px"
      >
      </el-table-column>
      <el-table-column prop="updateReason" label="变更原因" align="center">
      </el-table-column>
      <el-table-column
        prop="updateDetails"
        label="变更内容"
        align="center"
        width="120px"
      >
        <template slot-scope="scope">
          <div
            style="color: #2196f3; cursor: pointer"
            @click="handleDetails(scope.row)"
          >
            查看
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="fileList"
        label="补充合同附件"
        align="center"
        width="200px"
      >
        <template slot-scope="scope">
          <fileUpload
            v-if="scope.row.fileList[0]"
            :value="scope.row.fileList[0].fileList"
            :limit="1"
            :fileSize="200"
            :fileType="['pdf']"
            :preview="'view'"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="createUserName"
        label="操作人"
        align="center"
        width="120px"
      >
      </el-table-column>
      <el-table-column
        prop="updateDate"
        label="操作时间"
        align="center"
        width="200px"
      >
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import fileUpload from '@/components/upload'
export default {
  // 记录变更表格
  name: "detailTable",
  props: {
    tableData: {
      type: Array,
      default: () => []
    }
  },
  components: {
    fileUpload
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
          // 传当前行id 
          id: row.id,
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