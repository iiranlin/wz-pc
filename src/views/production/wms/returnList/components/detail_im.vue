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
        <!-- 附件 -->
        <template #file1Slot="scope">
          <el-form-item prop="fileList" label="检测报告" class="label-right-align">
            <fileUpload :value="scope.formModel.fileList01" :preview="true" />
          </el-form-item>
        </template>
        <!-- 附件 -->
        <template #file2Slot="scope">
          <el-form-item prop="fileList" label="质量证明文件" class="label-right-align">
            <fileUpload :value="scope.formModel.fileList02" :preview="true" />
          </el-form-item>
        </template>
        <!-- 附件 -->
        <template #file3Slot="scope">
          <el-form-item prop="fileList" label="报验结果" class="label-right-align">
            <fileUpload :value="scope.formModel.fileList03" :preview="true" />
          </el-form-item>
        </template>
        <template #returnDetailSlot>
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
            <el-table-column prop="materialName" label="物资名称" width="200">
            </el-table-column>
            <el-table-column
              prop="specModel"
              label="规格型号"
              width="200"
            ></el-table-column>
            <el-table-column
              prop="unit"
              label="计量单位"
              width="120"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="planAmount"
              label="需求数量"
              width="120"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="putTotal"
              label="本次收货数量"
              width="120"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="packagingFm"
              label="包装形式"
              width="160"
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
              prop="addr"
              label="使用地点"
              width="200"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="receivingAddress"
              label="收货地址"
              width="200"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="supplyDate"
              label="供应时间"
              width="160"
              align="center"
            ></el-table-column>

            <el-table-column
              prop="receiver"
              label="收货人及联系方式"
              width="180"
            ></el-table-column>
            <el-table-column
              prop="field0"
              label="投资方"
              width="150"
              align="center"
            ></el-table-column>
            <el-table-column prop="field1" label="投资比例" width="150"></el-table-column>
            <el-table-column prop="projectShortName" label="合格证附件" width="200">
              <template slot-scope="scope">
                <fileUpload
                  :value="scope.row.fileList01"
                  :preview="true"
                  :isShowTip="false"
                />
              </template>
            </el-table-column>
            <el-table-column prop="projectShortName" label="厂检报告附件" width="200">
              <template slot-scope="scope">
                <fileUpload
                  :value="scope.row.fileList02"
                  :preview="true"
                  :isShowTip="false"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="refundTotal"
              label="退货数量"
              width="120"
              align="center"
            ></el-table-column>
            <el-table-column prop="projectShortName" label="退货附件" width="200">
              <template slot-scope="scope">
                <fileUpload
                  :value="scope.row.fileList03"
                  :preview="true"
                  :isShowTip="false"
                />
              </template>
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
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import fileUpload from "@/components/upload";
import { getUserInfo } from "@/utils/user-info";
import * as Api from "@/api/prodmgr-inv/project/scm.js";
export default {
  name: "returnDetail_im",
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
    this.init();
  },
  methods: {
    //初始化
    async init(id) {
      this.loading = true;
      await Api.detailBack(id).then(({ data }) => {
        this.loading = false;
        this.$nextTick(async () => {
          await this.formFillInPage();
          const newData = {
            ...data,
            fileList01: data.fileByList ? JSON.parse(data.fileByList).jcbg || [] : [], //检测报告
            fileList02: data.fileByList ? JSON.parse(data.fileByList).zlzm || [] : [], //质量证明文件
            fileList03: data.fileByList ? JSON.parse(data.fileByList).byjg || [] : [], //报验结果
          };
          this.$refs.vFormRef.setFormData(newData);
          //   form action
          this.$refs.vFormRef.setReadMode(true);
          const detail = data.materialSupplierDetailDTOList.map((x) => ({
            ...x,
            manufactureDate: dayjs(x.manufactureDate).format("YYYY-MM-DD"),
            expirationDate: dayjs(x.expirationDate).format("YYYY-MM-DD"),
            fileList01: x.fileByList ? JSON.parse(x.fileByList).hgz || [] : [], //合格证
            fileList02: x.fileByList ? JSON.parse(x.fileByList).cjbg || [] : [], //厂检报告
            fileList03: x.fileByList ? JSON.parse(x.fileByList).thfj_im || [] : [], //退货附件
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
        formFillInPage("returnDetail_im").then((res) => {
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
