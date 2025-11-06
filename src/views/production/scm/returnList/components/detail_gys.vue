<template>
  <div class="app-container container_flex"  v-loading="loading">
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
          <el-form-item
            prop="fileList"
            label="自检单"
            class="label-right-align"
            v-if="backNode == '1'"
          >
            <fileUpload :value="scope.formModel.fileList01" :preview="true" :limit="9999" />
          </el-form-item>
          <el-form-item prop="fileList" label="检测报告" class="label-right-align" v-else>
            <fileUpload :value="scope.formModel.fileList03" :preview="true" :limit="9999" />
          </el-form-item>
        </template>
        <!-- 附件 -->
        <template #file2Slot="scope">
          <el-form-item
            prop="fileList"
            label="其他资料"
            class="label-right-align"
            v-if="backNode == '1'"
          >
            <fileUpload :value="scope.formModel.fileList02" :preview="true" :limit="9999" />
          </el-form-item>
          <el-form-item
            prop="fileList"
            label="质量证明文件"
            class="label-right-align"
            v-else
          >
            <fileUpload :value="scope.formModel.fileList04" :preview="true" :limit="9999" />
          </el-form-item>
        </template>
        <!-- 附件 -->
        <template #file3Slot="scope">
          <el-form-item
            prop="fileList"
            label="报验结果"
            class="label-right-align"
            v-if="backNode == '2'"
          >
            <fileUpload :value="scope.formModel.fileList05" :preview="true" :limit="9999" />
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
            <el-table-column prop="deptName" label="施工单位名称" min-width="200">
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
              prop="sendTotal"
              label="发货数量"
              width="120"
              align="center"
            ></el-table-column>
            <el-table-column
              :prop="backNode=='1'?'refundTotal':'refundZjTotal'"
              label="退货数量"
              width="120"
              align="center"
            ></el-table-column>
            <el-table-column prop="projectShortName" label="退货附件" width="180">
              <template slot-scope="scope">
                <fileUpload
                  :value="scope.row.fileList"
                  :preview="true"
                  :isShowTip="false"
                  :limit="9999"
                />
              </template>
            </el-table-column>
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
  name: "returnDetail_gys",
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
    backNode() {
      return this.$route.query?.backNode || "";
    },
  },
  async created() {},
  mounted() {
    this.init(this.id);
  },
  methods: {
    //初始化
    async init(id) {
      this.loading=true;
      await Api[this.backNode=='1'?'detailBack':'detailBySBack'](id).then(({ data }) => {
        this.loading=false;
        this.$nextTick(async () => {
          await this.formFillInPage();
          const newData = {
            ...data,
            issueType:this.backNode,
            backDate: data.backDate?dayjs(data.backDate).format("YYYY-MM-DD"):'',
            fileList01: data.fileByList ? JSON.parse(data.fileByList).zjd || [] : [], //自检单
            fileList02: data.fileByList ? JSON.parse(data.fileByList).qtzl || [] : [], //其他资料
            fileList03: data.fileByList ? JSON.parse(data.fileByList).jcbg || [] : [], //检测报告
            fileList04: data.fileByList ? JSON.parse(data.fileByList).zlzm || [] : [], //质量证明文件
            fileList05: data.fileByList ? JSON.parse(data.fileByList).byjg || [] : [], //报验结果
          };
          this.$refs.vFormRef.setFormData(newData);
          //   form action
          this.$refs.vFormRef.setReadMode(true);
          const detail = data.materialCirculationDetailsTableDTOS.map((x) => ({
            ...x,
            fileList: x.fileByList ? JSON.parse(x.fileByList)[this.backNode=='1'?'thfj_sh':'thfj_im'] || [] : [], //退货附件(thfj_sh收货退货的附件、thfj_im入库退货的附件)
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
        formFillInPage("returnDetail_g").then((res) => {
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
