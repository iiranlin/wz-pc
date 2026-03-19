<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="handleButtonClick"></button-top>
    
    <div :class="{ container_flex_form: true }">
      <VFormRender :form-json="formJson" :form-data="formData" :option-data="optionData" ref="vFormRef"
        :global-dsv="globalDsv" :class="{ formRender_view: true }">
      </VFormRender>
    </div>

    <toBeReviewed ref="toBereview" />
    <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />

    <PlanQAdjustmentDialog ref="planQAdjustmentDialogRef" @createSuccess="createSuccess"/>
  </div>
</template>
<script>
  import indexMixin from "@/views/mixins";
  import dayjs from "dayjs";
  import * as PurchasePlanApi from "@/api/prodmgr-inv/project/annualProcurementPlan.js";
  import toBeReviewed from "@/views/audit/components/toBeReviewed";
  import workFlowView from '@/components/workFlowView'
  import PlanQAdjustmentDialog from '@/views/selfMaterialProcurementPlan/annualProcurementPlan/components/planQAdjustment.vue'
  import VFormRender from "@/components/form-render/index";
  import { formFillInPage } from "@/api/form/form";
  import { getToken } from "@/utils/auth";
  export default {
    name: "detailPlanQulity",
    mixins: [indexMixin],
    components: { toBeReviewed, workFlowView,VFormRender,PlanQAdjustmentDialog },
    computed: {
      type() {
        return this.$route.query.type;
      },
      id() {
        return this.$route.query?.id || "";
      },
      name(){
        return this.$route.query?.name
      },
      queryAuditArr() {
        return JSON.parse(this.$route.query.auditArr || "[]");
      }
    },
    data() {
      return {
        // 页面属性
        property: { fields: [{ isAdd: 1, isEdit: 1 }] },
        // 顶部按钮配置
      buttonTop: [
        { buttonName: "返回", buttonCode: "cancel", buttonIcon: "Blue-Cancel", type: "create, update" },
        { buttonName: "保存", buttonCode: "save", buttonIcon: "Blue-Save", type: "create, update" },
        { buttonName: "通过", buttonCode: "pass", buttonIcon: "Blue-AddSon", type: "" },
        {
          buttonName: "驳回",
          buttonCode: "reject",
          buttonIcon: "Blue-EditCard",
          type: "",
        },
        { buttonName: "编辑", buttonCode: "update", buttonIcon: "Blue-Edit", type: "create, update" },
        { buttonName: '流程查看', buttonCode: 'flowSee', buttonIcon: 'Blue-Flow', type: '' }

      ],
        // 表单相关
      formJson: {},
      formData: {},
      optionData: {},
        // 页面属性
        metaId: this.$route.meta.id,
        rowData: {},
        loading:false,
        selectedRow: null,
        workFlowViewVisible: false,
        globalDsv: {
          VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
          VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
          Authorization: getToken(),
          businessType: "24",
        },
      }
    },
    mounted() {
      this.initPage();
    },
    methods:{

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
      const { data } = await PurchasePlanApi.planQtyDetail(id);
      this.title = this.type === "view" ? "审核详情" : "编辑";
      await this.loadFormConfig();

      this.rowData = data
      // 3. 设置主表单数据
      this.$refs.vFormRef.setFormData({
        ...data,
      });

      // 4. 设置只读模式
      this.$refs.vFormRef.setReadMode(this.type === "view");
    },

      /** 加载表单配置 */
      async loadFormConfig() {
        const { data } = await formFillInPage("detailPlanQulity");
        this.$refs.vFormRef.setFormJson(data);
        this.$refs.vFormRef.setReadMode(true);
      },
      handleButtonClick(buttonCode) {
        const actions = {
          cancel: () => this.$router.go(-1),
          update: () =>{
            // 跳转到planQAdjustment.vue页面进行编辑
            this.$refs["planQAdjustmentDialogRef"].init( this.rowData, this.name);
          },
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
      if (item.buttonCode === "save") {
        return this.type !== "view";
      }
      // 审核中才能显示同意和不同意按钮
      if (item.buttonCode === "pass" || item.buttonCode === "reject") {
        return this.name == 'audit'
      }
      // 只有handle状态下且当前不是编辑模式时才显示编辑按钮
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

  }
}
</script>
