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
     
        <!-- 标段列表，根据选择的建设项目下的标段数量动态生成标段数量 -->
         <!-- sectionOptions 如果有5项，那么就生成5个input，然后用他的id和用户手动输入的值构建数据 -->
         <!-- 后端返回及保存的数据结构：[{'标段ID':inputvalue1},{'标段ID2':inputvalue2}]  -->
        <template #sectionListSlot="{ formModel }">
          <!-- 动态列容器：70%宽度居中 -->
          <div class="section-list-wrapper">
            <template v-for="item in sectionOptions" >
              <el-form-item
                :label="`${item.label}投资计划(万元)`"
                class="label-top-layout"
                :prop="`sectionValue_${item.value}`"
                :rules="[{ required: true, message: '请输入投资计划金额', trigger: ['blur', 'change'] }]"
              >
               <el-input 
                  v-model="formModel[`sectionValue_${item.value}`]" 
                  placeholder="请输入投资计划金额"
                  type="number"
                  @input="updateSectionValue(item.value, $event)"
                  @blur="calculateTotal"
                ></el-input>
              </el-form-item>
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
import * as SectionApi from '@/api/prodmgr-inv/project/section.js'
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
      formData: {},
      optionData: {},
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: "24",
      },
      lineOptions: [],
      sectionOptions: [],
      sectionInvestmentValues: {}, // 用于存储各标段的投资计划值
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
      // TODO: 待后端接口联调后打开
      // await Api.detail(id).then(({ data }) => {
      //   this.$nextTick(async () => {
      //     this.title = "编辑";
      //     await this.formFillInPage();
      //     await this.getLineOptions();
      //     
      //     // 编辑模式下初始化联动数据（标段和合同都根据建设项目ID获取）
      //     if (data.projectId) {
      //       await this.getSectionOptions(data.projectId);
      //     }
      //     
      //     // 回显标段投资计划数据
      //     if (data.sectionInvestmentPlan) {
      //       this.convertFromApiFormat(data.sectionInvestmentPlan);
      //     }
      //
      //     // 处理监理单位数据：将逗号分隔的字符串转换为数组
      //     if (
      //       data.supervisionUnitId &&
      //       typeof data.supervisionUnitId === "string"
      //     ) {
      //       data.supervisionUnitId = data.supervisionUnitId.split(",");
      //     }
      //     if (data.projectType && typeof data.projectType === "string") {
      //       data.projectType = data.projectType.split(",");
      //     }
      //
      //     this.$refs.vFormRef.setFormData(data);
      //     this.$refs.vFormRef.setReadMode(this.type === "view");
      //   });
      // });

      // ========== Mock 数据开始 ==========
      const mockData = {
        id: id,
        projectId: '1977659879783116801',
        projectName: '新建上海至南京至合肥高速铁路',
        year: '2026',
        total: 15000,
        remark: '这是一条Mock备注数据',
        // 标段投资计划 Mock 数据
        sectionInvestmentPlan: [
          { '1991698858145411074': '5000' },
          { '1991698858145411075': '6000' },
          { '1991698858145411076': '4000' }
        ]
      };

      this.$nextTick(async () => {
        this.title = "编辑";
        await this.formFillInPage();
        await this.getLineOptions();
        
        // 编辑模式下初始化联动数据
        if (mockData.projectId) {
          await this.getSectionOptions(mockData.projectId);
        }
        
        // 回显标段投资计划数据
        if (mockData.sectionInvestmentPlan) {
          this.convertFromApiFormat(mockData.sectionInvestmentPlan);
        }

        this.$refs.vFormRef.setFormData(mockData);
        this.$refs.vFormRef.setReadMode(this.type === "view");
      });
      // ========== Mock 数据结束 ==========
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
        // 清空之前的动态字段
        this.clearSectionFormFields();
        return;
      }
      const { data } = await SectionApi.itemList({ pageSize: -1, projectId });
      // 分页接口返回的数据在 data.records 中
      const records = data?.list || data || [];
      this.sectionOptions = records.map(x => ({
        label: x.projectShortName,  // 使用项目简称作为动态列标签
        value: x.id,
        ...x // 保留原始数据
      }));
      // 初始化动态表单字段到 formModel，以支持表单验证
      this.initSectionFormFields();
    },
    /**
     * 初始化标段投资计划的表单字段
     */
    initSectionFormFields() {
      this.$nextTick(() => {
        const formData = {};
        this.sectionOptions.forEach(item => {
          const fieldName = `sectionValue_${item.value}`;
          // 如果 sectionInvestmentValues 中已有值，则使用已有值
          formData[fieldName] = this.sectionInvestmentValues[item.value] || '';
        });
        this.$refs.vFormRef.setFormData(formData);
      });
    },
    /**
     * 清空动态生成的标段表单字段
     */
    clearSectionFormFields() {
      this.$nextTick(() => {
        const formData = {};
        this.sectionOptions.forEach(item => {
          formData[`sectionValue_${item.value}`] = undefined;
        });
        this.$refs.vFormRef?.setFormData(formData);
      });
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
    //新建/保存
    handleCreate() {
      this.$refs.vFormRef.validateForm(async (valid) => {
        console.log(valid, "valid");
        if (valid) {
          this.loading = true;
          const formData = await this.$refs.vFormRef.getFormData();
          
          // 将标段投资计划数据转换为后端需要的格式
          formData.sectionInvestmentPlan = this.convertToApiFormat(formData);

          // TODO: 待后端接口联调后打开
          // await Api[this.type === "update" ? `save` : `save`](
          //   Object.assign(
          //     { id: this.type === "update" ? this.id : null },
          //     formData
          //   )
          // )
          //   .then(({ message }) => {
          //     this.loading = false;
          //     this.$modal.msgSuccess(message);
          //     this.cancel();
          //   })
          //   .catch(async () => {
          //     const formData = await this.$refs.vFormRef.getFormData();
          //   })
          //   .finally((err) => {
          //     this.loading = false;
          //   });

          // ========== Mock 保存开始 ==========
          console.log('提交的表单数据:', formData);
          console.log('标段投资计划数据:', formData.sectionInvestmentPlan);
          
          // 模拟接口延迟
          setTimeout(() => {
            this.loading = false;
            this.$modal.msgSuccess(this.type === 'update' ? '修改成功' : '保存成功');
            this.cancel();
          }, 500);
          // ========== Mock 保存结束 ==========
        }
      });
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("annualInvestmentPlan").then((res) => {
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
          this.sectionInvestmentValues = {}; // 清空标段投资计划值
          this.$refs.vFormRef.setFormData({
            sectionProjectId: '',
            sectionName: '',
            contractID: '',
            contractNo: '',
            seller: '',
            itemName: ''
          });
          // 同时获取标段项目列表和合同列表
          if (val) {
            await this.getSectionOptions(val);
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
    /**
     * 更新标段投资计划值
     * @param {string} sectionId - 标段ID
     * @param {string} value - 输入值
     */
    updateSectionValue(sectionId, value) {
      // 同步到 sectionInvestmentValues（用于兼容和数据转换）
      this.$set(this.sectionInvestmentValues, sectionId, value);
    },
    /**
     * 计算所有标段投资计划金额的累加值，并更新表单的 total 字段
     */
    async calculateTotal() {
      let total = 0;
      // 从 formModel 获取最新值
      const formData = await this.$refs.vFormRef.getFormData(false);
      this.sectionOptions.forEach(item => {
        const fieldName = `sectionValue_${item.value}`;
        const num = parseFloat(formData[fieldName]);
        if (!isNaN(num)) {
          total += num;
          // 同步到 sectionInvestmentValues
          this.$set(this.sectionInvestmentValues, item.value, formData[fieldName]);
        }
      });
      // 保留两位小数，避免浮点数精度问题
      // total = Math.round(total * 100) / 100;
      this.$refs.vFormRef.setFormData({ total });
    },
    /**
     * 将表单中的标段投资计划值转换为后端需要的数组格式
     * 后端格式：[{'标段ID1': value1}, {'标段ID2': value2}]
     * @param {Object} formData - 表单数据
     * @returns {Array} 转换后的数组
     */
    convertToApiFormat(formData) {
      const result = [];
      this.sectionOptions.forEach(item => {
        const fieldName = `sectionValue_${item.value}`;
        const value = formData[fieldName];
        if (value !== undefined && value !== null && value !== '') {
          result.push({ [item.value]: value });
        }
      });
      return result;
    },
    /**
     * 将后端返回的数组格式转换为表单可用的对象格式
     * 后端格式：[{'标段ID1': value1}, {'标段ID2': value2}]
     * @param {Array} apiData - 后端返回的数据
     */
    convertFromApiFormat(apiData) {
      this.sectionInvestmentValues = {};
      const formData = {};
      if (Array.isArray(apiData)) {
        apiData.forEach(item => {
          const [sectionId, value] = Object.entries(item)[0] || [];
          if (sectionId) {
            this.$set(this.sectionInvestmentValues, sectionId, value);
            // 同时设置到 formModel
            formData[`sectionValue_${sectionId}`] = value;
          }
        });
      }
      // 设置表单数据
      this.$nextTick(() => {
        this.$refs.vFormRef?.setFormData(formData);
      });
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

/* 动态列垂直布局：label在上，输入框在下 */
::v-deep .label-top-layout {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 18px;
  
  .el-form-item__label {
    text-align: left;
    line-height: 1.5;
    padding-bottom: 8px;
    width: auto !important;
    float: none;
  }
  
  .el-form-item__content {
    margin-left: 0 !important;
    width: 100%;
  }
}

/* 动态列容器：70%宽度居中 */
.section-list-wrapper {
  width: 70%;
  margin: 0 auto;
}</style>
