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
      <el-table-column prop="name" label="名称" align="center"> </el-table-column>
    </el-table>

    <div slot="footer" class="dialog-footer">
      <el-button round @click="visible = false">取消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as Api from '@/api/prodmgr-inv/project/contract.js'
export default {
  // 合同数量弹窗 
    name: "sellerDialog",
    data () {
        return {
            loading: false,
            title: '详情',
            visible: false,
            tableData: []
        }
    },
    methods: {
        open (data) {
         this.getContractNameList(data)
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
        async getContractNameList (ids){
          const res = await Api.getContractNameList(ids)
          this.tableData = res.data.map(x => ({name:x}))
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