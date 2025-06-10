<template>
  <div class="tab-table-container">
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
        <!-- 附件 -->
        <template #file1Slot="scope">
          <el-form-item prop="fileList" label="自检单" class="label-right-align">
            <fileUpload
              v-model="scope.formModel.fileList"
              :limit="1"
              :fileSize="50"
              :fileType="['pdf']"
              :preview="true"
            />
          </el-form-item>
        </template>
        <!-- 附件 -->
        <template #file2Slot="scope">
          <el-form-item prop="fileList" label="其它资料" class="label-right-align">
            <fileUpload
              v-model="scope.formModel.fileList"
              :limit="1"
              :fileSize="50"
              :fileType="['pdf']"
              :preview="true"
            />
          </el-form-item>
        </template>
        <template #returnDetailSlot>
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
            <el-table-column prop="materialName" label="物资名称" min-width="250">
            </el-table-column>
            <el-table-column
              prop="specModel"
              label="规格型号"
              width="150"
            ></el-table-column>

            <el-table-column prop="unit" label="计量单位" width="120"></el-table-column>
            <el-table-column
              prop="planAmount"
              label="需求数量"
              width="120"
            ></el-table-column>
            <el-table-column
              prop="putTotal"
              label="本次收货数量"
              width="120"
            ></el-table-column>
            <el-table-column
              prop="packagingFm"
              label="包装形式"
              width="160"
            ></el-table-column>
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
            <el-table-column prop="projectShortName" label="合格证附件" width="200">
              <!-- <template slot-scope="scope">
          <fileUpload
            v-if="scope.row.fileList[0]"
            :value="scope.row.fileList[0].fileList"
            :limit="1"
            :fileSize="50"
          />
        </template> -->
            </el-table-column>
            <el-table-column prop="projectShortName" label="厂检报告附件" width="200">
              <!-- <template slot-scope="scope">
          <fileUpload
            v-if="scope.row.fileList[0]"
            :value="scope.row.fileList[0].fileList"
            :limit="1"
            :fileSize="50"
          />
        </template> -->
            </el-table-column>
            <el-table-column
              prop="refundTotal"
              label="退货数量"
              width="120"
            ></el-table-column>
            <el-table-column
              prop="projectShortName"
              label="退货附件"
              width="200"
            ></el-table-column>
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
import * as Api from "@/api/prodmgr-inv/project/scm.js";
import dayjs from "dayjs";
export default {
  name: "returnDetail_sh",
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
    this.init(this.id);
  },
  methods: {
    //初始化
    async init(id) {
      await Api.detailBack(id).then(({ data }) => {
        this.$nextTick(async () => {
          await this.formFillInPage();
          // fileList回显
          const newData = {
            ...data,
            fileList: (data.fileList && data.fileList[0]?.fileList) || [],
          };
          this.$refs.vFormRef.setFormData(newData);
          //   form action
          this.$refs.vFormRef.setReadMode(true);
          const detail = data.materialSupplierDetailDTOList.map((x) => ({
            ...x,
            manufactureDate: dayjs(x.manufactureDate).format("YYYY-MM-DD"),
            expirationDate: dayjs(x.expirationDate).format("YYYY-MM-DD"),
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
    },
    cancel() {
      this.$router.go(-1);
    },

    buttonShow(item) {
      return true;
    },

    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("returnDetail_sh").then((res) => {
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
