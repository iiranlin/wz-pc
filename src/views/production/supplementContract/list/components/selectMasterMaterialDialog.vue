<template>
  <el-dialog
    title="选择主合同物资"
    :visible.sync="dialogVisible"
    width="80%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 提示信息 -->
    <el-alert
      title="当前合同数量存在负数,系统未自动匹配到对应物资,需手动选择对应物资"
      type="warning"
      :closable="false"
      style="margin-bottom: 20px"
    ></el-alert>

    <!-- 标段项目筛选Tab -->
    <el-tabs v-model="activeTab" @tab-click="handleTabClick" style="margin-top: 10px;">
      <el-tab-pane label="全部" name="all"></el-tab-pane>
      <el-tab-pane 
        v-for="section in sectionTabs" 
        :key="section.name" 
        :label="section.label"
        :name="section.name"
      ></el-tab-pane>
    </el-tabs>

    <!-- 主合同物资列表 -->
    <el-table
      ref="dataTable"
      :data="filteredTableData"
      border
      style="width: 100%"
      max-height="450"
      v-loading="loading"
    >
      <!-- 单选列 -->
      <el-table-column label="选择" width="80" align="center" fixed>
        <template slot-scope="scope">
          <el-radio v-model="selectedId" :label="scope.row.id" @change="handleRadioChange(scope.row)">
            <span></span>
          </el-radio>
        </template>
      </el-table-column>
      <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
      <el-table-column prop="materialName" label="物资名称" minWidth="200" align="center"></el-table-column>
      <el-table-column prop="sectionName" label="标段项目名称" minWidth="150" align="center"></el-table-column>
      <el-table-column prop="specModel" label="规格型号" width="200" align="center"></el-table-column>
      <el-table-column prop="unit" label="计量单位" width="120" align="center"></el-table-column>
      <el-table-column prop="amount" label="数量" width="120" align="center"></el-table-column>
      <el-table-column prop="price" label="到站不含税单价(元)" width="160" align="center"></el-table-column>
      <el-table-column prop="vatRate" label="物资增值税率(%)" width="150" align="center">
        <template slot-scope="scope">
          {{ scope.row.vatRate }}
        </template>
      </el-table-column>
      <el-table-column prop="taxPrice" label="到站含税单价(元)" width="150" align="center">
        <template slot-scope="scope">
          {{ scope.row.taxPrice ? scope.row.taxPrice.toFixed(2) : '' }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 底部按钮 -->
    <div  class="dialog-footer">
      <el-button @click="handleClose" style="margin:10px 10px 0 0;">取 消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saveLoading">保 存</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as ContractItemApi from '@/api/prodmgr-inv/project/contractItem.js';

export default {
  name: 'SelectMasterMaterialDialog',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      saveLoading: false,
      tableData: [],
      activeTab: 'all', // 当前激活的标段Tab
      currentRow: null, // 当前正在操作的补充合同物资行
      selectedRow: null, // 用户选择的主合同物资行
      selectedId: null, // 单选按钮选中的ID
      contractId: null // 主合同ID (parentId)
    };
  },
  computed: {
    /**
     * 根据当前 Tab 筛选表格数据
     */
    filteredTableData() {
      if (this.activeTab === 'all') {
        return this.tableData;
      }
      
      // 找到对应的标段名称
      const selectedSection = this.sectionTabs.find(s => s.name === this.activeTab);
      if (!selectedSection) {
        return this.tableData;
      }
      
      // 按标段名称筛选
      return this.tableData.filter(item => item.sectionName === selectedSection.sectionName);
    },
    
    /**
     * 生成标段 Tab 列表
     */
    sectionTabs() {
      // 提取所有唯一的标段名称
      const sectionNames = [...new Set(this.tableData.map(item => item.sectionName).filter(Boolean))];
      
      // 生成 Tab 配置
      return sectionNames.map((name, index) => ({
        name: `section-${index}`,
        label: name,
        sectionName: name
      }));
    }
  },
  methods: {
    /**
     * 打开弹窗
     * @param {String} contractId - 主合同ID (parentId)
     * @param {Object} currentRow - 当前补充合同物资行数据
     */
    async open(contractId, currentRow) {
      this.dialogVisible = true;
      this.contractId = contractId;
      this.currentRow = currentRow;
      this.selectedRow = null;
      this.selectedId = null; // 重置单选按钮
      this.activeTab = 'all'; // 重置Tab为全部
      
      // 加载主合同物资列表
      await this.loadMasterMaterialList();
    },

    /**
     * 加载主合同物资列表
     */
    async loadMasterMaterialList() {
      if (!this.contractId) {
        this.$message.error('主合同ID不能为空');
        return;
      }

      this.loading = true;
      try {
        const res = await ContractItemApi.mainItemList({
          contractId: this.contractId
        });
        
        if (res.code === 0) {
          this.tableData = res.data.list || res.data || [];
        } else {
          this.$message.error(res.msg || '获取主合同物资列表失败');
        }
      } catch (error) {
        console.error('加载主合同物资列表失败:', error);
        this.$message.error('加载主合同物资列表失败');
      } finally {
        this.loading = false;
      }
    },

    /**
     * 处理单选按钮变化
     */
    handleRadioChange(row) {
      this.selectedRow = row;
      console.log('选中物资:', row);
    },

    /**
     * 保存选择
     */
    async handleSave() {
      if (!this.selectedRow) {
        this.$message.warning('请先选择一条主合同物资');
        return;
      }

      if (!this.currentRow || !this.currentRow.id) {
        this.$message.error('当前行数据无效');
        return;
      }

      // 二次确认
      try {
        await this.$confirm('指定关系后将无法进行修改，请确认操作', '确认提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
      } catch {
        // 用户取消操作
        return;
      }

      this.saveLoading = true;
      try {
        const res = await ContractItemApi.saveContractItem({
          id: this.currentRow.id,
          masterDetailId: this.selectedRow.id
        });

        if (res.code === 0) {
          this.$message.success('保存成功');
          this.dialogVisible = false;
          // 触发父组件刷新事件，传递保存的数据
          this.$emit('save-success', {
            id: this.currentRow.id,
            masterDetailId: this.selectedRow.id
          });
        } else {
          this.$message.error(res.msg || '保存失败');
        }
      } catch (error) {
        console.error('保存失败:', error);
        this.$message.error('保存失败');
      } finally {
        this.saveLoading = false;
      }
    },

    /**
     * 处理 Tab 点击事件
     */
    handleTabClick(tab) {
      console.log('切换到Tab:', tab.name);
      // Tab切换时清除选择
      this.selectedRow = null;
      this.selectedId = null;
    },

    /**
     * 关闭弹窗
     */
    handleClose() {
      this.dialogVisible = false;
      this.tableData = [];
      this.activeTab = 'all';
      this.selectedRow = null;
      this.selectedId = null;
      this.currentRow = null;
      this.contractId = null;
    }
  }
};
</script>

<style scoped>
/* Tab样式 */
::v-deep .el-tabs__header {
  margin-bottom: 15px;
}

::v-deep .el-tabs__item {
  font-weight: 500;
  transition: all 0.3s ease;
}

::v-deep .el-tabs__item.is-active {
  color: #409EFF;
  font-weight: 600;
}

::v-deep .el-tabs__active-bar {
  background-color: #409EFF;
}

/* 表格样式 */
::v-deep .el-table {
  border-radius: 8px;
  overflow: hidden;
}

::v-deep .el-table tbody tr:hover > td {
  background-color: #f5f7fa !important;
}

::v-deep .el-table__body tr.current-row > td {
  background-color: #ecf5ff !important;
}

.dialog-footer {
  text-align: right;
}
</style>
