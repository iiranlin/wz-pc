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
        <!-- 供应需求ID和需求项目切换 -->
        <template #slot2="scope">
          <el-form-item
            prop="supplyNumber"
            label="供应需求ID"
            class="label-right-align"
            v-if="type != 'view'"
          >
            <el-input v-model="scope.formModel.supplyNumber" readonly></el-input>
          </el-form-item>
          <el-form-item
            prop="sectionName"
            label="需求项目"
            class="label-right-align"
            v-else
          >
            <el-input v-model="scope.formModel.sectionName" readonly></el-input>
          </el-form-item>
        </template>
        <template #shippingNumberSlot="scope">
          <el-form-item
            prop="shippingNumber"
            label="发货单号"
            class="label-right-align"
            v-if="type == 'view'"
          >
            {{ scope.formModel.shippingNumber }}
          </el-form-item>
        </template>
        <template #detailSlot>
          <TabTable ref="tabTableRef" :tableData="tableData" />
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
import dayjs from 'dayjs'
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
    supplyName() {
      return this.$route.query?.supplyName || "";
    },
    supplyNumber() {
      return this.$route.query?.supplyNumber || "";
    },
    sellerId() {
      return this.$route.query?.sellerId || "";
    },
    ...mapState(["request"]),
  },
  async created() {
    this.tableData = this.getSelectedItemList();
  },
  activated() {
    this.tableData = this.getSelectedItemList();
  },
  watch: {
    $route(to, from) {
      if (from.path != "/scm/selectItem"&&from.path != "/scm/addSend") {
        if (["view", "update"].includes(this.type)) {
          this.updateInit(this.id);
          return;
        }

        if (this.type === "create") {
          this.init();
          return;
        }
      }
    },
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
    onCheck(tableData) {
      const errors = [];
      tableData.forEach((row, index) => {
        const rowNum = index + 1;
        if (!row.planAmount || row.planAmount == 0) {
          errors.push(`第${rowNum}行，数量未填写 `);
        }
        if (!row.packagingFm) {
          errors.push(`第${rowNum}行，包装形式未填写 `);
        }
        if (!row.manufactureDate) {
          errors.push(`第${rowNum}行，生产日期未填写 `);
        }
      });

      if (errors.length > 0) {
        this.$message({
          message: errors.join("<br/> <br/>"),
          type: "error",
          dangerouslyUseHTMLString: true,
        });
        return false;
      }
      // TODO: 提交逻辑放这里
      return true;
    },
    getSelectedItemList() {
      return this.request.selectedItemList;
    },
    setSelectedItemList(data) {
      this.$store.dispatch("request/setSelectedItemList", data);
    },
    //初始化
    init() {
      this.$nextTick(async () => {
        await this.formFillInPage();
      });
    },
    // 编辑初始化
    async updateInit(id) {
      await Api.sendDetail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.title = "编辑";
          await this.formFillInPage();
          // fileList回显
          const newData = {
            ...data,
            fileList: data.fileList&&data.fileList[0]?.fileList || [],
            arrivalDate:dayjs(data.arrivalDate).format('YYYY-MM-DD'),
            shippingDate:dayjs(data.shippingDate).format('YYYY-MM-DD'),
          };
          this.$refs.vFormRef.setFormData(newData);

          //   form action
          this.$refs.vFormRef.setReadMode(this.type === "view");

          
            const detail = data.materialSupplierDetailDTOList.map(x => ({
            ...x,
            manufactureDate: dayjs(x.manufactureDate).format('YYYY-MM-DD'),
            expirationDate: dayjs(x.expirationDate).format('YYYY-MM-DD'),
            id: x.planDetailId,
            
          }))
          this.tableData = detail;
          this.setSelectedItemList(this.tableData)
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

    buttonShow(item) {
      if (item.buttonCode === "save") {
        return this.type !== "view";
      }
      return true;
    },
    //新建
    handleCreate() {
      this.$refs.vFormRef.validateForm(async (valid) => {
        if (!valid) {
          this.$message.warning("请完善信息");
          return;
        }
        const flag = this.tableData.every(
          (obj) => obj.sectionId === this.tableData[0].sectionId
        );
        if (!flag) {
          this.$modal.msgError("一个发货批次只允许选择一个标段项目的供应物资");
          return;
        }
        if (this.getSelectedItemList().length === 0) {
          this.$modal.msgError("请选择物资");
          return;
        }
        const isValid = this.onCheck(this.tableData);
        if (!isValid) {
          return;
        }

        if (valid) {
          this.loading = true;
          const formData = await this.$refs.vFormRef.getFormData();
          // 后端存入嵌套数组
          const fileList = formData.fileList;
          formData.fileList = [{ fileList }];
          await Api.save(
            Object.assign(
              { supplyId: this.type === "create" ? this.id : null,id:this.type === "create" ? null : this.id},
              formData,
              {
                materialSupplierDetailParams: this.tableData.map((x) => ({
                  planDetailId:x.id,
                  ...x,
                })),
              }
            )
          )
            .then(({ message }) => {
              this.loading = false;
              this.$modal.msgSuccess(message);
              this.setSelectedItemList([]);
              this.$router.push({
                name: "demand",
              });
            })
            .finally((err) => {
              formData.fileList=fileList;
              this.loading = false;
            });
        }
      });
    },

    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("addSend").then((res) => {
          this.$refs["vFormRef"].setFormJson(res.data);
          this.$refs["vFormRef"].setFormData({
            supplyName: this.supplyName,
            supplyNumber: this.supplyNumber,
          });
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
