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

      <div class="divCss">
        <el-row>
          <el-col :span="10">
            <span><span class="itemclass">物资名称：</span>{{ rowData.materialName }}</span>
          </el-col>
          <el-col :span="12">
            <span><span class="itemclass">计量单位：</span>{{ rowData.unit }}</span>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <span><span class="itemclass">原计划量：</span>{{ rowData.planPurchaseQty }}</span>
          </el-col>
          <el-col :span="12">
            <span><span class="itemclass">项目需求剩余量：</span>{{ rowData.totalAvailableQty }}</span>
          </el-col>
        </el-row>
      </div>

      <el-form
        ref="elform"
        class="process-form"
        label-position="right"
        size="medium"
        :showMessage="true"
        :rules="rules"
        :model="form"
      >
       <el-row>
          <el-col :span="24">
            <el-form-item :label="'调整形式：'" prop="operateType">
              <el-radio-group v-model="form.operateType" @change="handleOperateTypeChange">
                <el-radio :label="1">增加</el-radio>
                <el-radio :label="2">减少</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="'调整数量：'" prop="displayDiff">
              <el-input v-model="form.displayDiff" name="planPurchaseQtyDiff" style="width: 200px" @input="handleInput"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      
        <el-row>
          <el-col :span="8">
            <el-form-item :label="'调整后计划量：'">
              <span>{{ form.planPurchaseQtyNow }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item :label="'调整后项目需求剩余量：'">
              <span>{{ form.remainingAvailableQty }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="'调整说明:'" prop="remark">
              <el-input v-model="form.remark" type="textarea"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer" v-if="type !== 'view'">
      <el-button round type="primary" @click="handleCreate">保存</el-button>
      <el-button round @click="visible = false">返回</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as PurchasePlanApi from "@/api/prodmgr-inv/project/annualProcurementPlan.js";
export default {
  name: "PlanQAdjustment",
  dicts: ["MeasureUnit", "WZDL"],
  data() {
    return {
      title: "采购计划量调整",
      visible: false,
      type: "add",
      form: {
        zgPurchasePlanId:'', //计划id
        zgPurchasePlanNumber:'',//计划业务编号
        planPurchaseQtyOld:null,//原计划量
        planPurchaseQtyNow:null,//现在计划量
        planPurchaseQtyDiff:null,//差值（实际值，用于计算和提交）
        displayDiff:null,//显示值（不带符号）
        remark:'',
        operateType:null,//调整方式 1增加 2减少
        remainingAvailableQty:null,//调整后项目需求剩余量
      },
      rules: {
        operateType: [
          { required: true, message: "请选择调整形式" }
        ],
        displayDiff : [
          { required: true, message: "请输入调整数量" },
          {
            pattern: /^[1-9]\d*(\.\d{1,3})?$/,
            message: "请输入大于0且最多3位小数的数值"
          }
        ],
      },
      loading: false,
      isEdit: false,
      rowData: null, // 保存原始表单数据用于比较
      name: null, // 保存从init方法传入的name值
    };
  },
  computed: {
    // 优先使用从init方法传入的name值，否则从路由参数中获取
    currentName() {
      return this.name || this.$route.query?.name;
    },
  },
  watch: {
    // 监听调整方式变化
    'form.operateType'(newValue, oldValue) {
      this.handleOperateTypeChange(newValue);
    },
    // 监听调整数量变化
    'form.displayDiff'(newValue, oldValue) {
      this.handleOperateTypeChange(this.form.operateType);
    },
  },
  methods: {
    //初始化
    init(row, name) {
      this.rowData = row;
      this.name = name;
      this.form = {
        zgPurchasePlanId: row.id,
        zgPurchasePlanNumber: row.planNumber,
        planPurchaseQtyOld:row.planPurchaseQty,//原计划量
        planPurchaseQtyNow:null,//现在计划量
        planPurchaseQtyDiff:null,//差值（实际值，用于计算和提交）
        displayDiff:null,//显示值（不带符号）
        remark:''
      };
      this.isEdit = false;
      this.visible = true;
      this.$nextTick(() => {
        this.title = "采购计划量调整";
      });
    },

    //新建
    handleCreate() {
      this.$refs.elform.validate(async (valid) => {
        if(valid) {
          // 根据操作类型设置值
          if (this.form.operateType === 2) {
            // 减少操作，添加减号
            if (!String(this.form.planPurchaseQtyDiff).startsWith('-')) {
              this.form.planPurchaseQtyDiff = '-' + this.form.planPurchaseQtyDiff;
            } else {
              this.form.planPurchaseQtyDiff = this.form.planPurchaseQtyDiff;
            }
          } else {
            // 增加操作，移除减号
            if (String(this.form.planPurchaseQtyDiff).startsWith('-')) {
              this.form.planPurchaseQtyDiff = this.form.planPurchaseQtyDiff.substring(1);
            } else {
              this.form.planPurchaseQtyDiff = this.form.planPurchaseQtyDiff;
            }
          }
          this.loading = true;
          delete this.form.displayDiff;
          delete this.form.operateType;
          await PurchasePlanApi[`PlanQtySave`](Object.assign({}, this.form))
            .then(({ message }) => {
              this.loading = false;
              this.$modal.msgSuccess(message);
              this.visible = false;
              this.$emit("createSuccess");
              
              // 如果是handle模式，保存后刷新当前详情页面
              if (this.currentName === "handle") {
                // 关闭弹窗后，刷新父页面
                this.$nextTick(() => {
                  window.location.reload();
                });
              }
            })
            .catch((err) => {
              this.loading = false;
            });
        }
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
    
    // 处理输入事件，确保只输入有效的数字
    handleInput(event) {
      // 处理 event 为 undefined 的情况
      if (!event || !event.target) {
        return;
      }
      
      let value = event.target.value;
      // 移除非数字和小数点字符，只保留第一个小数点
      value = value.replace(/[^0-9.]/g, '').replace(/\.(?=.*\.)/g, '');
      // 限制小数位数为3位
      const parts = value.split('.');
      if (parts.length === 2 && parts[1].length > 3) {
        value = parts[0] + '.' + parts[1].substring(0, 3);
      }
      
      // 更新显示值（不带符号）
      this.form.displayDiff = value;
      
      // 根据触发事件的元素设置对应的值
      const target = event.target;
      if (target && target.name) {
        switch (target.name) {
          case 'planPurchaseQtyDiff':
            // 根据操作类型处理实际值
            let processedValue = value;
            if (this.form.operateType === 2) {
              // 减少操作，确保实际值为负数
              if (processedValue) {
                processedValue = '-' + processedValue;
              }
            }
            
            this.form.planPurchaseQtyDiff = processedValue;
            
            // 计算调整后计划量
            if (value) {
              const oldValue = Number(this.form.planPurchaseQtyOld) || 0;
              const diffValue = Number(this.form.planPurchaseQtyDiff) || 0;
              this.form.planPurchaseQtyNow = oldValue + diffValue;
              
              // 计算调整后项目需求剩余量 = （原计划量 + 项目需求剩余量） - 调整后计划量
              const planPurchaseQty = Number(this.rowData.planPurchaseQty) || 0;
              const totalAvailableQty = Number(this.rowData.totalAvailableQty) || 0;
              this.form.remainingAvailableQty = (totalAvailableQty + planPurchaseQty) - this.form.planPurchaseQtyNow;
            } else {
              // 当调整数量为空时，清空调整后计划量和调整后项目需求剩余量
              this.form.planPurchaseQtyNow = null;
              this.form.remainingAvailableQty = null;
            }
            break;
        }
      }
    },
    
    // 处理调整方式变化
    handleOperateTypeChange(value) {
      // 当调整方式变化时，重新计算 planPurchaseQtyNow
      if (this.form.displayDiff) {
        // 处理实际值（带符号，用于计算和提交）
        let processedValue = this.form.displayDiff;
        if (value === 2) {
          // 减少操作，确保实际值为负数
          if (processedValue) {
            processedValue = '-' + processedValue;
          }
        }
        
        this.form.planPurchaseQtyDiff = processedValue;
        
        // 更新显示值（不带符号）
        this.form.displayDiff = this.form.displayDiff;
        
        // 重新计算调整后计划量
        const oldValue = Number(this.form.planPurchaseQtyOld) || 0;
        const diffValue = Number(this.form.planPurchaseQtyDiff) || 0;
        this.form.planPurchaseQtyNow = oldValue + diffValue;
        
        // 计算调整后项目需求剩余量 = 项目需求剩余量 - 调整后计划量
        const totalAvailableQty = Number(this.rowData.totalAvailableQty) || 0;
        const planPurchaseQty = Number(this.rowData.planPurchaseQty) || 0;
        this.form.remainingAvailableQty = (totalAvailableQty + planPurchaseQty) - this.form.planPurchaseQtyNow; 
      } else {
        // 当调整数量为空时，清空调整后计划量和调整后项目需求剩余量
        this.form.planPurchaseQtyNow = null;
        this.form.remainingAvailableQty = null;
      }
    },
  },
};
</script>
<style scoped>
.divCss{
  line-height: 32px; margin: 25px 0 20px 100px;
}
.itemclass{
  display: inline-block;
  width: 120px;
  text-align: right;
  font-weight: bold;
}
</style>