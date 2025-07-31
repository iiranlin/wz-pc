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
        <!-- 供货商/操作人 -->
        <template #supplierNameSlot="scope">
          <el-form-item
            prop="sellerName"
            label="供货商"
            class="label-right-align"
            v-if="type != 'view'"
          >
            <el-input v-model="scope.formModel.sellerName" readonly></el-input>
          </el-form-item>
          <el-form-item
            prop="createUserName"
            label="操作人"
            class="label-right-align"
            v-else
          >
            {{ scope.formModel.createUserName }}
          </el-form-item>
        </template>
        <!-- 发货日期/收货日期 -->
        <template #shippingDateSlot="scope">
          <el-form-item
            prop="shippingDate"
            label="发货日期"
            class="label-right-align"
            v-if="type != 'view'"
          >
            <el-date-picker
              v-model="scope.formModel.shippingDate"
              type="date"
              style="width: 100%"
              v-if="type != 'view'"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
              readonly
            ></el-date-picker>
          </el-form-item>
          <el-form-item prop="takeDate" label="收货时间" class="label-right-align" v-else>
            {{ scope.formModel.takeDate }}
          </el-form-item>
        </template>
        <template #file3Slot="scope">
          <el-form-item prop="fileList" label="发货单" class="label-right-align">
            <fileUpload
              v-model="scope.formModel.fileList03"
              :preview="true"
              :limit="1"
              :fileSize="50"
              :fileType="['pdf']"
            />
          </el-form-item>
        </template>
        <!-- 附件 -->
        <template #file1Slot="scope">
          <el-form-item
            v-if="type != 'view'"
            prop="fileList01"
            label="自检单"
            class="label-right-align"
            :rules="[{ required: true, message: '请上传', trigger: 'change' }]"
          >
            <fileUpload
              v-model="scope.formModel.fileList01"
              :preview="type == 'view'"
              :limit="1"
              :fileSize="500"
              :fileType="['pdf']"
              :isShowTip="false"
            />
          </el-form-item>
          <el-form-item prop="fileList" label="其它资料" class="label-right-align" v-else>
            <fileUpload
              v-model="scope.formModel.fileList02"
              :preview="type == 'view'"
              :limit="1"
              :fileSize="500"
              :fileType="['pdf']"
              :isShowTip="false"
            />
          </el-form-item>
        </template>
        <!-- 附件 -->
        <template #file2Slot="scope" v-if="type != 'view'">
          <el-form-item prop="fileList" label="其它资料" class="label-right-align">
            <fileUpload
              v-model="scope.formModel.fileList02"
              :preview="type == 'view'"
              :limit="1"
              :fileSize="500"
              :fileType="['pdf']"
              :isShowTip="false"
            />
          </el-form-item>
        </template>
        <!-- 收货时间 -->
        <template #dateSlot="scope">
          <el-form-item
            v-if="type != 'view'"
            prop="takeDate"
            label="收货时间"
            class="label-right-align"
            :rules="[{ required: true, message: '请选择收货时间', trigger: 'change' }]"
          >
            <el-date-picker
              v-model="scope.formModel.takeDate"
              type="datetime"
              :picker-options="pickerOptions"
              style="width: 100%"
              v-if="type != 'view'"
              value-format="yyyy-MM-dd HH:mm"
              format="yyyy-MM-dd HH:mm"
            ></el-date-picker>
            <span v-else>
              {{ scope.formModel.takeDate }}
            </span>
          </el-form-item>
          <el-form-item
            v-else
            prop="fileList01"
            label="自检单"
            class="label-right-align"
            :rules="[{ required: true, message: '请上传', trigger: 'change' }]"
          >
            <fileUpload
              v-model="scope.formModel.fileList01"
              :preview="type == 'view'"
              :limit="1"
              :fileSize="500"
              :fileType="['pdf']"
              :isShowTip="false"
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
              prop="sendTotal"
              label="本次发货数量"
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
              prop="field2"
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
            <el-table-column
              prop="putTotal"
              label="实收数量"
              width="120"
              fixed="right"
              align="center"
            >
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.putTotal"
                  :min="0"
                  @change="changePut(scope.row)"
                  size="mini"
                  style="width: 100%"
                  v-if="type != 'view' && show"
                ></el-input-number>
                <span v-else>
                  {{ scope.row.putTotal }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="refundTotal"
              label="退货数量"
              width="120"
              fixed="right"
              align="center"
            >
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.refundTotal"
                  :min="0"
                  size="mini"
                  style="width: 100%"
                  v-if="type != 'view' && show"
                  @change="changeRefund(scope.row)"
                ></el-input-number>
                <span v-else>
                  {{ scope.row.refundTotal }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="projectShortName"
              label="退货附件"
              width="180"
              fixed="right"
            >
              <template slot-scope="scope">
                <fileUpload
                  v-if="Number(scope.row.refundTotal) > 0"
                  :value="scope.row.fileList03"
                  v-model="scope.row.fileList03"
                  :preview="type == 'view'"
                  :isShowTip="false"
                  :limit="1"
                  :fileSize="500"
                />
              </template>
            </el-table-column>
          </el-table>
        </template>
      </VFormRender>
    </div>
      <toBeReviewed ref="toBereview" />
  </div>
</template>

<script>
import Vue from "vue";
import * as Api from "@/api/prodmgr-inv/project/receive.js";
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import fileUpload from "@/components/upload";
import { getUserInfo } from "@/utils/user-info";
import dayjs from "dayjs";
import toBeReviewed from "@/views/audit/components/toBeReviewed";
export default {
  name: "receivePage",
  components: {
    VFormRender,
    fileUpload,
    toBeReviewed,
  },
  data() {
    const userInfo = getUserInfo();
    return {
      approvalStatus:"",
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
        { buttonName: "通过", buttonCode: "pass", buttonIcon: "Blue-AddSon", type: "" },
        {
          buttonName: "驳回",
          buttonCode: "reject",
          buttonIcon: "Blue-EditCard",
          type: "",
        },
        {
          buttonName: "提交入库审核",
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
      shippingDate: "", //发货时间
      pickerOptions: {
        disabledDate: (time) => {
          var nowDate = new Date().getTime();
          return (
            time.getTime() > nowDate || time.getTime() < this.shippingDate - 28800000
          );
        },
      },
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
    takeStatus(){
      return this.$route.query?.takeStatus ;
    },
    queryAuditArr() {
      return JSON.parse(this.$route.query.auditArr || "[]");
    },
    name() {
      return this.$route.query?.name || "";
    },
  },
  async created() {},
  mounted() {
    this.init(this.id);
    if (this.type == "view") {
      this.$nextTick(() => {
        this.$tab.updatePage({
          path: "/receive/receivePage",
          meta: {
            title: "收货详情",
          },
        });
      });
    }
  },
  methods: {
    getDate() {
      let now = new Date();
      // 获取年、月、日
      let year = now.getFullYear();
      let month = now.getMonth() + 1;
      month = month < 10 ? "0" + month : month;
      let day = now.getDate();
      day = day < 10 ? "0" + day : day;
      const hour = now.getHours();
      const minute = now.getMinutes();
      var date = year + "-" + month + "-" + day + " " + hour + ":" + minute;
      return date;
    },

    //初始化
    init(id) {
      this.$nextTick(async () => {
        this.loading = true;
        const api = this.takeStatus == 5 || this.takeStatus == void 0 ? 'detailTakeBack' : 'detailTake';
        await Api[api](id).then(({ data }) => {
          this.approvalStatus = data.approvalStatus;
          this.$nextTick(async () => {
            this.loading = false;
            await this.formFillInPage();
            if (this.type == "create") {
              //收货的时候默认本机日期
              data.takeDate = this.getDate();
              this.shippingDate = data.shippingDate;
              console.log(
                this.shippingDate,
                "--------------this.shippingDate-------------"
              );
              data.shippingDate = dayjs(data.shippingDate).format("YYYY-MM-DD");
            } else {
              data.takeDate = dayjs(data.takeDate).format("YYYY-MM-DD HH:mm");
            }
            // fileList回显
            const newData = {
              ...data,
              fileList01: data.fileByList ? JSON.parse(data.fileByList).zjd || [] : [], //自检单
              fileList02: data.fileByList ? JSON.parse(data.fileByList).qtzl || [] : [], //其他资料
              fileList03: data.fileByList ? JSON.parse(data.fileByList).fhd || [] : [], //发货单
            };
            this.$refs.vFormRef.setFormData(newData);
            this.$refs.vFormRef.setReadMode(this.type === "view");
            const detail = data.materialCirculationDetailsTableDTOS.map((x) => ({
              ...x,
              manufactureDate: dayjs(x.manufactureDate).format("YYYY-MM-DD"),
              expirationDate: x.expirationDate
                ? dayjs(x.expirationDate).format("YYYY-MM-DD")
                : "",
              supplyDate: x.supplyDate?dayjs(x.supplyDate).format("YYYY-MM-DD"):'',
              putTotal: this.type == "create" ? x.sendTotal : x.putTotal, //新建默认实收数量=发货数量
              fileList01: x.fileByList ? JSON.parse(x.fileByList).hgz || [] : [], //合格证
              fileList02: x.fileByList ? JSON.parse(x.fileByList).cjbg || [] : [], //厂检报告
              fileList03: x.fileByList ? JSON.parse(x.fileByList).thfj_sh || [] : [], //退货附件
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
      if (buttonCode === "pass") {
        this.$refs.toBereview.init("pass", this.queryAuditArr, this.name);
        return
      }
      if (buttonCode === "reject") {
        this.$refs.toBereview.init("reject", this.queryAuditArr, this.name);
        return
      }
    },
    cancel() {
      this.$router.go(-1);
    },

    buttonShow(item) {
      if (item.buttonCode === "save") {
        return this.type !== "view";
      }
       // 审核中才能显示同意和不同意按钮
      if (item.buttonCode === "pass" || item.buttonCode === "reject") {
        if(['toBeDeal','handle'].includes(this.name)){
          return false
        }
        if(this.takeStatus == 5){
          return false
        }
        // 2 审核中  0已驳回 3审核通过
        return this.approvalStatus == "2";
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
          //自检单
          if (formData.fileList01.length > 0) {
            this.$set(fileByList, "zjd", formData.fileList01);
          }
          //其他资料
          if (formData.fileList02.length > 0) {
            this.$set(fileByList, "qtzl", formData.fileList02);
          }
          formData.fileByList = JSON.stringify(fileByList);
          for (var i in this.tableData) {
            var fileByList = this.tableData[i].fileByList
              ? JSON.parse(this.tableData[i].fileByList)
              : {};
            //退货附件
            if (this.tableData[i].fileList03.length > 0) {
              this.$set(fileByList, "thfj_sh", this.tableData[i].fileList03);
            }
            this.tableData[i].fileByList = JSON.stringify(fileByList);
          }
          formData.takeDate = new Date(formData.takeDate).toISOString();

          this.$modal.confirm("是否确认提交审核?").then(() => {
            this.$reviewerDialog({
              type: "SH",
              multiple: false,
              success: async (assignee) => {
                this.loading = true;
                await Api.submitTodo(
                  Object.assign(
                    {
                      id: this.id,
                      planType: "SH",
                      assignee,
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
                    this.loading = false;
                  });
              },
            });
          });
           
        }
      });
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("receive").then((res) => {
          this.$refs["vFormRef"].setFormJson(res.data);

          this.$refs["vFormRef"].setFormData({
            buyer: this.buyer,
          });

          resolve(true);
        });
      });
    },
    //填写实收数量
    changePut(row) {
      //收货不能超过发货，最终算出退货
      if (Number(row.putTotal) > Number(row.sendTotal)) {
        this.$modal.msgError("实收数量不能大于发货数量！");
        row.putTotal = row.sendTotal;
        console.log(row.putTotal, "======row.putTotal====");
      } else {
        row.refundTotal = Number(row.sendTotal) - Number(row.putTotal);
      }
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },
    //填写退货数量
    changeRefund(row) {
      //退货不能超过发货，最终算出收货
      if (Number(row.refundTotal) > Number(row.sendTotal)) {
        this.$modal.msgError("退货数量不能大于发货数量！");
        row.refundTotal = Number(row.sendTotal) - Number(row.putTotal);
      } else {
        row.putTotal = Number(row.sendTotal) - Number(row.refundTotal);
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
