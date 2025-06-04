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
        <!-- 附件 -->
        <template #fileSlot="scope">
          <el-form-item prop="fileList" label="发货单附件附件" class="label-right-align">
            <fileUpload
              v-model="scope.formModel.fileList"
              :limit="1"
              :fileSize="50"
              :fileType="['pdf']"
              :preview="type === 'view'"
            />
          </el-form-item>
        </template>

        <template #detailSlot>
          <TabTable ref="tabTableRef" :tableData="tableData" :PARAMS="params"/>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import * as Api from "@/api/prodmgr-inv/project/contract.js";
import * as LineApi from "@/api/prodmgr-inv/project/line.js";
import TabTable from "./tabTable.vue";
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import fileUpload from "@/components/upload";
import { listByDeptCode } from "@/api/system/dept.js";
import { getUserInfo } from "@/utils/user-info";
export default {
  name: "addSend",
  components: {
    VFormRender,
    fileUpload,
    TabTable,
  },
  data() {
    const userInfo = getUserInfo();
    return {
      maxManualIndex: 1,
      buyer: userInfo?.deptName,
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
      // 菜单按钮、字段等数据
      buttonTop: [
        {
          buttonName: "返回",
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
      gysOptions: [],
      tableData: [],
    };
  },
  computed: {
    type() {
      return this.$route.query.type;
    },
    id() {
      return this.$route.query?.id || "";
    },
    params(){
        return this.$route.params;
    }
  },
  async created() {

  },
  mounted() {
     if (['view', 'update'].includes(this.type)) {
      this.updateInit(this.id)
      return
    }

    if (this.type === 'create') {
      this.init()
      return
    }
  },
  methods: {
    //初始化
    init() {
      this.$nextTick(async () => {
        await this.formFillInPage();
      });
    },
    // 编辑初始化
    async updateInit(id) {
      await Api.detail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.title = "编辑";
          await this.formFillInPage();
          // fileList回显
          const newData = {
            ...data,
            contractStatus: data.contractStatus == "2",
            fileList: data.fileList[0]?.fileList || [],
          };
          this.$refs.vFormRef.setFormData(newData);

          //   form action
          this.$refs.vFormRef.setReadMode(this.type === "view");

          this.tableData = data.materialList;
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
      this.$router.go(-1);
    },

    buttonShow (item) {
      if (item.buttonCode === 'save') {
        return this.type !== 'view'
      }
      return true
    },
    //新建
    handleCreate() {
      this.$refs.vFormRef.validateForm(async (valid) => {
        if (!valid) {
          this.$message.warning("请完善信息");
          return;
        }
        // 校验表格
        const tableValid = this.$refs.tabTableRef.onCheck();
        if (!tableValid) {
          return;
        }

        // 如果表格内数据为空，则提示
        if (this.tableData.length === 0) {
          this.$message.warning("请添加合同物资科目");
          return;
        }

        if (valid) {
          this.loading = true;
          const formData = await this.$refs.vFormRef.getFormData();
          formData.contractStatus = formData.contractStatus ? "2" : "1";
          // 后端存入嵌套数组
          const fileList = formData.fileList;
          formData.fileList = [{ fileList }];
          await Api[this.type === "update" ? `edit` : `save`](
            Object.assign({ id: this.type === "update" ? this.id : null }, formData, {
              materialList: this.tableData.map((x) => ({
                ...x,
                id: null,
              })),
            })
          )
            .then(({ message }) => {
              this.loading = false;
              this.$modal.msgSuccess(message);
              this.cancel();
            })
            .finally((err) => {
              this.loading = false;
            });
        }
      });
    },

    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("addSend").then((res) => {
          this.$refs["vFormRef"].setFormJson(res.data);
          if (this.params) {
            this.$refs["vFormRef"].setFormData({
              supplyName: this.params.supplyName,
              supplyNumber: this.params.supplyNumber,
            });
          }
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
