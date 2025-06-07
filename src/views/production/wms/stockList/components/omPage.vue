<template>
  <div class="tab-table-container">
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
          <el-form-item prop="fileList" label="领料单" class="label-right-align">
            <fileUpload
              v-model="scope.formModel.fileList"
              :limit="1"
              :fileSize="50"
              :fileType="['pdf']"
              :preview="true"
            />
          </el-form-item>
        </template>
        <template #detailSlot>
          <el-table
            :data="tableData"
            border
            style="width: 100%"
            :max-height="600"
            v-loading="loading"
            ref="dataTable"
          >
            <el-table-column
              type="index"
              label="序号"
              width="55"
              align="center"
              fixed="left"
            />
            <el-table-column prop="sellerName" label="供应商" min-width="250">
            </el-table-column>
            <el-table-column prop="materialName" label="物资名称" min-width="250">
            </el-table-column>
            <el-table-column
              prop="specModel"
              label="规格型号"
              width="120"
            ></el-table-column>

            <el-table-column prop="unit" label="计量单位" width="120"></el-table-column>
            <el-table-column
              prop="planAmount"
              label="需求数量"
              width="120"
            ></el-table-column>
            <el-table-column prop="1" label="当前库存数量" width="120"></el-table-column>

            <el-table-column
              prop="manufactureDate"
              label="生产日期"
              width="150"
            ></el-table-column>
            <el-table-column
              prop="expirationDate"
              label="有效期截止日期"
              width="150"
            ></el-table-column>
            <el-table-column prop="remark" label="备注" width="200"></el-table-column>

            <el-table-column prop="1" label="仓库" width="120"></el-table-column>
            <el-table-column prop="2" label="出库数量" width="120"></el-table-column>
          </el-table>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import fileUpload from "@/components/upload";
import { getUserInfo } from "@/utils/user-info";
export default {
  name: "omPage",
  components: {
    VFormRender,
    fileUpload,
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
          buttonName: "确定",
          buttonCode: "save",
          buttonIcon: "Blue-Save",
          type: "create, update",
        },
      ],
      constructionOptions: [],
      gysOptions: [],
      tableData: [],
      selection: [],
      form: {},
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
  async created() {},
  mounted() {
    this.init();
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
      await Api.sendDetail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.title = "编辑";
          await this.formFillInPage();
          // fileList回显
          const newData = {
            ...data,
            fileList: (data.fileList && data.fileList[0]?.fileList) || [],
            arrivalDate: dayjs(data.arrivalDate).format("YYYY-MM-DD"),
            shippingDate: dayjs(data.shippingDate).format("YYYY-MM-DD"),
          };
          this.$refs.vFormRef.setFormData(newData);

          //   form action
          this.$refs.vFormRef.setReadMode(this.type === "view");

          const detail = data.materialSupplierDetailDTOList.map((x) => ({
            ...x,
            manufactureDate: dayjs(x.manufactureDate).format("YYYY-MM-DD"),
            expirationDate: dayjs(x.expirationDate).format("YYYY-MM-DD"),
            id: x.planDetailId,
          }));
          this.tableData = detail;
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
              {
                supplyId: this.type === "create" ? this.id : null,
                id: this.type === "create" ? null : this.id,
              },
              formData,
              {
                materialSupplierDetailParams: this.tableData.map((x) => ({
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
              this.$router.push({
                name: "demand",
              });
            })
            .finally((err) => {
              formData.fileList = fileList;
              this.loading = false;
            });
        }
      });
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("om").then((res) => {
          this.$refs["vFormRef"].setFormJson(res.data);

          this.$refs["vFormRef"].setFormData({
            buyer: this.buyer,
          });

          resolve(true);
        });
      });
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
