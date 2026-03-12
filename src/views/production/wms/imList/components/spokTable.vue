<template>
  <div>
    <div style="margin-bottom: 10px; display: flex; align-items: center; justify-content: flex-end;">
      <el-input v-model="searchKey" placeholder="请输入规格型号搜索" clearable size="mini"
        style="width: 250px;" prefix-icon="el-icon-search" />
    </div>
    <el-table :data="filteredList" border style="width: 100%" max-height="450" v-loading="loading" ref="itemTable"
      row-key="id">

      <el-table-column label="序号" width="88" align="center" type="index" fixed="left"></el-table-column>
      <el-table-column label="物资名称" width="150" prop="materialName" align="center" fixed="left"></el-table-column>
      <el-table-column label="规格型号" width="150" prop="specModel" align="center" fixed="left"></el-table-column>
      <el-table-column label="计量单位" width="150" prop="unit" align="center"></el-table-column>
      <el-table-column label="发货数量" width="150" prop="sendTotal" align="center"></el-table-column>
      <el-table-column label="可抽检数量" width="150" prop="storeTotal" align="center"></el-table-column>
      <el-table-column label="包装形式" prop="packagingFm" align="center"></el-table-column>
      <el-table-column label="生产日期" width="150" prop="manufactureDate" align="center">
        <template slot-scope="scope">
          {{ scope.row.manufactureDate | formatDate }}
        </template>
      </el-table-column>
      <el-table-column label="有效期截止日期" width="150" prop="expirationDate" align="center">
        <template slot-scope="scope">
          {{ scope.row.expirationDate | formatDate }}
        </template>
      </el-table-column>
      <el-table-column label="合格证附件" width="200" prop="hgzfj" align="center">
        <template slot-scope="scope">
          <fileUpload v-model="scope.row.hgzfj" :limit="9999" :fileSize="500"
            :fileType="['jpg', 'jpeg', 'png', 'pdf']" :preview="true" />
        </template>
      </el-table-column>
      <el-table-column label="厂检报告附件" width="200" prop="cjbgfj" align="center">
        <template slot-scope="scope">
          <fileUpload v-model="scope.row.cjbgfj" :limit="9999" :fileSize="500"
            :fileType="['jpg', 'jpeg', 'png', 'pdf']" :preview="true" />
        </template>
      </el-table-column>
      <el-table-column label="当前库存数量" width="150" prop="remainingStock" align="center"></el-table-column>

      <el-table-column label="抽检结果" align="center" width="150">
        <template slot-scope="scope">
          <template v-if="type != 'view'">
            <el-tooltip v-if="isSamplingDisabled(scope.row)" :content="getSamplingDisabledReason(scope.row)" placement="top">
              <div class="sampling-disabled-box">
                <i class="el-icon-warning-outline sampling-disabled-icon"></i>
                <span>不可抽检</span>
                <div class="sampling-disabled-reason">当前可抽检数量为0</div>
              </div>
            </el-tooltip>
            <el-select v-else v-model="scope.row.detailStatus" size="mini" @change="handleChange(scope.row)"
              :disabled="isSamplingDisabled(scope.row)" style="width: 100%" filterable>
              <el-option v-for="item of samplingResult" :key="item.value" :label="item.label"
                :value="item.value"></el-option>
            </el-select>
          </template>
          <span v-else>{{ scope.row.detailStatus | samplingResultFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column label="结果处理" align="center" width="200">
        <template slot-scope="scope">
          <template v-if="type != 'view'">
            <el-select v-if="scope.row.detailStatus === '2'" v-model="scope.row.status" size="mini"
              style="width: 100%" filterable @change="handleDealChange(scope.row)">
              <el-option v-for="res of dealResult" :key="res.value" :label="res.label"
                :value="res.value"></el-option>
            </el-select>
          </template>
          <span v-else>{{ scope.row.status | dealResultFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="退换货数量" width="150"  align="center">
        <template slot-scope="scope">
          {{ scope.row.returnAmount || 0 }}
          </template>
      </el-table-column>
      <el-table-column label="抽检材料附件" prop="fileList" align="center" width="200">
        <template slot-scope="scope">
          <fileUpload v-if="scope.row.detailStatus === '2'" v-model="scope.row.fileList" :limit="9999" :fileSize="500"
            :fileType="['jpg', 'jpeg', 'png', 'pdf']" :preview="type ==='view'" />
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" align="center" width="200">
        <template slot-scope="scope">
          <template v-if="type !== 'view'">
            <el-input v-model="scope.row.remark" placeholder="请输入" />
          </template>
          <span v-else>{{ scope.row.remark }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import fileUpload from '@/components/upload'

// 提取为模块级常量，以便 filters 和 data 共用
const SAMPLING_RESULT = [
  { value: '1', label: '合格' },
  { value: '2', label: '不合格' }
]
const DEAL_RESULT = [
  { value: '2', label: '只退换库存数量' },
  { value: '3', label: '退换入库质检通过数量' }
]

export default {
  name: 'SpokTable',

  components: { fileUpload },
  filters:{
    samplingResultFilter(val){
      const item = SAMPLING_RESULT.find(item => item.value == val)
      return item ? item.label : ''
    },
    dealResultFilter(val){
      const item = DEAL_RESULT.find(item => item.value == val)
      return item ? item.label : ''
    }
  },

  props: {
    /** 表格数据列表 */
    itemList: {
      type: Array,
      default: () => []
    },
    /** 加载状态 */
    loading: {
      type: Boolean,
      default: false
    },
    type:{
      type: String,
      default: ''
    }
  },

  data() {
    return {
      searchKey: '',
      samplingResult: SAMPLING_RESULT,
      dealResult: DEAL_RESULT
    }
  },

  computed: {
    /** 根据规格型号关键字过滤列表 */
    filteredList() {
      if (!this.searchKey) return this.itemList;
      const key = this.searchKey.toLowerCase();
      return this.itemList.filter(item =>
        item.specModel && item.specModel.toLowerCase().includes(key)
      );
    }
  },

  methods: {
    isSamplingDisabled(row) {
      return row?.samplingFlag === '0';
    },

    getSamplingDisabledReason(row) {
      return `物资"${row.materialName}"当前可抽检数量为0，不允许抽检`;
    },

    resetSamplingFields(row) {
      this.$set(row, 'detailStatus', '');
      this.$set(row, 'status', '');
      this.$set(row, 'returnAmount', '0');
      this.$set(row, 'fileList', []);
    },

    /** 抽检结果变更 */
    handleChange(row) {
      if (this.isSamplingDisabled(row)) {
        this.resetSamplingFields(row);
        this.$message.warning(`物资"${row.materialName}"，不允许抽检`);
        return;
      }
      if (row.detailStatus === '1') {
        // 合格：清空结果处理、退换货数量、抽检材料附件
        this.$set(row, 'status', '1');
        this.$set(row, 'returnAmount', '0');
        this.$set(row, 'fileList', []);
      } else {
        // 不合格：结果处理默认选中第一项，并联动计算退换货数量
        this.$set(row, 'status', this.dealResult[0]?.value || '');
        this.handleDealChange(row);
      }
    },

    /** 结果处理变更 - 自动计算退换货数量 */
    handleDealChange(row) {
      if (row.status === '2') {
        // 只退换库存数量 → 退换货数量 = 当前库存数量
        this.$set(row, 'returnAmount', row.remainingStock);
      } else if (row.status === '3') {
        // 退换入库质检通过数量 → 退换货数量 = 可抽检数量
        this.$set(row, 'returnAmount', row.storeTotal);
      } else {
        this.$set(row, 'returnAmount', '0');
      }
    },

    /**
     * 验证表格数据
     * 规则：抽检结果为"不合格"时，抽检材料附件为必填
     * @returns {boolean} 验证是否通过
     */
    validate() {
      for (let i = 0; i < this.itemList.length; i++) {
        const row = this.itemList[i];
        if (this.isSamplingDisabled(row) && row.detailStatus) {
          this.$message.warning(`第 ${i + 1} 行"${row.materialName}"，不允许抽检`);
          return false;
        }
        // 不合格时，校验抽检材料附件
        if (row.detailStatus === '2') {
          if (!row.fileList || row.fileList.length === 0) {
            this.$message.warning(`第 ${i + 1} 行"${row.materialName}"抽检结果为不合格，请上传抽检材料附件`);
            return false;
          }
        }
      }
      return true;
    }
  }
}
</script>

<style lang="scss" scoped>
.sampling-disabled-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 6px 8px;
  border: 1px solid #f3c7c7;
  border-radius: 4px;
  background: #fff3f3;
  color: #d14343;
  line-height: 1.4;
  cursor: not-allowed;
}

.sampling-disabled-icon {
  margin-bottom: 2px;
  font-size: 14px;
}

.sampling-disabled-reason {
  font-size: 12px;
  color: #b85b5b;
}
</style>
