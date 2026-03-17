<template>
  <Dialog :title="title" :visible.sync="visible" v-if="visible" :show-close="true" :close-on-click-modal="false"
    :close-on-press-escape="false" append-to-body :destroy-on-close="true" class="dialog-route" width="60%"
    height="600px">
    <el-table :data="tableData" style="width: 100%;margin-top: 16px;" max-height="500">
      <el-table-column type="index" label="序号" width="120px" align="center">
      </el-table-column>
      <el-table-column prop="number" label="合同编号" align="center"> </el-table-column>
      <el-table-column prop="name" label="合同名称" align="center"> </el-table-column>
      <el-table-column prop="materialName" label="物资名称" align="center"> </el-table-column>
      <el-table-column prop="materialSpec" label="规格型号" align="center"> </el-table-column>
      <el-table-column prop="materialUnitPrice" label="不含税单价/元" align="center"> </el-table-column>
      <el-table-column prop="sectionName" label="标段项目" align="center"> </el-table-column>
      <el-table-column prop="buyer" label="供应商" align="center"> </el-table-column>
    </el-table>

    <div slot="footer" class="dialog-footer">
      <el-button round @click="visible = false" style="margin-right: 10px;">关闭</el-button>
      <!-- 下载 -->
      <el-button type="primary" @click="handleDownload">下载</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as FileApi from "@/api/prodmgr-inv/project/file.js";
export default {
  name: "sectionDialog",
  data() {
    return {
      loading: false,
      title: '详情',
      visible: false,
      tableData: [],
      id:null,
    }
  },
  methods: {
    open(tableData,id) {
      this.tableData = tableData;
      this.id = id;
      this.visible = true;
    },
    //取消
    handleCancel() {
      this.visible = false;
    },
    async handleDownload() {
      try {
        this.loading = true;
        await FileApi.customDownload({ businessType: 8, businessData: this.id });
      } catch (error) {
        this.$modal.msgError("下载失败，请重试");
      } finally {
        this.loading = false;
      }
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