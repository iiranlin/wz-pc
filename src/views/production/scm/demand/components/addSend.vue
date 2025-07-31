<template>
  <div class="app-container container_flex" v-loading="loading">
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
          <el-form-item
            prop="fileList"
            label="发货单附件"
            class="label-right-align"
            :rules="[{ required: true, message: '请上传', trigger: 'change' }]"
          >
            <fileUpload
              v-model="scope.formModel.fileList"
              :limit="1"
              :preview="type === 'view' && status !=2"
              :isShowTip="false"
              :fileType="['pdf']"
            />
          </el-form-item>
        </template>
         <!-- 装车照片附件 -->
        <template #fhSlot="scope">
          <el-form-item
            prop="zczp"
            label="装车照片"
            class="label-right-align"
           
          >
            <fileUpload
              v-model="scope.formModel.zczp"
              :limit="9999"
              :preview="type === 'view' && status !=2"
              :isShowTip="false"
              :fileType="['jpg','png','jpeg']"
            />
          </el-form-item>
        </template>
        <!-- 供应需求ID和需求项目切换 -->
        <!-- <template #slot2="scope">
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
          {{scope.formModel.sectionName}}
          </el-form-item>
        </template> -->
        <template #shippingNumberSlot="scope">
          <el-form-item
            prop="contractName"
            label="合同名称"
            class="label-right-align"
            v-if="type != 'view'"
          >
            <el-input v-model="scope.formModel.contractName" readonly></el-input>
          </el-form-item>
          <el-form-item
            prop="shipmentBatchNumber"
            label="发货单号"
            class="label-right-align"
            v-else
          >
            {{ scope.formModel.shipmentBatchNumber }}
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
import dayjs from "dayjs";
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
    status(){
      // status = 2 表示货运中，仅允许修改附件，其余和view模式一样
      return this.$route.query?.status || "";
    },
    planId(){
      return this.$route.query?.planId || "";
    },
    ...mapState(["request"]),
  },
  async created() {},
  activated() {
    if (this.type == "view") {
      this.$nextTick(() => {
        this.$tab.updatePage({
          path: "/scm/addSend",
          meta: {
            title: this.status == 2 ?'修改发货信息': "货运详情",
          },
        });
      });
    }
    if (this.type == "update") {
      this.$nextTick(() => {
        this.$tab.updatePage({
          path: "/scm/addSend",
          meta: {
            title: "修改发货信息",
          },
        });
      });
    }
  },
  watch: {
    $route(to, from) {
      //只有从选择物资页面过来，才从缓存里取值
      if (from.path == "/scm/selectItem") {
        //选择物资，发货数量默认带过来计划数量
        var data = this.getSelectedItemList();
        this.tableData = data.map((x) => ({
          ...x,
          sendTotal: x.ssendTotal,
        }));
      }
      // if (from.path != "/scm/selectItem" && from.path != "/scm/addSend") {
      //   if (["view", "update"].includes(this.type)) {
      //     this.updateInit(this.id);
      //     return;
      //   }
      //   if (this.type === "create") {
      //     this.init();
      //     return;
      //   }
      // }
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
        if (!row.sendTotal || row.sendTotal == 0) {
          errors.push(`第${rowNum}行，发货数量未填写 `);
        }
        if (!row.packagingFm) {
          errors.push(`第${rowNum}行，包装形式未填写 `);
        }
        if (!row.manufactureDate) {
          errors.push(`第${rowNum}行，生产日期未填写 `);
        }

        if (!row.field2) {
          errors.push(`第${rowNum}行，收货地址未填写 `);
        }
        if (!row.supplyDate) {
          errors.push(`第${rowNum}行，供应时间未填写 `);
        }
        if (!row.receiver) {
          errors.push(`第${rowNum}行，收货人及联系方式未填写 `);
        }
        if (!row.fileList01 || row.fileList01.length == 0) {
          errors.push(`第${rowNum}行，请上传合格证附件 `);
        }
        if (!row.fileList02 || row.fileList02.length == 0) {
          errors.push(`第${rowNum}行，请上传厂检报告附件`);
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
    async init() {
      this.loading = true;
      await Api.detailWz(this.id).then(({ data }) => {
        this.loading = false;
        this.$nextTick(async () => {
          await this.formFillInPage();
          this.$refs["vFormRef"].setFormData({
            sectionName: data.sectionName,
            planName: data.planName,
            contractName: data.contractName,
          });
        });
      });
    },
    // 编辑初始化
    async updateInit(id) {
      this.loading = true;
      await Api.sendDetail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.loading = false;
          this.title = "编辑";
          await this.formFillInPage();
          // fileList回显
          const newData = {
            ...data,
            fileList: data.fileByList ? JSON.parse(data.fileByList).fhd || [] : [], //发货单
            zczp: data.fileByList ? JSON.parse(data.fileByList).zczp || [] : [], //装车照片
            arrivalDate: dayjs(data.arrivalDate).format("YYYY-MM-DD"),
            shippingDate: dayjs(data.shippingDate).format("YYYY-MM-DD"),
          };
          this.$refs.vFormRef.setFormData(newData);

          //   form action
          this.$refs.vFormRef.setReadMode(this.type === "view");
          const detail = data.materialCirculationDetailsTableDTOS.map((x) => ({
            ...x,
            manufactureDate: dayjs(x.manufactureDate).format("YYYY-MM-DD"),
            expirationDate: x.expirationDate
              ? dayjs(x.expirationDate).format("YYYY-MM-DD")
              : "",
            supplyDate: x.supplyDate?dayjs(x.supplyDate).format("YYYY-MM-DD"):'',
            id: x.planDetailId,
            fileList01: x.fileByList ? JSON.parse(x.fileByList).hgz || [] : [], //合格证
            fileList02: x.fileByList ? JSON.parse(x.fileByList).cjbg || [] : [], //厂检报告
          }));
          this.tableData = detail;
          console.log(this.tableData, "-------this.tableData------");
          this.setSelectedItemList(this.tableData);
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
        return this.type !== "view" || this.status == 2;
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
        // const flag = this.tableData.every(
        //   (obj) => obj.sectionId === this.tableData[0].sectionId
        // );
        // if (!flag) {
        //   this.$modal.msgError("一次发货只允许选择一个需求组织（分部）的供应物资");
        //   return;
        // }
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
          //组装附件
          var fileByList = formData.fileByList ? JSON.parse(formData.fileByList) : {};
          //发货单
          if (formData.fileList.length > 0) {
            this.$set(fileByList, "fhd", formData.fileList);
          }
          //装车照片
          if (formData.zczp.length > 0) {
            this.$set(fileByList, "zczp", formData.zczp);
          }
          formData.fileByList = JSON.stringify(fileByList);
          for (var i in this.tableData) {
            var fileByList = this.tableData[i].fileByList
              ? JSON.parse(this.tableData[i].fileByList)
              : {};
            //合格证
            if (this.tableData[i].fileList01.length > 0) {
              this.$set(fileByList, "hgz", this.tableData[i].fileList01);
            }
            //厂检报告
            if (this.tableData[i].fileList02.length > 0) {
              this.$set(fileByList, "cjbg", this.tableData[i].fileList02);
            }
            this.tableData[i].fileByList = JSON.stringify(fileByList);
          }
          await Api[this.type == "create" ? "save" : "modifySend"](
            Object.assign(
              {
                planId: this.planId,
                id: this.type == "create" ? "" : this.id,
              },
              formData,
              {
                materialCirculationDetailsTableParamList: this.tableData.map((x) => ({
                  planDetailId: x.id,
                  ...x,
                })),
              }
            )
          )
            .then(({ message }) => {
              this.loading = false;
              this.$modal.msgSuccess(message);
              this.setSelectedItemList([]);
              //保存成功关闭tab，清除缓存
              this.$tab.closePage({
                path: "/scm/addSend",
                meta: {},
              });
              this.$store.dispatch("tagsView/delCachedView", { name: 'addSend' });
              this.$router.push({
                name: "sendList",
              });
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
