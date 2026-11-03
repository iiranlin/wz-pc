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
       <template #projectNameSlot="{ formModel }">
          <el-form-item prop="projectName" label="建设项目：" class="label-right-align">
            <template v-if="type === 'create'">
              <span class="titleCss" :title="itemData.projectName">
                {{itemData.projectName}}
              </span>
            </template>
            <template v-else>
              <span class="titleCss" :title="formModel.projectName">
                {{formModel.projectName}}
                </span>
            </template>
          </el-form-item>
        </template>
         <template #sectionNameSlot="{ formModel }">
          <el-form-item prop="sectionName" label="标段项目：" class="label-right-align">
            <template v-if="type === 'create'">
              <span class="titleCss" :title="itemData.sectionName">
                {{itemData.sectionName}}
              </span>
            </template>
            <template v-else>
              <span class="titleCss" :title="formModel.sectionProjectName">
                {{formModel.sectionProjectName}}
                </span>
            </template>
          </el-form-item>
        </template>

        <template #planYearSlot="{ formModel }">
          <el-form-item prop="planYear" label="计划年度：" class="label-right-align">
            <el-date-picker
              v-model="formModel.planYear"
              type="year"
              value-format="yyyy"
              placeholder="选择计划年度"
              style="width: 100%"
              v-if="type !== 'view'"
            />
            <span v-else>
              {{formModel.planYear}}
            </span>
          </el-form-item>
        </template>

        <!-- 计量单位选择插槽 -->
        <template #measurementUnitSlot="{ formModel }">
           <el-form-item label="计量单位：" prop="unit" required class="label-right-align">
              <el-select
                v-model="formModel.unit"
                placeholder="请选择"
                style="width: 100%"
                filterable
                v-if="type !== 'view'"
              >
                <el-option
                  v-for="item in dict.type.MeasureUnit"
                  :key="item.value"
                  :label="item.label"
                  :value="item.label"
                />
              </el-select>

              <span v-else>
                {{formModel.unit}}
              </span>
            </el-form-item>
        </template>
      </VFormRender>

      <toBeReviewed ref="toBereview" />
      <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
    </div>
  </div>
</template>

<script>
 import dayjs from "dayjs";
import * as Api from "@/api/prodmgr-inv/project/annualProcurementPlan.js";
import * as PurchasePlanApi from "@/api/prodmgr-inv/project/annualProcurementPlan.js";
import VFormRender from "@/components/form-render/index";
import toBeReviewed from "@/views/audit/components/toBeReviewed";
import workFlowView from '@/components/workFlowView'
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";

