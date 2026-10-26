<template>
  <div class="app-container container_flex">
    <button-top
      :buttonTopData="buttonTop"
      :buttonShow="buttonShow"
      @newButton="newButton"
    ></button-top>
    <div :class="{ container_flex_form: true }">
      <VFormRender
        :form-json="formJson"
        :form-data="formData"
        :option-data="optionData"
        ref="vFormRef"
        :global-dsv="globalDsv"
        :class="{ formRender_view: true }"
      >
        <template #table>
          <detailTable :projectId="projectId" ref="detailTable"></detailTable>

          <!-- <table /> -->
        </template>

        <!-- 装车照片附件 -->
        <template #fileSlot="scope">
          <ShippingAttachments :field-key="scope.shippingAttachmentKey" :model="scope.formModel" group="photos" :preview="true" />
          <ShippingAttachments :field-key="scope.shippingAttachmentKey" :model="scope.formModel" group="quality" :preview="true" />
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import ShippingAttachments from "@/components/shipping-attachments";
import { prepareShippingAttachmentLayout, initShippingAttachments, readShippingAttachments } from "@/utils/shipping-attachments";
import * as Api from "@/api/prodmgr-inv/project/planRest.js";
import * as LineApi from "@/api/prodmgr-inv/project/line.js";
import * as SectionApi from "@/api/prodmgr-inv/project/section.js";
import table from "./table.vue";
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import attachmentTable from "@/views/components/attachmentTable";
import { listByDeptCode } from "@/api/system/dept.js";
import detailTable from "./detailTable.vue";
import { getUserInfo } from "@/utils/user-info";
import { mapState } from "vuex";
import dayjs from "dayjs";
import fileUpload from "@/components/upload";
export default {
  // 需求物流查看
  components: {
    ShippingAttachments,
    VFormRender,
    attachmentTable,
    detailTable,
    table,
    fileUpload,
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
      constructionCompanyOptions: [],
      supervisionUnitOptions: [],
      materialAgentCompanyOptions: [],
      // 菜单按钮、字段等数据
      buttonTop: [
        {
          buttonName: "返回",
          buttonCode: "cancel",
          buttonIcon: "Blue-Cancel",
          type: "create, update",
        },
      ],
      constructionOptions: [],
      selectRows: [],
      userInfo: getUserInfo(),
    };
  },
  computed: {
    type() {
      return this.$route.query.type;
    },
    id() {
      return this.$route.query?.id || "";
    },
    projectId() {
      return this.$route.query?.projectId || "";
    },
    ...mapState(["request"]),
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
    async getCurrentSection() {
      const res = await SectionApi.getCurrentSection();
      this.sectionInfo = res.data;
      this.$refs.vFormRef.setFormData({
        sectionName: this.sectionInfo.sectionName,
        title:
          this.sectionInfo.constructionCompany +
          this.sectionInfo.sectionName +
          dayjs().format("YYYY年MM月") +
          "甲供物资需求",
      });
    },

    //初始化
    init() {
      this.$nextTick(async () => {
        this.title = "新建";
        await this.formFillInPage();
        this.getCurrentSection();
      });
    },
    // 编辑初始化
    async updateInit(id) {
      await Api.detail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.title = "编辑";
          await this.formFillInPage();
          this.$refs.vFormRef.setFormData({
            ...data,
            ...readShippingAttachments(data.fileByList),
            createDate: dayjs(data.createDate).format("YYYY-MM-DD HH:mm"),
          });

          //   form action
          this.$refs.vFormRef.setReadMode(true);
        });
      });
    },
    newButton(buttonCode) {
      if (buttonCode === "cancel") {
        this.cancel();
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
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("logisticsRequest").then((res) => {
          this.$refs["vFormRef"].setFormJson(prepareShippingAttachmentLayout(res.data, {"fileSlot": ["photos", "quality"]}));
          initShippingAttachments(this.$refs.vFormRef);
          //   form action
          this.$refs["vFormRef"].setReadMode(true);

          resolve(true);
        });
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
</style>
