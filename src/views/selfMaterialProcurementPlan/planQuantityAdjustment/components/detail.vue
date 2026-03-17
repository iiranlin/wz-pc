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
  >
    <div class="form-render-wrapper" style="margin-top: 16px">
      <el-form :model="rowData" :rules="rules" ref="elform" label-width="120px" class="label-right-align">
      <el-row>
        <el-col :span="8" style="line-height: 50px;">
          <span class="itemCss">计划年度：</span>{{ rowData.planYear }}
        </el-col>

        <el-col :span="8" style="line-height: 50px;">
          <span class="itemCss">采购物资名称：</span>{{ rowData.materialName }}
        </el-col>
      </el-row>
      <el-row>
         <el-col :span="8" style="line-height: 50px;">
          <span class="itemCss">计量单位：</span>{{ rowData.unit }}
        </el-col>
        <el-col :span="8" style="line-height: 50px;">
          <span class="itemCss">调整前数量：</span>{{ rowData.planPurchaseQty }}
        </el-col>
      </el-row>

      <el-row>
        
         <el-col :span="8" style="line-height: 50px;">
          <span class="itemCss">调整数量：</span>{{ rowData.planPurchaseQtyDiff }}
        </el-col>
         <el-col :span="8" style="line-height: 50px;">
          <span class="itemCss">调整后数量：</span>{{ rowData.planPurchaseQtyNow }}
        </el-col>
      </el-row>
       <el-row>
        <el-col :span="24" style="line-height: 50px;">
          <span class="itemCss">填制单位：</span>{{ rowData.unitName }}
        </el-col>
        </el-row>
       <el-row>
         <el-col :span="8" style="line-height: 50px;">
          <span class="itemCss">填制人：</span>{{ rowData.createUserName }}
        </el-col>
         <el-col :span="8" style="line-height: 50px;">
          <span class="itemCss">提交时间：</span>{{ rowData.createTime | formatDate }}
        </el-col>
      </el-row>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button round @click="visible = false">关闭</el-button>
    </div>
  </Dialog>
</template>

<script>
import dayjs from "dayjs";
export default {
  name: "PlanQuantityAdjustmentDetail",
  data() {
    return {
      title: "详情页",
      visible: false,
      type: "view",
      loading: false,
      rowData: null, // 保存原始表单数据用于比较
    };
  },
 filters: {
    formatDate(value) {
      if (!value) return ''
      return dayjs(value).format("YYYY年MM月DD日");
    },
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
  font-weight: bold;
}
</style>