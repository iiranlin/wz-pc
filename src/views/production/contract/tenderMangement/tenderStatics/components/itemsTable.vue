<template>
  <div class="license-panel" >
    <div class="panel-header">
      <div class="title">
        <span>操作</span>
        <i class="el-icon-warning-outline tooltip-icon" @click="showTooltip" v-if="!isView"></i>
      </div>
      <div>
        <el-button v-if="!isView" type="primary" size="mini" icon="el-icon-plus" @click="addItem">
          新增
        </el-button>
        <el-button v-if="isView" type="primary" size="mini" icon="el-icon-download" @click="exportItems">
          导出明细
        </el-button>
      </div>
    </div>

    <!-- 动态table项 -->
    <el-table :data="materialTenderInfoDOList" style="margin-top: 20px;" size="small">
      <el-table-column label="序号" type="index" width="50" align="center" />
      <el-table-column width="260" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 招标项目名称
        </template>
        <template slot-scope="scope">
          <el-select v-if="!isView" v-model="scope.row.tenderProjectId" placeholder="请选择" style="width: 100%" @change="handleProjectChange(scope.row, $event)">
            <el-option v-for="item in lineOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <span v-else>{{ scope.row.tenderProjectName }}</span>
        </template>
      </el-table-column>
      <el-table-column width="300" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 招标人名称
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.tendererName" placeholder="请输入填报单位" />
          <el-tooltip v-else :content="scope.row.tendererName" placement="top" effect="dark">
            <span class="ellipsis-text">{{ scope.row.tendererName }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="year" width="130" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 招标年度
        </template>
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.tenderYear" disabled placeholder="请选择" type="year" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.tenderYear) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="300" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 招标交易场所
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.tenderTradePlace" placeholder="请输入" style="width: 100%" />
          <el-tooltip v-else :content="scope.row.tenderTradePlace" placement="top" effect="dark">
            <span class="ellipsis-text">{{ scope.row.tenderTradePlace }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column width="200" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 项目类别
        </template>
        <template slot-scope="scope"> 
          <el-input v-if="!isView" v-model="scope.row.projectCategory" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.projectCategory }}</span>
        </template>
      </el-table-column>
      <el-table-column width="200" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 物资类别
        </template>
        <template slot-scope="scope">
          <el-select v-if="!isView" v-model="scope.row.materialCategory" placeholder="请选择" style="width: 100%" @change="handleMaterialCategoryChange(scope.row, $event)">
            <el-option v-for="item in dict.type.WZDL" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <span v-else>{{ getMaterialCategoryLabel(scope.row.materialCategory) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="200" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 招标编号
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.tenderNo" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.tenderNo }}</span>
        </template>
      </el-table-column>
      <el-table-column width="180" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 包件号
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.packageNo" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.packageNo }}</span>
        </template>
      </el-table-column>
      <el-table-column width="300" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 物资种类
        </template>
        <template slot-scope="scope">
          <el-select v-if="!isView" v-model="scope.row.materialType" placeholder="请选择"
              filterable style="width: 100%" @change="handleMaterialTypeChange(scope.row, $event)">
            <el-option v-for="item in typeOptions[scope.row.materialCategory] || []" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <span v-else>{{ getMaterialTypeLabel(scope.row.materialCategory, scope.row.materialType) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="300" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 细目
        </template>
        <template slot-scope="scope">
          <el-select v-if="!isView" v-model="scope.row.itemDetail" placeholder="请选择" filterable style="width: 100%">
            <el-option v-for="item in detailOptions[scope.row.materialType] || []" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <span v-else>{{ getItemDetailLabel(scope.row.materialType, scope.row.itemDetail) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 计量单位
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
      <el-table-column width="130" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 招标数量
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.tenderQuantity" placeholder="请输入" style="width: 100%" @input="handleTenderQuantityInput(scope.row, $event)" />
          <span v-else>{{ scope.row.tenderQuantity }}</span>
        </template>
      </el-table-column>
      <el-table-column width="170" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 招标发布公告时间
        </template>
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.tenderNoticePubTime" placeholder="请选择" type="date" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.tenderNoticePubTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="160" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 开标时间
        </template>
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.bidOpenTime" placeholder="请选择" type="date" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.bidOpenTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="200" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 推荐中标候选人公示时间
        </template>
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.candidatePubTime" placeholder="请选择" type="date" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.candidatePubTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="160" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 中标通知书时间
        </template>
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.bidNoticeTime" placeholder="请选择" type="date" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.bidNoticeTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="150" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 中标单位
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.winningBidder" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.winningBidder }}</span>
        </template>
      </el-table-column>
      <el-table-column width="150" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 中标金额（万元）
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.bidAmount" placeholder="请输入" style="width: 100%" 
          @input="handleBidAmountInput(scope.row, $event)"/>
          <span v-else>{{ scope.row.bidAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column width="160" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 合同签订时间
        </template>
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.contractSignTime" placeholder="请选择" type="date" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.contractSignTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="300" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 投标人名称
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.bidderName" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.bidderName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="150" align="center">
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.remark" placeholder="请输入" style="width: 100%" maxlength="1000"/>
          <span v-else>{{ scope.row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="!isView" label="操作" width="120" align="center" fixed="right">
        <template slot-scope="scope">
          <!-- <el-button type="text" size="mini" style="margin-right: 20px;" @click="editItem(scope.$index)">修改</el-button> -->
          <el-button type="text" size="mini" @click="removeItem(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

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
  </div>
</template>

<script>
import dayjs from "dayjs";
import * as LineApi from '@/api/prodmgr-inv/project/line.js'
import * as TypeApi from "@/api/prodmgr-inv/project/itemType.js";
import * as DetailApi from "@/api/prodmgr-inv/project/itemDetail.js";
import * as FileApi from "@/api/prodmgr-inv/project/file.js";

export default {
  name: 'itemsTable',
  dicts: ['MeasureUnit', 'WZDL'],
  data() {
    return {
      lineOptions: [], // 项目名称选项
      dialogVisible: false, // 填写说明弹窗显示状态
       isInitializing: true, // 添加初始化标记
      typeOptions: {}, // 物资种类选项，按物资类别分类
      detailOptions: {}, // 物资细目选项，按物资种类分类
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
  },

  created () {
    this.getLineOptions()
     // 初始化完成
    this.$nextTick(() => {
      this.isInitializing = false;
    });
  },
  watch: {
    value: {
      handler(newValue) {
        if (newValue && newValue.materialTenderInfoDOList) {
          this.loadExistingData(newValue.materialTenderInfoDOList);
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 加载已有的数据，为编辑和查看详情做准备
    async loadExistingData(items) {
      for (const item of items) {
        // 加载物资种类数据
        if (item.materialCategory) {
          await this.getTypeOptions(item.materialCategory);
          // 加载细目数据
          if (item.materialType) {
            await this.getDetailOptions(item.materialType, item.materialCategory);
          }
        }
      }
    },
    // 处理物资类别变化
    async handleMaterialCategoryChange(row, materialCategory) {
      console.log('handleMaterialCategoryChange触发', { row, materialCategory });
      // 清空物资种类和细目
      row.materialType = '';
      row.itemDetail = '';
      
      // 如果选择了物资类别，获取对应的物资种类
      if (materialCategory) {
        await this.getTypeOptions(materialCategory);
      } else {
        console.log('物资类别为空');
      }
    },
    
    // 处理物资种类变化
    async handleMaterialTypeChange(row, materialType) {
      // 清空细目
      row.itemDetail = '';
      
      // 如果选择了物资种类，获取对应的细目
      if (materialType) {
        // 传递物资类别的code作为speciesCode参数
        await this.getDetailOptions(materialType, row.materialCategory);
      } else {
        console.log('物资种类为空');
      }
    },
    
    // 获取物资种类选项（依赖物资大类）
    async getTypeOptions(speciesCode = "") {
      try {
        const params = {
          pageNum: 1,
          pageSize: -1,
          speciesCode: speciesCode,
        };

        const res = await TypeApi.itemList(params);
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
      } catch (error) {
        console.error("获取物资种类失败", error);
        this.$set(this.typeOptions, speciesCode, []);
      }
    },
    // 获取物资细目选项（依赖物资种类）
    async getDetailOptions(categoriesCode, speciesCode) {
      try {
        console.log('调用DetailApi.itemList', { categoriesCode, speciesCode });
        const params = {
          pageNum: 1,
          pageSize: -1,
          categoriesCode: categoriesCode,
          speciesCode: speciesCode,
        };

        const res = await DetailApi.itemList(params);
        console.log('DetailApi.itemList返回', res);
        if (res.data && res.data.list) {
          const options = res.data.list.map((x) => ({
            ...x,
            label: x.detailName,
            value: x.detailCode,
          }));
          this.$set(this.detailOptions, categoriesCode, options);
        } else {
          this.$set(this.detailOptions, categoriesCode, []);
        }
      } catch (error) {
        this.$set(this.detailOptions, categoriesCode, []);
      }
    },

    addItem() {
      this.materialTenderInfoDOList.push({
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
    },
    removeItem(index) {
      this.materialTenderInfoDOList.splice(index, 1);
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
    getItemDetailLabel(materialType, itemDetail) {
      // 从detailOptions中查找细目对应的标签
      if (!materialType || !itemDetail) return '';
      const options = this.detailOptions[materialType] || [];
      const item = options.find(item => item.value === itemDetail);
      return item ? item.label : itemDetail;
    },
    async exportItems() {
      try {
        this.loading = true;
        await FileApi.customDownload({businessType:137, businessData: JSON.stringify({...this.formData,idList:null,tenderId:this.id})});

      } catch (error) {
        this.$modal.msgError("导出失败，请重试");
        console.error('导出统计信息失败:', error);
      } finally {
        this.loading = false;
      }
    }
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
