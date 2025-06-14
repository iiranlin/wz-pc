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
        <template #file1Slot="scope">
          <el-form-item
            prop="fileList01"
            label="检测报告"
            class="label-right-align"
            :rules="[{ required: true, message: '请上传', trigger: 'change' }]"
          >
            <fileUpload
              v-model="scope.formModel.fileList01"
              :value="scope.formModel.fileList01"
              :preview="type == 'view'"
              :limit="1"
              :fileSize="200"
              :fileType="['pdf']"
              :isShowTip="false"
            />
          </el-form-item>
        </template>
        <!-- 附件 -->
        <template #file2Slot="scope">
          <el-form-item
            prop="fileList02"
            label="质量证明文件"
            class="label-right-align"
            :rules="[{ required: true, message: '请上传', trigger: 'change' }]"
          >
            <fileUpload
              v-model="scope.formModel.fileList02"
              :value="scope.formModel.fileList02"
              :preview="type == 'view'"
              :limit="1"
              :fileSize="200"
              :fileType="['pdf']"
              :isShowTip="false"
            />
          </el-form-item>
        </template>
        <!-- 附件 -->
        <template #file3Slot="scope">
          <el-form-item
            prop="fileList03"
            label="报验结果"
            class="label-right-align"
            :rules="[{ required: true, message: '请上传', trigger: 'change' }]"
          >
            <fileUpload
              v-model="scope.formModel.fileList03"
              :value="scope.formModel.fileList03"
              :preview="type == 'view'"
              :limit="1"
              :fileSize="200"
              :fileType="['pdf']"
              :isShowTip="false"
            />
          </el-form-item>
        </template>
        <!-- 详情页显示入库时间 -->
        <template #dateSlot="scope">
          <el-form-item label="入库时间" class="label-right-align" v-if="type == 'view'">
            {{ scope.formModel.storeDate }}
          </el-form-item>
        </template>
        <!-- 详情页显示操作人 -->
        <template #storeOperatorSlot="scope">
          <el-form-item label="操作人" class="label-right-align" v-if="type == 'view'">
            {{ scope.formModel.storeOperator }}
          </el-form-item>
        </template>
        <template #detailSlot>
          <el-table
            :data="tableData"
            border
            style="width: 100%"
            :max-height="600"
            ref="dataTable"
            :row-class-name="tableRowClassName"
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
              align="center"
            ></el-table-column>
            <el-table-column
              prop="field0"
              label="投资方"
              width="150"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="field1"
              label="投资比例"
              width="150"
              align="center"
            ></el-table-column>
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
            <el-table-column prop="remark" label="备注" width="200"></el-table-column>
            <el-table-column prop="storeTotal" label="入库数量" width="150" align="right">
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.storeTotal"
                  :min="0"
                  @change="changePut(scope.row)"
                  size="mini"
                  style="width: 100%"
                  v-if="type != 'view' && show"
                ></el-input-number>
                <span v-else>
                  {{ scope.row.storeTotal }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="refundTotal"
              label="退货数量"
              width="150"
              align="right"
            >
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.refundTotal"
                  :min="0"
                  @change="changeRefund(scope.row)"
                  size="mini"
                  style="width: 100%"
                  v-if="type != 'view' && show"
                ></el-input-number>
                <span v-else>
                  {{ scope.row.refundTotal }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="projectShortName"
              label="退货附件"
              width="250"
              align="right"
            >
              <template slot-scope="scope">
                <fileUpload
                  :value="scope.row.fileList03"
                  v-model="scope.row.fileList03"
                  :preview="type == 'view'"
                  :isShowTip="false"
                  :limit="1"
                  :fileSize="200"
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
import * as Api from "@/api/prodmgr-inv/project/wms.js";
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import fileUpload from "@/components/upload";
import { getUserInfo } from "@/utils/user-info";
import dayjs from "dayjs";
export default {
  name: "imPage",
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
    supplyId() {
      return this.$route.query?.supplyId || "";
    },
  },
  async created() {},
  mounted() {
    this.init(this.id);
    if (this.type == "view") {
      this.$nextTick(() => {
        this.$tab.updatePage({
          path: "/wms/imPage",
          meta: {
            title: "入库详情",
          },
        });
      });
    }
  },
  methods: {
    //初始化
    init(id) {
      this.loading = true;
      this.$nextTick(async () => {
        await Api.detailStore(id).then(({ data }) => {
          this.loading = false;
          this.$nextTick(async () => {
            await this.formFillInPage();
            this.$refs.vFormRef.setReadMode(true);
            const newData = {
              ...data,
              fileList01: data.fileByList ? JSON.parse(data.fileByList).jcbg || [] : [], //检测报告
              fileList02: data.fileByList ? JSON.parse(data.fileByList).zlzm || [] : [], //证明文件
              fileList03: data.fileByList ? JSON.parse(data.fileByList).byjg || [] : [], //报验结果
            };
            this.$refs.vFormRef.setFormData(newData);
            this.$refs.vFormRef.setReadMode(true);
            const detail = data.materialCirculationDetailsTableDTOS.map((x) => ({
              ...x,
              manufactureDate: dayjs(x.manufactureDate).format("YYYY-MM-DD"),
              expirationDate: x.expirationDate
                ? dayjs(x.expirationDate).format("YYYY-MM-DD")
                : "",
              storeTotal: this.type == "create" ? x.putTotal : x.storeTotal, //新增默认入库数量=收货数量
              fileList01: x.fileByList ? JSON.parse(x.fileByList).hgz || [] : [], //合格证
              fileList02: x.fileByList ? JSON.parse(x.fileByList).cjbg || [] : [], //厂检报告
              fileList03: x.fileByList ? JSON.parse(x.fileByList).thfj_im || [] : [], //退货附件
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
      this.$router.go(-1);
    },

    buttonShow(item) {
      if (item.buttonCode === "save") {
        return this.type !== "view";
      }
      return true;
    },
    onCheck(tableData) {
      const errors = [];
      console.log(tableData, "=============tableData");
      tableData.forEach((row, index) => {
        const rowNum = index + 1;
        if (Number(row.refundTotal) > 0 && row.fileList03.length == 0) {
          errors.push(`第${rowNum}行，有退货数量，请上传退货附件 `);
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
    //新建
    handleCreate() {
      this.$refs.vFormRef.validateForm(async (valid) => {
        if (!valid) {
          this.$message.warning("请完善信息");
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
          //检测报告
          if (formData.fileList01.length > 0) {
            this.$set(fileByList, "jcbg", formData.fileList01);
          }
          //质量证明文件
          if (formData.fileList02.length > 0) {
            this.$set(fileByList, "zlzm", formData.fileList02);
          }
          //报验结果
          if (formData.fileList03.length > 0) {
            this.$set(fileByList, "byjg", formData.fileList03);
          }
          formData.fileByList = JSON.stringify(fileByList);
          for (var i in this.tableData) {
            var fileByList = this.tableData[i].fileByList
              ? JSON.parse(this.tableData[i].fileByList)
              : {};
            //退货附件
            if (this.tableData[i].fileList03.length > 0) {
              this.$set(fileByList, "thfj_im", this.tableData[i].fileList03);
            }
            this.tableData[i].fileByList = JSON.stringify(fileByList);
          }
          await Api.saveStore(
            Object.assign(
              {
                supplyId: this.supplyId,
                id: this.id,
              },
              formData,
              {
                materialCirculationDetailsTableParamList: this.tableData.map((x) => ({
                  ...x,
                })),
              }
            )
          )
            .then(({ message }) => {
              this.loading = false;
              this.$modal.msgSuccess(message);

              this.cancel();
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
        formFillInPage("im").then((res) => {
          this.$refs["vFormRef"].setFormJson(res.data);

          this.$refs["vFormRef"].setFormData({
            buyer: this.buyer,
          });

          resolve(true);
        });
      });
    },
    //填写入库数量putTotal
    changePut(row) {
      //入库不能超过收货，最终算出退货
      if (Number(row.storeTotal) > Number(row.putTotal)) {
        this.$modal.msgError("入库数量不能大于收货数量！");
        row.storeTotal = row.putTotal;
      } else {
        row.refundTotal = Number(row.putTotal) - Number(row.storeTotal);
      }
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },
    //填写退货数量
    changeRefund(row) {
      //退货不能超过收货，最终算出入库
      if (Number(row.refundTotal) > Number(row.putTotal)) {
        this.$modal.msgError("退货数量不能大于收货数量！");
        row.refundTotal = Number(row.putTotal) - Number(row.storeTotal);
      } else {
        row.storeTotal = Number(row.putTotal) - Number(row.refundTotal);
      }
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },
    //有效期不足30天变红色
    tableRowClassName({ row, rowIndex }) {
      var time = 30 * 24 * 60 * 60 * 1000;
      var dateTime = new Date(row.expirationDate).getTime();
      const timestamp = new Date().getTime();
      if (Number(dateTime) - Number(timestamp) < time) {
        return "highlight-row-red";
      }
      return "";
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