export default {
  name: "AddAnnualProcurementPlan",
  dicts: ["MeasureUnit"],
  components: { VFormRender ,toBeReviewed,workFlowView},

  data() {
    return {
      loading: false,
      title: "新增",
      itemData: {},
      currentProjectData: null, // 保存当前项目标段数据
      selectedRow: null,
      rowData: {},
      workFlowViewVisible: false,
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
      // 顶部按钮配置
      buttonTop: [
        { buttonName: "取消", buttonCode: "cancel", buttonIcon: "Blue-Cancel", type: "create, update" },
        { buttonName: "保存", buttonCode: "save", buttonIcon: "Blue-Save", type: "create, update" },
        { buttonName: "通过", buttonCode: "pass", buttonIcon: "Blue-AddSon", type: "" },
        { buttonName: '退回上一步', buttonCode: 'rollbackToPrevious', buttonIcon: 'Blue-Cancel', type: '' },
        {
          buttonName: "驳回",
          buttonCode: "reject",
          buttonIcon: "Blue-EditCard",
          type: "",
        },
        { buttonName: "编辑", buttonCode: "update", buttonIcon: "Blue-Edit", type: "create, update" },
        { buttonName: '流程查看', buttonCode: 'flowSee', buttonIcon: 'Blue-Flow', type: '' }
      ],
      // 页面类型
      currentType: null,
    };
  },
  computed: {
    type() {
      return this.currentType || this.$route.query.type;
    },
    id() {
      return this.$route.query?.id || "";
    },
    name(){
      return this.$route.query?.name
    },
    queryAuditArr() {
      return JSON.parse(this.$route.query.auditArr || "[]");
    },
  },
 async created() {
		this.getCurrentProSection();
	},
  mounted() {
    this.initPage();
  },

  methods: {
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
    },

    /** 编辑/查看模式初始化 */
    async initEditMode(id) {
      const { data } = await PurchasePlanApi.detail(id);
      this.title = this.type === "view" ? "查看" : "编辑";
      await this.loadFormConfig();

      // 3. 设置主表单数据
      this.rowData = data;
      this.$refs.vFormRef.setFormData({
        ...data,
        // settlementYear: String(data.settlementYear)
      });

      // 4. 设置只读模式
      this.$refs.vFormRef.setReadMode(this.type === "view");
    },
    // 获取当前项目标段
     getCurrentProSection() {
        if (this.type === 'view' || this.type === 'update') {
          return
        }
        PurchasePlanApi.getSectionProjectBySGDW().then(({ data }) => {
          this.itemData = data[0];
          // 保存项目标段数据，等待表单配置加载完成后再设置
          this.currentProjectData = {
            projectId: data[0].projectId,
            sectionProjectId: data[0].id,
          };
			})
    },

    /** 加载表单配置 */
    async loadFormConfig() {
      const { data } = await formFillInPage("addAnnualProcurementPlan");
      this.$refs.vFormRef.setFormJson(data);

      const currentYear = dayjs().year()
      const formData = {
        planYear: currentYear.toString()
      };
      
      // 如果有保存的项目标段数据，一并设置
      if (this.currentProjectData) {
        formData.projectId = this.currentProjectData.projectId;
        formData.sectionProjectId = this.currentProjectData.sectionProjectId;
      }
      
      this.$refs['vFormRef'].setFormData(formData);
      this.$refs.vFormRef.setReadMode(false);
    },

    // ==================== 数据加载 ====================


    /** 计量单位事件 */
    async handleMeasurementUnitChange(projectId) {
      const selectedOption = this.lineOptions.find(item => item.value === projectId);
      // 设置项目名称
      this.$refs.vFormRef.setFormData({
        projectName: selectedOption?.label || ''
      });
    },

    /** 顶部按钮点击 */
    handleButtonClick(buttonCode) {
      if (buttonCode === 'rollbackToPrevious') {
        this.$refs.toBereview.init('rollbackToPrevious', this.queryAuditArr, this.queryName || this.name)
        return
      }
      const actions = {
        cancel: () => this.$router.go(-1),
        update: () =>{
          this.$refs.vFormRef.setReadMode(false);
          this.currentType = "update";
          this.title = "编辑";
        },
        save: () => this.handleSubmit(),

        pass: () => {
            this.$refs.toBereview.init("pass", this.queryAuditArr, this.name);
        },
        reject: () => {
          this.$refs.toBereview.init("reject", this.queryAuditArr, this.name);
        },
        flowSee: () => {
          this.workFlowViewVisible = true
          this.selectedRow = { businessId: this.id }
        },
      };
      actions[buttonCode]?.();
    },

    /** 按钮显示控制 */
    buttonShow(item) {
      if (item.buttonCode === 'rollbackToPrevious') {
        const query = this.isDialog ? this.dialogQuery : this.$route.query
        return query.name === 'audit' && query.type === 'view' && Array.isArray(this.queryAuditArr)
          && this.queryAuditArr.length === 1 && !!this.queryAuditArr[0]?.taskId
          && this.buttonShow({ ...item, buttonCode: 'reject' })
      }
      if (item.buttonCode === "save") {
        return this.type !== "view";
      }
      // 审核中才能显示同意和不同意按钮
      if (item.buttonCode === "pass" || item.buttonCode === "reject") {
        return this.name == 'audit'
      }
      // 只有handle状态下才显示编辑按钮
      if (item.buttonCode === "update") {
        return this.name === "handle" && this.type !== "update"
      }
      // 已提交、已生效、修改后同意、已驳回、允许查看流程
      // 流程查看 
      if (item.buttonCode === 'flowSee') {
        return !['1'].includes(this.rowData.status) && ['handle', 'toBeDeal', 'audit', 'todoList'].includes(this.name)
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
          
          // 将到日的时间戳转换为到月的时间戳
          if (formData.planPurchaseTime) {
            formData.planPurchaseTime = dayjs(formData.planPurchaseTime).startOf('month').valueOf();
          }
          if (formData.planUseTime) {
            formData.planUseTime = dayjs(formData.planUseTime).startOf('month').valueOf();
          }
          
          // 验证计划采购量不能超过项目需求总数量
          if (formData.planPurchaseQty && formData.totalRequiredQty) {
            const planPurchaseQty = Number(formData.planPurchaseQty);
            const totalRequiredQty = Number(formData.totalRequiredQty);
            if (planPurchaseQty > totalRequiredQty) {
              this.$modal.msgError(`计划采购量不能超过项目需求总数量！`);
              this.loading = false;
              return;
            }
          }
          
          const apiMethod = this.type === "update" ? "edit" : "save";
          const payload = this.type === "update"
            ? { id: this.id, ...formData }
            : formData;

          const { message } = await Api[apiMethod](payload);
          this.$modal.msgSuccess(message);
          
          // 如果是name = handle模式说明是待处理状态进来的，保存后留在当前页面并切换回只读模式
          if (this.name === "handle") {
            this.currentType = "view";
            this.title = "查看";
            this.$refs.vFormRef.setReadMode(true);
            // 重新加载数据以显示最新状态
            await this.initEditMode(this.id);
          } else {
            this.$router.go(-1);
          }
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
