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
    width="60%"
  >
    <el-table :data="tableData" height="400" style="width: 100%;margin-top: 16px;">
      <el-table-column
        type="index"
        label="序号"
        width="120px"
        align="center"
      >
      </el-table-column>
      <el-table-column prop="sectionName" label="标段简称" align="center"> </el-table-column>
      <el-table-column prop="amount" label="投资计划金额(万元)" align="center"> </el-table-column>
    </el-table>

    <div slot="footer" class="dialog-footer">
      <el-button round @click="visible = false">取消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as Api from '@/api/prodmgr-inv/project/annualInvestmentPlan.js'


export default {
  // 标段投资计划明细弹窗 
    name: "sellerDialog",
    data () {
        return {
            loading: false,
            title: '标段投资计划明细',
            visible: false,
            tableData: []
        }
    },
    methods: {
        open (data) {
         this.getList(data)
            // this.tableData = data;
            this.visible = true;
        },
        indexMethod (index) {
            return '合同' + (index + 1);
        },
        //取消
        handleCancel () {
            this.visible = false;
        },
        async getList (ids){
          // 注释接口调用，使用mock数据
          const res = await Api.detail(ids)
          this.tableData = res.map(x => ({sectionName:x.sectionName , amount:x.amount}))
          
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