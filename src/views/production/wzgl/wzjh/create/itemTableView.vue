<template>
  <div class="material-search-table">
    <!-- 搜索框 -->
    <div class="search-container">
      <div style="font-size: 20px; font-weight: bold">
        计划物资明细（共计
        <i style="color: red">{{ filteredData.length }}</i> 项）
      </div>

      <div style="display: flex; gap: 10px">
        <el-button raw-type="button" @click="addCol" v-if="cols.length < 5">
          添加一列
        </el-button>
        <el-button
          type="danger"
          raw-type="button"
          @click="deleteCol"
          v-if="cols.length > 0"
        >
          删除一列
        </el-button>
      </div>
    </div>

    <!-- 表格 -->
    <el-table ref="tableRef" :data="filteredData" style="width: 100%" border max-height="350">
      <el-table-column
        type="index"
        align="center"
        label="序号"
        width="60"
        fixed
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="sellerName"
        align="center"
        width="200"
        label="供应商"
       show-overflow-tooltip fixed></el-table-column>
      <el-table-column
        prop="materialName"
        align="center"
        width="200"
        label="物资名称"
       show-overflow-tooltip fixed></el-table-column>
      <el-table-column
        prop="specModel"
        align="center"
        width="200"
        label="规格型号"
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="unit"
        label="计量单位"
        align="center"
        width="120"
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="amount"
        label="合同数量"
        align="center"
        width="120"
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="cumulativeAmount"
        label="累计计划量（含本次）"
        align="center"
        width="200"
       show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="planAmount"
        label="本次计划数量"
        align="center"
        width="120"
       show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        align="center"
        prop="supplyDate"
        label="供应时间"
        min-width="200"
       show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.supplyDate | formatDate }}
        </template>
      </el-table-column>
      <el-table-column
        prop="addr"
        label="使用地点"
        align="center"
        min-width="200"
       show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="receiver"
        label="收货人及联系方式"
        align="center"
        min-width="250"
       show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        v-for="(col, index) in cols"
        :key="index"
        align="center"
        width="200"
       show-overflow-tooltip>
        <template v-slot:header>
          <el-input
            v-if="colsIndex === index"
            v-model="col.title"
            size="mini"
            placeholder="输入表头"
          />
          <span v-if="colsIndex !== index">{{ cols[index].title }}</span>
        </template>
        <template slot-scope="scope">
          <el-input
            v-model="scope.row[`field${index}`]"
            size="mini"
            placeholder="输入内容"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="remark"
        label="备注"
        align="center"
        min-width="200"
       show-overflow-tooltip></el-table-column>
    </el-table>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import { mapState } from 'vuex';
export default {
  // 物资选择预览
  props: {
    allData: {
      type: Array,
      default: () => []
    }
  },
  filters: {
    formatDate (date) {
      if (!date) return '';
      return dayjs(date).format('YYYY-MM-DD')

    }
  },
  data () {
    return {

      cols: [],
      colsIndex: 0,
      itemKey: null // 强制让表格刷新一次
    };
  },
  computed: {
    ...mapState(['requestPlan']),
    // 根据搜索词过滤表格数据
    filteredData () {
      return this.allData;

    }
  },

  methods: {
    addCol () {
      // titile必须填写后才能继续新增
      if (this.cols.some(item => !item.title)) {
        this.$message.warning('请先填写表头');
        return
      }

      this.cols.push({ title: "" });
      this.colsIndex = this.cols.length - 1;
      console.log("增加的值", this.cols);
      this.itemKey = Math.random()

    },
    deleteCol () {
      /** 
       * bug 数据更新了 页面没更新数据 table拿到的数据还是以前的老数据，采用了给table加个key的方法解决
       * 让 table 重新加载 然后刷新数据
      */
      this.$confirm('是否确认删除最后一列？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const data = JSON.parse(JSON.stringify(this.cols));
        data.splice(data.length - 1, 1);
        console.log("删除后的值", this.cols, data);
        this.$set(this, 'cols', data)
        this.colsIndex = this.cols.length - 1;
        this.itemKey = Math.random()
      })
    },
    
    onCheck () {
       if (this.cols.some(item => !item.title)) {
        this.$message.warning('请先填写表头');
        return false
      }
      return true
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
