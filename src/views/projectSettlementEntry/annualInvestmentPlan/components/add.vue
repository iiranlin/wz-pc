<template>
  <div class="app-container container_flex">
    <button-top
      :buttonTopData="buttonTop"
      :buttonShow="buttonShow"
      @newButton="handleButtonClick"
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
        <!-- 建设项目选择插槽 -->
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
              style="width: 100%"
              placeholder="请选择"
              @change="handleProjectChange"
            >
              <el-option
                v-for="item in lineOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </template>
     
        <!-- 标段投资计划动态列插槽 -->
        <template #sectionListSlot="{ formModel }">
          <div class="section-list-wrapper">
            <template v-for="item in sectionOptions">
              <el-form-item
                :key="item.value"
                :label="`${item.label}投资计划(万元)`"
                :prop="`sectionValue_${item.value}`"
                :rules="[{ required: true, message: '请输入投资计划金额', trigger: ['blur', 'change'] }]"
                class="label-top-layout"
              >
                <el-input 
                  v-model="formModel[`sectionValue_${item.value}`]" 
                  placeholder="请输入投资计划金额"
                  type="number"
                  @input="handleSectionInput(item.value, $event)"
                  @blur="calculateTotal"
                />
              </el-form-item>
            </template>
          </div>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import * as Api from "@/api/prodmgr-inv/project/annualInvestmentPlan.js";
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import * as WzglApi from '@/api/prodmgr-inv/project/wzgl.js';
import * as SectionApi from '@/api/prodmgr-inv/project/section.js';
import Decimal from 'decimal.js';

