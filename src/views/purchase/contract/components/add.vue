<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
    <div :class="{ container_flex_form: type === 'view' }">
      <VFormRender @formValueChange="formValueChange" :form-json="formJson" :form-data="formData"
        :option-data="optionData" ref="vFormRef" :global-dsv="globalDsv" :class="{ formRender_view: type === 'view' }">
        <template #projefctNameSolt="{ formModel }">
          <el-form-item prop="projefctName"  label="标段项目" class="label-right-align">
            <template v-if="type === 'create'">
              <span class="titleCss" :title="projectData.sectionName">{{
                projectData.sectionName
                }}</span>
            </template>
            <template v-else>
              <span class="titleCss" :title="formModel.projefctName">{{
                formModel.projefctName
                }}</span>
            </template>
          </el-form-item>
        </template>

        <template #unitNameSlot="{ formModel }">
          <el-form-item prop="unitName" label-width="130px" label="买方" class="label-right-align">
            <template v-if="type === 'create'">
              <span class="titleCss" :title="projectData.constructionCompany">{{
                projectData.constructionCompany
                }}</span>
            </template>
            <template v-else>
              <span class="titleCss" :title="formModel.unitName">{{
                formModel.unitName
                }}</span>
            </template>
          </el-form-item>
        </template>
        <template #codeSolt="{ formModel }">
          <el-form-item prop="code" :rules="[{ required: true, message: '请选择', trigger: 'change' }]" label-width="175px"
            label="物资大类" class="label-right-align">
            <template v-if="type !== 'view'">
              <el-select v-model="formModel.code" filterable required style="width: 100%" placeholder="请选择" @change="
                (val) =>
                  selectDataChange(dict.type.purchase_code, val, 'code')
              ">
                <el-option v-for="item in dict.type.purchase_code" :key="item.value" :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </template>
            <template v-else>
              <span>{{ formModel.name }}</span>
            </template>
          </el-form-item>
        </template>

        <template #purchaseCodeSolt="{ formModel }">
          <el-form-item prop="purchaseCode" :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
             label="类别" class="label-right-align">
            <template v-if="type !== 'view'">
              <el-select v-model="formModel.purchaseCode" filterable required style="width: 100%" placeholder="请选择"
                @change="
                  (val) => selectDataChange(purchaseItem, val, 'purchaseCode')
                ">
                <el-option v-for="item in purchaseItem" :key="item.purchaseCode" :label="item.purchaseName"
                  :value="item.purchaseCode">
                </el-option>
              </el-select>
            </template>
            <template v-else>
              <span>{{ formModel.purchaseName }}</span>
            </template>
          </el-form-item>
        </template>

        <template #purchaseTypeCodeSolt="{ formModel }">
          <el-form-item prop="purchaseTypeCode" :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
            label-width="130px" label="物资种类" class="label-right-align">
            <template v-if="type !== 'view'">
              <el-select v-model="formModel.purchaseTypeCode" filterable required style="width: 100%" placeholder="请选择"
                @change="
                  (val) =>
                    selectDataChange(purchaseType, val, 'purchaseTypeCode')
                ">
                <el-option v-for="item in purchaseType" :key="item.purchaseTypeCode" :label="item.purchaseTypeName"
                  :value="item.purchaseTypeCode">
                </el-option>
              </el-select>
            </template>
            <template v-else>
              <span>{{ formModel.purchaseTypeName }}</span>
            </template>
          </el-form-item>
        </template>

        <template #purchaseDetailCodeSolt="{ formModel }">
          <el-form-item prop="purchaseDetailCode" :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
            label-width="175px" label="物资细目" class="label-right-align">
            <template v-if="type !== 'view'">
              <el-select v-model="formModel.purchaseDetailCode" filterable required style="width: 100%"
                placeholder="请选择" @change="
                  (val) =>
                    selectDataChange(purcahseDetail, val, 'purchaseDetailCode')
                ">
                <el-option v-for="item in purcahseDetail" :key="item.purchaseDetailCode"
                  :label="item.purchaseDetailName" :value="item.purchaseDetailCode">
                </el-option>
              </el-select>
            </template>
            <template v-else>
              <span>{{ formModel.purchaseDetailName }}</span>
            </template>
          </el-form-item>
        </template>

        <!-- 附件 -->
        <template #htfbsmjSlot="{ formModel }">
          <el-form-item prop="htfbsmj" label-width="130px" :rules="[
            {
              required: true,
              message: '请上传合同副本扫描件',
              trigger: 'change',
            },
          ]" label="合同副本扫描件" class="label-right-align">
            <fileUpload :isShowTip="false" v-model="formModel.htfbsmj" :limit="9999" :fileSize="500"
              :fileType="['pdf', 'jpg', 'png', 'jpeg', 'doc', 'docx']" :preview="type === 'view' || checked" />
          </el-form-item>
        </template>
        <template #attachmentFileSolt="{ formModel }">
          <el-form-item prop="hthbfj" label-width="160px" label="核备附件(支持多个)" class="label-right-align" :rules="[
            
          ]">
            <fileUpload :isShowTip="false" v-model="formModel.hthbfj" :limit="9999" :fileSize="500"
              :fileType="['pdf', 'jpg', 'png', 'jpeg', 'doc', 'docx']" :preview="type === 'view' || checked" />
          </el-form-item>
        </template>

        <template #gyszlzscnsSlot="{ formModel }">
          <el-form-item prop="gyszlzscns" label-width="175px" :rules="[
            {
              required: true,
              message: '请上传供应商质量终身承诺书',
              trigger: 'change',
            },
          ]" label="供应商质量终身承诺书" class="label-right-align">
            <fileUpload :isShowTip="false" v-model="formModel.gyszlzscns" :limit="9999" :fileSize="500"
              :fileType="['pdf', 'jpg', 'png', 'jpeg', 'doc', 'docx']" :preview="type === 'view' || checked" />
          </el-form-item>
        </template>
        <template #tlzycpSlot="{ formModel }">
          <el-form-item prop="railwaySpecial" label-width="120px" label="铁路专用产品" class="label-right-align">
            <template v-if="type !== 'view'">
              <el-radio-group v-model="formModel.railwaySpecial" @change="onRailwayChange">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </template>

            <template v-else>
              <span>{{ formModel.railwaySpecial == 1 ? "是" : "否" }}</span>
            </template>
          </el-form-item>
        </template>



        <template #contentSlot="{ formModel }">
          <contentSlot v-model="formModel" ref="contentSlotRef" :isView="type === 'view'" :formRef="$refs.vFormRef"  />
        </template>
      </VFormRender>
    </div>
    <toBeReviewed ref="toBereview" />
  </div>
