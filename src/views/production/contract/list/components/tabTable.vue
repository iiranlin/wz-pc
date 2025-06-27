<template>
  <div class="tab-table-container">
    <!-- Action Button -->
    <template v-if="type !== 'view'">
      <!-- <el-button type="primary" icon="el-icon-plus" size="mini" @click="onAdd"
        >添加物资</el-button
      > -->
      <!-- 批量导入 -->
      <el-button
        type="primary"
        icon="el-icon-upload"
        size="mini"
        @click="onBatchUpload"
        >批量导入</el-button
      >
      <!-- 删除 -->
      <el-button
        type="danger"
        icon="el-icon-delete"
        size="mini"
        @click="onDelete"
        >删除</el-button
      >
    </template>
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="建设项目" name="total"></el-tab-pane>
      <el-tab-pane
        v-for="project in projectTabs"
        :key="project.name"
        :label="project.label"
        :name="project.name"
      ></el-tab-pane>
    </el-tabs>

    <div style="max-height: 450px">
      <virtual-scroll
        :dynamic="false"
        v-show="show"
        ref="virtualScroll"
        :data="filteredTableData"
        :item-size="62"
        key-prop="id"
        @change="(renderData) => (virtualList = renderData)"
      >
        <el-table
          :data="virtualList"
          border
          style="width: 100%"
          max-height="450"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          @select="onSelect"
          ref="dataTable"
          row-key="id"
        >
          <virtual-column
            label="序号"
            width="88"
            align="center"
            type="index"
            fixed
          ></virtual-column>
          <!-- 多选 -->
          <virtual-column
            v-if="type !== 'view'"
            width="60"
            type="selection"
            align="center"
            fixed
          ></virtual-column>
          <!-- ✅ 多选框列 -->
          <!-- <el-table-column
          type="selection"
          width="55"
          fixed
          align="center"
        ></el-table-column> -->
          <el-table-column
            prop="materialName"
            label="物资名称"
            width="250"
            fixed
            align="center"
          >
            <template slot-scope="scope">
              <el-select
                v-if="scope.row.isManual && type !== 'view'"
                v-model="scope.row.materialId"
                placeholder="请选择物资名称"
                size="mini"
                @change="handleFieldChange('materialId', scope.row)"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="unit of options['itemOptions']"
                  :key="unit.value"
                  :label="unit.label"
                  :value="unit.value"
                ></el-option>
              </el-select>
              <span v-else>{{ scope.row.materialName }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column
            prop="projectShortName"
            label="项目简称"
            width="120"
            align="center"
          ></el-table-column> -->

          <!-- 条件渲染：仅在总表中显示 -->
          <el-table-column
            v-if="activeTab === 'total'"
            prop="sectionName"
            label="标段项目名称"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <el-select
                v-if="scope.row.isManual && type !== 'view'"
                v-model="scope.row.sectionId"
                placeholder="请选择标段项目名称"
                size="mini"
                @change="handleFieldChange('sectionId', scope.row)"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="item of options['setcionOptions']"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
              <span v-else>{{ scope.row.sectionName }}</span>
            </template>
          </el-table-column>

          <!-- 其他列 -->
          <el-table-column
            prop="sellerName"
            label="卖方名称"
            width="120"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="specModel"
            label="规格型号"
            width="200"
            align="center"
          >
          </el-table-column>

          <!-- 可选择计量单位 -->
          <el-table-column
            prop="unit"
            label="计量单位"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.unit }}</span>
            </template>
          </el-table-column>

          <!-- 可编辑amount -->
          <el-table-column
            prop="amount"
            label="数量"
            width="180"
            align="center"
          >
            <template slot="header">
              <span style="color: red; margin-right: 5px">*</span>
              <span>数量</span>
            </template>
            <template slot-scope="scope">
              <el-input-number
                v-if="type !== 'view'"
                v-model="scope.row.amount"
                :min="0"
                :precision="2"
                size="mini"
                @change="handleFieldChange('amount', scope.row)"
                style="width: 100%"
              ></el-input-number>
              <span v-else>{{ scope.row.amount }}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="price"
            label="到站不含税单价(元)"
            width="200"
            align="center"
          >
            <template slot="header">
              <span style="color: red; margin-right: 5px">*</span>
              <span>到站不含税单价(元)</span>
            </template>
            <template slot-scope="scope">
              <el-input-number
                v-if="type !== 'view'"
                v-model="scope.row.price"
                :min="0"
                :precision="2"
                size="mini"
                @change="handleFieldChange('price', scope.row)"
                style="width: 100%"
              ></el-input-number>
              <span v-else>{{ scope.row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="vatRate"
            label="物资增值税率（%）"
            width="200"
            align="center"
          >
            <template slot="header">
              <span style="color: red; margin-right: 5px">*</span>
              <span>物资增值税率（%）</span>
            </template>
            <template slot-scope="scope">
              <el-input-number
                v-if="type !== 'view'"
                v-model="scope.row.vatRate"
                :min="0"
                :precision="2"
                size="mini"
                @change="handleFieldChange('vatRate', scope.row)"
                style="width: 100%"
              ></el-input-number>
              <span v-else>{{ scope.row.vatRate }}%</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="taxPrice"
            label="到站含税单价(元)"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              {{ scope.row.taxPrice ? scope.row.taxPrice.toFixed(2) : '' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="totalAmount"
            label="到站合价含税(元)"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              {{
                scope.row.totalAmount ? scope.row.totalAmount.toFixed(2) : ''
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="deliveryLocation"
            label="交货地点"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <el-input
                v-if="type !== 'view'"
                v-model="scope.row.deliveryLocation"
                size="mini"
                @change="handleFieldChange('deliveryLocation', scope.row)"
                style="width: 100%"
              ></el-input>
              <span v-else>{{ scope.row.deliveryLocation }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="receiver"
            label="收货人"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <el-input
                v-if="type !== 'view'"
                v-model="scope.row.receiver"
                size="mini"
                @change="handleFieldChange('receiver', scope.row)"
                style="width: 100%"
              ></el-input>
              <span v-else>{{ scope.row.receiver }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="deliveryStatus"
            label="交货状态"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <el-input
                v-if="type !== 'view'"
                v-model="scope.row.deliveryStatus"
                size="mini"
                @change="handleFieldChange('deliveryStatus', scope.row)"
                style="width: 100%"
              ></el-input>
              <span v-else>{{ scope.row.deliveryStatus }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="deliveryTerms"
            label="交货条件"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <el-input
                v-if="type !== 'view'"
                v-model="scope.row.deliveryTerms"
                size="mini"
                @change="handleFieldChange('deliveryTerms', scope.row)"
                style="width: 100%"
              ></el-input>
              <span v-else>{{ scope.row.deliveryTerms }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="deliveryDate"
            label="交货期"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <el-input
                v-if="type !== 'view'"
                v-model="scope.row.deliveryDate"
                size="mini"
                @change="handleFieldChange('deliveryDate', scope.row)"
                style="width: 100%"
              ></el-input>
              <span v-else>{{ scope.row.deliveryDate }}</span>
            </template>
          </el-table-column>
        </el-table>
      </virtual-scroll>
    </div>

    <!-- 统计信息 -->
    <div class="summary-info" v-if="currentTableData.length > 0">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="summary-item">
            <span class="summary-label">总条数：</span>
            <span class="summary-value amount-text"
              >{{ currentTableData.length }} 条</span
            >
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <span class="summary-label">到站合价含税合计：</span>
            <span class="summary-value amount-text"
              >{{ totalAmount.toFixed(2) }} 元</span
            >
          </div>
        </el-col>
      </el-row>
    </div>

    <BatchDialog ref="batchDialogRef" />
  </div>
</template>

<script>
import BatchDialog from './batchDialog.vue';
import * as ItemApi from '@/api/prodmgr-inv/project/item.js';
import * as LineApi from '@/api/prodmgr-inv/project/line.js';
import VirtualScroll, { VirtualColumn } from 'el-table-virtual-scroll'
export default {
  name: 'tabTable',
  dicts: ['MeasureUnit'],
  props: {
    // 接收外部传入的表格数据
    tableData: {
      type: Array,
      default: () => []
    },
    sellerName: {
      type: String,
      default: ''
    }

  },
  components: {
    BatchDialog,
    VirtualScroll,
    VirtualColumn
  },
  data () {
    return {
      virtualList: [],
      activeTab: 'total', // 当前激活的tab
      currentTableData: [], // 当前显示的表格数据
      loading: false,
      selectedRowKeys: { total: [] }, // 用户存储当前选择的数据
      maxManualIndex: 0,
      options: {

      },
      params: {
        pageNum: 1,
        pageSize: -1,
      },
      show: true,
      currentTableSelect: [],
      firstSelectAll: true,
    }
  },
  computed: {
    filteredTableData () {
      if (this.activeTab === 'total') {
        return this.tableData;
      } else {
        const selectedProject = this.projectTabs.find(p => p.name === this.activeTab);
        if (selectedProject) {
          return this.tableData.filter(item =>
            item.sectionName === selectedProject.projectName
          );
        } else {
          return [];
        }
      }
    },
    // 计算总amount
    totalQuantity () {
      return this.filteredTableData.reduce((sum, item) => {
        return sum + (parseFloat(item.amount) || 0);
      }, 0);
    },
    // 计算总金额
    totalAmount () {
      return this.filteredTableData.reduce((sum, item) => {

        return sum + item.totalAmount;
      }, 0);
    },
    projectTabs () {
      const projectNames = [...new Set(this.tableData.map(item => item.sectionName).filter(Boolean))];
      return projectNames.map((name, index) => ({
        name: `project-${index}`,
        label: name,
        projectName: name
      }));
    },
    projectId () {
      return this.$store.state.project.projectId || this.$route.query.projectId
    },
    type () {
      return this.$route.query.type
    }
  },

  watch: {
    // 监听外部数据变化
    tableData: {
      handler (newData) {
        this.updateCurrentData();
      },
      immediate: true,
      deep: true
    },
    // 监听activeTab变化
    activeTab () {
      this.updateCurrentData();
    },
    projectId () {
      this.getSectionOptions()
    }
  },
  created () {
    // this.getItemsOptions()
    this.getSectionOptions()

  },
  mounted () {
    this.$refs.batchDialogRef.$on('onOk', this.onDialogOk.bind(this)) // ✅

  },
  methods: {
    onDialogOk (data) {
      console.log('props sellerName', this.sellerName)
      // 将批量上传的文件，导入到总的数据中
      const newData = data.map(item => ({
        ...item,
        sellerName: this.sellerName,
      }))
      this.tableData.push(...newData)
    },
    // 获取options数据
    async getItemsOptions () {
      const res = await ItemApi.itemList(this.params)
      this.options.itemOptions = res.data.list.map(item => {
        return {
          ...item,
          value: item.id,
          label: item.materialName
        }
      })
    },
    async getSectionOptions () {
      if (!this.projectId) {
        return
      }
      const res = await LineApi.detail(this.projectId)
      this.options.setcionOptions = res.data.sectionList.map(item => {
        return {
          ...item,
          value: item.id,
          label: item.sectionName
        }
      })
    },
    // 新增物资行
    onAdd () {

      // 向父组件发送新增事件
      this.$emit('data-change', {
        type: 'add',
        row: {},
      });

      // 刷新当前数据显示
      this.updateCurrentData();

      this.$message.success('已添加新行，请填写物资信息');
    },

    onBatchUpload () {
      this.$refs.batchDialogRef.open();
    },
    // 批量删除选中数据
    onDelete () {
      this.$confirm('确认删除选中数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 找到当前tab对应的所有选中行
          // this.tableData = this.tableData.filter(row => !this.selectedRowKeys[this.activeTab].includes(this.getRowKey(row)))
          // 获取所有selectedRowKeys
          const selectedRowKeys = Object.keys(this.selectedRowKeys).reduce((acc, key) => {
            return acc.concat(this.selectedRowKeys[key]);
          }, []);

          // 获取当前table选择的数据

          this.$emit('data-change', {
            type: 'delete',
            row: this.currentTableSelect.map(x => x.id),
          });
        })
    },
    // 每个字段的变化都触发这个方法
    handleFieldChange (fieldType, row) {
      this.$emit('data-change', {
        type: fieldType,
        index: this.getOriginalIndex(row),
        row: row,
        newValue: row[fieldType]
      });

      console.log('handleFieldChange', fieldType, row);

      // 选择物资名称时，同步更新其他物资信息，选择标段名称时，同步简称
      switch (fieldType) {
        case 'materialId':
          // 同步更新其他物资信息
          const selectedItem = this.options.itemOptions.find(item => item.value === row.materialId);
          if (selectedItem) {
            row.specModel = selectedItem.specModel;
            row.unit = selectedItem.unit;
            row.materialName = selectedItem.materialName
          }
          break;
        case 'sectionId':
          // 同步更新简称
          const selectedSection = this.options.setcionOptions.find(item => item.value === row.sectionId);
          if (selectedSection) {
            this.$set(row, 'projectShortName', selectedSection.projectShortName)
            this.$set(row, 'sectionName', selectedSection.sectionName)
          }
          break;
        // (100 + 税率) * 不含税单价 = 到站含税单价
        case 'vatRate':
          this.calculateTaxPrice(row);
          break;
        case 'price':
          this.calculateTaxPrice(row);
          break;
        // 数量 * 到站含税单价 = 到站合价含税
        case 'amount':
          this.calculateTotalAmount(row);
          break;
        case 'taxPrice':
          this.calculateTotalAmount(row);
          break;
      }
    },
    calculateTaxPrice (row) {
      if (row.vatRate && row.price) {
        const taxPrice = (100 + row.vatRate) * row.price
        row.taxPrice = taxPrice

        this.calculateTotalAmount(row)
      }
    },
    calculateTotalAmount (row) {
      if (row.amount && row.taxPrice) {
        const totalAmount = row.amount * row.taxPrice
        row.totalAmount = totalAmount
      }
    },
    // 处理Tab点击事件
    handleTabClick (tab) {
      this.activeTab = tab.name;
      this.loading = false;


      // 切换Tab后恢复选中状态
      this.restoreSelectionAfterTabChange();
      // 向父组件发送事件
      this.$emit('tab-change', {
        activeTab: this.activeTab,
        currentData: this.filteredTableData
      });

      this.show = false;
      setTimeout(() => {

        this.show = true;
      }, 100)

    },

    // 切换Tab后恢复选中状态
    restoreSelectionAfterTabChange () {
      const tableRef = this.$refs.dataTable;
      const vs = this.$refs.virtualScroll;
      if (!tableRef) return;
      // 获取已经选中所有keys
      const allKeys = Object.keys(this.selectedRowKeys).reduce((acc, key) => {
        return acc.concat(this.selectedRowKeys[key]);
      }, []);

      // 计算当前 tab 应该选中的 key（自身 + total 中包含的 key）
      const shouldBeSelectedKeys = [...new Set(
        allKeys
      )];

      this.currentTableData.forEach(row => {
        const key = this.getRowKey(row);
        const shouldSelect = shouldBeSelectedKeys.includes(key);
        // vs.toggleRowSelection(row, shouldSelect);
        // tableRef.toggleRowSelection(row, shouldSelect);
      });
    },


    // 获取原始数据中的索引
    getOriginalIndex (row) {
      return this.tableData.findIndex(item =>
        item.id === row.id && item.materialName === row.materialName
      );
    },


    // 返回唯一行 key，用于多选保留状态
    getRowKey (row) {
      return `${row.id}`;
    },
    onSelect (selection, row, checked) {
      this.currentTableSelect = selection
    },

    // 处理表格的勾选变化 - 修改版本
    handleSelectionChange (selection) {
      // 若是空数据且已有正确选项，说明是虚拟滚动触发的伪事件
      if (selection.length === 0 && this.currentTableSelect.length > 0) {
        // 忽略这次空事件
        return
      }
      // 全选判断
      if (selection.length === this.filteredTableData.length) {
        this.currentTableSelect = selection
      }

      // 第一次进入时，将selectedRowKeys备份
      const currentSelectedKeys = selection.map(row => this.getRowKey(row));
      // 再添加当前选中的key
      this.selectedRowKeys[this.activeTab] = currentSelectedKeys
      this.emitSelectionChange();


    },
    // 新增方法：向父组件发送选中变化事件
    emitSelectionChange () {
      const allSelectedRows = this.tableData.filter(row => this.selectedRowKeys[this.activeTab].includes(this.getRowKey(row)));
    },
    // ✅ 当切换Tab时刷新表格并恢复多选
    updateCurrentData () {
      if (!this.selectedRowKeys[this.activeTab]) {
        this.$set(this.selectedRowKeys, this.activeTab, []);
      }

      if (this.activeTab === 'total') {
        this.currentTableData = [...this.tableData];
      } else {
        const selectedProject = this.projectTabs.find(p => p.name === this.activeTab);
        this.currentTableData = selectedProject
          ? this.tableData.filter(item => item.sectionName === selectedProject.projectName)
          : [];
      }

      this.$nextTick(() => {
        this.restoreSelectionAfterTabChange();
      });
    },
    // 验证表格数据
    onCheck () {
      const validationErrors = this.validateTableData();

      if (validationErrors.length === 0) {
        return true;
      } else {
        // 显示验证错误信息
        const errorMessage = this.formatValidationErrors(validationErrors);
        this.$message({
          message: errorMessage,
          type: 'error',
          duration: 8000,
          dangerouslyUseHTMLString: true
        });
        return false;
      }
    },

    // 验证表格数据的核心方法
    validateTableData () {
      const errors = [];
      const currentData = this.filteredTableData;

      currentData.forEach((row, index) => {
        const rowErrors = [];
        const displayIndex = index + 1; // 显示行号从1开始

        // 验证数量字段
        if (!row.amount || row.amount <= 0) {
          rowErrors.push('数量');
        }

        // 验证物资名称（对于手动添加的行）
        if (row.isManual && (!row.materialId || !row.materialName)) {
          rowErrors.push('物资名称');
        }

        // 验证计量单位
        if (!row.unit || row.unit.trim() === '') {
          rowErrors.push('计量单位');
        }

        // 验证标段名称
        if (!row.sectionId || row.sectionId.trim() === '') {
          rowErrors.push('标段名称');
        }

        // 到站不含税单价
        if (!row.price || row.price <= 0) {
          rowErrors.push('到站不含税单价');
        }

        // 物资增值税率
        if (!row.vatRate || row.vatRate <= 0) {
          rowErrors.push('物资增值税率');
        }


        // 如果有错误，添加到错误列表
        if (rowErrors.length > 0) {
          errors.push({
            rowIndex: displayIndex,
            rowData: row,
            missingFields: rowErrors
          });
        }
      });

      return errors;
    },

    // 格式化验证错误信息
    formatValidationErrors (errors) {
      const currentTabName = this.activeTab === 'total' ? '总数据' :
        this.projectTabs.find(p => p.name === this.activeTab)?.label || '当前标签页';

      let message = `<div style="text-align: left;"><strong>${currentTabName} 数据验证失败：</strong><br/>`;

      errors.forEach(error => {
        const fieldsText = error.missingFields.join('、');
        message += `<div style="margin: 5px 0; color: #f56c6c;">• 第 ${error.rowIndex} 行：${fieldsText} 未填写</div>`;
      });

      message += '</div>';
      return message;
    },

    // 高亮显示有错误的行（可选功能）
    highlightErrorRows (errors) {
      // 清除之前的高亮
      this.clearRowHighlight();

      // 高亮错误行
      errors.forEach(error => {
        const rowIndex = error.rowIndex - 1;
        this.$nextTick(() => {
          const tableRef = this.$refs.dataTable;
          if (tableRef && tableRef.$el) {
            const rows = tableRef.$el.querySelectorAll('.el-table__body tr');
            if (rows[rowIndex]) {
              rows[rowIndex].style.backgroundColor = '#fef0f0';
              rows[rowIndex].style.border = '1px solid #f56c6c';
            }
          }
        });
      });
    },

    // 清除行高亮
    clearRowHighlight () {
      this.$nextTick(() => {
        const tableRef = this.$refs.dataTable;
        if (tableRef && tableRef.$el) {
          const rows = tableRef.$el.querySelectorAll('.el-table__body tr');
          rows.forEach(row => {
            row.style.backgroundColor = '';
            row.style.border = '';
          });
        }
      });
    },
  },
}
</script>

<style scoped>
/* 自定义Tab样式 */
::v-deep .el-tabs__header {
  margin-bottom: 20px;
}

::v-deep .el-tabs__item {
  font-weight: 500;
  transition: all 0.3s ease;
}

::v-deep .el-tabs__item.is-active {
  color: #2196f3;
  font-weight: 600;
}

::v-deep .el-tabs__active-bar {
  background-color: #2196f3;
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

/* 金额文字样式 */
.amount-text {
  color: #e6a23c;
  font-weight: 600;
}

/* 统计信息样式 */
.summary-info {
  margin-left: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-label {
  color: #666;
  font-size: 14px;
  margin-right: 8px;
}

.summary-value {
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

::v-deep .el-select {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tab-table-container {
    padding: 10px;
  }

  .summary-info {
    padding: 15px;
  }

  .summary-item {
    margin-bottom: 10px;
    flex-direction: column;
    text-align: center;
  }

  .summary-label {
    margin-right: 0;
    margin-bottom: 5px;
  }
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
