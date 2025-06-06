<template>
  <div class="material-search-table">
    <!-- 搜索框 -->
    <div class="search-container">
      <div style="font-size: 20px; font-weight: bold">
        计划物资明细（共计
        <i style="color: red">{{ Object.keys(selectedMap).length }}</i> 项）
      </div>
      <!-- <el-input
        v-model="searchKeyword"
        placeholder="请输入物资名称搜索"
        clearable
        prefix-icon="el-icon-search"
        size="small"
        style="width: 200px"
      ></el-input> -->
      <el-button @click="addColumn" :disabled="dynamicColumns.length >= 5"
        >增加列</el-button
      >
    </div>

    <!-- 表格 -->
    <el-table ref="tableRef" :data="filteredData" style="width: 100%" border>
      <el-table-column
        type="index"
        align="center"
        label="序号"
        width="60"
      ></el-table-column>
      <el-table-column
        prop="sellerName"
        align="center"
        width="200"
        label="供应商"
      ></el-table-column>
      <el-table-column
        prop="materialName"
        align="center"
        width="200"
        label="物资名称"
      ></el-table-column>
      <el-table-column
        prop="specModel"
        align="center"
        width="200"
        label="规格型号"
      ></el-table-column>
      <el-table-column
        prop="unit"
        label="计量单位"
        align="center"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="amount"
        label="合同数量"
        align="center"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="cumulativeAmount"
        label="累计计划量（含本次）"
        align="center"
        width="200"
      >
      </el-table-column>
      <el-table-column
        prop="planAmount"
        label="本次计划数量"
        align="center"
        width="120"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="supplyDate"
        label="供应时间"
        min-width="200"
      >
        <template slot-scope="scope">
          {{ scope.row.supplyDate | formatDate }}
        </template>
      </el-table-column>
      <el-table-column
        prop="addr"
        label="使用地点"
        align="center"
        min-width="200"
      >
      </el-table-column>
      <el-table-column
        prop="receiver"
        label="收货人及联系方式"
        align="center"
        min-width="250"
      >
      </el-table-column>
      <el-table-column
        prop="remark"
        label="备注"
        align="center"
        min-width="200"
      ></el-table-column>
      <el-table-column
        v-for="col in dynamicColumns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        align="center"
        min-width="120"
      >
        <template slot="header" >
          <div style="display: flex; align-items: center">
            <el-input
              v-model="col.label"
              size="mini"
              style="width: 100px; margin-right: 5px"
              placeholder="列名"
            />
            <el-button
              icon="el-icon-delete"
              size="mini"
              type="danger"
              circle
              @click.stop="removeColumn(index)"
            />
          </div>
        </template>

        <!-- 单元格输入框 -->
        <template slot-scope="{ row }">
          <el-input
            v-model="row[col.prop]"
            size="mini"
            placeholder="请输入"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import { mapState } from 'vuex';
export default {
  // 物资选择预览
  props: {
    allData: {
      type: Array,
      default: () => []
    }
  },
  filters: {
    formatDate (date) {
      if (!date) return '';
      return dayjs(date).format('YYYY-MM-DD')

    }
  },
  data () {
    return {
      searchKeyword: '',
      selectedMap: {}, // 使用对象或Map来存储全局选中项（按id）
      hasRestoredFromStore: false, // ✅ 是否已初始化选中项
      dynamicColumns: [] // 动态列数组
    };
  },
  computed: {
    ...mapState(['requestPlan']),
    // 根据搜索词过滤表格数据
    filteredData () {
      if (!this.searchKeyword) return this.allData;
      return this.allData.filter(row =>
        row.materialName.includes(this.searchKeyword)
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
    // 删除列
  removeColumn(index) {
    const prop = this.dynamicColumns[index].prop;
    this.dynamicColumns.splice(index, 1);
    // 删除所有数据行中该字段
    this.allData.forEach(row => {
      this.$delete(row, prop);
    });
  },
    addColumn () {
      const max = 5;
      if (this.dynamicColumns.length >= max) return;
      const idx = this.dynamicColumns.length;
      this.dynamicColumns.push({
        prop: `field${idx}`,
        label: `自定义列${idx + 1}`,
        editable: true // 用于未来扩展，标识这是可编辑列
      });
    },
    // 新增方法：同步store中已选中的数据到组件
    syncStoreSelectedData () {
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

        this.sortData(); // 排序
      }
      this.hasRestoredFromStore = true; // ✅ 防止后续重新勾选
    },
    getSelectedMaterialList () {
      return this.requestPlan.selectedMaterialList
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
        if (this.selectedMap[row.id]) {
          this.$refs.tableRef.toggleRowSelection(row, true);
        }
      });
    },
    // 排序函数：已选项置顶
    sortData () {
      this.allData.sort((a, b) => {
        const aSelected = !!this.selectedMap[a.id];
        const bSelected = !!this.selectedMap[b.id];
        if (aSelected === bSelected) return 0;
        return aSelected ? -1 : 1;
      });
    },

    // 用户单选时记录勾选状态
    handleSelect (selection, row) {
      if (selection.find(r => r.id === row.id)) {
        this.$set(this.selectedMap, row.id, row);
      } else {
        this.$delete(this.selectedMap, row.id);
      }
      this.sortData(); // 排序
    },

    // 用户点击“全选”或“取消全选”
    handleSelectAll (selection) {
      const currentIds = this.filteredData.map(row => row.id);
      currentIds.forEach(id => {
        const row = this.allData.find(r => r.id === id);
        if (selection.find(r => r.id === id)) {
          this.$set(this.selectedMap, id, row);
        } else {
          this.$delete(this.selectedMap, id);
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