<template>
  <div class="license-panel">
    <div class="panel-header">
      <div class="title">
        <span>{{ !isView ? "操作" : "" }}</span>
        <i class="el-icon-warning-outline tooltip-icon" @click="showTooltip"></i>
      </div>
      <div v-if="!isView">
        <el-button  type="primary" size="mini" icon="el-icon-plus" @click="addItem">
          新增
        </el-button>
      </div>
    </div>

    <!-- 动态table项 -->
    <el-table :data="materialTenderInfoDOList" style="margin-top: 20px;" size="small">
      <el-table-column label="序号" type="index" width="50" align="center" />
      <el-table-column width="180" align="center">
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
      <el-table-column label="招标人名称" width="120" align="center">
        <template slot-scope="scope">
          {{ scope.row.tendererName }}
        </template>
      </el-table-column>
      <el-table-column prop="year" width="130" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 招标年度
        </template>
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.tenderYear"  placeholder="请选择" type="year" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.tenderYear) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="150" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 招标交易场所
        </template>
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.tenderTradePlace" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.tenderTradePlace }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120" align="center">
        <template slot="header">
          <span style="color: red;">*</span> 项目类别
        </template>
        <template slot-scope="scope"> 
          <el-input v-if="!isView" v-model="scope.row.projectCategory" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.projectCategory }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物资类别" width="160" align="center">
        <template slot-scope="scope">
          <el-select v-if="!isView" v-model="scope.row.materialCategory" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in dict.type.WZDL" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <span v-else>{{ scope.row.materialCategory }}</span>
        </template>
      </el-table-column>
      <el-table-column label="招标编号" width="150" align="center">
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.tenderNo" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.tenderNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="包件号" width="100" align="center">
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.packageNo" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.packageNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物资种类" width="120" align="center">
        <template slot-scope="scope">
         <el-input v-if="!isView" v-model="scope.row.materialType" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.materialType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="细目" width="120" align="center">
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.itemDetail" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.itemDetail }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计量单位" width="120" align="center">
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
      <el-table-column label="招标数量" width="100" align="center">
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.tenderQuantity" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.tenderQuantity }}</span>
        </template>
      </el-table-column>
      <el-table-column label="招标发布公告时间" width="170" align="center">
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.tenderNoticePubTime" placeholder="请选择" type="date" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.tenderNoticePubTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开标时间" width="160" align="center">
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.bidOpenTime" placeholder="请选择" type="date" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.bidOpenTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="推荐中标候选人公示时间" width="180" align="center">
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.candidatePubTime" placeholder="请选择" type="date" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.candidatePubTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="中标通知书时间" width="160" align="center">
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.bidNoticeTime" placeholder="请选择" type="date" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.bidNoticeTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="中标单位" width="150" align="center">
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.winningBidder" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.winningBidder }}</span>
        </template>
      </el-table-column>
      <el-table-column label="中标金额（万元）" width="150" align="center">
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.bidAmount" placeholder="请输入" style="width: 100%" 
          @input="handleBidAmountInput(scope.row, $event)"/>
          <span v-else>{{ scope.row.bidAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合同签订时间" width="160" align="center">
        <template slot-scope="scope">
          <el-date-picker v-if="!isView" v-model="scope.row.contractSignTime" placeholder="请选择" type="date" style="width: 100%" />
          <span v-else>{{ formatTimestamp(scope.row.contractSignTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="投标人名称" width="150" align="center">
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.bidderName" placeholder="请输入" style="width: 100%" />
          <span v-else>{{ scope.row.bidderName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="150" align="center">
        <template slot-scope="scope">
          <el-input v-if="!isView" v-model="scope.row.remark" placeholder="请输入" style="width: 100%" />
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
import { watch } from "vue";

export default {
  name: 'itemsTable',
  dicts: ['MeasureUnit', 'WZDL'],
  data() {
    return {
      lineOptions: [], // 招标项目名称
      dialogVisible: false // 填写说明弹窗显示状态
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

  filters: {
    formatDate(value) {
      if (!value) return "";
      return dayjs(value).format("YYYY-MM-DD");
    },
  },

  created () {
    this.getLineOptions()
  },
  methods: {
    addItem() {
      this.materialTenderInfoDOList.push({
        tenderProjectId: "",            //项目id
        tenderProjectName: "",            //招标项目名称
        tendererName: this.tenderUnit, //招标人名称
        tenderYear: "", //招标年度
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
       LineApi.lineSelectOptions().then(({ data }) => {
        this.lineOptions = data.map(x => ({
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
    formatTimestamp(timestamp) {
      // 如果是时间戳（数字类型），转换为年月日格式
      if (timestamp && typeof timestamp === 'number') {
        return dayjs(timestamp).format('YYYY-MM-DD');
      }
      // 如果已经是字符串格式，直接返回
      return timestamp;
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

</style>
