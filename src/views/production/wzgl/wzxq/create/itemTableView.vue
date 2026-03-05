<template>
  <div class="material-search-table">
    <!-- 搜索框 -->
    <div class="search-container">
      <div style="font-size: 20px; font-weight: bold">
        请选择用料物资（已选择
        <i style="color: red">{{ Object.keys(selectedMap).length }}</i> 项）
      </div>
      <el-input v-model="searchKeyword" placeholder="请输入规格型号搜索" clearable prefix-icon="el-icon-search" size="small"
        style="width: 200px"></el-input>
    </div>

    <!-- 表格 -->
    <el-table ref="tableRef" :data="filteredData" style="width: 100%" border @selection-change="noop"
      @select="handleSelect" @select-all="handleSelectAll" max-height="500">
      <el-table-column align="center" type="selection" width="55" fixed :selectable="selectable"></el-table-column>
      <el-table-column type="index" align="center" label="序号" width="60" fixed></el-table-column>
      <el-table-column prop="materialName" align="center" label="物资名称" width="250" fixed></el-table-column>
      <el-table-column prop="specModel" align="center" label="规格型号" width="250" fixed></el-table-column>

      <el-table-column prop="unit" label="计量单位" align="center" width="120"></el-table-column>
      <el-table-column prop="amount" label="合同数量" align="center" width="120">
        <template slot-scope="scope">
          {{ scope.row.amount }}
         <el-tooltip
                v-if="scope.row.negative && scope.row.negative < 0"
                class="el-icon-warning-outline negative-tip-icon clickable"
                :content="`当前物资存在所有负合同数量总和为: ${scope.row.negative}`"
                title="点击查看补充合同列表"
              >
             <i  @click="handleNegativeIconClick(scope.row)" class="el-icon-warning-outline negative-tip-icon"></i></el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="cumulativeAmount" label="已累计计划数量" align="center" width="150"></el-table-column>
      <el-table-column prop="deliveryDate" label="供应时间" align="center" width="200"></el-table-column>
      <el-table-column prop="deliveryLocation" label="交货地点" align="center" width="200"></el-table-column>
      <el-table-column prop="receiver" label="收货人及联系方式" align="center" min-width="200"></el-table-column>
    </el-table>
    <ViewNegativeContractsDialog ref="viewNegativeContractsDialogRef" />

  </div>
</template>

<script>
import { mapState } from 'vuex';
import ViewNegativeContractsDialog from '@/views/production/contract/list/components/viewNegativeContractsDialog.vue';
export default {
  // 物资选择预览
  components: {
    ViewNegativeContractsDialog,
  },
  props: {
    allData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchKeyword: '',
      selectedMap: {}, // 使用对象或Map来存储全局选中项（按id）
      hasRestoredFromStore: false, // ✅ 是否已初始化选中项
    };
  },
  computed: {
    ...mapState(['request']),
    // 根据搜索词过滤表格数据
    filteredData() {
      if (!this.searchKeyword) return this.allData;
      return this.allData.filter(row =>
        row.specModel.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
    }
  },
  watch: {
    // 每次搜索结果变更后，重新设置选中状态
    filteredData() {
      this.$nextTick(this.restoreSelection);
    },
    allData: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.syncStoreSelectedData();
        }
      },
      immediate: true // 组件创建时立即执行一次
    },
  },
  methods: {
        /**
     * 处理负数图标点击事件
     * 打开查看补充合同列表弹窗
     */
    handleNegativeIconClick(row) {
      if (!row.id) {
        this.$message.warning('数据无效');
        return;
      }

      // 打开查看补充合同弹窗
      this.$refs.viewNegativeContractsDialogRef.open(row.id);
    },
    selectable(row) {
      // 合同数量不能为负数,且合同数量不等于已累计计划数量
      return +row.amount > 0 && +row.amount !== +row.cumulativeAmount
    },
    // 新增方法：同步store中已选中的数据到组件
    syncStoreSelectedData() {
      if (this.hasRestoredFromStore) return;
      const selected = this.getSelectedMaterialList();
      if (selected.length > 0) {
        selected.forEach(sel => {
          const match = this.allData.find(item => item.id === sel.id);
          if (match) {
            // ✅ 把 store 中的数据字段 merge 到 allData 的项上（只 merge 附加字段，不覆盖关键字段）
            Object.keys(sel).forEach(key => {
              if (key !== 'uid') {
                this.$set(match, key, sel[key]);
              }
            });
            this.$set(this.selectedMap, match.id, match); // ✅ 必须同步 selectedMap
            this.$nextTick(() => {
              this.$refs.tableRef.toggleRowSelection(match, true); // ✅ 先设置数据再勾选 UI
            });
          }
        });

        // this.sortData(); // 排序
      }
      this.hasRestoredFromStore = true; // ✅ 防止后续重新勾选
    },
    getSelectedMaterialList() {
      return this.request.selectedMaterialList
    },
    async noop() {
      // 忽略默认 selection-change 行为
      await new Promise(resolve => setTimeout(resolve, 10))
      this.$emit('onSelectRow', Object.values(this.selectedMap))
    },

    // 恢复当前页已选中的行
    restoreSelection() {
      this.$refs.tableRef && this.$refs.tableRef.clearSelection();
      this.filteredData.forEach(row => {
        if (this.selectedMap[row.id]) {
          this.$refs.tableRef.toggleRowSelection(row, true);
        }
      });
    },
    // 排序函数：已选项置顶
    sortData() {
      this.allData.sort((a, b) => {
        const aSelected = !!this.selectedMap[a.id];
        const bSelected = !!this.selectedMap[b.id];
        if (aSelected === bSelected) return 0;
        return aSelected ? -1 : 1;
      });
    },

    // 用户单选时记录勾选状态
    handleSelect(selection, row) {
      if (selection.find(r => r.id === row.id)) {
        this.$set(this.selectedMap, row.id, row);
      } else {
        this.$delete(this.selectedMap, row.id);
      }
      // this.sortData(); // 排序
    },

    // 用户点击“全选”或“取消全选”
    handleSelectAll(selection) {
      const currentIds = this.filteredData.map(row => row.id);
      currentIds.forEach(id => {
        const row = this.allData.find(r => r.id === id);
        if (selection.find(r => r.id === id)) {
          this.$set(this.selectedMap, id, row);
        } else {
          this.$delete(this.selectedMap, id);
        }
      });
      // this.sortData(); // 排序
    },
  },
  mounted() {
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

// 修复固定列滚动条点击问题
::v-deep .el-table {

  .el-table__fixed,
  .el-table__fixed-right {
    pointer-events: none; // 禁用固定列的鼠标事件

    // 但保留固定列内容的交互能力
    .el-table__fixed-body-wrapper,
    .el-table__fixed-header-wrapper {
      pointer-events: auto;
    }
  }

  // 确保滚动条区域可以接收事件
  .el-table__body-wrapper {
    pointer-events: auto;
  }
}

/* 负数提示图标样式 */
.negative-tip-icon {
  margin-left: 5px;
  color: #E6A23C;
  font-size: 16px;
  vertical-align: middle;
}

.negative-tip-icon.clickable {
  cursor: pointer;
}

.negative-tip-icon.clickable:hover {
  color: #D39C2F;
  transform: scale(1.1);
}
</style>