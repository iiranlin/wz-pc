<template>
  <div class="">
    <el-table :data="tableData" border style="width: 100%">
      <!-- 序号 -->
      <el-table-column
        type="index"
        label="序号"
        align="center"
        width="80px"
        fixed
      >
      </el-table-column>

      <el-table-column
        prop="materialName"
        label="物资名称"
        align="center"
        min-width="250px"
        fixed
      >
      </el-table-column>
      <el-table-column
        prop="specModel"
        label="规格型号"
        align="center"
        width="200px"
        fixed
      >
      </el-table-column>
      <el-table-column
        prop="unit"
        label="计量单位"
        align="center"
        width="120px"
      >
      </el-table-column>
      <el-table-column
        prop="planAmount"
        label="本次计划数量"
        align="center"
        width="120px"
      >
      </el-table-column>
      <el-table-column
        prop="sendTotal"
        label="发货数量"
        align="center"
        width="120px"
      >
      </el-table-column>
      <el-table-column
        prop="packagingFm"
        label="包装形式"
        align="center"
        width="150px"
      >
      </el-table-column>
      <el-table-column
        prop="manufactureDate"
        label="生产日期"
        align="center"
        width="150px"
      >
        <template slot-scope="scope">
          {{ scope.row.manufactureDate | formatDate }}
        </template>
      </el-table-column>
      <el-table-column
        prop="expirationDate"
        label="有效期截止日期"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          {{ scope.row.expirationDate | formatDate }}
        </template>
      </el-table-column>
      <el-table-column
        prop="addr"
        label="使用地点"
        align="center"
        width="150px"
      >
      </el-table-column>
      <el-table-column
        prop="supplyDate"
        label="供应时间"
        align="center"
        width="150px"
      >
        <template slot-scope="scope">
          {{ scope.row.supplyDate | formatDate }}
        </template>
      </el-table-column>
      <el-table-column
        prop="field2"
        label="收货地址"
        align="center"
        width="200px"
      >
      </el-table-column>

      <el-table-column
        prop="receiver"
        label="收货人及联系方式"
        align="center"
        width="200px"
      >
      </el-table-column>
      <el-table-column
        prop="field0"
        label="投资方"
        align="center"
        width="200px"
      >
      </el-table-column>
      <el-table-column
        prop="field1"
        label="投资比例"
        align="center"
        width="200px"
      >
      </el-table-column>
      <el-table-column
        prop="field1"
        label="合格证附件"
        align="center"
        width="200px"
      >
        <template slot-scope="scope">
          <fileUpload
            :value="scope.row.fileByList | filterFiles('hgz')"
            :limit="9999"
            :preview="true"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="field1"
        label="厂检报告附件"
        align="center"
        width="200px"
      >
        <template slot-scope="scope">
          <fileUpload
            :value="scope.row.fileByList | filterFiles('cjbg')"
            :limit="9999"
            :preview="true"
          />
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" align="center" width="200px">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import fileUpload from "@/components/upload";
import dayjs from 'dayjs';
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
    formatDate (value, format = 'YYYY年MM月DD日') {
      if (!value) return '';
      return dayjs(value).format(format);
    },
    filterFiles (files, name) {
      if (!files) return []
      
      const parseFiles = JSON.parse(files);
      return parseFiles[name]
    }
  },
  components: {
    fileUpload
  },
  methods: {


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