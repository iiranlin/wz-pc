<template>
  <div class="tab-table-container">
    <!-- Action Button -->
    <div class="flex">
      <span class="title">
        发运物资明细 （共计<span style="color: red">{{ selection.length }}</span
        >条）
      </span>
      <el-button type="primary" icon="el-icon-plus" size="mini" @click="selectItem"
        >选择发货物资</el-button
      >
    </div>
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      :max-height="600"
      v-loading="loading"
      :row-key="getRowKey"
      @selection-change="handleSelectionChange"
      ref="dataTable"
    >
      <el-table-column type="index" label="序号" width="55" align="center" fixed="left" />
      <!-- ✅ 多选框列 -->
      <el-table-column
        type="selection"
        width="55"
        fixed="left"
        align="center"
      ></el-table-column>
      <el-table-column prop="materialName" label="标段项目名称" width="250" fixed="left">
      </el-table-column>
      <el-table-column prop="materialName" label="物资名称" width="250" fixed="left">
      </el-table-column>
      <el-table-column
        prop="projectShortName"
        label="规格型号"
        width="120"
      ></el-table-column>

      <el-table-column
        prop="projectShortName"
        label="计量单位"
        width="120"
      ></el-table-column>
      <el-table-column prop="projectShortName" label="数量" width="120"></el-table-column>
      <el-table-column
        prop="projectShortName"
        label="包装形式"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="projectShortName"
        label="生产日期"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="projectShortName"
        label="有效期截止日期"
        width="120"
      ></el-table-column>
      <el-table-column prop="projectShortName" label="备注" width="120"></el-table-column>
      <el-table-column
        prop="projectShortName"
        label="合格证附件"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="projectShortName"
        label="厂检报告附件"
        width="120"
      ></el-table-column>
    </el-table>
  </div>
</template>

<script>
import * as ItemApi from "@/api/prodmgr-inv/project/item.js";
import * as LineApi from "@/api/prodmgr-inv/project/line.js";
export default {
  name: "tabTable",
  dicts: ["MeasureUnit"],
  props: {
    // 接收外部传入的表格数据
    tableData: {
      type: Array,
      default: () => [],
    },
    PARAMS:Object
  },
  components: {},
  data() {
    return {
      loading: false,
      selection: [],
      params: {
        pageNum: 1,
        pageSize: -1,
      },
    };
  },

  created() {},
  methods: {
    selectItem() {
      this.$router.push({
        name: "selectItem",
        params: this.PARAMS,
      });
    },
    // 返回唯一行 key，用于多选保留状态
    getRowKey(row) {
      return `${row.id}`;
    },
    // 处理表格的勾选变化 - 修改版本
    handleSelectionChange(selection) {
      this.selection = selection;
    },
  },
};
</script>

<style scoped>
.flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}
.flex .title {
  font-weight: 600;
  color: #000;
  padding-left: 12px;
}
/* 表格样式优化 */
::v-deep .el-table {
  border-radius: 8px;
  overflow: hidden;
}

::v-deep .el-table__body-wrapper {
  max-height: 600px;
  overflow-y: auto;
}

::v-deep .el-table tbody tr:hover > td {
  background-color: #f5f7fa !important;
}

::v-deep .el-select {
  width: 100%;
}

/* 加载动画 */
::v-deep .el-loading-mask {
  border-radius: 8px;
}

/* 滚动条样式 */
::v-deep .el-table__body-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

<style>
.app-container > div + div {
  overflow: auto;
}
</style>
