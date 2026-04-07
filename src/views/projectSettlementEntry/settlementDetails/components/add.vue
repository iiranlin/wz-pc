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
        <!-- 标段项目 -->
        <template #sectionSlot="{ formModel }">
          <el-form-item
            prop="sectionProjectId"
            :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
            label="标段项目"
            class="label-right-align"
          >
            <el-select
              v-model="formModel.sectionProjectId"
              filterable
              required
              style="width: 100%"
              placeholder="请选择"
              @change="(val) => selectChange(sectionOptions, val, 'sectionName')"
            >
              <el-option
                v-for="item in sectionOptions"
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
        <!-- 结算金额 -->
        <template #amountSlot="{ formModel }">
          <el-form-item
            prop="amount"
            :rules="[{ required: true, message: '请输入', trigger: 'change' }]"
            label="结算金额"
            class="label-right-align"
          >
              <el-input v-model="formModel.amount" placeholder="请输入"  @input="handleAmountInput(formModel, $event, 'amount')" @change="changeAmount"/>
          </el-form-item>
        </template>
        <!-- 付款金额 -->
        <template #investorAmountSlot="{ formModel }">
          <el-form-item
            prop="investorAmount"
            :rules="[{ required: true, message: '请输入', trigger: 'change' }]"
            label="付款金额"
            class="label-right-align"
          >
              <el-input v-model="formModel.investorAmount" placeholder="请输入"  @input="handleAmountInput(formModel, $event, 'investorAmount')" @change="changeAmount"/>
          </el-form-item>
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
    // 编辑初始化
    async updateInit(id) {
      await Api.detail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.title = "编辑";
          await this.formFillInPage();
          await this.getLineOptions();
          
          // 编辑模式下初始化联动数据（标段和合同都根据建设项目ID获取）
          if (data.projectId) {
            await this.getSectionOptions(data.projectId);
            await this.getContractOptions(data.projectId);
          }

          // 根据合同ID自动带出供应商和物资名称
          if (data.contractId) {
            const selectedContract = this.contractOptions.find(item => item.value === data.contractId);
            if (selectedContract) {
              data.seller = selectedContract.seller || '';
              data.itemName = selectedContract.itemName || '';
            }
          }

          this.$refs.vFormRef.setFormData(data);
          this.$refs.vFormRef.setReadMode(this.type === "view");
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
    // 根据建设项目id获取标段项目列表
    async getSectionOptions(projectId) {
      if (!projectId) {
        this.sectionOptions = [];
        return;
      }
      const { data } = await Api.getSectionProjectListByProjectIds({ ids: [projectId] });
      this.sectionOptions = (data || []).map(x => ({
        label: x.sectionName,
        value: x.id,
        ...x // 保留原始数据
      }));
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
    handleAmountInput(row, value, type) {  
      // 只允许输入数字和小数点
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
    // 结算金额改变时，计算质保金金额 = 结算金额 - 付款金额
    changeAmount() {
      if (this.$refs.vFormRef) {
        const formData = this.$refs.vFormRef.getFormData(false);

        const amount = parseFloat(formData.amount || 0);
        const investorAmount = parseFloat(formData.investorAmount || 0);
        
        // 验证付款金额不能大于结算金额
        if (investorAmount > amount) {
          this.$modal.msgError('付款金额不能大于结算金额');
        } else {
          // 计算并更新质保金金额，保留小数点后六位
          const retentionMoney = parseFloat((amount - investorAmount).toFixed(6));
          // 更新质保金金额
          this.$refs.vFormRef.setFormData({
            retentionMoney: retentionMoney
          });
        }
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
          
          // 验证备注长度不能超过1000
          if (formData.remark && formData.remark.length > 1000) {
            this.loading = false;
            this.$modal.msgError('备注长度不能超过1000个字符');
            return;
          }

          await Api[this.type === "update" ? `save` : `save`](
            Object.assign(
              { id: this.type === "update" ? this.id : null },
              formData
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
        // 选择建设项目时，同时获取标段项目和合同列表（标段和合同是同级关系）
        if (key === "projectName") {
          // 清空下级选项和值
          this.sectionOptions = [];
          this.contractOptions = [];
          this.$refs.vFormRef.setFormData({
            sectionProjectId: '',
            sectionName: '',
            contractId: '',
            contractNo: '',
            seller: '',
            itemName: ''
          });
          // 同时获取标段项目列表和合同列表
          if (val) {
            await this.getSectionOptions(val);
            await this.getContractOptions(val);
          }
        }
        
        // 选择合同时，自动带出供应商和物资名称
        if (key === "contractNo") {
          const selectedContract = options.find(item => item.value === val);
          if (selectedContract) {
            this.$refs.vFormRef.setFormData({
              seller: selectedContract.seller || '',
              itemName: selectedContract.itemName || ''
            });
          }
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
</style>
