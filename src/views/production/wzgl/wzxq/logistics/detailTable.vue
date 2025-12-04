<template>
  <div class="">
    <el-tabs tab-position="top" v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane v-for="tab in tabList" :key="tab.name" :label="tab.label" :name="tab.name"></el-tab-pane>
    </el-tabs>

    <el-descriptions style="margin: 0 12px" :column="3" size="small" border>
      <el-descriptions-item label="发货单号" label-class-name="my-label" content-class-name="my-content"
        class="my-descriptions">
        <el-tooltip :content="detail.shipmentBatchNumber" placement="bottom" effect="light">
          <!-- 超出隐藏 -->
          <!-- ellips -->
          <div style="
              min-width: 206px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            ">
            {{ detail.shipmentBatchNumber }}
          </div>
        </el-tooltip>
      </el-descriptions-item>
      <el-descriptions-item label="物流单号" label-class-name="my-label" content-class-name="my-content">
        {{ detail.oddNumbers }}
      </el-descriptions-item>
      <el-descriptions-item label="发货时间" label-class-name="my-label" content-class-name="my-content">
        {{ detail.shippingDate | formatDate }}
      </el-descriptions-item>
      <el-descriptions-item label="车牌号" label-class-name="my-label" content-class-name="my-content">
        {{ detail.carNumber }}
      </el-descriptions-item>
      <el-descriptions-item label="发货地址" label-class-name="my-label" content-class-name="my-content">
        <el-tooltip :content="detail.shippingAddress" placement="bottom" effect="light">
          <!-- 超出隐藏 -->
          <!-- ellips -->
          <div style="
              min-width: 206px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            ">
            {{ detail.shippingAddress }}
          </div>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item label="预计到达时间" label-class-name="my-label" content-class-name="my-content">
        <el-tooltip :content="detail.arrivalDate | formatDate" placement="bottom" effect="light">
          <!-- 超出隐藏 -->
          <!-- ellips -->
          <div style="
              min-width: 206px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            ">
            {{ detail.arrivalDate | formatDate }}
          </div>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item label="联系人" label-class-name="my-label" content-class-name="my-content">
        {{ detail.contacts }}
      </el-descriptions-item>
      <el-descriptions-item label="联系电话" label-class-name="my-label" content-class-name="my-content">
        {{ detail.contactsPhone }}
      </el-descriptions-item>
      <el-descriptions-item label="装车照片" label-class-name="my-label" content-class-name="my-content">
        <!-- {{ JSON.stringify(detail.zczp) }} -->
        <fileUpload v-model="detail.zczp" :limit="9999" :preview="true" :isShowTip="false"
          :fileType="['jpg', 'png', 'jpeg']" />
      </el-descriptions-item>
    </el-descriptions>
    <div style="height: 10px"></div>
    <template v-if="detail.oddNumbers">
      <wuliu :courierNumber="detail.oddNumbers" style="height: 450px" />
    </template>
    <template v-else>
      <!-- 没有订单号则展示普通表格 -->
      <wuliuTable :tableData="detail.materialTrackMessageDTOS" />
    </template>
    <!-- 物资明细 -->
    <div style="height: 10px"></div>
    <itemTable :tableData="detail.materialCirculationDetailsTableDTOS" />
  </div>
</template>

<script>
import dayjs from "dayjs";
import wuliu from "@/views/components/wuliu";
import itemTable from "./itemTable";
import wuliuTable from "./table.vue";
import * as Api from "@/api/prodmgr-inv/project/scm.js";
import fileUpload from "@/components/upload";
export default {
  // 需求详情表格数据
  props: {
    tableData: {
      type: Array,
      default: () => [],
    },
  },
  filters: {
    // 日期格式化过滤器
    formatDate(value, format = "YYYY年MM月DD日") {
      if (!value) return "";
      return dayjs(value).format(format);
    },
  },
  components: {
    wuliu,
    itemTable,
    wuliuTable,
    fileUpload
  },
  computed: {
    id() {
      return this.$route.query.id;
    },
    batch() {
      return this.$route.query.batch;
    },
  },
  data() {
    // 状态（1.未发货 2.货运中 3.已完成）
    const status = {
      1: "未发货",
      2: "货运中",
      3: "已完成",
      8: "审核中",
      9: "驳回"
    };
    return {
      status,
      courierNumber: "",
      detail: {},
      tabList: [],
      activeTab: "",
    };
  },
  created() {
    //有batch批次号，直接用批次号获取详情，不再调取批次数组接口
    if (this.batch) {
      this.getLogistics(this.batch);
    } else {
      this.getBatch();
    }
  },
  methods: {
    async getLogistics(id) {
      const res = await Api.getLogisticsDetail(id);
      this.detail = res.data;
      this.detail.zczp = JSON.parse(this.detail.fileByList).zczp
    },
    async getBatch() {
      const res = await Api.getBatchList(this.id)
      this.tabList = res.data.map((x, idx) => ({
        label: `发货批次${idx + 1}`,
        name: x.shipmentBatchNumber,
      }));

      if (this.tabList.length) {
        this.activeTab = this.tabList[0].name;
        this.handleTabClick(this.tabList[0]);
      }
    },
    handleTabClick(tab) {
      this.getLogistics(tab.name);
    },
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

<style>
.my-label {
  background: #f2f2f2 !important;
  min-height: 38px !important;
  width: 100px !important;
  font-size: 14px !important;
  color: #1b1e22 !important;
  display: block;
  padding-right: 0 !important;
}

.my-content {
  background: #fff;
  width: calc(100% / 3) !important;
}
</style>
