<template>
  <div class="material-search-table">
    <!-- 搜索框 -->
    <div class="search-container">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane
          v-for="tab in tabList"
          :key="tab.name"
          :label="tab.label"
          :name="tab.name"
        ></el-tab-pane>
      </el-tabs>
    </div>

    <!-- 表格 -->
    <el-table ref="tableRef" :data="tableData" style="width: 100%" border>
      <el-table-column
        type="index"
        align="center"
        label="序号"
        width="60"
      ></el-table-column>
      <el-table-column
        prop="materialName"
        label="物资名称"
        align="center"
        width="120"
      ></el-table-column>

      <el-table-column
        prop="specModel"
        label="规格型号"
        align="center"
        width="150"
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
      </el-table-column>
      <el-table-column
        prop="planAmount"
        label="本次计划数量"
        align="center"
        width="120"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="supplyDate"
        label="供应时间"
        min-width="200"
      >
        <template slot-scope="scope">
          {{ scope.row.supplyDate | formatDate }}
        </template>
      </el-table-column>
      <el-table-column
        prop="addr"
        label="使用地点"
        align="center"
        min-width="200"
      >
      </el-table-column>
      <el-table-column
        prop="receiver"
        label="收货人及联系方式"
        align="center"
        min-width="250"
      >
      </el-table-column>
      <el-table-column
        v-for="(col, index) in cols"
        :key="index"
        align="center"
        width="200"
      >
        <template v-slot:header>
          <span>{{ cols[index].title }}</span>
        </template>
        <template slot-scope="scope">
          {{ scope.row[`filed${index}`] }}
        </template>
      </el-table-column>
      <el-table-column
        prop="remark"
        label="备注"
        align="center"
        min-width="200"
      ></el-table-column>
    </el-table>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import * as Api from '@/api/prodmgr-inv/project/planRest.js'
import * as Material from '@/api/prodmgr-inv/project/scm.js'

export default {
  props: {
    details: {
      type: Object,
      default:  {}
    }
  },
  filters: {
    // 日期格式化过滤器
    formatDate (value, format = 'YYYY-MM-DD') {
      console.log(value, 'date')
      if (!value) return '';
      return dayjs(value).format(format);
    }
  },
  computed: {
    id () {
      return this.$route?.query?.id || ''
    },
    cols () {
      return JSON.parse(this.details?.columnConfig || '[]')
    }
  },
  data () {
    return {
      tabList: [
      ],
      activeTab: '',
      tableData: [],
    }
  },
  mounted () {
    this.getSupplier()
  },
  methods: {
    handleTabClick (tab) {
      // 切换供应商，重新获取表格数据
      console.log(tab.name, 'tab')
    },
    // 获取所有供应商
    async getSupplier () {
      const res = await Api.getSeller({ id: this.id });

      this.tabList = res.data.map(x => ({
        name: x.SELLERID,
        label: x.SELLERNAME,
      }))

      // 默认选中第一个供应商
      if(this.tabList.length) {
        this.getMaterialList(this.tabList[0].name)
        this.activeTab = this.tabList[0].name
      }
    },
    // 获取所有供应商下物资
    async getMaterialList (sellerId) {
      const res = await Material.getMaterial({
        sellerId,
      })
      this.tableData = res.data
     
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