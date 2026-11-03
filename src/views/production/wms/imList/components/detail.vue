<template>
  <div class="app-container container_flex" v-loading="loading">
    <button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
    <div :class="{ container_flex_form: true }">
      <VFormRender :form-json="formJson" :form-data="formData" :option-data="optionData" ref="vFormRef"
        :global-dsv="globalDsv" :class="{ formRender_view: true }">
        <!-- 附件 -->
        <template #file1Slot="scope">
          <el-form-item prop="fileList01" label-width="200px" label="报检材料上传（支持多个）" class="label-right-align">
            <fileUpload v-model="scope.formModel.fileList01" :value="scope.formModel.fileList01" :preview="true"
              :limit="9999" />
          </el-form-item>
        </template>
        <!-- 入库单 -->
       	<template #rkdFileSlot="scope">
						<el-form-item prop="rkd" label="入库单附件" label-width="200px" class="label-right-align">
							<fileUpload v-model="scope.formModel.rkd" :value="scope.formModel.rkd" :limit="9999"
								:multiple="true" :fileSize="500" :fileType="['pdf', 'jpg', 'png', 'jpeg']"
								:isShowTip="false" :preview="true" />
						</el-form-item>
					</template>
        <!-- 附件 -->
        <template #file2Slot="scope">
          <ShippingAttachments :field-key="scope.shippingAttachmentKey" :model="scope.formModel" group="quality" quality-prop="fileList02" :preview="true" />
        </template>
        <!-- 附件 -->
        <template #file3Slot="scope">
          <el-form-item prop="fileList03" label="报验结果" class="label-right-align">
            <fileUpload v-model="scope.formModel.fileList03" :value="scope.formModel.fileList03" :preview="true"
              :limit="9999" />
          </el-form-item>
        </template>
        <template #detailSlot>
          <el-table :data="tableData" border style="width: 100%" max-height="350" ref="dataTable"
            :row-class-name="tableRowClassName">
            <el-table-column type="index" label="序号" width="55" align="center" fixed="left"  show-overflow-tooltip/>
            <el-table-column prop="sellerName" label="供应商" width="250" align="center" show-overflow-tooltip fixed></el-table-column>
            
            <el-table-column prop="materialName" label="物资名称" width="200" show-overflow-tooltip fixed>
            </el-table-column>
            <el-table-column prop="specModel" label="规格型号" width="200" show-overflow-tooltip></el-table-column>

            <el-table-column prop="unit" label="计量单位" width="120" align="center" show-overflow-tooltip></el-table-column>
            <el-table-column prop="planAmount" label="需求数量" width="120" align="center" show-overflow-tooltip></el-table-column>
            <el-table-column prop="putTotal" label="本次实收数量" width="120" align="center" show-overflow-tooltip></el-table-column>
            <el-table-column prop="packagingFm" label="包装形式" width="160" align="center" show-overflow-tooltip></el-table-column>
            <el-table-column prop="manufactureDate" label="生产日期" width="150" align="center" show-overflow-tooltip></el-table-column>
            <el-table-column prop="expirationDate" label="有效期截止日期" width="150" align="center" show-overflow-tooltip></el-table-column>
            <el-table-column prop="addr" label="使用地点" width="200" align="center" show-overflow-tooltip></el-table-column>
            <el-table-column prop="field2" label="收货地址" width="200" show-overflow-tooltip></el-table-column>
            <el-table-column prop="supplyDate" label="计划使用时间" width="160" align="center" show-overflow-tooltip></el-table-column>

            <el-table-column prop="receiver" label="收货人及联系方式" width="180" show-overflow-tooltip></el-table-column>
            <el-table-column prop="field0" label="投资方" width="150" align="center" show-overflow-tooltip></el-table-column>
            <el-table-column prop="field1" label="投资比例" width="150" align="center" show-overflow-tooltip></el-table-column>
            <el-table-column prop="projectShortName" label="合格证附件" width="200" show-overflow-tooltip>
              <template slot-scope="scope">
                <fileUpload :value="scope.row.fileList01" :preview="true" :isShowTip="false" :limit="9999" />
              </template>
            </el-table-column>
            <el-table-column prop="projectShortName" label="厂检报告附件" width="200" show-overflow-tooltip>
              <template slot-scope="scope">
                <fileUpload :value="scope.row.fileList02" :preview="true" :isShowTip="false" :limit="9999" />
              </template>
            </el-table-column>
            <el-table-column prop="storeTotal" label="入库数量" width="120" align="center" show-overflow-tooltip>
            </el-table-column>
            <el-table-column prop="refundZjTotal" label="退货数量" width="120" align="center" show-overflow-tooltip>
            </el-table-column>
            <el-table-column prop="projectShortName" label="退货附件" width="200" show-overflow-tooltip>
              <template slot-scope="scope">
                <fileUpload :value="scope.row.fileList03" v-model="scope.row.fileList03" :preview="true"
                  :isShowTip="false" :limit="9999" />
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" width="200" show-overflow-tooltip></el-table-column>
          </el-table>
        </template>
      </VFormRender>
      <toBeReviewed ref="toBereview" />
      <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
    </div>
  </div>
