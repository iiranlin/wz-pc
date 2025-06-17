<template>
  <div class="material-search-table">
    <!-- 搜索框 -->
    <div class="search-container">
      <div style="font-size: 20px; font-weight: bold">
        请设置物资需求信息（已选择
        <i style="color: red">{{ tableData.length }}</i> 项）
      </div>
      <el-button @click="onGoView"> 选择需求物资 </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      ref="tableRef"
      :data="tableData"
      style="width: 100%"
      border
      max-height="500"
    >
      <el-table-column
        type="index"
        align="center"
        label="序号"
        width="60"
        fixed
      ></el-table-column>
      <el-table-column
        prop="sellerName"
        label="供应商"
        align="center"
        width="120"
        fixed
      ></el-table-column>
      <el-table-column
        prop="materialName"
        label="物资名称"
        align="center"
        width="120"
        fixed
      ></el-table-column>
      <el-table-column
        prop="specModel"
        label="规格型号"
        align="center"
        width="150"
        fixed
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
        <template slot-scope="scope">
          {{ +scope.row.cumulativeAmount + +(scope.row.planAmount || 0) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="planAmount"
        label="本次计划数量"
        align="center"
        width="150"
      >
        <template slot="header">
          <span style="color: red; margin-right: 5px">*</span>
          <span>本次计划数量</span>
        </template>
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.planAmount"
            :min="0"
            :max="+scope.row.amount - +scope.row.cumulativeAmount"
            :precision="2"
            size="mini"
            style="width: 100%"
          ></el-input-number>
        </template>
      </el-table-column>
      <el-table-column prop="supplyDate" label="供应时间" min-width="200">
        <template slot="header">
          <span style="color: red; margin-right: 5px">*</span>
          <span>供应时间</span>
          <el-button
            type="text"
            icon="el-icon-document-copy"
            @click="copyLast('supplyDate')"
            style="margin-left: 8px; font-size: 14px"
            >填充</el-button
          >
        </template>
        <template slot-scope="scope">
          <el-date-picker
            v-model="scope.row.supplyDate"
            type="date"
            size="mini"
            style="width: 100%"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </template>
      </el-table-column>
      <el-table-column prop="addr" label="使用地点" min-width="200">
        <template slot="header">
          <span style="color: red; margin-right: 5px">*</span>
          <span>使用地点</span>
          <el-button
            type="text"
            icon="el-icon-document-copy"
            @click="copyLast('addr')"
            style="margin-left: 8px; font-size: 14px"
            >填充</el-button
          >
        </template>
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.addr"
            size="mini"
            style="width: 100%"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="field2" label="收货地址" min-width="200">
        <template slot="header">
          <span style="color: red; margin-right: 5px">*</span>
          <span>收货地址</span>
          <el-button
            type="text"
            icon="el-icon-document-copy"
            @click="copyLast('field2')"
            style="margin-left: 8px; font-size: 14px"
            >填充</el-button
          >
        </template>
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.field2"
            size="mini"
            style="width: 100%"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="receiver" label="收货人及联系方式" min-width="250">
        <template slot="header">
          <span style="color: red; margin-right: 5px">*</span>
          <span>收货人及联系方式</span>
          <el-button
            type="text"
            icon="el-icon-document-copy"
            @click="copyLast('receiver')"
            style="margin-left: 8px; font-size: 14px"
            >填充</el-button
          >
        </template>
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.receiver"
            size="mini"
            style="width: 100%"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="field0" label="投资方" min-width="200">
        <template slot="header">
          <span style="color: red; margin-right: 5px">*</span>
          <span>投资方</span>
          <el-button
            type="text"
            icon="el-icon-document-copy"
            @click="copyLast('field0')"
            style="margin-left: 8px; font-size: 14px"
            >填充</el-button
          >
        </template>
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.field0"
            size="mini"
            style="width: 100%"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="field1" label="投资比例" min-width="200">
        <template slot="header">
          <span style="color: red; margin-right: 5px">*</span>
          <span>投资比例</span>
          <el-button
            type="text"
            icon="el-icon-document-copy"
            @click="copyLast('field1')"
            style="margin-left: 8px; font-size: 14px"
            >填充</el-button
          >
        </template>
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.field1"
            size="mini"
            style="width: 100%"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="200">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.remark"
            size="mini"
            style="width: 100%"
          ></el-input>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  // 新增物资填报表格
  data () {
    return {
      tableData: [],
    };
  },
  computed: {
    ...mapState(['request']),
    id () {
      return this.$route.query?.id || ''
    },
  },
  mounted () {
    this.tableData = this.getSelectedMaterialList().map(x => ({
      ...x,
      // 合同数量 - 累计数量
      planAmount: +x.amount - +x.cumulativeAmount
    }))
  },
  methods: {
    copyLast (name) {
      if (!this.tableData || this.tableData.length === 0) return;

      let lastIndex = -1;
      let lastDate = null;

      for (let i = this.tableData.length - 1; i >= 0; i--) {
        if (this.tableData[i][name]) {
          lastIndex = i;
          lastDate = this.tableData[i][name];
          break;
        }
      }

      if (lastDate === null) return;

      for (let i = lastIndex + 1; i < this.tableData.length; i++) {
        if (!this.tableData[i][name]) {
          this.$set(this.tableData[i], name, lastDate);
        }
      }
    },
    onGoView () {
      this.$router.push({
        name: 'requestView',
        query: {
          type: 'create',
          id: this.id
        }
      })
    },
    setSelectedMaterialList (data) {
      this.$store.dispatch('request/setSelectedMaterialList', data)
    },
    getSelectedMaterialList (data) {
      return this.request.selectedMaterialList
    }
  },
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