</template>

<script>
import Vue from "vue";
import * as Api from "@/api/purchase/contract.js";
import { getCurrentSection } from "@/api/prodmgr-inv/project/section.js";
import VFormRender from "@/components/form-render/index";
import { purchaseItemFindAllList } from "@/api/purchase/item.js";
import { purchaseTypeFindAllList } from "@/api/purchase/type.js";
import { purchaseDetailFindAllList } from "@/api/purchase/detail.js";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import fileUpload from "@/components/upload";
import { getUserInfo } from "@/utils/user-info";
import { useSlots } from "vue";
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import contentSlot from "./contentSlot.vue";
export default {
  name: "SectionAdd",
  dicts: ["purchase_code", "flowStatus"],
  components: {
    VFormRender,
    fileUpload,
    toBeReviewed,
    contentSlot
  },
  data() {
    const userInfo = getUserInfo();
    return {
      code: null,
      purchaseCode: null,
      purchaseTypeCode: null,
      purchaseDetailCode: null,
      purchaseItem: [],
      purchaseType: [],
      purcahseDetail: [],
      projectData: {},
      maxManualIndex: 1,
      buyer: userInfo?.instituteName,
      loading: false,
      title: "新增",
      checked: false,
      //   fileList type
      // type: 'create', //update , view ,create
      fileList: [],
      formJson: {},
      formData: {},
      optionData: {},
      countNum: 0,
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
          buttonName: "保存",
          buttonCode: "save",
          buttonIcon: "Blue-Save",
          type: "create, update",
        },
        { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
        { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
        { buttonName: '修改', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
      ],
      constructionOptions: [],
      gysOptions: [],
      tableData: [],
      formConfigJson: "",
      currentFormData: {},
      backData: null,
      detail: {},
      sellerName: "", // 添加sellerName数据属性
    };
  },
  computed: {
    type() {
      return this.$route.query.type;
    },
    id() {
      return this.$route.query?.id || "";
    },
    name() {
      return this.$route.query?.name || "";
    },
    queryAuditArr() {
      return JSON.parse(this.$route.query.auditArr || '[]')
    },
  },
  async created() {
    this.findAllListData();
  },
  mounted() {
    if (["view", "update"].includes(this.type)) {
      this.updateInit(this.id);
      return;
    }

    if (this.type === "create") {
      this.init();
      return;
    }
  },
  methods: {
    formValueChange(e) {
      this.currentFormData = e;
    },
    // 动态修改表单配置，并重置表单结构
    async onRailwayChange(e) {
      const formConfig = JSON.parse(sessionStorage.getItem("formConfigJson"));
      if (e == 0) {
        this.$refs.vFormRef.setFormJson(this.updateLicenseCard(formConfig, e));
      } else {
        this.$refs.vFormRef.setFormJson(
          sessionStorage.getItem("formConfigJson")
        );
        this.$forceUpdate();
      }

      // 这里用 setFormData 只能恢复主表单和一层子表单的数据

      this.$refs.vFormRef.setFormData({
        ...this.currentFormData,
        railwaySpecial: e,
      });
    },

    /**
     * 更新许可/认证证书配置
     * @param {Object} formConfig - 完整的动态表单配置
     * @param {Number} railwaySpecial - 传入的值（1显示 / 0隐藏）
     */
    updateLicenseCard(formConfig, railwaySpecial) {
      if (railwaySpecial == 0) {
        // 直接移除 card87236
        formConfig.widgetList = formConfig.widgetList.filter(
          (w) => w.id !== "card87236"
        );
        return JSON.stringify(formConfig);
      }
      return JSON.stringify(formConfig);
    },
    findAllListData() {
      if (this.type === 'view') {
        return
      }
      getCurrentSection().then((res) => {
        this.projectData = res.data;
        this.$refs["vFormRef"].setFormData({
          projefctName: res.data.projectName,
          unitName: res.data.constructionCompany,
          sectionShortName: res.data.projectShortName,
          projectName: res.data.projectName,
        });
      });
      // purchaseItemFindAllList().then(res => {
      // 	this.purchaseItem = res.data;
      // });
      // purchaseTypeFindAllList().then(res => {
      // 	this.purchaseType = res.data;
      // });
      // purchaseDetailFindAllList().then(res => {
      // 	this.purcahseDetail = res.data;
      // });
    },
    onDataChange(data) {
      if (["delete"].includes(data.type)) {
        this.tableData = this.tableData.filter(
          (item) => !data.row.includes(item.id + "")
        );
        return;
      }
      if (data.type === "add") {
        this.onAdd();
        return;
      }
    },
    onAdd() { },
    //初始化
    init() {
      this.$nextTick(async () => {
        this.title = "新建";
        await this.formFillInPage();
        this.$refs.vFormRef.setFormData({
          contractDetailsList: [{
            materialName: "",
            specModel: "",
            unit: 0,
            amount: 0,
            price: 0,
            vatRate: 0,
            totalAmount: 0,
            railwaySpecial: '0',
          }]
        });
      });
    },
    // 编辑初始化
    async updateInit(id) {
      await Api.detail(id).then((res) => {
        this.$nextTick(async () => {
          this.title = "编辑";
          await this.formFillInPage();
          this.getItemList(res.data.code);
          this.getTypeData(res.data.code, res.data.purchaseCode);
          this.getDetailDate(
            res.data.code,
            res.data.purchaseCode,
            res.data.purchaseTypeCode
          );
          const newData = {
            ...res.data,
          };
          // const paramsContractLicense = [];
          // newData.contractLicense.map((item, index) => {
          //   item.attachmentFile =
          //     item.attachmentFile != "" ? JSON.parse(item.attachmentFile) : [];
          //   paramsContractLicense.push(item);
          // });
          // newData.contractLicense = paramsContractLicense;

          newData.contractDetailsList = newData.contractDetailsList.map(x => ({
            ...x,
            validityGuarantee: x.railwaySpecial == 1 ? [x.startTime, x.endTime] : [],

          }))

          // 回显附件
          newData.htfbsmj =
            newData.files != "" ? JSON.parse(newData.files).htfbsmj : [];
          newData.gyszlzscns =
            newData.files != "" ? JSON.parse(newData.files).gyszlzscns : [];
          newData.hthbfj =
            newData.files != "" ? JSON.parse(newData.files).hthbfj : [];

            console.log(newData.hthbfj)

          // 缓存回显数据
          this.backData = newData;
          if (newData.railwaySpecial == 0) {
            // 隐藏许可/认证证书
            this.$refs.vFormRef.setFormJson(
              this.updateLicenseCard(
                JSON.parse(sessionStorage.getItem("formConfigJson")),
                newData.railwaySpecial
              )
            );
          }
          this.detail = newData
          this.$refs.vFormRef.setFormData(newData);
          this.$refs.vFormRef.setReadMode(this.type === "view");
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
      if (buttonCode === 'pass') {
        this.$refs.toBereview.init('pass', this.queryAuditArr, this.name)
        return;
      }
      if (buttonCode === 'reject') {
        this.$refs.toBereview.init('reject', this.queryAuditArr, this.name)
        return
      }
      if (buttonCode === 'edit') {
        this.$tab.closePage(true)
        this.$router.push({
          name: 'detailPurchaseContract',
          query: {
            id: this.id,
            type: 'update',
            from: 'list'
          }
        })
        return

      }
    },
    cancel() {
      this.$tab.closeOpenPage(true)
    },

    buttonShow(item) {
      if (item.buttonCode === "save") {
        return this.type !== "view";
      }
      if (item.buttonCode === 'pass' || item.buttonCode === 'reject') {
        return [2].includes(this.detail.status) && this.name == 'audit' 
      }
      if (item.buttonCode === 'edit') {
        return [0].includes(this.detail.status) && this.name == 'handle'
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
        if (valid) {
          this.loading = true;
          const formData = await this.$refs.vFormRef.getFormData();
          formData.projefctName = this.projectData.projectName;
          formData.projectName = this.projectData.projectName;
          formData.sectionShortName = this.projectData.projectShortName;
          formData.projectId = this.projectData.projectId;
          formData.unitName = this.projectData.constructionCompany;
          formData.bidDocument = JSON.stringify(formData.bidDocument);
          formData.registration = JSON.stringify(formData.registration);
          formData.scheme = JSON.stringify(formData.scheme);
          formData.schemeApproval = JSON.stringify(formData.schemeApproval);
          // const paramsContractLicense = [];

          // if (formData.railwaySpecial == 1) {
          //   formData.contractLicense.map((item, index) => {
          //     item.attachmentFile = JSON.stringify(item.attachmentFile);
          //     paramsContractLicense.push(item);
          //   });
          //   formData.contractLicense = paramsContractLicense;
          // } else {
          //   formData.contractLicense = [];
          // }

          // 附件
          const files = JSON.stringify({
            htfbsmj: formData.htfbsmj,
            gyszlzscns: formData.gyszlzscns,
            hthbfj: formData.hthbfj,
          });
          formData.contractDetailsList = formData.contractDetailsList.map(x => ({
            ...x,
            startTime: x.railwaySpecial == 1 ? x.validityGuarantee[0] : '',
            endTime: x.railwaySpecial == 1 ? x.validityGuarantee[1] : '',

          }))
          await Api[this.type === "update" ? `modify` : `create`](
            Object.assign(
              {
                id: this.type === "update" ? this.id : null,
              },
              formData,
              { files }
            )
          )
            .then(({ message }) => {
              this.loading = false;
              this.$modal.msgSuccess(message);
              this.saveBack();
            })
            .finally((err) => {
              this.loading = false;
            });
        }
      });
    },
    saveBack() {
      this.$tab.closeOpenPage(true)
      setTimeout(() => {

        this.$router.push({
          name: '/nuclear/contract'
        })
      }, 100)
    },
    checkoutStatus(flag) { },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("purchaseContract").then((res) => {
          this.$refs["vFormRef"].setFormJson(res.data);
          sessionStorage.setItem("formConfigJson", res.data);
          this.$refs["vFormRef"].setFormData({
            buyer: this.buyer,
          });
          resolve(true);
        });
      });
    },
    getItemList(code) {
      purchaseItemFindAllList({ code: code }).then((res) => {
        this.purchaseItem = res.data;
      });
    },

    getTypeData(code, purchaseCode) {
      purchaseTypeFindAllList({ code: code, purchaseCode, purchaseCode }).then(
        (res) => {
          this.purchaseType = res.data;
        }
      );
    },

    getDetailDate(code, purchaseCode, purchaseTypeCode) {
      purchaseDetailFindAllList({
        code: code,
        purchaseCode: purchaseCode,
        purchaseTypeCode: purchaseTypeCode,
      }).then((res) => {
        this.purcahseDetail = res.data;
      });
    },
    selectDataChange(options, val, key) {
      if (key == 'code') {
        this.code = val;
        this.purchaseCode = null;
        this.purchaseTypeCode = null;
        this.purchaseDetailCode = null;
        this.purchaseItem = [];
        this.purchaseType = [];
        this.purcahseDetail = [];
        this.$refs['vFormRef'].setFormData({
          name: options.find(item => item.value === val).label,
          purchaseCode: null,
          purchaseName: null,
          purchaseTypeCode: null,
          purchaseTypeName: null,
          purchaseDetailCode: null,
          purchaseDetailName: null,
        });
        this.getItemList(val);
      } else if (key == 'purchaseCode') {
        this.purchaseCode = val;
        this.purchaseTypeCode = null;
        this.purchaseDetailCode = null;
        this.purchaseType = [];
        this.purcahseDetail = [];
        this.$refs['vFormRef'].setFormData({
          purchaseName: options.find(item => item.purchaseCode === val).purchaseName,
          purchaseTypeCode: null,
          purchaseTypeName: null,
          purchaseDetailCode: null,
          purchaseDetailName: null,
        });
        this.getTypeData(this.code, this.purchaseCode);
      } else if (key == 'purchaseTypeCode') {
        this.purchaseTypeCode = val;
        this.purchaseDetailCode = null;
        this.purcahseDetail = [];
        this.$refs['vFormRef'].setFormData({
          purchaseTypeName: options.find(item => item.purchaseTypeCode === val).purchaseTypeName,
          purchaseDetailCode: null,
          purchaseDetailName: null,
        });
        this.getDetailDate(this.code, this.purchaseCode, this.purchaseTypeCode);
      } else if (key == 'purchaseDetailCode') {
        this.$refs['vFormRef'].setFormData({
          purchaseDetailName: options.find(item => item.purchaseDetailCode === val)
            .purchaseDetailName
        });
      }
    },
    selectChange(options, val, key) {
      this.$refs.vFormRef.setFormData({
        [key]: options.find((item) => item.value === val)?.label,
      });
    },
    beforeUpload(file) {
      console.log(file, "beforeUpload");
      // const isJPG = file.type === 'pdf';
      // const size = file.size / 1024 / 1024 < 500;
      // if (!isJPG) {
      // 	this.$message.error('文件只能是 PDF 格式!');
      // }
      // if (!size) {
      // 	this.$message.error('上传头像图片大小不能超过 500MB!');
      // }
      // return isJPG && size;
    },
    uploadFile(file) {
      // try {
      // 	const client = new OSS({
      // 		region: 'cn-hangzhou"',
      // 		accessKeyId: 'LTAI5tC37nKnUEPeszGoveX8',
      // 		accessKeySecret: 'vi26hami9gwgWES8jwkLEP8Zd0gM2v',
      // 		bucket: 'yc-mat',
      // 		endpoint: 'https://oss-cn-hangzhou.aliyuncs.com'
      // 	}).put(file.name, file)
      // 	console.log(client, 'oss')
      // } catch (e) {
      // 	console.log(e)
      // }
    },
    handleUploadSuccess(res, file) {
      console.log(res, file, "res, file");
    },
    handleExceed(files, fileList) {
      this.$message.error(`最多只能上传 10 个文件`);
    },
    handleRemove(file, fileList) {
      console.log(file, fileList, "file, fileList");
    },
    handlePreview(file) {
      console.log(file, "file");
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
  },
};
</script>

<style lang="scss" scoped>
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

.titleCss {
  display: inline-block;
  /* 或者 block */
  width: 200px;
  /* 设置一个具体的宽度 */
  white-space: nowrap;
  /* 防止文本换行 */
  overflow: hidden;
  /* 隐藏溢出的内容 */
  text-overflow: ellipsis;
  /* 显示省略符号来代表被修剪的文本 */
}
</style>
