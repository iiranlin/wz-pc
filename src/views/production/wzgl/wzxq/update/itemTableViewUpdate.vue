<template>
  <div class="material-search-table">
    <!-- 搜索框 -->
    <div class="search-container">
      <div style="font-size: 20px; font-weight: bold">
        请选择用料物资科目（已选择
        <i style="color: red">{{ Object.keys(selectedMap).length }}</i> 项）
      </div>
      <el-input
        v-model="searchKeyword"
        placeholder="请输入规格型号搜索"
        clearable
        prefix-icon="el-icon-search"
        size="small"
        style="width: 200px"
      ></el-input>
    </div>

    <!-- 表格 -->
    <el-table
      ref="tableRef"
      :data="filteredData"
      style="width: 100%"
      border
      @selection-change="noop"
      @select="handleSelect"
      @select-all="handleSelectAll" max-height="350"
    >
      <el-table-column
        align="center"
        type="selection"
        width="55"
       show-overflow-tooltip></el-table-column>
      <el-table-column
        type="index"
        align="center"
        label="序号"
        width="60"
        fixed
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="sellerName"
        align="center"
        label="供应商"
       show-overflow-tooltip fixed></el-table-column>
      <el-table-column
        prop="materialName"
        align="center"
        label="物资名称"
       show-overflow-tooltip fixed></el-table-column>
      <el-table-column
        prop="specModel"
        align="center"
        label="规格型号"
       show-overflow-tooltip fixed></el-table-column>
      <el-table-column
        prop="unit"
        label="计量单位"
        align="center"
        width="120"
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="amount"
        label="合同数量"
        align="center"
        width="120"
       show-overflow-tooltip></el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  // 物资更新的时候选择预览 - 页面
  props: {
    allData: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      searchKeyword: '',
      selectedMap: {}, // 使用对象或Map来存储全局选中项（按id）
      hasRestoredFromStore: false, // ✅ 是否已初始化选中项
    };
  },
  computed: {
    ...mapState(['requestUpdate']),
    // 根据搜索词过滤表格数据
    filteredData () {
      if (!this.searchKeyword) return this.allData;
      return this.allData.filter(row =>
        row.specModel.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
    }
  },
  watch: {
    // 每次搜索结果变更后，重新设置选中状态
    filteredData () {
      this.$nextTick(this.restoreSelection);
    },
    allData: {
      handler (newVal) {
        if (newVal && newVal.length > 0) {
          this.syncStoreSelectedData();
        }
      },
      immediate: true // 组件创建时立即执行一次
    },
  },
  methods: {
    // 新增方法：同步store中已选中的数据到组件
    syncStoreSelectedData () {
      if (this.hasRestoredFromStore) return;
      const selected = this.getSelectedMaterialList();
      if (selected.length > 0) {
        selected.forEach(sel => {
          const match = this.allData.find(item => item.uid === sel.uid);
          if (match) {
            // ✅ 把 store 中的数据字段 merge 到 allData 的项上（只 merge 附加字段，不覆盖关键字段）
            Object.keys(sel).forEach(key => {
              if (key !== 'uid') {
                this.$set(match, key, sel[key]);
              }
            });
            this.$set(this.selectedMap, match.uid, match); // ✅ 必须同步 selectedMap
            this.$nextTick(() => {
              this.$refs.tableRef.toggleRowSelection(match, true); // ✅ 先设置数据再勾选 UI
            });
          }
        });

        this.sortData(); // 排序
      }
      this.hasRestoredFromStore = true; // ✅ 防止后续重新勾选
    },
    getSelectedMaterialList () {
      return this.requestUpdate.selectedMaterialList
    },
    async noop () {
      // 忽略默认 selection-change 行为
      await new Promise(resolve => setTimeout(resolve, 10))
      this.$emit('onSelectRow', Object.values(this.selectedMap))
    },

    // 恢复当前页已选中的行
    restoreSelection () {
      this.$refs.tableRef && this.$refs.tableRef.clearSelection();
      this.filteredData.forEach(row => {
        if (this.selectedMap[row.uid]) {
          this.$refs.tableRef.toggleRowSelection(row, true);
        }
      });
    },
    // 排序函数：已选项置顶
    sortData () {
      this.allData.sort((a, b) => {
        const aSelected = !!this.selectedMap[a.uid];
        const bSelected = !!this.selectedMap[b.uid];
        if (aSelected === bSelected) return 0;
        return aSelected ? -1 : 1;
      });
    },

    // 用户单选时记录勾选状态
    handleSelect (selection, row) {
      if (selection.find(r => r.uid === row.uid)) {
        this.$set(this.selectedMap, row.uid, row);
      } else {
        this.$delete(this.selectedMap, row.uid);
      }
      this.sortData(); // 排序
    },

    // 用户点击“全选”或“取消全选”
    handleSelectAll (selection) {
      const currentIds = this.filteredData.map(row => row.uid);
      currentIds.forEach(uid => {
        const row = this.allData.find(r => r.uid === uid);
        if (selection.find(r => r.uid === uid)) {
          this.$set(this.selectedMap, uid, row);
        } else {
          this.$delete(this.selectedMap, uid);
        }
      });
      this.sortData(); // 排序
    },
  },
  mounted () {
    this.restoreSelection();
  }
};
</script>

<style lang="scss" scoped>
.material-search-table {
  .search-container {
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