</template>

<script>
import ShippingAttachments from "@/components/shipping-attachments";
import { prepareShippingAttachmentLayout, initShippingAttachments, readShippingAttachments } from "@/utils/shipping-attachments";
import Vue from "vue";
import * as Api from "@/api/prodmgr-inv/project/wms.js";
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import fileUpload from "@/components/upload";
import { getUserInfo } from "@/utils/user-info";
import toBeReviewed from "@/views/audit/components/toBeReviewed";
import dayjs from "dayjs";
import workFlowView from '@/components/workFlowView'
export default {
  name: "imDetail",
  components: {
    ShippingAttachments,
    VFormRender,
    fileUpload,
    toBeReviewed,
    workFlowView
  },
  data() {
    const userInfo = getUserInfo();
    return {
      selectedRow: null,
      workFlowViewVisible: false,
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
        // {
        //   buttonName: "修改后同意",
        //   buttonCode: "passEdit",
        //   buttonIcon: "Blue-Edit",
        //   type: "",
        // },
        { buttonName: '退回上一步', buttonCode: 'rollbackToPrevious', buttonIcon: 'Blue-Cancel', type: '' },
        {
          buttonName: "驳回",
          buttonCode: "reject",
          buttonIcon: "Blue-EditCard",
          type: "",
        },
        { buttonName: '修改', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
        { buttonName: '流程查看', buttonCode: 'flowSee', buttonIcon: 'Blue-Flow', type: '' }

      ],
      constructionOptions: [],
      gysOptions: [],
      tableData: [],
      selection: [],
      form: {},
      show: true,
      storeStatus: "",
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
    queryAuditArr() {
      return JSON.parse(this.$route.query.auditArr || "[]");
    },
    name() {
      return this.$route.query?.name || "";
    },
  },
  async created() { },
  mounted() {
    this.init(this.id);
  },
  methods: {
    //初始化
    init(id) {
      this.loading = true;
      this.$nextTick(async () => {
        await Api.detailStoreBack(id).then(({ data }) => {
          this.loading = false;
          this.storeStatus = data.storeStatus;
          this.$nextTick(async () => {
            await this.formFillInPage();
            // fileList回显
            const newData = {
              ...data,
              storeDate: data.storeDate ? dayjs(data.storeDate).format("YYYY-MM-DD") : "",
              fileList01: data.fileByList ? JSON.parse(data.fileByList).jcbg || [] : [], //检测报告
              ...readShippingAttachments(data.fileByList, "fileList02", "zlzm"),
              fileList03: data.fileByList ? JSON.parse(data.fileByList).byjg || [] : [], //报验结果
              rkd: data.fileByList ? JSON.parse(data.fileByList).rkd || [] : [], //入库单
            };
            this.$refs.vFormRef.setFormData(newData);
            this.$refs.vFormRef.setReadMode(true);
            const detail = data.materialCirculationDetailsTableDTOS.map((x) => ({
              ...x,
              manufactureDate: dayjs(x.manufactureDate).format("YYYY-MM-DD"),
              expirationDate: x.expirationDate
                ? dayjs(x.expirationDate).format("YYYY-MM-DD")
                : "",
              supplyDate: x.supplyDate ? dayjs(x.supplyDate).format("YYYY-MM-DD") : '',
              fileList01: x.fileByList ? JSON.parse(x.fileByList).hgz || [] : [], //合格证
              fileList02: x.fileByList ? JSON.parse(x.fileByList).cjbg || [] : [], //厂检报告
              fileList03: x.fileByList ? JSON.parse(x.fileByList).thfj_im || [] : [], //退货附件
              rkd: x.fileByList ? JSON.parse(x.fileByList).rkd || [] : [], //入库单
            }));
            this.tableData = detail;
          });
        });
      });
    },
    newButton(buttonCode) {
      if (buttonCode === 'rollbackToPrevious') {
        this.$refs.toBereview.init('rollbackToPrevious', this.queryAuditArr, this.queryName || this.name)
        return
      }
      if (buttonCode === "cancel") {
        this.cancel();
      } else if (buttonCode === "pass") {
        this.$refs.toBereview.init("pass", this.queryAuditArr, this.name);
      } else if (buttonCode === "reject") {
        this.$refs.toBereview.init("reject", this.queryAuditArr, this.name);
      } else if (buttonCode === "passEdit") {
        this.$refs.toBereview.init("passEdit", this.queryAuditArr, this.name);
      } else if (buttonCode === 'edit') {
        this.$tab.closePage(true)
        this.$router.push({
          name: 'imPage',
          // id=1969943908570083329&supplyId=1965983364125192193&type=create&storeStatus=1
          query: {
            id: this.id,
            type: 'update',
            storeStatus: '0'
          }
        })
        return

      } else if (buttonCode === 'flowSee') {
        this.workFlowViewVisible = true
        this.selectedRow = { businessId: this.id }
      }
    },
    cancel() {
      if (this.isCloudLogin()) {
        this.$router.replace('/index');
        return;
      }
      this.$router.go(-1);
    },
    isCloudLogin() {
      return sessionStorage.getItem('loginType') === 'cloud' || !!sessionStorage.getItem('cloudLoginFlag');
    },

    buttonShow(item) {
      if (item.buttonCode === 'rollbackToPrevious') {
        const query = this.isDialog ? this.dialogQuery : this.$route.query
        return query.name === 'audit' && query.type === 'view' && Array.isArray(this.queryAuditArr)
          && this.queryAuditArr.length === 1 && !!this.queryAuditArr[0]?.taskId
          && this.buttonShow({ ...item, buttonCode: 'reject' })
      }
      // 审核中才能显示同意和不同意按钮
      if (item.buttonCode === "pass" || item.buttonCode === "reject") {
        return this.storeStatus == "5" && !['toBeDeal', 'handle'].includes(this.name);
      }

      if (item.buttonCode === "cancel") {
        return true;
      }
      if (item.buttonCode === 'edit') {
        console.log(item, this.name);
        return ["0"].includes(this.storeStatus) && this.name == 'handle'
      }
      // 已提交、已生效、修改后同意、已驳回、允许查看流程
      // 流程查看 
      if (item.buttonCode === 'flowSee') {
        return !['1'].includes(this.storeStatus) && ['handle', 'toBeDeal', 'audit'].includes(this.name)
      }
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("imDetail").then((res) => {
          this.$refs["vFormRef"].setFormJson(prepareShippingAttachmentLayout(res.data, {"file2Slot": "quality"}));
          initShippingAttachments(this.$refs.vFormRef);
          resolve(true);
        });
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
