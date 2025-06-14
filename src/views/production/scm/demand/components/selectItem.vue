<template>
  <div class="app-container container_flex" v-loading="loading">
    <button-top
      :buttonTopData="buttonTop"
      :buttonShow="buttonShow"
      @newButton="newButton"
    ></button-top>
    <div class="container_flex_form">
      <VFormRender
        :form-json="formJson"
        :form-data="formData"
        :option-data="optionData"
        ref="vFormRef"
        :global-dsv="globalDsv"
        class="formRender_view"
      >
        <template #itemSlot>
          <item-table @onSelectRow="onSelectRow" :tableData="tableData" />
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import * as Api from "@/api/prodmgr-inv/project/scm.js";
import TabTable from "./tabTable.vue";
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import fileUpload from "@/components/upload";
import { getUserInfo } from "@/utils/user-info";
import { mapState } from "vuex";
import ItemTable from "./itemTable.vue";
import dayjs from "dayjs";
export default {
  name: "selectItem",
  components: {
    VFormRender,
    fileUpload,
    TabTable,
    ItemTable,
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
        // {
        //   buttonName: "返回",
        //   buttonCode: "cancel",
        //   buttonIcon: "Blue-Cancel",
        //   type: "create, update",
        // },
        {
          buttonName: "保存",
          buttonCode: "save",
          buttonIcon: "Blue-Save",
          type: "create, update",
        },
      ],
      constructionOptions: [],
      gysOptions: [],

      selectRows: [],
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
    planId() {
      return this.$route.query?.planId || "";
    },
    ...mapState(["request"]),
  },
  async created() {},
  mounted() {
    this.init();
  },
  activated() {
    this.init();
  },
  methods: {
    onSelectRow(rows) {
      console.log(rows, "rowssss");
      this.selectRows = rows;
    },
    //初始化
    async init() {
      this.loading = true;
      await Api.detailWz(this.type == "create" ? this.id : this.planId).then(
        ({ data }) => {
          this.loading = false;
          this.$nextTick(async () => {
            this.tableData = data.details.map((x) => ({
              ...x,
              supplyDate: dayjs(x.supplyDate).format("YYYY-MM-DD"),
            }));
            await this.formFillInPage();
            this.$refs["vFormRef"].setFormData({
              sectionName: data.sectionName,
              planName: data.planName,
              contractName: data.contractName,
            });
            this.$refs.vFormRef.setReadMode(true);
          });
        }
      );
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
      return true;
    },

    //新建
    handleCreate() {
      if (this.selectRows.length === 0) {
        this.$message.warning("请选择要添加的物资");
        return;
      }
      // const flag = this.selectRows.every(
      //   (obj) => obj.deptId === this.selectRows[0].deptId
      // );
      // if (!flag) {
      //   this.$modal.msgError("一次发货只允许选择一个需求组织（分部）的供应物资");
      //   return;
      // }
      this.setSelectedItemList(this.selectRows);
      this.cancel();
    },

    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("selectItem").then((res) => {
          this.$refs["vFormRef"].setFormJson(res.data);
          this.$refs["vFormRef"].setFormData({
            supplyName: this.supplyName,
            supplyNumber: this.supplyNumber,
          });
          resolve(true);
        });
      });
    },

    setSelectedItemList(data) {
      this.$store.dispatch("request/setSelectedItemList", data);
    },
    getSelectedItemList() {
      return this.request.selectedItemList;
    },
  },
};
</script>

<style lang="scss" scoped>
.flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}
.flex .title {
  font-weight: 600;
  color: #000;
  padding-left: 12px;
}
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
