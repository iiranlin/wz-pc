<template>
  <div class="tab-table-container">
    <div class="flex">
      <span class="title">
        请选择本次发货物资 （已选择<span style="color: red">{{
          Object.keys(selectedMap).length
        }}</span
        >项）
      </span>
      <!-- <el-select
        class="select-box"
        v-model="form.deptId"
        placeholder="请选择需求组织"
        clearable
        style="width: 240px"
        size="small"
        @change="findWzList"
      >
        <el-option
          v-for="(item, key) in deptList"
          :key="key"
          :label="item.deptName"
          :value="item.deptId"
        />
      </el-select> -->
    </div>
    <el-table
      :data="tableData"
      border
      style="width: 100%" max-height="350"
      v-loading="loading"
      @selection-change="noop"
      @select="handleSelect"
      @select-all="handleSelectAll"
      ref="tableRef"
    >
      <el-table-column type="index" label="序号" width="55" align="center" fixed="left"  show-overflow-tooltip/>
      <!-- ✅ 多选框列 -->
      <el-table-column
        type="selection"
        width="55"
        fixed="left"
        align="center"
        :selectable="selectable"
       show-overflow-tooltip></el-table-column>
      <el-table-column prop="materialName" label="物资名称" width="200" fixed="left" show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="specModel"
        label="规格型号"
        width="200"
        align="center"
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="unit"
        label="计量单位"
        width="100"
        align="center"
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="amount"
        label="合同数量"
        width="120"
        align="center"
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="cumulativeAmount"
        label="累计计划量（含本次）"
        width="120"
        align="center"
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="planAmount"
        label="本次计划数量"
        width="120"
        align="center"
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="supplyDate"
        label="供应时间"
        width="140"
        align="center"
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="addr"
        label="使用地点"
        width="200"
        align="center"
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="receiver"
        label="收货人及联系方式"
        width="180"
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="field0"
        label="投资方"
        width="160"
        align="center"
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="field1"
        label="投资比例"
        width="150"
        align="center"
       show-overflow-tooltip></el-table-column>
      <el-table-column prop="remark" label="备注" width="200" show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="ssendTotal"
        label="本次需求未发货数量"
        width="120"
        align="center"
        fixed="right"
       show-overflow-tooltip></el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as Api from "@/api/prodmgr-inv/project/scm.js";

export default {
  name: "itemTable",
  dicts: ["MeasureUnit"],

  props: {
    tableData: {
      type: Array,
      default: () => [],
    },
  },
  components: {},
  computed: {
    type() {
      return this.$route.query.type;
    },
    id() {
      return this.$route.query?.id || "";
    },
    ...mapState(["request"]),
  },
  data() {
    return {
      loading: false,
      tableData: [],
      tableData: [],
      selectRows: [],
      form: {},
      deptList: [],
      selectedMap: {}, // 使用对象或Map来存储全局选中项（按id）
      hasRestoredFromStore: false, // ✅ 是否已初始化选中项
    };
  },
  watch: {
    tableData: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.syncStoreSelectedData();
        }
      },
      immediate: true, // 组件创建时立即执行一次
    },
  },
  mounted() {},
  activated() {
    (this.hasRestoredFromStore = false), (this.form = {});
  },
  created() {},
  methods: {
    // 新增方法：同步store中已选中的数据到组件
    syncStoreSelectedData() {
      if (this.hasRestoredFromStore) return;
      const selected = this.getSelectedItemList();
      console.log(selected, "=======selected=====");
      if (selected.length > 0) {
        selected.forEach((sel) => {
          const match = this.tableData.find((item) => item.allocationUniqueNumber === sel.allocationUniqueNumber);
          if (match) {
            // ✅ 把 store 中的数据字段 merge 到 tableData 的项上（只 merge 附加字段，不覆盖关键字段）
            Object.keys(sel).forEach((key) => {
              this.$set(match, key, sel[key]);
            });
            this.$set(this.selectedMap, match.id, match); // ✅ 必须同步 selectedMap
            this.$nextTick(() => {
              this.$refs.tableRef.toggleRowSelection(match, true); // ✅ 先设置数据再勾选 UI
            });
          }
        });
      }
      this.hasRestoredFromStore = true; // ✅ 防止后续重新勾选
    },
    async noop() {
      // 忽略默认 selection-change 行为
      await new Promise((resolve) => setTimeout(resolve, 10));
      this.$emit("onSelectRow", Object.values(this.selectedMap));
    },

    // 恢复当前页已选中的行
    restoreSelection() {
      this.$refs.tableRef && this.$refs.tableRef.clearSelection();
      this.tableData.forEach((row) => {
        if (this.selectedMap[row.id]) {
          this.$refs.tableRef.toggleRowSelection(row, true);
        }
      });
    },
    // 排序函数：已选项置顶
    sortData() {
      this.tableData.sort((a, b) => {
        const aSelected = !!this.selectedMap[a.id];
        const bSelected = !!this.selectedMap[b.id];
        if (aSelected === bSelected) return 0;
        return aSelected ? -1 : 1;
      });
    },

    // 用户单选时记录勾选状态
    handleSelect(selection, row) {
      if (selection.find((r) => r.id === row.id)) {
        this.$set(this.selectedMap, row.id, row);
      } else {
        this.$delete(this.selectedMap, row.id);
      }
      // this.sortData(); // 排序
    },

    // 用户点击“全选”或“取消全选”
    handleSelectAll(selection) {
      const currentIds = this.tableData.map((row) => row.id);
      currentIds.forEach((id) => {
        const row = this.tableData.find((r) => r.id === id);
        if (selection.find((r) => r.id === id)) {
          this.$set(this.selectedMap, id, row);
        } else {
          this.$delete(this.selectedMap, id);
        }
      });
      // this.sortData(); // 排序
    },
    setSelectedItemList(data) {
      this.$store.dispatch("request/setSelectedItemList", data);
    },
    getSelectedItemList() {
      return this.request.selectedItemList;
    },
    selectable(row) {
      if(!row.ssendTotal||row.ssendTotal==0){
         return false;
      }else{
        return true;
      }
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
