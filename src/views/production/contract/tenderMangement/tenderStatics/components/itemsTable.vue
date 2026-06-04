<template>
  <div class="license-panel" >
    <div class="panel-header">
      <div class="title">
        <span>操作</span>
        <i class="el-icon-warning-outline tooltip-icon" @click="showTooltip" v-if="!isView"></i>
      </div>
      <div class="header-actions">
        <template v-if="!isView">
          <el-button type="success" icon="el-icon-upload" size="mini" @click="onBatchUpload">批量导入</el-button>
          <el-button style="margin-left: 20px;" type="primary" size="mini" icon="el-icon-plus" @click="addItem">新增</el-button>
        </template>
        <el-input
          v-if="isView"
          v-model="searchKeyword"
          class="table-search"
          size="mini"
          clearable
          prefix-icon="el-icon-search"
          placeholder="搜索全部字段"
        />
        <el-button v-if="isView" type="primary" size="mini" icon="el-icon-download" @click="exportItems">
          导出明细
        </el-button>
      </div>
    </div>

    <!-- 动态table项 -->
    <virtual-scroll
      :dynamic="true"
      ref="virtualScroll"
      :data="filteredMaterialTenderInfoDOList"
      key-prop="__rowKey"
      @change="handleVirtualChange"
    >
    <el-table :data="virtualList" border style="margin-top: 20px;" size="small" max-height="350" row-key="__rowKey">
      <el-table-column v-if="isView" width="55" align="center" fixed>
        <template slot="header">
          <el-checkbox
            :value="isAllFilteredSelected"
            :indeterminate="selectedIndeterminate"
            @change="handleToggleAllFilteredSelection"
          />
        </template>
        <template slot-scope="scope">
          <el-checkbox
            :value="selectedRowKeySet.has(scope.row.__rowKey)"
            @change="handleToggleRowSelection(scope.row, $event)"
          />
        </template>
      </el-table-column>
      <virtual-column label="序号" type="index" width="50" align="center" fixed  show-overflow-tooltip/>
      <el-table-column width="260" align="center" show-overflow-tooltip>
        <template slot="header">
          招标项目名称
        </template>
        <template slot-scope="scope">
          <el-select v-if="!isView" v-model="scope.row.tenderProjectId" placeholder="请选择" style="width: 100%" @change="handleProjectChange(scope.row, $event)">
            <el-option v-for="item in lineOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <span v-else>{{ scope.row.tenderProjectName }}</span>
        </template>
      </el-table-column>
      <el-table-column width="300" align="center" show-overflow-tooltip>
        <template slot="header">
          招标人名称
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.tendererName" placeholder="请输入填报单位" />
          <el-tooltip v-else :content="scope.row.tendererName" placement="top" effect="dark">
            <span class="ellipsis-text">{{ scope.row.tendererName }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="year" width="130" align="center" show-overflow-tooltip>
        <template slot="header">
          招标年度
        </template>
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.tenderYear" disabled placeholder="请选择" type="year" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.tenderYear) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="300" align="center" show-overflow-tooltip>
        <template slot="header">
          招标交易场所
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.tenderTradePlace" placeholder="请输入" style="width: 100%" />
          <el-tooltip v-else :content="scope.row.tenderTradePlace" placement="top" effect="dark">
            <span class="ellipsis-text">{{ scope.row.tenderTradePlace }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column width="200" align="center" show-overflow-tooltip>
        <template slot="header">
          项目类别
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.projectCategory" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.projectCategory }}</span>
        </template>
      </el-table-column>
      <el-table-column width="200" align="center" show-overflow-tooltip>
        <template slot="header">
          物资类别
        </template>
        <template slot-scope="scope">
          <el-select v-if="!isView" v-model="scope.row.materialCategory" placeholder="请选择" style="width: 100%" @change="handleMaterialCategoryChange(scope.row, $event)">
            <el-option v-for="item in dict.type.WZDL" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <span v-else>{{ getMaterialCategoryLabel(scope.row.materialCategory) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="200" align="center" show-overflow-tooltip>
        <template slot="header">
          招标编号
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.tenderNo" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.tenderNo }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180" align="center" show-overflow-tooltip>
        <template slot="header">
          包件号
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.packageNo" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.packageNo }}</span>
        </template>
      </el-table-column>
      <el-table-column width="300" align="center" show-overflow-tooltip>
        <template slot="header">
          物资种类
        </template>
        <template slot-scope="scope">
          <el-select v-if="!isView" v-model="scope.row.materialType" placeholder="请选择"
              filterable style="width: 100%" @change="handleMaterialTypeChange(scope.row, $event)">
            <el-option v-for="item in typeOptions[scope.row.materialCategory] || []" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <span v-else>{{ getMaterialTypeLabel(scope.row.materialCategory, scope.row.materialType) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="300" align="center" show-overflow-tooltip>
        <template slot="header">
          细目
        </template>
        <template slot-scope="scope">
          <el-select v-if="!isView" v-model="scope.row.itemDetail" placeholder="请选择" filterable style="width: 100%">
            <el-option v-for="item in detailOptions[getDetailOptionsKey(scope.row.materialType, scope.row.materialCategory)] || []" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <span v-else>{{ getItemDetailLabel(scope.row.materialCategory, scope.row.materialType, scope.row.itemDetail) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120" align="center" show-overflow-tooltip>
        <template slot="header">
          计量单位
        </template>
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.measureUnit"
            placeholder="请选择"
            style="width: 100%"
            filterable
            v-if="!isView"
          >
            <el-option
              v-for="item in dict.type.MeasureUnit"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
          <span v-else>{{ scope.row.measureUnit }}</span>
        </template>
      </el-table-column>
      <el-table-column width="130" align="center" show-overflow-tooltip>
        <template slot="header">
          招标数量
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.tenderQuantity" placeholder="请输入" style="width: 100%" @input="handleTenderQuantityInput(scope.row, $event)" />
          <span v-else>{{ scope.row.tenderQuantity }}</span>
        </template>
      </el-table-column>
      <el-table-column width="170" align="center" show-overflow-tooltip>
        <template slot="header">
          招标发布公告时间
        </template>
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.tenderNoticePubTime" placeholder="请选择" type="date" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.tenderNoticePubTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="160" align="center" show-overflow-tooltip>
        <template slot="header">
          开标时间
        </template>
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.bidOpenTime" placeholder="请选择" type="date" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.bidOpenTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="200" align="center" show-overflow-tooltip>
        <template slot="header">
          推荐中标候选人公示时间
        </template>
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.candidatePubTime" placeholder="请选择" type="date" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.candidatePubTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="160" align="center" show-overflow-tooltip>
        <template slot="header">
          中标通知书时间
        </template>
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.bidNoticeTime" placeholder="请选择" type="date" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.bidNoticeTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="150" align="center" show-overflow-tooltip>
        <template slot="header">
          中标单位
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.winningBidder" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.winningBidder }}</span>
        </template>
      </el-table-column>
      <el-table-column width="150" align="center" show-overflow-tooltip>
        <template slot="header">
          中标金额（万元）
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.bidAmount" placeholder="请输入" style="width: 100%"
          @input="handleBidAmountInput(scope.row, $event)"/>
          <span v-else>{{ scope.row.bidAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column width="160" align="center" show-overflow-tooltip>
        <template slot="header">
          合同签订时间
        </template>
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.contractSignTime" placeholder="请选择" type="date" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.contractSignTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="300" align="center" show-overflow-tooltip>
        <template slot="header">
          投标人名称
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.bidderName" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.bidderName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="150" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.remark" placeholder="请输入" style="width: 100%" maxlength="1000"/>
          <span v-else>{{ scope.row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="!isView" label="操作" width="120" align="center" fixed="right" show-overflow-tooltip>
        <template slot-scope="scope">
          <!-- <el-button type="text" size="mini" style="margin-right: 20px;" @click="editItem(scope.$index)">修改</el-button> -->
          <el-button type="text" size="mini" @click="removeItem(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    </virtual-scroll>

    <!-- 填写说明弹窗 -->
    <el-dialog
      title="填写说明"
      :visible.sync="dialogVisible"
      width="700px"
      center
    >
      <div class="dialog-content">
        <p>1.招标项目名称应与项目初步设计批复一致。招标人名称按单位全称填写。</p>
        <p>2.统计2012年10月以来的铁路基建大中型项目、技改项目（招标限价400万元及以上）、代建地方铁路项目（招标限价400万元及以上）的招标情况。按行逐项填写，单元格不要进行合并。</p>
        <p>3."物资种类、细目"应严格按照《国铁集团甲供物资目录》规范填写。计量单位应按照甲供物资采购计划要求规范填写，如：组、套、个、台、kg、㎡等。若同一包件存在多种物资的，招标数量按计量单位分别汇总，如：聚氨酯防水涂料、防水卷材，kg/㎡，5000/20000。</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 批量导入弹窗组件 -->
     <BatchDialog ref="batchDialogRef" />
  </div>
</template>

<script>
import dayjs from "dayjs";
import * as LineApi from '@/api/prodmgr-inv/project/line.js'
import * as TypeApi from "@/api/prodmgr-inv/project/itemType.js";
import * as DetailApi from "@/api/prodmgr-inv/project/itemDetail.js";
import * as FileApi from "@/api/prodmgr-inv/project/file.js";
import BatchDialog from './batchDialog.vue'
import VirtualScroll, { VirtualColumn } from 'el-table-virtual-scroll'

export default {
  name: 'itemsTable',
  dicts: ['MeasureUnit', 'WZDL'],
  components: {BatchDialog, VirtualScroll, VirtualColumn},
  data() {
    return {
      lineOptions: [], // 项目名称选项
      dialogVisible: false, // 填写说明弹窗显示状态
      isInitializing: true, // 添加初始化标记
      skipWatch: false, // 导入数据时跳过 watcher 的 loadExistingData
      importing: false,
      virtualList: [],
      searchKeyword: '',
      selectedRowKeys: [],
      batchDialogOkHandler: null,
      rowKeySeed: 0,
      typeOptions: {}, // 物资种类选项，按物资类别分类
      detailOptions: {}, // 物资细目选项，按物资种类分类
      typeOptionRequests: {},
      detailOptionRequests: {},
       // 查询参数
      formData: {
        parentId: null,
      },
      listQuery:{
        pageNum: 1,
        pageSize: 1000,
      },
      loading: false,
    }
  },
  props: {
    value: {
      type: Object,
      default: {},
    },
    isView: {
      type: Boolean,
      default: false,
    },
    tenderUnit: {
      type: String,
      default: '',
    },
    tenderYear: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      default: '',
    },
  },
  computed: {
    materialTenderInfoDOList: {
      get() {
        return this.value.materialTenderInfoDOList || [];
      },
      set(val) {
        // 整个 form 对象 emit 回去
        const newdata = JSON.parse(
          JSON.stringify({ ...this.value, materialTenderInfoDOList: val })
        );
        this.$emit("input", newdata);
      },
    },
    filteredMaterialTenderInfoDOList() {
      const keyword = String(this.searchKeyword || '').trim().toLowerCase();
      if (!keyword) return this.materialTenderInfoDOList;
      return this.materialTenderInfoDOList.filter(item => this.getRowSearchText(item).includes(keyword));
    },
    selectedRowKeySet() {
      return new Set(this.selectedRowKeys);
    },
    isAllFilteredSelected() {
      const selectableRows = this.filteredMaterialTenderInfoDOList.filter(item => item && item.__rowKey);
      if (!selectableRows.length) return false;
      return selectableRows.every(item => this.selectedRowKeySet.has(item.__rowKey));
    },
    selectedIndeterminate() {
      const selectableRows = this.filteredMaterialTenderInfoDOList.filter(item => item && item.__rowKey);
      if (!selectableRows.length) return false;
      const selectedCount = selectableRows.filter(item => this.selectedRowKeySet.has(item.__rowKey)).length;
      return selectedCount > 0 && selectedCount < selectableRows.length;
    },
  },
  mounted(){
    this.batchDialogOkHandler = this.onDialogOk;
    this.$refs.batchDialogRef.$on('onOk', this.batchDialogOkHandler) // ✅
  },
  beforeDestroy() {
    if (this.$refs.batchDialogRef && this.batchDialogOkHandler) {
      this.$refs.batchDialogRef.$off('onOk', this.batchDialogOkHandler);
    }
  },
  created () {
    this.getLineOptions()
     // 初始化完成
    this.$nextTick(() => {
      this.isInitializing = false;
    });
  },
  watch: {
    'value.materialTenderInfoDOList': {
      handler(newList) {
        if (this.skipWatch) return;
        if (newList && newList.length) {
          this.ensureRowKeys(newList);
        }
        this.syncSelectedRows();
      },
      immediate: true,
    }
  },
  methods: {
    ensureRowKeys(items = []) {
      items.forEach(item => {
        this.ensureRowKey(item);
      });
    },
    ensureRowKey(item) {
      if (!item) return item;
      if (item.__rowKey) return item;
      Object.defineProperty(item, '__rowKey', {
        value: item.id || `tender-item-${Date.now()}-${this.rowKeySeed++}`,
        enumerable: false,
        configurable: true,
      });
      return item;
    },
    syncSelectedRows() {
      const rowKeys = new Set(this.materialTenderInfoDOList.map(item => item && item.__rowKey).filter(Boolean));
      this.selectedRowKeys = this.selectedRowKeys.filter(rowKey => rowKeys.has(rowKey));
    },
    normalizeSearchValue(value) {
      if (value === null || value === undefined) return '';
      return String(value).toLowerCase();
    },
    getRowSearchText(row) {
      if (!row) return '';
      const rawValues = Object.keys(row)
        .filter(key => key !== '__rowKey')
        .map(key => this.normalizeSearchValue(row[key]));
      const displayValues = [
        this.formatTimestamp(row.tenderYear),
        this.formatTimestamp(row.tenderNoticePubTime),
        this.formatTimestamp(row.bidOpenTime),
        this.formatTimestamp(row.candidatePubTime),
        this.formatTimestamp(row.bidNoticeTime),
        this.formatTimestamp(row.contractSignTime),
        this.getMaterialCategoryLabel(row.materialCategory),
        this.getMaterialTypeLabel(row.materialCategory, row.materialType),
        this.getItemDetailLabel(row.materialCategory, row.materialType, row.itemDetail),
      ].map(value => this.normalizeSearchValue(value));
      return rawValues.concat(displayValues).join(' ');
    },
    handleToggleRowSelection(row, checked) {
      if (!row || !row.__rowKey) return;
      if (checked) {
        if (!this.selectedRowKeySet.has(row.__rowKey)) {
          this.selectedRowKeys = this.selectedRowKeys.concat(row.__rowKey);
        }
        return;
      }
      this.selectedRowKeys = this.selectedRowKeys.filter(rowKey => rowKey !== row.__rowKey);
    },
    handleToggleAllFilteredSelection(checked) {
      const filteredRowKeys = this.filteredMaterialTenderInfoDOList.map(item => item && item.__rowKey).filter(Boolean);
      if (checked) {
        this.selectedRowKeys = Array.from(new Set(this.selectedRowKeys.concat(filteredRowKeys)));
        return;
      }
      const filteredRowKeySet = new Set(filteredRowKeys);
      this.selectedRowKeys = this.selectedRowKeys.filter(rowKey => !filteredRowKeySet.has(rowKey));
    },
    handleVirtualChange(renderData) {
      this.virtualList = renderData || [];
      this.loadExistingData(this.virtualList);
    },
    getDetailOptionsKey(categoriesCode, speciesCode) {
      return `${speciesCode || ''}_${categoriesCode || ''}`;
    },
    // 加载已有的数据，为编辑和查看详情做准备（带去重）
    async loadExistingData(items) {
      const loadedCategories = new Set();
      const loadedTypes = new Map();
      for (const item of items) {
        // 加载物资种类数据（去重）
        if (item.materialCategory && !loadedCategories.has(item.materialCategory)) {
          loadedCategories.add(item.materialCategory);
        }
        // 加载细目数据（去重）
        const typeKey = this.getDetailOptionsKey(item.materialType, item.materialCategory);
        if (item.materialCategory && item.materialType && !loadedTypes.has(typeKey)) {
          loadedTypes.set(typeKey, {
            materialType: item.materialType,
            materialCategory: item.materialCategory,
          });
        }
      }
      await Promise.all(Array.from(loadedCategories).map(materialCategory => this.getTypeOptions(materialCategory)));
      await Promise.all(Array.from(loadedTypes.values()).map(item => this.getDetailOptions(item.materialType, item.materialCategory)));
    },
    // 处理物资类别变化
    async handleMaterialCategoryChange(row, materialCategory) {
      // 清空物资种类和细目
      row.materialType = '';
      row.itemDetail = '';

      // 如果选择了物资类别，获取对应的物资种类（用户手动切换需强制刷新）
      if (materialCategory) {
        await this.getTypeOptions(materialCategory, true);
      }
    },

    // 处理物资种类变化
    async handleMaterialTypeChange(row, materialType) {
      // 清空细目
      row.itemDetail = '';

      // 如果选择了物资种类，获取对应的细目（用户手动切换需强制刷新）
      if (materialType) {
        await this.getDetailOptions(materialType, row.materialCategory, true);
      }
    },

    // 获取物资种类选项（依赖物资大类），带缓存
    async getTypeOptions(speciesCode = "", force = false) {
      // 已加载过且非强制刷新时直接返回，避免重复请求
      if (!force && this.typeOptions[speciesCode]) return;
      if (!force && this.typeOptionRequests[speciesCode]) return this.typeOptionRequests[speciesCode];
      const params = {
        pageNum: 1,
        pageSize: -1,
        speciesCode: speciesCode,
      };

      const request = TypeApi.itemList(params).then(res => {
        if (res.data && res.data.list) {
          const options = res.data.list.map((x) => ({
            ...x,
            label: x.materialCategoriesName,
            value: x.materialCategoriesCode,
          }));
          // 响应式处理 否则无法正常显示
          this.$set(this.typeOptions, speciesCode, options);
        } else {
          this.$set(this.typeOptions, speciesCode, []);
        }
      }).catch(error => {
        console.error("获取物资种类失败", error);
        this.$set(this.typeOptions, speciesCode, []);
      }).finally(() => {
        this.$delete(this.typeOptionRequests, speciesCode);
      });
      this.$set(this.typeOptionRequests, speciesCode, request);
      return request;
    },
    // 获取物资细目选项（依赖物资种类），带缓存
    async getDetailOptions(categoriesCode, speciesCode, force = false) {
      const cacheKey = this.getDetailOptionsKey(categoriesCode, speciesCode);
      // 已加载过且非强制刷新时直接返回，避免重复请求
      if (!force && this.detailOptions[cacheKey]) return;
      if (!force && this.detailOptionRequests[cacheKey]) return this.detailOptionRequests[cacheKey];
      const params = {
        pageNum: 1,
        pageSize: -1,
        categoriesCode: categoriesCode,
        speciesCode: speciesCode,
      };

      const request = DetailApi.itemList(params).then(res => {
        if (res.data && res.data.list) {
          const options = res.data.list.map((x) => ({
            ...x,
            label: x.detailName,
            value: x.detailCode,
          }));
          this.$set(this.detailOptions, cacheKey, options);
        } else {
          this.$set(this.detailOptions, cacheKey, []);
        }
      }).catch(() => {
        this.$set(this.detailOptions, cacheKey, []);
      }).finally(() => {
        this.$delete(this.detailOptionRequests, cacheKey);
      });
      this.$set(this.detailOptionRequests, cacheKey, request);
      return request;
    },

    addItem() {
      const row = this.ensureRowKey({
        tenderProjectId: "",            //项目id
        tenderProjectName: "",            //招标项目名称
        tendererName: this.tenderUnit, //招标人名称
        tenderYear: this.tenderYear, //招标年度
        tenderTradePlace: "", //招标交易场所
        projectCategory: "", //项目类别
        materialCategory: "", //物资类别
        tenderNo: "", //招标编号
        packageNo: "", //包件号
        materialType: "", //物资种类
        itemDetail: "", //细目
        measureUnit: "", //计量单位
        tenderQuantity: null, //招标数量
        tenderNoticePubTime: null, //招标公告发布时间
        bidOpenTime: null, //开标时间
        candidatePubTime: null, //推荐中标候选人公示时间
        bidNoticeTime: null, //中标通知书时间
        winningBidder: null, //中标单位
        bidAmount: null, //中标金额（万元）
        contractSignTime: null, //合同签订时间
        bidderName: "", //投标人名称
        remark: "" //备注
      });
      this.materialTenderInfoDOList.push(row);
    },
    removeItem(row) {
      const index = this.materialTenderInfoDOList.findIndex(item => item === row || item.__rowKey === row.__rowKey);
      if (index === -1) return;
      this.materialTenderInfoDOList.splice(index, 1);
      this.syncSelectedRows();
    },
    showTooltip() {
      this.dialogVisible = true;
    },
    editItem(index) {
      console.log('编辑第', index, '行');
      // 聚焦到编辑控件
      // this.$refs['materialTenderInfoDOList' + index].$refs['materialName'].focus();
      this.isView = false;
    },
     getLineOptions() {
      LineApi.itemList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
         this.lineOptions = data.list.map(x => ({
          label: x.projectName,
          value: x.id
        }))
      })
    },
    handleProjectChange(row, projectId) {
      // 根据选择的项目ID找到项目名称
      const selectedProject = this.lineOptions.find(item => item.value === projectId);
      if (selectedProject) {
        row.tenderProjectName = selectedProject.label;
      }
    },
    handleBidAmountInput(row, value) {
      // 只允许输入数字和小数点
      let formattedValue = value.replace(/[^\d.]/g, '');

      // 确保只有一个小数点
      const parts = formattedValue.split('.');
      if (parts.length > 2) {
        formattedValue = parts[0] + '.' + parts.slice(1).join('');
      }

      // 限制小数点后六位
      if (parts.length === 2 && parts[1].length > 6) {
        formattedValue = parts[0] + '.' + parts[1].substring(0, 6);
      }

      // 更新值
      row.bidAmount = formattedValue;
    },
    handleTenderQuantityInput(row, value) {
      // 只允许输入数字和小数点
      let formattedValue = value.replace(/[^\d.]/g, '');

      // 确保只有一个小数点
      const parts = formattedValue.split('.');
      if (parts.length > 2) {
        formattedValue = parts[0] + '.' + parts.slice(1).join('');
      }

      // 限制小数点后两位
      if (parts.length === 2 && parts[1].length > 2) {
        formattedValue = parts[0] + '.' + parts[1].substring(0, 2);
      }

      // 更新值
      row.tenderQuantity = formattedValue;
    },
    formatTimestamp(timestamp) {
      // 如果是时间戳（数字类型），转换为年月日格式
      if (timestamp && typeof timestamp === 'number') {
        return dayjs(timestamp).format('YYYY-MM-DD');
      }
      // 如果已经是字符串格式，直接返回
      return timestamp;
    },
    getMaterialCategoryLabel(value) {
      // 从字典中查找物资类别对应的标签
      if (!value) return '';
      const item = this.dict.type.WZDL.find(item => item.value === value);
      return item ? item.label : value;
    },
    getMaterialTypeLabel(materialCategory, materialType) {
      // 从typeOptions中查找物资种类对应的标签
      if (!materialCategory || !materialType) return '';
      const options = this.typeOptions[materialCategory] || [];
      const item = options.find(item => item.value === materialType);
      return item ? item.label : materialType;
    },
    getItemDetailLabel(materialCategory, materialType, itemDetail) {
      // 从detailOptions中查找细目对应的标签
      if (!materialType || !itemDetail) return '';
      const options = this.detailOptions[this.getDetailOptionsKey(materialType, materialCategory)] || [];
      const item = options.find(item => item.value === itemDetail);
      return item ? item.label : itemDetail;
    },
    async exportItems() {
      try {
        this.loading = true;
        const selectedRowKeySet = this.selectedRowKeySet;
        const allRowKeys = this.materialTenderInfoDOList.map(item => item && item.__rowKey).filter(Boolean);
        const isFullDataSelected = allRowKeys.length > 0 && allRowKeys.every(rowKey => selectedRowKeySet.has(rowKey));
        const selectedIdList = this.materialTenderInfoDOList
          .filter(item => item && selectedRowKeySet.has(item.__rowKey))
          .map(item => item.id)
          .filter(Boolean);
        if (this.selectedRowKeys.length && !selectedIdList.length) {
          this.$modal.msgError("请选择已保存的数据后导出");
          return;
        }
        await FileApi.customDownload({businessType:137, businessData: JSON.stringify({...this.formData,idList:isFullDataSelected ? [] : selectedIdList,tenderId:this.id})});

      } catch (error) {
        this.$modal.msgError("导出数据过多，请重试");
        console.error('导出统计信息失败:', error);
      } finally {
        this.loading = false;
      }
    },
    onBatchUpload() {
      this.$refs.batchDialogRef.open(this.tenderYear);
    },
    async onDialogOk(data) {
      if (this.importing) return;
      this.importing = true;
      // 标记跳过 watcher，避免 push 后 watcher 对全部数据重新调用 loadExistingData
      this.skipWatch = true;
      try {
        // 将批量上传的文件，导入到总的数据中
        const newData = data.map(item => this.ensureRowKey({
          ...item,
          tenderYear: this.tenderYear
        }))
        this.materialTenderInfoDOList.push(...newData)
        await this.$nextTick();
      } finally {
        this.skipWatch = false;
        this.importing = false;
      }
    },
  },
};
</script>

<style scoped>
.borderTop {
  border-top: 1px solid #ebeef5;
}

.license-panel {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f7fa;
  padding: 10px 14px;
  border-bottom: 1px solid #ebeef5;
}

.panel-header .title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
}

.table-search {
  width: 220px;
  margin-right: 10px;
}

.panel-table-header {
  display: flex;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
  font-weight: 500;
  color: #666;
}

.panel-table-header .col {
  padding: 8px 12px;
  border-right: 1px solid #ebeef5;
  text-align: center;
}

.col1,
.col2,
.col3 {
  flex: 1;
}

.col4 {
  flex: 1.2;
}

.col5 {
  width: 80px;
}

.panel-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  align-items: flex-start;
  padding: 10px 0;
}

.row-left {
  flex: 1;
  padding: 0 12px;
}

.row-right {
  width: 80px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 4px;
}

.tooltip-icon {
  cursor: pointer;
    margin-left: 6px;
    color: orange
}

.dialog-content {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 20px;
  background-color: #fafafa;
}

.dialog-content p {
  margin-bottom: 10px;
  line-height: 1.5;
  font-size: 14px;
}

/* 省略号样式 */
.ellipsis-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
