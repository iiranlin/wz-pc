<template>
  <div class="material-search-table">
    <!-- 搜索框 -->
    <div class="search-container">
      <div style="font-size: 20px; font-weight: bold">
        <!-- 选择需要修改的物资科目（系统会对应到提报人，请线下联系提报人进行修改操作） -->
      </div>
    </div>
    <!-- 表格 -->
    <el-table
      ref="tableRef"
      :data="tableData"
      style="width: 100%"
      border
      :loading="loading"
     max-height="350">
      <!-- 序号 -->
      <el-table-column
        align="center"
        label="序号"
        width="60"
        fixed
       show-overflow-tooltip>
        <template slot-scope="scope">
          {{ (listQuery.pageNum - 1) * listQuery.pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        prop="speciesName"
        label="物资大类"
        align="center"
        width="180"
        fixed
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="categoriesName"
        label="物资种类"
        align="center"
        width="150"
        fixed
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="providedDetailName"
        label="细目"
        align="center"
        min-width="200"
        fixed
       show-overflow-tooltip></el-table-column>
      <el-table-column
        prop="materialName"
        label="物资名称"
        align="center"
        min-width="200"
       show-overflow-tooltip fixed></el-table-column>
      <el-table-column
        prop="specModel"
        label="规格型号"
        align="center"
        width="200"
       show-overflow-tooltip></el-table-column>
      <el-table-column prop="unit" label="计量单位" align="center" width="180" show-overflow-tooltip>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import dayjs from "dayjs";
import * as ItemApi from "@/api/prodmgr-inv/project/item.js";
import indexMixin from "@/views/mixins";
export default {
  mixins: [indexMixin],
  // 需求详情表格数据
  data() {
    return {
      total: 0,

      loading: false,
      tableData: [], // 本地数据
    };
  },
  filters: {
    // 日期格式化过滤器
    formatDate(value, format = "YYYY-MM-DD") {
      if (!value) return "";
      return dayjs(value).format(format);
    },
  },
  computed: {
    id() {
      return this.$route.query?.id || "";
    },
  },
  mounted() {
    this.getList();
  },
  methods: {
    // 获取物资列表数据
    async getList() {
      const params = {
        ...this.listQuery,
        status: "2",
        approvalPendingId: this.id,
      };

      try {
        this.loading = true;
        const res = await ItemApi.itemList(params);
        this.tableData = res.data.list || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error("获取物资列表失败", error);
        this.$message.error("获取物资列表失败");
      } finally {
        this.loading = false;
      }
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
