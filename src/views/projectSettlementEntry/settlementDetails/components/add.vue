<template>
  <div class="app-container container_flex">
    <button-top
      :buttonTopData="buttonTop"
      :buttonShow="buttonShow"
      @newButton="newButton"
    ></button-top>
    <div :class="{ container_flex_form: type === 'view' }">
      <VFormRender
        :form-json="formJson"
        :form-data="formData"
        :option-data="optionData"
        ref="vFormRef"
        :global-dsv="globalDsv"
        :class="{ formRender_view: type === 'view' }"
      >
        <template #lineSlot="{ formModel }">
          <el-form-item
            prop="projectId"
            :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
            label="建设项目"
            class="label-right-align"
          >
            <el-select
              v-model="formModel.projectId"
              filterable
              required
              style="width: 100%"
              placeholder="请选择"
              @change="(val) => selectChange(lineOptions, val, 'projectName')"
            >
              <el-option
                v-for="item in lineOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </template>
      
        <!-- 合同编号 -->
        <template #contractNumSlot="{ formModel }">
          <el-form-item
            prop="contractId"
            :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
            label="合同编号"
            class="label-right-align"
          >
            <el-select
              v-model="formModel.contractId"
              filterable
              required
              style="width: 100%"
              placeholder="请选择"
              @change="(val) => selectChange(contractOptions, val, 'contractNo')"
            >
              <el-option
                v-for="item in contractOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </template>
        <!-- 供应商 -->
        <template #buySlot="{ formModel }">
          <el-form-item
            prop="seller"
            :rules="[{ required: false, message: '请选择', trigger: 'change' }]"
            label="供应商"
            class="label-right-align"
          >
          <!-- 选择合同编号后自动带出来 -->
           <span>{{ formModel.seller }}</span>
           
          </el-form-item>
        </template>
        <!-- 物资名称 -->
            <template #itemNameSlot="{ formModel }">
          <el-form-item
            prop="itemName"
            :rules="[{ required: false, message: '请选择', trigger: 'change' }]"
            label="物资名称"
            class="label-right-align"
          >
          <!-- 选择合同编号后自动带出来 -->
           <span>{{ formModel.itemName }}</span>
           
          </el-form-item>
        </template>

        <!-- 标段项目 -->
        <template #sectionSlot="{ formModel }">
           <div class="section-container">
            <template v-for="(item, index) in sectionOptions">
              <div class="section-row">
                <div class="section-item">
                  <span class="section-label">项目标段：</span>
                  <span class="section-value">{{ item.label }}</span>
                </div>
                <div class="section-item">
                  <span class="section-label">结算金额(元)：</span>
                  <el-input v-model="formModel[`sectionAmount_${item.value}`]" placeholder="请输入" @input="handleAmountInput(formModel, $event, `sectionAmount_${item.value}`)" @change="changeAmount" class="section-input" />
                </div>

                <div class="section-item">
                  <span class="section-label">付款金额(元)：</span>
                  <el-input v-model="formModel[`sectionInvestorAmount_${item.value}`]" placeholder="请输入" @input="handleAmountInput(formModel, $event, `sectionInvestorAmount_${item.value}`)" @change="changeAmount" class="section-input"/>
                </div>
              </div>
            </template>
          </div>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import * as Api from "@/api/prodmgr-inv/project/settlementDetails.js";
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import attachmentTable from "@/views/components/attachmentTable";
import * as WzglApi from '@/api/prodmgr-inv/project/wzgl.js'
export default {
  name: "addSettlementDetails",
  components: {
    VFormRender,
    attachmentTable,
  },
  data() {
    return {
      loading: false,
      title: "新增",
      checked: false,
      //   fileList type
      // type: 'create', //update , view ,create
      fileList: [],
      formJson: {},
      formData: {
        amount: '', // 结算金额
        investorAmount: '', // 付款金额
        retentionMoney: '', // 质保金金额
      },
      optionData: {},
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: "24",
      },
      lineOptions: [],
      sectionOptions: [],
      contractOptions: [],
      constructionCompanyOptions: [],
      supervisionUnitOptions: [],
      cachedSectionValues: [], // 缓存标段投资计划数据（用于编辑回显）
      // 菜单按钮、字段等数据
      buttonTop: [
        {
          buttonName: "取消",
          buttonCode: "cancel",
          buttonIcon: "Blue-Cancel",
          type: "create, update",
        },
        {
          buttonName: "保存",
          buttonCode: "save",
          buttonIcon: "Blue-Save",
          type: "create, update",
        },
      ],
      constructionOptions: [],
    };
  },
  computed: {
    type() {
      return this.$route.query.type;
    },
    id() {
      return this.$route.query?.id || "";
    },
  },
  async created() {
  },
  mounted() {
    if (["view", "update"].includes(this.type)) {
      this.updateInit(this.id);
      return;
    }

    if (this.type === "create") {
      this.init();
      return;
    }
  },
  methods: {
    //初始化
    init() {
      this.$nextTick(async () => {
        this.title = "新建";
        await this.formFillInPage();
        this.getLineOptions();
      });
    },
    // 缓存标段投资计划数据（用于后续回显）
    cacheSectionValues(settlementMonths) {
      this.cachedSectionValues = settlementMonths || [];
    },
    // 编辑初始化
    async updateInit(id) {
      await Api.detail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.title = "编辑";
          await this.formFillInPage();
          await this.getLineOptions();
          
           // 1. 先缓存标段投资计划数据（用于后续回显）
           this.cacheSectionValues(data.settlementMonths);
          // 编辑模式下初始化联动数据（合同根据建设项目ID获取）
          if (data.projectId) {
            await this.getContractOptions(data.projectId);
          }

          // 根据合同ID自动带出供应商和物资名称,并根据合同ID获取标段项目列表
          if (data.contractId) {
            const selectedContract = this.contractOptions.find(item => item.value === data.contractId);
            if (selectedContract) {
              data.seller = selectedContract.seller || '';
              data.itemName = selectedContract.itemName || '';
            }

            await this.getSectionOptions(data.contractId);
          }
          
          // 等待sectionOptions加载完成
          // await new Promise(resolve => setTimeout(resolve, 200));
          
          // 将settlementMonths中的数据赋值给对应的sectionAmount_和sectionInvestorAmount_字段
          if (this.cachedSectionValues && this.cachedSectionValues.length > 0) {
            this.cachedSectionValues.forEach(item => {
              if (item.sectionProjectId) {
                const sectionAmountKey = `sectionAmount_${item.sectionProjectId}`;
                const sectionInvestorAmountKey = `sectionInvestorAmount_${item.sectionProjectId}`;
                
                // 将amount和investorAmount赋值给对应的字段
                data[sectionAmountKey] = item.amount || 0;
                data[sectionInvestorAmountKey] = item.investorAmount || 0;
              }
            });
          }

          this.$refs.vFormRef.setFormData(data);
          this.$refs.vFormRef.setReadMode(this.type === "view");
          
          // 调用changeAmount方法，计算总金额和质保金金额
          await this.$nextTick();
          this.changeAmount();
        });
      });
    },
    async getLineOptions() {
      const { data } = await WzglApi.lineSelectOptions({pageStatus: '1'});
      this.lineOptions = data.map(x => ({
        label: x.projectName,
        value: x.projectId
      }));
    },
    // 根据合同id获取标段项目列表
    async getSectionOptions(contractId) {
      if (!contractId) {
        this.sectionOptions = [];
        return;
      }
      const { data } = await Api.getSectionProjectListByContractId({ ids: [contractId] });
      this.sectionOptions = (data || []).map(x => ({
        label: x.SECTION_NAME,
        value: x.SECTION_ID,
        ...x // 保留原始数据
      }));

      // 初始化动态表单字段
      this.initSectionFormFields();
    },
    // 根据建设项目id获取合同列表（合同与标段是同级关系，都根据建设项目ID获取）
    async getContractOptions(projectId) {
      if (!projectId) {
        this.contractOptions = [];
        return;
      }
      const { data } = await Api.getContractListByProjectIds({ ids: [projectId] });
      this.contractOptions = (data || []).map(x => ({
        label: x.contractNo,
        value: x.id,
        seller: x.seller,
        itemName: x.itemName,
        ...x // 保留原始数据
      }));
    },
     /**
     * 初始化标段表单字段
     * 注意：VFormRender.setFormData 只能更新已存在的字段，
     * 需要直接操作 formDataModel 并使用 $set 添加动态属性
     */
    initSectionFormFields() {
      this.$nextTick(() => {
        const vFormRef = this.$refs.vFormRef;
        if (!vFormRef) return;
        
        const formDataModel = vFormRef.formDataModel;
        this.sectionOptions.forEach(item => {
          const fieldName = `sectionAmount_${item.value}`;
          const fieldNameInvestorAmount = `sectionInvestorAmount_${item.value}`;

          const cachedValue = this.cachedSectionValues[item.value];
          this.$set(formDataModel, fieldName, cachedValue?.amount || 0);
          this.$set(formDataModel, fieldNameInvestorAmount, cachedValue?.investorAmount || 0);
        });
      });
    },
    handleAmountInput(row, value, type) {  
      // 只允许输入数字和小数点，不允许输入负数
      let formattedValue = value.replace(/[^\d.]/g, '');
      
      // 确保只有一个小数点
      const parts = formattedValue.split('.');
      if (parts.length > 2) {
        formattedValue = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // 限制小数点后六位
      if (parts.length === 2 && parts[1].length > 6) {
        formattedValue = parts[0] + '.' + parts[1].substring(0, 6);
      }
      
      // 更新值
      if (type) {
        row[type] = formattedValue;
      }
    },
    
    changeAmount() {
      if (this.$refs.vFormRef) {
        const formData = this.$refs.vFormRef.getFormData(false);
        
        // 计算sectionOptions中所有条目的结算金额和付款金额的总和
        let totalAmount = 0;
        let totalInvestorAmount = 0;
        let sectionArray = [];
        
        this.sectionOptions.forEach((item, index) => {
          const sectionValue = parseFloat(formData[`sectionAmount_${item.value}`] || 0);
          const sectionInvestorAmount = parseFloat(formData[`sectionInvestorAmount_${item.value}`] || 0);
          
          // 检查付款金额是否大于结算金额
          if (sectionInvestorAmount > sectionValue) {
            this.$modal.msgError(`第${index + 1}行的付款金额不能大于结算金额`);
            // 清空付款金额
            formData[`sectionInvestorAmount_${item.value}`] = '';
            // 更新formModel
            this.$refs.vFormRef.setFormData({
              [`sectionInvestorAmount_${item.value}`]: ''
            });
            return;
          }
          
          totalAmount += sectionValue;
          totalInvestorAmount += sectionInvestorAmount;
          
          // 查找对应的cachedSectionValues中的数据，获取id
          let id = '';
          if (this.cachedSectionValues && this.cachedSectionValues.length > 0) {
            const matchingItem = this.cachedSectionValues.find(settlementItem => {
              return settlementItem.sectionProjectId === item.value || 
                     settlementItem.id === item.value ||
                     settlementItem.sectionProjectId === item.SECTION_ID ||
                     settlementItem.id === item.SECTION_ID;
            });
            if (matchingItem) {
              id = matchingItem.id || '';
            }
          }
          
          // 拼接新的数组
          sectionArray.push({
            id: id,
            sectionProjectId: item.value,
            amount: sectionValue,
            investorAmount: sectionInvestorAmount
          });
        });
        
        // 限制totalAmount和totalInvestorAmount最多保留小数点后6位
        totalAmount = parseFloat(totalAmount.toFixed(6));
        totalInvestorAmount = parseFloat(totalInvestorAmount.toFixed(6));
        
        // 计算并更新质保金金额，保留小数点后六位
        const retentionMoney = parseFloat((totalAmount - totalInvestorAmount).toFixed(6));
        
        // 更新formModel
        this.$refs.vFormRef.setFormData({
          amount: totalAmount,
          investorAmount: totalInvestorAmount,
          settlementMonths: sectionArray,
          retentionMoney: retentionMoney
        });
    
      }
    },
    newButton(buttonCode) {
      if (buttonCode === "cancel") {
        this.cancel();
        return;
      }
      if (buttonCode === "save") {
        this.handleCreate();
        return;
      }
    },
    cancel() {
      this.$router.go(-1);
    },

    buttonShow(item) {
      if (item.buttonCode === "save") {
        return this.type !== "view";
      }
      return true;
    },
    //新建
    handleCreate() {
      this.$refs.vFormRef.validateForm(async (valid) => {
        console.log(valid, "valid");
        if (valid) {
          this.loading = true;
          const formData = await this.$refs.vFormRef.getFormData();
          console.log(formData, "formData");
          // 验证备注长度不能超过1000
          if (formData.remark && formData.remark.length > 1000) {
            this.loading = false;
            this.$modal.msgError('备注长度不能超过1000个字符');
            return;
          }
          
          // 验证settlementMonths数组中至少有一条数据填写了结算金额和付款金额的值
          if (formData.settlementMonths && formData.settlementMonths.length > 0) {
            // 检查是否至少有一条数据填写了结算金额和付款金额
            const hasValidData = formData.settlementMonths.some(item => {
              const amount = item.amount;
              const investorAmount = item.investorAmount;
              return (amount && amount !== '' && amount !== 0) && 
                     (investorAmount && investorAmount !== '' && investorAmount !== 0);
            });
            
            if (!hasValidData) {
              this.loading = false;
              this.$modal.msgError('至少有一条标段的结算金额和付款金额不能为空');
              return;
            }
          } 
          // else {
          //   // 如果settlementMonths为空，也需要提示
          //   this.loading = false;
          //   this.$modal.msgError('至少有一条标段的结算金额和付款金额不能为空');
          //   return;
          // }
          /**
           * 去除formData里的
             seller
             itemName
             amount
             investorAmount
             retentionMoney  只做展示 不传给后端
           */
          delete formData.seller;
          delete formData.itemName;
          delete formData.amount;
          delete formData.investorAmount;
          delete formData.retentionMoney;

          // 过滤掉多余的sectionInvestorAmount_ 和 sectionAmount_标志的字段
          const filteredFormData = {};
          Object.keys(formData).forEach(key => {
            if (!key.startsWith('sectionInvestorAmount_') && !key.startsWith('sectionAmount_')) {
              filteredFormData[key] = formData[key];
            }
          });
          
          await Api[this.type === "update" ? `save` : `save`](
            Object.assign(
              { id: this.type === "update" ? this.id : null },
              filteredFormData
            )
          )
            .then(({ message }) => {
              this.loading = false;
              this.$modal.msgSuccess(message);
              this.cancel();
            })
            .catch(async () => {
              const formData = await this.$refs.vFormRef.getFormData();
            })
            .finally((err) => {
              this.loading = false;
            });
        }
      });
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("settlementDetails").then((res) => {
          this.$refs["vFormRef"].setFormJson(res.data);
          //   form action
          this.$refs["vFormRef"].setReadMode(false);

          resolve(true);
        });
      });
    },
    async selectChange(options, val, key) {
      if (Array.isArray(val)) {
        // 多选情况：将选中的值转换为逗号分隔的字符串
        const labels = val
          .map((v) => options.find((item) => item.value === v)?.label)
          .filter(Boolean);
        this.$refs.vFormRef.setFormData({
          [key]: labels.join(","),
        });
      } else {
        // 单选情况
        this.$refs.vFormRef.setFormData({
          [key]: options.find((item) => item.value === val)?.label,
        });
        
        // ========== 联动逻辑 ==========
        // 选择建设项目时，获取合同列表
        if (key === "projectName") {
          // 清空下级选项和值
          this.sectionOptions = [];
          this.contractOptions = [];
          this.$refs.vFormRef.setFormData({
            contractId: '',
            contractNo: '',
            seller: '',
            itemName: '',
            settlementMonths: [],
            amount: '', // 清空结算金额
            investorAmount: '', // 清空付款金额
            retentionMoney: '', // 清空质保金金额
            remark: '' // 清空备注信息

          });
          // 同时获取合同列表
          if (val) {
            await this.getContractOptions(val);
          }
        }
        
        // 选择合同时，自动带出供应商和物资名称 ,并根据合同ID获取标段项目列表
        if (key === "contractNo") {
          const selectedContract = options.find(item => item.value === val);
          if (selectedContract) {
            this.$refs.vFormRef.setFormData({
              seller: selectedContract.seller || '',
              itemName: selectedContract.itemName || ''
            });
          }
           await this.getSectionOptions(val);
           this.$nextTick(() => {
              this.changeAmount();
            });
        }
      }
    },
  },
};
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

::v-deep .label-right-align .el-form-item__label {
  text-align: right;
}

.section-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
}

.section-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  // margin-bottom: 15px;
  width: 100%;
  // border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
  // background-color: #f9f9f9;
}

.section-item {
  display: flex;
  align-items: center;
  flex: 1;
  margin-left: 20px;
}

.section-item:last-child {
  margin-right: 0;
}

.section-label {
  // font-weight: 500;
  margin-right: 10px;
  min-width: 80px;
  text-align: right;
}

.section-value {
  flex: 1;
  // font-size: 14px;
}

.section-input {
  flex: 1;
  min-width: 120px;
}

@media screen and (max-width: 768px) {
  .section-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .section-item {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .section-item:last-child {
    margin-bottom: 0;
  }
  
  .section-label {
    min-width: 100px;
  }
}</style>