export default {
  name: "AddAnnualInvestmentPlan",
  
  components: { VFormRender },
  
  data() {
    return {
      loading: false,
      title: "新增",
      // 表单相关
      formJson: {},
      formData: {},
      optionData: {},
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: "24",
      },
      // 下拉选项
      lineOptions: [],           // 建设项目选项
      sectionOptions: [],        // 标段项目选项
      sectionInvestmentValues: {}, // 标段投资计划值缓存（用于数据回显和格式转换）
      // 顶部按钮配置
      buttonTop: [
        { buttonName: "取消", buttonCode: "cancel", buttonIcon: "Blue-Cancel", type: "create, update" },
        { buttonName: "保存", buttonCode: "save", buttonIcon: "Blue-Save", type: "create, update" },
      ],
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
  
  mounted() {
    this.initPage();
  },
  
  methods: {
    // ==================== 页面初始化 ====================
    
    /** 根据页面类型初始化 */
    initPage() {
      if (["view", "update"].includes(this.type)) {
        this.initEditMode(this.id);
      } else if (this.type === "create") {
        this.initCreateMode();
      }
    },
    
    /** 新建模式初始化 */
    async initCreateMode() {
      this.title = "新建";
      await this.loadFormConfig();
      await this.loadProjectOptions();
    },
    
    /** 编辑/查看模式初始化 */
    async initEditMode(id) {
      const { data } = await Api.modifyXq(id);
      
      this.title = this.type === "view" ? "查看" : "编辑";
      await this.loadFormConfig();
      await this.loadProjectOptions();
      
      // 1. 先缓存标段投资计划数据（用于后续回显）
      this.cacheSectionValues(data.materialSectionParams);
      
      // 2. 加载标段选项并初始化动态字段（此时会从缓存读取值）
      if (data.projectId) {
        await this.loadSectionOptions(data.projectId);
      }
      
      // 3. 设置主表单数据
      this.$refs.vFormRef.setFormData({
        ...data,
        settlementYear: String(data.settlementYear)
      });
      
      // 4. 设置只读模式
      this.$refs.vFormRef.setReadMode(this.type === "view");
    },
    
    /** 加载表单配置 */
    async loadFormConfig() {
      const { data } = await formFillInPage("annualInvestmentPlan");
      this.$refs.vFormRef.setFormJson(data);
      this.$refs.vFormRef.setReadMode(false);
    },
    
    // ==================== 数据加载 ====================
    
    /** 加载建设项目选项 */
    async loadProjectOptions() {
      const { data } = await WzglApi.lineSelectOptions({ pageStatus: '1' });
      this.lineOptions = data.map(x => ({
        label: x.projectName,
        value: x.projectId
      }));
    },
    
    /** 加载标段项目选项 */
    async loadSectionOptions(projectId) {
      if (!projectId) {
        this.sectionOptions = [];
        return;
      }
      const { data } = await SectionApi.itemList({ pageSize: -1, projectId });
      const records = data?.list || data || [];
      this.sectionOptions = records.map(x => ({
        label: x.projectShortName,
        value: x.id,
        ...x
      }));
      // 初始化动态表单字段
      this.initSectionFormFields();
    },
    
    // ==================== 标段投资计划相关 ====================
    
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
          const fieldName = `sectionValue_${item.value}`;
          const cachedValue = this.sectionInvestmentValues[item.value];
          this.$set(formDataModel, fieldName, cachedValue ?? '');
        });
      });
    },
    
    /** 缓存标段投资计划值（用于编辑回显） */
    cacheSectionValues(materialSectionParams) {
      this.sectionInvestmentValues = {};
      if (!Array.isArray(materialSectionParams)) return;
      
      materialSectionParams.forEach(item => {
        if (item.sectionId) {
          this.$set(this.sectionInvestmentValues, item.sectionId, item.amount);
        }
      });
    },
    
    /** 标段输入处理 */
    handleSectionInput(sectionId, value) {
      this.$set(this.sectionInvestmentValues, sectionId, value);
    },
    
    /** 计算投资计划总金额 */
    async calculateTotal() {
      const formData = await this.$refs.vFormRef.getFormData(false);
      let total = new Decimal(0);
      
      this.sectionOptions.forEach(item => {
        const value = formData[`sectionValue_${item.value}`];
        if (value != null && value !== '') {
          const num = new Decimal(value);
          if (!num.isNaN()) {
            total = total.plus(num);
          }
        }
      });
      
      this.$refs.vFormRef.setFormData({ amount: total.toNumber() });
    },
    
    /** 转换为后端 API 格式 */
    convertToApiFormat(formData) {
      return this.sectionOptions
        .filter(item => {
          const value = formData[`sectionValue_${item.value}`];
          return value != null && value !== '';
        })
        .map(item => ({
          sectionId: item.value,
          amount: formData[`sectionValue_${item.value}`]
        }));
    },
    
    // ==================== 事件处理 ====================
    
    /** 建设项目变更 */
    async handleProjectChange(projectId) {
      const selectedOption = this.lineOptions.find(item => item.value === projectId);
      
      // 设置项目名称
      this.$refs.vFormRef.setFormData({
        projectName: selectedOption?.label || ''
      });
      
      // 清空并重新加载标段数据
      this.sectionOptions = [];
      this.sectionInvestmentValues = {};
      
      if (projectId) {
        await this.loadSectionOptions(projectId);
      }
    },
    
    /** 顶部按钮点击 */
    handleButtonClick(buttonCode) {
      const actions = {
        cancel: () => this.$router.go(-1),
        save: () => this.handleSubmit(),
      };
      actions[buttonCode]?.();
    },
    
    /** 按钮显示控制 */
    buttonShow(item) {
      if (item.buttonCode === "save") {
        return this.type !== "view";
      }
      return true;
    },
    
    /** 表单提交 */
    handleSubmit() {
      this.$refs.vFormRef.validateForm(async (valid) => {
        if (!valid) return;
        
        this.loading = true;
        try {
          const formData = await this.$refs.vFormRef.getFormData();
          formData.materialSectionParams = this.convertToApiFormat(formData);
          
          const apiMethod = this.type === "update" ? "edit" : "save";
          const payload = this.type === "update" 
            ? { id: this.id, ...formData }
            : formData;
          
          const { message } = await Api[apiMethod](payload);
          this.$modal.msgSuccess(message);
          this.$router.go(-1);
        } finally {
          this.loading = false;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .label-right-align .el-form-item__label {
  text-align: right;
}

/* 动态列垂直布局 */
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

/* 动态列容器 */
.section-list-wrapper {
  width: 70%;
  margin: 0 auto;
}
</style>
