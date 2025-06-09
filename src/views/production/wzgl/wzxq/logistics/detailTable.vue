<template>
  <div class="material-search-table">
    <el-tabs tab-position="top" v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane
        v-for="tab in tabList"
        :key="tab.name"
        :label="tab.label"
        :name="tab.name"
      ></el-tab-pane>
    </el-tabs>

    <el-descriptions :column="3" size="small" border>
      <el-descriptions-item
        label="发货单号"
        label-class-name="my-label"
        content-class-name="my-content"
      >
        shippingNumber
      </el-descriptions-item>
      <el-descriptions-item
        label="物流单号"
        label-class-name="my-label"
        content-class-name="my-content"
      >
        归属线路项目
      </el-descriptions-item>
      <el-descriptions-item
        label="发货事件"
        label-class-name="my-label"
        content-class-name="my-content"
      >
        归属线路项目
      </el-descriptions-item>
      <el-descriptions-item
        label="发货地址"
        label-class-name="my-label"
        content-class-name="my-content"
      >
        <el-tooltip content="Bottom center" placement="bottom" effect="light">
          <!-- 超出隐藏 -->
          <!-- ellips -->
          <div
            style="
              width: 300px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            "
          >
            归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目
          </div>
        </el-tooltip>
      </el-descriptions-item>
      <el-descriptions-item
        label="收货地址"
        label-class-name="my-label"
        content-class-name="my-content"
      >
        <el-tooltip content="Bottom center" placement="bottom" effect="light">
          <!-- 超出隐藏 -->
          <!-- ellips -->
          <div
            style="
              width: 300px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            "
          >
            归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目归属线路项目
          </div>
        </el-tooltip>
      </el-descriptions-item>
      <el-descriptions-item
        label="预计到达时间"
        label-class-name="my-label"
        content-class-name="my-content"
      >
        <el-tooltip content="Bottom center" placement="bottom" effect="light">
          <!-- 超出隐藏 -->
          <!-- ellips -->
          <div
            style="
              width: 300px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            "
          >
            归属线路项目归属线路
          </div>
        </el-tooltip>
      </el-descriptions-item>
      <el-descriptions-item
        label="车牌号"
        label-class-name="my-label"
        content-class-name="my-content"
      >
        归属线路项目
      </el-descriptions-item>
      <el-descriptions-item
        label="联系人"
        label-class-name="my-label"
        content-class-name="my-content"
      >
        归属线路项目
      </el-descriptions-item>
      <el-descriptions-item
        label="联系电话"
        label-class-name="my-label"
        content-class-name="my-content"
      >
        归属线路项目
      </el-descriptions-item>
    </el-descriptions>
    <wuliu :courierNumber="detail.oddNumbers" style="height: 500px" />
  </div>
</template>

<script>
import dayjs from 'dayjs';
import wuliu from '@/views/components/wuliu'
import * as Api from '@/api/prodmgr-inv/project/scm.js'
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
    formatDate (value, format = 'YYYY-MM-DD') {
      if (!value) return '';
      return dayjs(value).format(format);
    }
  },
  components: {
    wuliu,
  },
  computed: {
    id () {
      return this.$route.query.id
    }
  },
  data () {
    return {
      courierNumber: '',
      detail: {},
      tabList: [],
      activeTab: ''
    }
  },
  created () {
    this.getLogistics()
    this.getBatch()
  },
  methods: {
    async getLogistics (id = 'FH202506080001') {
      const res = await Api.getLogisticsDetail(id)
      this.detail = res.data
    },
    async getBatch () {
      const res = await Api.getBatch(this.id)
      this.tabList = res.data.map((x, idx) => ({
        label: x.batchNumber,
        name: x.batchNumber
      }))

      if (this.tabList.length) {
        this.activeTab = this.tabList[0].name
        this.handleTabClick(this.tabList[0].name)
      }
    },
    handleTabClick (tab) {
      this.getLogistics(tab.name)
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

<style>
.my-label {
  background: #f2f2f2 !important;
  min-height: 38px !important;
  width: 150px !important;
  font-size: 14px !important;
  color: #1b1e22 !important;
}

.my-content {
  background: #fff;
  width: calc(33.33%-150px) !important;
}
</style>