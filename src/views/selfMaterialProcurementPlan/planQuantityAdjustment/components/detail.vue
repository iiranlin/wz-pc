<template>
  <Dialog
    :title="title"
    :visible.sync="visible"
    v-if="visible"
    :show-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :append-to-body="true"
    :destroy-on-close="true"
    class="dialog-route"
    width="500px"
  >
    <div class="form-render-wrapper" style="margin-top: 16px">
      <el-row>
        <el-col :span="8" style="line-height: 50px;">
          <span class="itemCss">调整前数量：</span>{{ rowData.planPurchaseQty }}
        </el-col>
         <el-col :span="8" style="line-height: 50px;">
          <span class="itemCss">调整数量：</span>{{ rowData.planPurchaseQtyDiff }}
        </el-col>
         <el-col :span="8" style="line-height: 50px;">
          <span class="itemCss">调整后数量：</span>{{ rowData.planPurchaseQtyNow }}
        </el-col>
      </el-row>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button round @click="visible = false">关闭</el-button>
    </div>
  </Dialog>
</template>

<script>
export default {
  name: "ItemAdd",
  data() {
    return {
      title: "详情页",
      visible: false,
      type: "view",
      loading: false,
      rowData: null, // 保存原始表单数据用于比较
    };
  },
 
  methods: {
    //初始化
    init(row) {
      this.rowData = row;
      this.visible = true;
      this.$nextTick(() => {
        this.title = "审核详情页";
      });
    },


    //取消
    handleCancel() {
      this.visible = false;
    },

    //关闭dialog回调
    handleDialogClose() {
      this.$refs.elform.resetFields();
    },
  },
};
</script>
<style scoped>
.itemCss{
  font-weight: bold; display: inline-block; width: 90px; text-align: right;
}
</style>