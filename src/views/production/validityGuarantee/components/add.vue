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
        <!-- 合同名称选择 -->
        <template #contractNameSlot="{ formModel }">
          <el-form-item
            prop="contractName"
            label="合同名称"
            class="label-right-align"
          >
            <span>{{ formModel.contractName }}</span>
          </el-form-item>
        </template>
        <!-- 合同编号选择 -->
        <template #contractNoSlot="{ formModel }">
          <el-form-item
            prop="contractNo"
            label="合同编号"
            class="label-right-align"
          >
            <span>{{ formModel.contractNo }}</span>
          </el-form-item>
        </template>

        <!--卖方单位  -->
        <template #sellerSlot="{ formModel }">
          <el-form-item prop="sellerId" label="卖方" class="label-right-align">
            <span>{{ formModel.seller }}</span>
          </el-form-item>
        </template>
        <!-- 买方单位 -->
        <template #buyerSlot="{ formModel }">
          <el-form-item prop="buyerId" label="买方" class="label-right-align">
            <template>
              <span>{{ formModel.buyer }}</span>
            </template>
          </el-form-item>
        </template>

        <!-- 建设项目 -->
        <template #lineSlot="{ formModel }">
          <el-form-item
            prop="buyerId"
            label="建设项目"
            class="label-right-align"
          >
            <template>
              <span>{{ formModel.projectName }}</span>
            </template>
          </el-form-item>
        </template>

        <!-- 物资名称 -->
        <template #itemNameSlot="{ formModel }">
          <el-form-item
            prop="buyerId"
            label="物资名称"
            class="label-right-align"
          >
            <template>
              <span>{{ formModel.itemName }}</span>
            </template>
          </el-form-item>
        </template>

        <!-- 原合同名称 -->
        <template #oldNameSlot="{ formModel }">
          <el-form-item
            prop="buyerId"
            label="原合同名称"
            class="label-right-align"
          >
            <template>
              <span>{{ formModel.oldName }}</span>
            </template>
          </el-form-item>
        </template>
        <!-- 附件 -->
        <template #fileListSlot="scope">
          <el-form-item
            prop="fileList"
            label="合同附件"
            class="label-right-align"
          >
            <fileUpload
              v-model="scope.formModel.validityGuaranteeFile"
              :limit="9999"
              :fileSize="500"
              :fileType="['pdf']"
              :preview="type === 'view'"
            />
          </el-form-item>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import * as Api from "@/api/prodmgr-inv/project/validityGuarantee.js";
import * as ContractApi from "@/api/prodmgr-inv/project/contract.js";
import * as LineApi from "@/api/prodmgr-inv/project/line.js";
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import attachmentTable from "@/views/components/attachmentTable";
import { listByDeptCode } from "@/api/system/dept.js";
import { extractSelectOptions } from "@/utils/index";
import fileUpload from "@/components/upload";
import router from "@/router";
export default {
  name: "SectionAdd",
  components: {
    VFormRender,
    attachmentTable,
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
    projectId() {
      return this.$route.query?.projectId || "";
    },
    // 用户获取父级ID 查询合同详细信息
    contractId() {
      return this.$route.query?.contractId || "";
    },
  },
  async created() {},
  mounted() {
    if (["view", "update"].includes(this.type)) {
      this.updateInit(this.id);
      if (this.type === "view") {
        this.$tab.updatePage({
          path: "/contract/addValidityGuarantee",
          meta: {
            title: "保函有效期详情",
          },
        });
      }
      if (this.type === "update") {
        this.$tab.updatePage({
          path: "/contract/addValidityGuarantee",
          meta: {
            title: "保函有效期修改",
          },
        });
      }
      return;
    }

    if (this.type === "create") {
      this.init();
      return;
    }
  },
  methods: {
    async getContractInfo() {
      if (!this.contractId) return;
      await ContractApi.detail(this.contractId).then(({ data }) => {
        this.$refs.vFormRef.setFormData({
          ...data,
        });
      });
    },
    //初始化
    init() {
      this.$nextTick(async () => {
        this.title = "新建";
        await this.formFillInPage();
        await this.getContractInfo();
      });
    },
    // 编辑初始化
    async updateInit(id) {
      await Api.detail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.title = "编辑";
          await this.formFillInPage();
          const validityGuaranteeFile = data.validityGuaranteeFile;
          // fileList回显
          const newData = {
            ...data,
            validityGuaranteeFile: validityGuaranteeFile
              ? JSON.parse(validityGuaranteeFile)
              : [],
            validityGuarantee: [
              data.validityGuarantee,
              data.validityGuaranteeEnd,
            ],
          };
          this.$refs.vFormRef.setFormData(newData);

          //   form action
          this.$refs.vFormRef.setReadMode(this.type === "view");
        });
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
      this.$tab.closeOpenPage(true);
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
        if (valid) {
          this.loading = true;
          const formData = await this.$refs.vFormRef.getFormData();

          // validityGuarantee 保函有效期日期范围拆分两个字段: validityGuarantee,validityGuaranteeEnd
          const validityGuarantee = formData.validityGuarantee;
          formData.validityGuarantee = validityGuarantee
            ? validityGuarantee[0]
            : "";
          formData.validityGuaranteeEnd = validityGuarantee
            ? validityGuarantee[1]
            : "";
          // 保函合同附件
          const validityGuaranteeFile = formData.validityGuaranteeFile;

          await Api[this.type === "update" ? `edit` : `save`](
            Object.assign(
              { id: this.type === "update" ? this.id : null },
              formData,
              {
                contractId: this.contractId,
                validityGuaranteeFile: JSON.stringify(validityGuaranteeFile),
              }
            )
          )
            .then(({ message }) => {
              this.loading = false;
              this.$modal.msgSuccess(message);
              this.$tab.closePage(router.currentRoute);
              this.$router.push({ name: "validityGuarantee" });
            })
            .finally((err) => {
              this.loading = false;
            });
        }
      });
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("addValidityGuarantee").then((res) => {
          this.$refs["vFormRef"].setFormJson(res.data);
          //   form action
          this.$refs["vFormRef"].setReadMode(false);

          resolve(true);
        });
      });
    },
    selectChange(options, val, key) {
      this.$refs.vFormRef.setFormData({
        [key]: options.find((item) => item.value === val)?.label,
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
