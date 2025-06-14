<template>
  <div class="app-container container_flex" v-loading="loading">
    <button-top
      :buttonTopData="buttonTop"
      :buttonShow="buttonShow"
      @newButton="newButton"
    ></button-top>
    <div :class="{ container_flex_form: type === 'view' || preview }">
      <VFormRender
        :form-json="formJson"
        :form-data="formData"
        :option-data="optionData"
        ref="vFormRef"
        :global-dsv="globalDsv"
        :class="{ formRender_view: type === 'view' || preview }"
      >
        <!-- 附件 -->
        <template #fileSlot="scope">
          <el-form-item
            prop="fileList"
            label="领料单"
            class="label-right-align"
            :rules="[{ required: true, message: '请上传', trigger: 'change' }]"
          >
            <fileUpload
              v-model="scope.formModel.fileList"
              :preview="type == 'view' || preview"
              :limit="1"
              :fileSize="200"
              :isShowTip="false"
            />
          </el-form-item>
        </template>
        <template #detailSlot>
          <div class="flex">
            <span class="title">
              物资明细 共{{ tableData.length }}
              项）
            </span>
            <el-input
              v-if="type != 'view' && !preview"
              v-model="materialName"
              placeholder="请输入物资名称"
              style="width: 300px"
            >
              <el-button slot="append" icon="el-icon-search"></el-button
            ></el-input>
          </div>
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
            <el-table-column prop="sellerName" label="供应商" width="200">
            </el-table-column>
            <el-table-column prop="materialName" label="物资名称" width="200">
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
              label="需求数量"
              width="120"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="storeTotal"
              label="当前库存数量"
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
            <el-table-column prop="outTotle" label="出库数量" width="150" align="center" fixed="right">
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.outTotle"
                  :min="0"
                  :max="scope.row.storeTotal||0"
                  size="mini"
                  style="width: 100%"
                  v-if="type != 'view' && !preview"
                ></el-input-number>
                <span v-else>
                  {{ scope.row.outTotle }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" width="200" fixed="right">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.remark"
                  size="mini"
                  style="width: 100%"
                  v-if="type != 'view' && !preview"
                ></el-input>
                <span v-else>
                  {{ scope.row.remark }}
                </span>
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
import * as Api from "@/api/prodmgr-inv/project/wms.js";
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import fileUpload from "@/components/upload";
import { getUserInfo } from "@/utils/user-info";
import dayjs from "dayjs";
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
          buttonName: "预览",
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
      materialName: "",
      preview: false, //出库页还是预览页
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
  watch: {
    preview: {
      handler(newVal) {
        if (newVal) {
          this.buttonTop[1].buttonName = "确定";
          this.$refs.vFormRef.setReadMode(true);
        } else {
          this.buttonTop[1].buttonName = "预览";
          this.$refs.vFormRef.setReadMode(false);
        }
      },
    },
  },
  async created() {},
  mounted() {
    this.init(this.id);
  },
  methods: {
    //初始化
    init(id) {
      this.loading=true;
      this.$nextTick(async () => {
        await Api.detailOut(id).then(({ data }) => {
          this.loading=false;
          this.$nextTick(async () => {
            await this.formFillInPage();
            this.$refs.vFormRef.setFormData({
              sectionName: data.sectionName,
              planName: data.planName,
              deptName: data.deptName,
            });
            const detail = data.details.map((x) => ({
              ...x,
              manufactureDate: dayjs(x.manufactureDate).format("YYYY-MM-DD"),
              expirationDate: dayjs(x.expirationDate).format("YYYY-MM-DD"),
              outTotle: x.storeTotal, //默认出库数量=库存数量
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
      if (buttonCode === "save") {
        this.handleCreate();
        return;
      }
    },
    cancel() {
      if (this.preview) {
        this.preview = false;
      } else {
        this.$router.go(-1);
      }
    },

    buttonShow(item) {
      if (item.buttonCode === "save") {
        return this.type !== "view";
      }
      return true;
    },
    //新建
    async handleCreate() {
      console.log(this.preview, "=====this.preview====");
      if (!this.preview) {
        //进行预览
        this.$refs.vFormRef.validateForm(async (valid) => {
          if (!valid) {
            this.$message.warning("请完善信息");
            return;
          }
          const flag = this.tableData.every(item => !item.outTotle);
           if (flag) {
            this.$message.error("未选择出库物资！");
            return;
          }
          this.preview = !this.preview;
        });
      } else {
        const formData = await this.$refs.vFormRef.getFormData();
        //组装附件
        var fileByList = formData.fileByList ? JSON.parse(formData.fileByList) : {};
        //领料单
        if (formData.fileList.length > 0) {
          this.$set(fileByList, "lld", formData.fileList);
        }

        formData.fileByList = JSON.stringify(fileByList);
        this.loading=true;
        Api.outSave(
          Object.assign(
            {
              id: this.id,
            },
            formData,
            {
              materialSupplierOutDetailParams: this.tableData.map((x) => ({
                ...x,
              })),
            }
          )
        )
          .then(({ message }) => {
            this.loading = false;
            this.$modal.msgSuccess(message);
            this.$router.go(-1);
          })
          .finally((err) => {
            this.loading = false;
          });
      }
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("om").then((res) => {
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
