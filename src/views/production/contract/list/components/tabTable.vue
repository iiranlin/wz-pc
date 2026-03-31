<template>
  <div class="tab-table-container">
    <!-- Action Button -->
    <div style="display: flex;">
      <!-- <el-button type="primary" icon="el-icon-plus" size="mini" @click="onAdd"
        >添加物资</el-button
      > -->
      <!-- 批量导入 -->
      <div v-if="type !== 'view'">

        <el-button type="primary" icon="el-icon-upload" size="mini" @click="onBatchUpload">批量导入</el-button>
        <!-- 删除 -->
        <el-button type="danger" icon="el-icon-delete" size="mini" @click="onDelete">删除</el-button>
      </div>

      <div style="margin-left: auto;">
        <el-input v-model="searchKeyword" placeholder="请输入规格型号搜索" size="mini" style="width: 200px" clearable
          prefix-icon="el-icon-search" @input="handleSearch" @clear="handleClearSearch"></el-input>
      </div>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="建设项目" name="total"></el-tab-pane>
      <el-tab-pane v-for="project in projectTabs" :key="project.name" :label="project.label"
        :name="project.name"></el-tab-pane>
    </el-tabs>

    <div style="max-height: 450px">
      <virtual-scroll :dynamic="false" v-show="show" ref="virtualScroll" :data="filteredTableData" :item-size="62"
        key-prop="id" @change="(renderData) => (virtualList = renderData)">
        <el-table :data="virtualList" border style="width: 100%" max-height="450" v-loading="loading"
          @selection-change="handleSelectionChange" @select="onSelect" ref="dataTable" row-key="id">
          <virtual-column label="序号" width="88" align="center" type="index" fixed></virtual-column>
          <!-- 多选 -->
          <virtual-column v-if="type !== 'view'" width="60" type="selection" align="center" fixed></virtual-column>
          <!-- ✅ 多选框列 -->
          <!-- <el-table-column
          type="selection"
          width="55"
          fixed
          align="center"
        ></el-table-column> -->
          <el-table-column prop="materialName" label="物资名称" width="250" fixed align="center">
            <template slot-scope="scope">
              <el-select v-if="scope.row.isManual && type !== 'view'" v-model="scope.row.materialId"
                placeholder="请选择物资名称" size="mini" @change="handleFieldChange('materialId', scope.row)"
                style="width: 100%" filterable>
                <el-option v-for="unit of options['itemOptions']" :key="unit.value" :label="unit.label"
                  :value="unit.value"></el-option>
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
          <el-table-column v-if="activeTab === 'total'" prop="sectionName" label="标段项目名称" width="250" align="center">
            <template slot-scope="scope">
              <el-select v-if="scope.row.isManual && type !== 'view'" v-model="scope.row.sectionId"
                placeholder="请选择标段项目名称" size="mini" @change="handleFieldChange('sectionId', scope.row)"
                style="width: 100%" filterable>
                <el-option v-for="item of options['setcionOptions']" :key="item.value" :label="item.label"
                  :value="item.value"></el-option>
              </el-select>
              <span v-else>{{ scope.row.sectionName }}</span>
            </template>
          </el-table-column>

          <!-- 其他列 -->
          <el-table-column prop="sellerName" label="卖方名称" width="120" align="center"></el-table-column>
          <el-table-column prop="specModel" label="规格型号" width="200" align="center">
          </el-table-column>

          <!-- 可选择计量单位 -->
          <el-table-column prop="unit" label="计量单位" width="150" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.unit }}</span>
            </template>
          </el-table-column>

          <!-- 可编辑amount -->
          <el-table-column prop="amount" label="数量" width="180" align="center">
            <template slot="header">
              <span style="color: red; margin-right: 5px">*</span>
              <span>数量</span>
            </template>
            <template slot-scope="scope">
              <!-- <el-input-number
                v-if="type !== 'view'"
                v-model="scope.row.amount"
                :min="0"
                :precision="2"
                size="mini"
                @change="handleFieldChange('amount', scope.row)"
                style="width: 100%"
              ></el-input-number> -->
              <span>{{ scope.row.amount }}</span>
              <!-- 负数提示图标 -->
             <el-tooltip
            v-if="scope.row.negative && scope.row.negative < 0"
            class="el-icon-warning-outline negative-tip-icon clickable"
          >
            <div slot="content">
              <div>原合同数量: {{ getNegativeSummary(scope.row).originalAmount }}</div>
              <div>当前物资存在所有负合同数量总和为: {{ getNegativeSummary(scope.row).negativeAmount }}</div>
            </div>
            <i @click="handleNegativeIconClick(scope.row)" class="el-icon-warning-outline negative-tip-icon"></i>
          </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column prop="price" label="到站不含税单价(元)" width="200" align="center">
            <template slot="header">
              <span style="color: red; margin-right: 5px">*</span>
              <span>到站不含税单价(元)</span>
            </template>
            <template slot-scope="scope">
              <!-- <el-input-number
                v-if="type !== 'view'"
                v-model="scope.row.price"
                :min="0"
                :precision="2"
                size="mini"
                @change="handleFieldChange('price', scope.row)"
                style="width: 100%"
              ></el-input-number> -->
              <span>{{ scope.row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="vatRate" label="物资增值税率（%）" width="200" align="center">
            <template slot="header">
              <span style="color: red; margin-right: 5px">*</span>
              <span>物资增值税率（%）</span>
            </template>
            <template slot-scope="scope">
              <!-- <el-input-number
                v-if="type !== 'view'"
                v-model="scope.row.vatRate"
                :min="0"
                :precision="2"
                size="mini"
                @change="handleFieldChange('vatRate', scope.row)"
                style="width: 100%"
              ></el-input-number> -->
              <span>{{ scope.row.vatRate }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="taxPrice" label="到站含税单价(元)" width="150" align="center">
            <template slot-scope="scope">
              {{ scope.row.taxPrice ? scope.row.taxPrice.toFixed(2) : '' }}
            </template>
          </el-table-column>
          <el-table-column prop="totalAmount" label="到站合价含税(元)" width="150" align="center">
            <template slot-scope="scope">
              {{
                scope.row.totalAmount ? scope.row.totalAmount.toFixed(2) : ''
              }}
            </template>
          </el-table-column>
          <el-table-column prop="deliveryLocation" label="交货地点" width="150" align="center">
            <template slot-scope="scope">
              <el-input v-if="type !== 'view'" v-model="scope.row.deliveryLocation" size="mini"
                @change="handleFieldChange('deliveryLocation', scope.row)" style="width: 100%"></el-input>
              <span v-else>{{ scope.row.deliveryLocation }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="receiver" label="收货人" width="300" align="center">
            <template slot-scope="scope">
              <el-input v-if="type !== 'view'" v-model="scope.row.receiver" size="mini"
                @change="handleFieldChange('receiver', scope.row)" style="width: 100%"></el-input>
              <span v-else>{{ scope.row.receiver }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="deliveryStatus" label="交货状态" width="150" align="center">
            <template slot-scope="scope">
              <el-input v-if="type !== 'view'" v-model="scope.row.deliveryStatus" size="mini"
                @change="handleFieldChange('deliveryStatus', scope.row)" style="width: 100%"></el-input>
              <span v-else>{{ scope.row.deliveryStatus }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="deliveryTerms" label="交货条件" width="150" align="center">
            <template slot-scope="scope">
              <el-input v-if="type !== 'view'" v-model="scope.row.deliveryTerms" size="mini"
                @change="handleFieldChange('deliveryTerms', scope.row)" style="width: 100%"></el-input>
              <span v-else>{{ scope.row.deliveryTerms }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="deliveryDate" label="交货期" width="150" align="center">
            <template slot-scope="scope">
              <el-input v-if="type !== 'view'" v-model="scope.row.deliveryDate" size="mini"
                @change="handleFieldChange('deliveryDate', scope.row)" style="width: 100%"></el-input>
              <span v-else>{{ scope.row.deliveryDate }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="type == 'view'" prop="cumulativeAmount" label="累计下达数量" width="150" align="center">
          </el-table-column>
          <!-- 合同比例 发货数量 -->
          <el-table-column v-if="type == 'view'" prop="sendTotal" label="发货数量" width="150" align="center">
          </el-table-column>
          <el-table-column v-if="type == 'view'" prop="sendRatio" label="发货比例" width="150" align="center">
            <template slot-scope="scope">
              {{ scope.row.sendRatio }}%
            </template>
          </el-table-column>
          <el-table-column v-if="type == 'view'" prop="storeTotalRates" label="已收货金额" width="150" align="center">
          </el-table-column>
          <el-table-column v-if="type == 'view'" prop="storeTotal" label="累计入库量" width="150" align="center">
          </el-table-column>

          <el-table-column v-if="type == 'view'" prop="outTotal" label="累计出库量" width="150" align="center">
          </el-table-column>

          <el-table-column v-if="type == 'view'" prop="outTotalRates" label="出库金额" width="150" align="center">
          </el-table-column>

        </el-table>
      </virtual-scroll>
    </div>

    <!-- 统计信息 -->
    <div class="summary-info" v-if="filteredTableData.length > 0">
      <div class="summary-item">
        <span class="summary-label">总条数：</span>
        <span class="summary-value amount-text">{{ filteredTableData.length }} 条</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">到站合价：</span>
        <span class="summary-value amount-text">{{ totalAmount.toFixed(2) }}</span>
      </div>
      <!-- 总数量 -->
      <div class="summary-item">
        <span class="summary-label">总数量：</span>
        <span class="summary-value amount-text">{{ totalNum}}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">下达数量：</span>
        <span class="summary-value amount-text">{{ totalQuantity}}</span>
      </div>

      <div class="summary-item">
        <span class="summary-label">发货数量：</span>
        <span class="summary-value amount-text">{{totalSendCount}}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">收货数量：</span>
        <span class="summary-value amount-text">{{totalPutTotal}}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">收货金额：</span>
        <span class="summary-value amount-text">{{ totalStoreRates.toFixed(2) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">入库量：</span>
        <span class="summary-value amount-text">{{ totalStoreCount}}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">入库金额：</span>
        <span class="summary-value amount-text">{{ totalStoreTotalRates.toFixed(2) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">出库量：</span>
        <span class="summary-value amount-text">{{totalOutCount}}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">出库金额：</span>
        <span class="summary-value amount-text">{{ totalOutRates.toFixed(2) }}</span>
      </div>
    </div>

    <BatchDialog ref="batchDialogRef" />
    <ViewNegativeContractsDialog ref="viewNegativeContractsDialogRef" />
  </div>
</template>

<script>
  import Decimal from 'decimal.js';
import BatchDialog from './batchDialog.vue';
import ViewNegativeContractsDialog from './viewNegativeContractsDialog.vue';
import * as ItemApi from '@/api/prodmgr-inv/project/item.js';
import * as LineApi from '@/api/prodmgr-inv/project/line.js';
import { getNegativeContractSummary } from '@/utils/negativeContractSummary';
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
    ViewNegativeContractsDialog,
    VirtualScroll,
    VirtualColumn
  },
  data() {
    return {
      virtualList: [],
      activeTab: 'total', // 当前激活的tab
      currentTableData: [], // 当前显示的表格数据
      loading: false,
      selectedRowKeys: { total: [] }, // 用户存储当前选择的数据
      maxManualIndex: 0,
      searchKeyword: '', // 搜索关键词
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
    filteredTableData() {
      let data = [];

      // 首先根据tab筛选数据
      if (this.activeTab === 'total') {
        data = this.tableData;
      } else {
        const selectedProject = this.projectTabs.find(p => p.name === this.activeTab);
        if (selectedProject) {
          data = this.tableData.filter(item =>
            item.sectionName === selectedProject.projectName
          );
        } else {
          data = [];
        }
      }

      // 然后根据搜索关键词进一步筛选
      if (this.searchKeyword && this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.trim().toLowerCase();
        data = data.filter(item => {
          // 搜索规格型号字段，支持模糊匹配
          return item.specModel && item.specModel.toLowerCase().includes(keyword);
        });
      }

      return data;
    },
     // 计算总数量（使用 decimal.js 精确加法避免浮点数精度问题，只累加正数）
    totalNum() {
      return this.filteredTableData.reduce((sum, item) => {
        const amount = new Decimal(item.amount || 0);
        // 只累加正数，忽略负数和零
        if (amount.greaterThan(0)) {
          return sum.plus(amount);
        }
        return sum;
      }, new Decimal(0)).toNumber();
    },
    // 计算总金额（只累加正数）
    totalAmount() {
      return this.filteredTableData.reduce((sum, item) => {
        const amount = parseFloat(item.totalAmount) || 0;
        // 只累加正数，忽略负数和零
        if (amount > 0) {
          return sum + amount;
        }
        return sum;
      }, 0);
    },
    // 计算累计下达数量（只累加正数）
    totalQuantity() {
      return this.filteredTableData.reduce((sum, item) => {
        const cumulativeAmount = new Decimal(item.cumulativeAmount || 0);
        // 只累加正数，忽略负数和零
        if (cumulativeAmount.greaterThan(0)) {
          return sum.plus(cumulativeAmount);
        }
        return sum;
      }, new Decimal(0)).toNumber();
    },
    // 计算累计收货数量（只累加正数）
    totalPutTotal() {
      return this.filteredTableData.reduce((sum, item) => {
        const putTotal = new Decimal(item.putTotal || 0);
        // 只累加正数，忽略负数和零
        if (putTotal.greaterThan(0)) {
          return sum.plus(putTotal);
        }
        return sum;
      }, new Decimal(0)).toNumber();
    },
    // 计算累计发货数量（只累加正数）
    totalSendCount() {
      return this.filteredTableData.reduce((sum, item) => {
        const sendTotal = new Decimal(item.sendTotal || 0);
        // 只累加正数，忽略负数和零
        if (sendTotal.greaterThan(0)) {
          return sum.plus(sendTotal);
        }
        return sum;
      }, new Decimal(0)).toNumber();
    },
    // 计算已收货金额（只累加正数）
    totalStoreRates() {
      return this.filteredTableData.reduce((sum, item) => {
        const storeTotalRates = parseFloat(item.storeTotalRates) || 0;
        // 只累加正数，忽略负数和零
        if (storeTotalRates > 0) {
          return sum + storeTotalRates;
        }
        return sum;
      }, 0);
    },
    // 计算累计入库量（只累加正数）
    totalStoreCount() {
      return this.filteredTableData.reduce((sum, item) => {
        const storeTotal = new Decimal(item.storeTotal || 0);
        // 只累加正数，忽略负数和零
        if (storeTotal.greaterThan(0)) {
          return sum.plus(storeTotal);
        }
        return sum;
      }, new Decimal(0)).toNumber();
    },
    // 计算累计入库金额（只累加正数）
    totalStoreTotalRates() {
      return this.filteredTableData.reduce((sum, item) => {
        const storeTotalRates = parseFloat(item.storeTotalRates) || 0;
        // 只累加正数，忽略负数和零
        if (storeTotalRates > 0) {
          return sum + storeTotalRates;
        }
        return sum;
      }, 0);
    },
    // 计算累计出库量（只累加正数）
    totalOutCount() {
      return this.filteredTableData.reduce((sum, item) => {
        const outTotal = new Decimal(item.outTotal || 0);
        // 只累加正数，忽略负数和零
        if (outTotal.greaterThan(0)) {
          return sum.plus(outTotal);
        }
        return sum;
      }, new Decimal(0)).toNumber();
    },
    // 计算已出库金额（只累加正数）
    totalOutRates() {
      return this.filteredTableData.reduce((sum, item) => {
        const outTotalRates = parseFloat(item.outTotalRates) || 0;
        // 只累加正数，忽略负数和零
        if (outTotalRates > 0) {
          return sum + outTotalRates;
        }
        return sum;
      }, 0);
    },
    projectTabs() {
      const projectNames = [...new Set(this.tableData.map(item => item.sectionName).filter(Boolean))];
      return projectNames.map((name, index) => ({
        name: `project-${index}`,
        label: name,
        projectName: name
      }));
    },
    projectId() {
      return this.$store.state.project.projectId || this.$route.query.projectId
    },
    type() {
      return this.$route.query.type
    }
  },

  watch: {
    // 监听外部数据变化
    tableData: {
      handler(newData) {
        this.updateCurrentData();
      },
      immediate: true,
      deep: true
    },
    // 监听activeTab变化
    activeTab() {
      this.updateCurrentData();
    },
    projectId() {
      this.getSectionOptions()
    }
  },
  created() {
    // this.getItemsOptions()
    this.getSectionOptions()

  },
  mounted() {
    this.$refs.batchDialogRef.$on('onOk', this.onDialogOk.bind(this)) // ✅

  },
  methods: {
    getNegativeSummary(row) {
      return getNegativeContractSummary(row)
    },
    onDialogOk(data) {
      console.log('props sellerName', this.sellerName)
      // 将批量上传的文件，导入到总的数据中
      const newData = data.map(item => ({
        ...item,
        sellerName: this.sellerName,
      }))
      this.tableData.push(...newData)
    },
    // 获取options数据
    async getItemsOptions() {
      const res = await ItemApi.itemList(this.params)
      this.options.itemOptions = res.data.list.map(item => {
        return {
          ...item,
          value: item.id,
          label: item.materialName
        }
      })
    },
    async getSectionOptions() {
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
    onAdd() {

      // 向父组件发送新增事件
      this.$emit('data-change', {
        type: 'add',
        row: {},
      });

      // 刷新当前数据显示
      this.updateCurrentData();

      this.$message.success('已添加新行，请填写物资信息');
    },

    onBatchUpload() {
      this.$refs.batchDialogRef.open();
    },
    // 批量删除选中数据
    onDelete() {
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
    handleFieldChange(fieldType, row) {
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
    calculateTaxPrice(row) {
      if (row.vatRate && row.price) {
        const taxPrice = (100 + row.vatRate) * row.price
        row.taxPrice = taxPrice

        this.calculateTotalAmount(row)
      }
    },
    calculateTotalAmount(row) {
      if (row.amount && row.taxPrice) {
        const totalAmount = row.amount * row.taxPrice
        row.totalAmount = totalAmount
      }
    },
    // 处理Tab点击事件
    handleTabClick(tab) {
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
    restoreSelectionAfterTabChange() {
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
    getOriginalIndex(row) {
      return this.tableData.findIndex(item =>
        item.id === row.id && item.materialName === row.materialName
      );
    },


    // 返回唯一行 key，用于多选保留状态
    getRowKey(row) {
      return `${row.id}`;
    },
    onSelect(selection, row, checked) {
      this.currentTableSelect = selection
    },

    // 处理表格的勾选变化 - 修改版本
    handleSelectionChange(selection) {
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
    emitSelectionChange() {
      const allSelectedRows = this.tableData.filter(row => this.selectedRowKeys[this.activeTab].includes(this.getRowKey(row)));
    },
    // ✅ 当切换Tab时刷新表格并恢复多选
    updateCurrentData() {
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
    onCheck() {
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
    validateTableData() {
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
    formatValidationErrors(errors) {
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
    highlightErrorRows(errors) {
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
    clearRowHighlight() {
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

    // 处理搜索输入
    handleSearch() {
      // 搜索功能通过computed属性filteredTableData自动实现
      // 这里可以添加额外的搜索逻辑，比如防抖等
      console.log('搜索关键词:', this.searchKeyword);
    },

    // 清除搜索
    handleClearSearch() {
      this.searchKeyword = '';
      console.log('已清除搜索');
    },

    /**
     * 处理负数图标点击事件
     * 打开查看补充合同列表弹窗
     */
    handleNegativeIconClick(row) {
      if (!row.uniqueNumber && !row.allocationUniqueNumber) {
        this.$message.warning('数据无效');
        return;
      }

      // 打开查看补充合同弹窗
      this.$refs.viewNegativeContractsDialogRef.open(row.uniqueNumber || row.allocationUniqueNumber, row);
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

::v-deep .el-table tbody tr:hover>td {
  background-color: #f5f7fa !important;
}

/* 金额文字样式 */
.amount-text {
  color: #e6a23c;
  font-weight: 600;
}

/* 统计信息样式 */
.summary-info {
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.summary-item {
  min-width: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #ebeef5;
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
.app-container>div+div {
  overflow: auto;
}
</style>
