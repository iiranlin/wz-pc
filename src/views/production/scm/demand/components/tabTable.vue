<template>
  <div class="tab-table-container">
    <!-- Action Button -->
    <div class="flex">
      <span class="title">
        发运物资明细 （共计<span style="color: red">{{ tableData.length }}</span
        >条）
      </span>
      <el-button
        type="primary"
        icon="el-icon-plus"
        size="mini"
        @click="selectItem"
        v-if="type != 'view'"
        >选择发货物资</el-button
      >
    </div>
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      :max-height="600"
      v-loading="loading"
      ref="tableRef"
    >
      <el-table-column type="index" label="序号" width="55" align="center" fixed="left" />
      <!-- <el-table-column prop="sectionName" label="标段项目名称" width="250" fixed="left">
      </el-table-column> -->
      <el-table-column prop="materialName" label="物资名称" width="250" fixed="left">
      </el-table-column>
      <el-table-column prop="specModel" label="规格型号" width="200" align="center"></el-table-column>

      <el-table-column prop="unit" label="计量单位" width="120" align="center"></el-table-column>
      <el-table-column prop="planAmount" label="计划数量" width="140" align="center"></el-table-column>
      <el-table-column prop="sendTotal" label="发货数量" width="160">
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.sendTotal"
            :min="0"
            :max="Number(scope.row.planAmount)"
            size="mini"
            style="width: 100%"
            v-if="type != 'view'"
          ></el-input-number>
          <span v-else>
            {{ scope.row.sendTotal }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="packagingFm" label="包装形式" width="160" align="center">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.packagingFm"
            size="mini"
            style="width: 100%"
            v-if="type != 'view'"
          ></el-input>
          <span v-else>
            {{ scope.row.packagingFm }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="manufactureDate" label="生产日期" width="160">
        <template slot-scope="scope">
          <el-date-picker
            v-model="scope.row.manufactureDate"
            type="date"
            size="mini"
            style="width: 100%"
            value-format="yyyy-MM-dd"
            v-if="type != 'view'"
          ></el-date-picker>
          <span v-else>
            {{ scope.row.manufactureDate }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="expirationDate" label="有效期截止日期" width="160" align="center">
        <template slot-scope="scope">
          <el-date-picker
            v-model="scope.row.expirationDate"
            type="date"
            size="mini"
            style="width: 100%"
            value-format="yyyy-MM-dd"
            v-if="type != 'view'"
          ></el-date-picker>
          <span v-else>
            {{ scope.row.expirationDate }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="receivingAddress" label="收货地址" width="160" align="center">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.receivingAddress"
            size="mini"
            style="width: 100%"
            v-if="type != 'view'"
          ></el-input>
          <span v-else>
            {{ scope.row.receivingAddress }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="supplyDate" label="供应时间" width="160" align="center">
        <template slot-scope="scope">
          <el-date-picker
            v-model="scope.row.supplyDate"
            type="date"
            size="mini"
            style="width: 100%"
            value-format="yyyy-MM-dd"
            v-if="type != 'view'"
          ></el-date-picker>
          <span v-else>
            {{ scope.row.supplyDate }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="receiver" label="收货人及联系方式" width="250">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.receiver"
            size="mini"
            style="width: 100%"
            v-if="type != 'view'"
          ></el-input>
          <span v-else>
            {{ scope.row.receiver }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="field0" label="投资方" width="180" align="center"></el-table-column>
      <el-table-column prop="field1" label="投资比例" width="120" align="center"></el-table-column>
      <el-table-column prop="projectShortName" label="合格证附件" width="300">
        <template slot-scope="scope">
          <fileUpload
            v-model="scope.row.fileList01"
            :value="scope.row.fileList01"
            :limit="1"
            :preview="type == 'view'"
            :isShowTip="false"
          />
        </template>
      </el-table-column>
      <el-table-column prop="projectShortName" label="厂检报告附件" width="300">
        <template slot-scope="scope">
          <fileUpload
            v-model="scope.row.fileList02"
            :value="scope.row.fileList02"
            :limit="1"
            :preview="type == 'view'"
            :isShowTip="false"
          />
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" width="200">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.remark"
            size="mini"
            style="width: 100%"
            v-if="type != 'view'"
          ></el-input>
          <span v-else>
            {{ scope.row.remark }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import fileUpload from "@/components/upload";
export default {
  name: "tabTable",
  dicts: ["MeasureUnit"],

  props: {
    // 接收外部传入的表格数据
    tableData: {
      type: Array,
      default: () => [],
    },
  },
  components: { fileUpload },
  computed: {
    type() {
      return this.$route.query.type;
    },
    id() {
      return this.$route.query?.id || "";
    },
    planId() {
      return this.$route.query?.planId || "";
    }
  },
  data() {
    return {
      loading: false,
    };
  },

  created() {},
  methods: {
    selectItem() {
      this.setSelectedItemList(this.tableData);
      this.$router.push({
        name: "selectItem",
        query: {
          id: this.id,
          type: this.type,
          planId: this.planId,
        },
      });
    },
    setSelectedItemList(data) {
      this.$store.dispatch("request/setSelectedItemList", data);
    },
  },
};
</script>

<style scoped>
.flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}
.flex .title {
  font-weight: 600;
  color: #000;
  padding-left: 12px;
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

::v-deep .el-select {
  width: 100%;
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
