<template>
  <Dialog
    :title="title"
    :visible.sync="visible"
    v-if="visible"
    :show-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    append-to-body
    :destroy-on-close="true"
    class="dialog-route"
    width="70%"
  >
    <el-table :data="tableData" height="400" style="width: 100%;margin-top: 16px;">
      <el-table-column
        type="index"
        label="序号"
        width="120px"
        align="center"
      >
      </el-table-column>
      <el-table-column prop="contractName" label="合同名称" align="center"> </el-table-column>
      <el-table-column prop="startTime" label="合同签订日期" align="center">
        <template slot-scope="scope">
          {{ scope.row.startTime | formatDate}}
        </template>
      </el-table-column>
      <el-table-column prop="materialName" label="物资名称" align="center"> </el-table-column>
      <el-table-column prop="amount" label="采购数量" align="center"> </el-table-column>
      <el-table-column prop="unit" label="计量单位" align="center"> </el-table-column>
      <el-table-column prop="price" label="单价（元）" align="center"> </el-table-column>
      <el-table-column prop="totalAmount" label="合价（元）" align="center"> </el-table-column>
    </el-table>

    <div slot="footer" class="dialog-footer">
      <el-button round @click="visible = false">取消</el-button>
    </div>
  </Dialog>
</template>

<script>
  import * as PurchasePlanApi from "@/api/prodmgr-inv/project/annualProcurementPlan.js";
  import dayjs from 'dayjs'
  export default {
    name: "detailDialog",
    data () {
      return {
        loading: false,
        title: '明细',
        visible: false,
        tableData: []
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
    methods: {
      open (id) {
        this.getDetail(id)
        this.visible = true;
      },
      //取消
      handleCancel () {
        this.visible = false;
      },
      async getDetail(id){
        const res = await PurchasePlanApi.detail(id)
        this.tableData = res.data.itemList || []
      }
    }
  }
</script>

<style lang="scss" scoped>
  .slotIcon-color-content {
    color: red;
  }

  .slotIcon-color {
    color: #1890ff;
  }

  .ml-20 {
    margin-left: 20px !important;
  }

  .mt-20 {
    margin-top: 20px !important;
  }
</style>
