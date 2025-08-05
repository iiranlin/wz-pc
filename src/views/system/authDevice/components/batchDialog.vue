<template>
  <Dialog
    :title="title"
    :visible.sync="visible"
    v-if="visible"
    :show-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    append-to-body
    :destroy-on-close="true"
    width="850px"
  >
    <div style="display: flex; gap: 20px">
      <el-upload
        class="upload-demo"
        drag
        action=""
        :http-request="handleUpload"
        :before-upload="beforeUpload"
        :show-file-list="false"
        accept=".xlsx,.xls"
        v-loading="loading"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <div
        class="el-upload__tip"
        style="display: flex; align-items: center"
        slot="tip"
      >
        <div>
          1、每次上传一个excel格式文件，不超过100MB。<br />
          2、请严格按模板格式上传。 <br />
          3、<a
            style="color: #409eff; cursor: pointer"
            download
            href="/授权设备导入模板.xlsx"
            >模板下载</a
          >
        </div>
      </div>
    </div>

    <el-table :data="fileList" border style="width: 100%; margin-top: 20px">
      <el-table-column prop="fileName" label="文件名" />
      <el-table-column prop="number" label="授权设备条数" />
      <el-table-column
        prop="fileSize"
        label="文件大小"
        :formatter="formatFileSize"
      />
      <el-table-column prop="status" label="状态" />
    </el-table>

    <el-alert
      v-if="fileList.length > 0 && fileList[0].reason.length > 0"
      title="提示"
      type="warning"
      :closable="false"
      style="margin-top: 16px; width: 100%"
    >
      <template>
        <div style="height: 250px">
          <virtual-list
            :data-key="'index'"
            :data-sources="reasonListWithIndex"
            :data-component="reasonItemComponent"
            :estimate-size="32"
            :keeps="20"
            style="height: 100%; overflow-y: auto"
          />
        </div>
      </template>
    </el-alert>

    <div slot="footer" class="dialog-footer">
      <el-button round @click="visible = false">关闭</el-button>
    </div>
  </Dialog>
</template>

<script>
import { itemBatchImport } from "@/api/prodmgr-inv/project/item.js";
import VirtualList from "vue-virtual-scroll-list";

// 定义列表项组件
const ReasonItem = {
  props: {
    source: {
      type: Object,
      required: true,
    },
  },
  render(h) {
    return h("li", {}, [`${this.source.text}`]);
  },
};

export default {
  name: "batchDialog",
  components: {
    VirtualList,
  },
  data() {
    return {
      loading: false,
      title: "批量导入",
      visible: false,
      tableData: [],
      fileList: [],
      reasonItemComponent: ReasonItem,
    };
  },
  computed: {
    reasonListWithIndex() {
      if (!this.fileList.length || !this.fileList[0].reason) return [];
      // 确保所有数据都被正确映射
      const result = this.fileList[0].reason.map((text, index) => ({
        index,
        text,
      }));
      console.log(`总数据条数: ${result.length}`); // 调试用
      return result;
    },
  },
  methods: {
    formatFileSize(row, column, cellValue) {
      if (!cellValue) return "0 KB";
      const sizeInMB = cellValue / (1024 * 1024);
      if (sizeInMB < 1) {
        const sizeInKB = cellValue / 1024;
        return sizeInKB.toFixed(2) + " KB";
      } else {
        return sizeInMB.toFixed(2) + " MB";
      }
    },
    open() {
      this.visible = true;
      this.fileList = [];
    },
    //取消
    handleCancel() {
      this.visible = false;
    },
    onOk() {
      if (!this.fileList[0]?.list?.length) {
        this.$message.warning("请先上传文件");
        return;
      }
      this.$emit("onOk", this.fileList[0].list);
      this.visible = false;
    },
    beforeUpload(file) {
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls");
      const isLt100M = file.size / 1024 / 1024 < 100;
      if (!isExcel) {
        this.$message.error("只能上传 Excel 文件");
      }
      if (!isLt100M) {
        this.$message.error("文件大小不能超过 100MB");
      }
      return isExcel && isLt100M;
    },
    handleUpload({ file }) {
      const formData = new FormData();
      formData.append("file", file);
      this.loading = true;
      itemBatchImport(formData)
        .then((res) => {
          this.fileList = [res.data];
          // 判断 reason 是否存在且有内容
          if (Array.isArray(res.data.reason) && res.data.reason.length > 0) {
            this.$message.warning("文件存在错误，请查看提示信息");
            // 不关闭弹窗，只更新fileList并让用户查看错误信息
          } else {
            this.$message.success("导入成功");
            this.$emit("onOk"); // 正常导入才关闭
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.el-upload__text em {
  color: #409eff;
  cursor: pointer;
}
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

::v-deep .el-alert__content {
  width: 100%;
}
</style>
