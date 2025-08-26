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
            <el-table-column prop="sellerName" label="供应商名称" min-width="200">
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
              width="100"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="planAmount"
              label="本次计划数量"
              width="120"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="storeTotal"
              label="累计入库数量"
              width="120"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="stockStatus"
              label="当前库存"
              width="120"
              align="center"
            ></el-table-column>
          </el-table>
        </template>
          <!-- 附件 -->
        <template #fileListSlot="scope">
          <el-form-item
            prop="fileList"
            label="计划附件"
            class="label-right-align"
          >
            <fileUpload
              v-model="scope.formModel.fileList"
              :limit="1"
              :preview="type === 'view' "
              :isShowTip="false"
              :fileType="['pdf','jpg','png','jpeg']"
            />
          </el-form-item>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import * as Api from "@/api/prodmgr-inv/project/scm.js";
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import fileUpload from "@/components/upload";
import { getUserInfo } from "@/utils/user-info";
import dayjs from "dayjs";
import {findByBusinessType} from '@/utils/index.js'
export default {
  name: "stockDetail",
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
    this.updateInit();
  },
  methods: {
    // 编辑初始化
    async updateInit() {
      this.loading = true;
      await Api.detailGyMx({ id: this.id }).then(({ data }) => {
        this.loading = false;
        this.$nextTick(async () => {
          await this.formFillInPage();
          const newData = {
            ...data,
           fileList :findByBusinessType(data.fileList,'54'),
          };
          this.$refs.vFormRef.setFormData(newData);
          this.$refs.vFormRef.setReadMode(true);
          const detail = data.demandPlanDetailsGyDTOList.map((x) => ({
            ...x,
            manufactureDate: x.manufactureDate
              ? dayjs(x.manufactureDate).format("YYYY-MM-DD")
              : "",
            expirationDate: x.expirationDate
              ? dayjs(x.expirationDate).format("YYYY-MM-DD")
              : "",
          }));
          this.tableData = detail;
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
    handleCreate() {},
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("stockDetail").then((res) => {
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
