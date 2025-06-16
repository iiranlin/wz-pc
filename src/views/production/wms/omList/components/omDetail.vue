<template>
  <div class="app-container container_flex" v-loading="loading">
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
            ref="dataTable"
          >
            <el-table-column
              type="index"
              label="序号"
              width="55"
              align="center"
              fixed="left"
            />
            <el-table-column prop="sellerName" label="供应商" min-width="200">
            </el-table-column>
            <el-table-column prop="materialName" label="物资名称" min-width="200">
            </el-table-column>
            <el-table-column
              prop="specModel"
              label="规格型号"
              width="200"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="unit"
              label="计量单位"
              width="120"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="manufactureDate"
              label="生产日期"
              width="150"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="expirationDate"
              label="有效期截止日期"
              width="150"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="outTotal"
              label="本次出库数量"
              width="120"
              align="center"
            >
            </el-table-column>
            <el-table-column prop="remark" label="备注" width="200"></el-table-column>
          </el-table>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import * as Api from "@/api/prodmgr-inv/project/wms.js";
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import fileUpload from "@/components/upload";
import { getUserInfo } from "@/utils/user-info";
import dayjs from "dayjs";
export default {
  name: "omDetail",
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
      ],
      constructionOptions: [],
      gysOptions: [],
      tableData: [],
      selection: [],
      form: {},
      show: true,
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
    this.init(this.id);
  },
  methods: {
    //初始化
    init(id) {
      this.loading = true;
      this.$nextTick(async () => {
        await Api.outDetail(id).then(({ data }) => {
          this.loading = false;
          this.$nextTick(async () => {
            await this.formFillInPage();
            // fileList回显
            const newData = {
              ...data,
              fileList: data.fileByList ? JSON.parse(data.fileByList).lld || [] : [], //领料单
            };
            this.$refs.vFormRef.setFormData(newData);
            this.$refs.vFormRef.setReadMode(true);
            const detail = data.materialSupplierOutDetailDTOS.map((x) => ({
              ...x,
              manufactureDate: dayjs(x.manufactureDate).format("YYYY-MM-DD"),
              expirationDate: x.expirationDate?dayjs(x.expirationDate).format("YYYY-MM-DD"):'',
            }));
            this.tableData = detail;
          });
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
      return true;
    },

    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("omDetail").then((res) => {
          this.$refs["vFormRef"].setFormJson(res.data);

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
<style>
.highlight-row-red {
  color: red;
}
</style>
