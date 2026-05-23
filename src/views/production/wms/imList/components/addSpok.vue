<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="handleButtonClick"></button-top>
    <div :class="{ container_flex_form: true }">
      <VFormRender :form-json="formJson" :form-data="formData" :option-data="optionData" ref="vFormRef"
        :global-dsv="globalDsv" :class="{ formRender_view: true }">
        <template #itemTable="scope">
          <spok-table ref="spokTable" :item-list="scope.formModel.materialCirculationDetailsTableDTOS"
            :loading="loading" :type="type" />
        </template>
        <!-- 附件 -->
        <template #fileListSlot="scope">
          <el-form-item label="抽检结果材料上传" prop="fileList" :rules="[{ required: true, message: '请上传抽检结果材料' }]"  label-width="150px">
            <fileUpload v-model="scope.formModel.fileList" :limit="9999" :fileSize="500"
              :fileType="['jpg', 'jpeg', 'png', 'pdf']" :preview="type ==='view'" />
          </el-form-item>
        </template>
        <!-- 附件 -->
        <template #remarkSlot="scope">
          <el-form-item label="说明">
            <el-input v-if="type !== 'view'" v-model="scope.formModel.remark" placeholder="请输入" />
            <span v-else>{{ scope.formModel.remark }}</span>
          </el-form-item>
        </template>
        <!-- 抽检时间  samplingDateSlot-->
         <template #samplingDateSlot="scope">
          <el-form-item label="抽检时间" prop="samplingDate" :rules="[{ required: true, message: '请选择抽检时间' }]"  label-width="150px">
            <el-date-picker v-if="type !== 'view'" v-model="scope.formModel.samplingDate" placeholder="请选择" value-format="timestamp"  />
            <span v-else>{{ scope.formModel.samplingDate | formatDate }}</span>
          </el-form-item>
         </template>
         
      </VFormRender>
      <toBeReviewed ref="toBereview" />
      <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
    </div>
  </div>
</template>

<script>
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import Decimal from 'decimal.js';
import SpokTable from './spokTable.vue'
import fileUpload from '@/components/upload'
import * as Wms from "@/api/prodmgr-inv/project/wms.js";
import * as SpokDetailApi from '@/api/prodmgr-inv/project/spokDetail.js'
import toBeReviewed from "@/views/audit/components/toBeReviewed";
import workFlowView from '@/components/workFlowView'
import * as Api from '@/api/prodmgr-inv/project/spok.js'
export default {
  name: "addSpok",

  components: { VFormRender, SpokTable, fileUpload, toBeReviewed, workFlowView },

  data() {
    return {
      selectedRow: null,
      workFlowViewVisible: false,
      loading: false,
      title: "新增抽检",
      // 表单相关
      formJson: {},
      formData: {},
      optionData: {},
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: "24",
      },
      detail:{},
      // 顶部按钮配置
      buttonTop: [
        { buttonName: "返回", buttonCode: "cancel", buttonIcon: "Blue-Cancel", type: "create, update" },
        { buttonName: "通过", buttonCode: "pass", buttonIcon: "Blue-AddSon", type: "" },
        {
          buttonName: "驳回",
          buttonCode: "reject",
          buttonIcon: "Blue-EditCard",
          type: "",
        },
        { buttonName: "保存", buttonCode: "save", buttonIcon: "Blue-Save", type: "create, update" },
        { buttonName: '流程查看', buttonCode: 'flowSee', buttonIcon: 'Blue-Flow', type: '' }

      ],

    };
  },

  computed: {
    type() {
      return this.$route.query.type;
    },
    id() {
      return this.$route.query?.id || "";
    },
    name(){
      return this.$route.query?.name
    },
        queryAuditArr() {
      return JSON.parse(this.$route.query.auditArr || "[]");
    },
    from(){
      return this.$route.query?.from
    }
  },

  mounted() {
    this.initPage();
  },

  methods: {
    // ==================== 页面初始化 ====================
    /** 根据页面类型初始化 */
    initPage() {

      if (this.type === 'create') {
        this.initCreateMode();
        return
      }

      const title = this.type === 'view' ? '抽检详情' : this.type === 'update' ? '编辑抽检' : '新增抽检'
        this.$tab.updatePage({
          path: "/rkgl/addSpok",
          meta: {
            title: title,
          },
        });

      if (["view", "update"].includes(this.type)) {
        this.updateInit(this.id);
        return;
      }

    },

    /** 新建模式初始化 */
    async initCreateMode() {
      this.title = "新建";
      await this.loadFormConfig();

      this.init();

    },
    // 编辑初始化
    async updateInit(id) {
      this.loading = true;
      if(this.from === 'THXQ'){
        // 修改tab标题
         this.$tab.updatePage({
          path: "/rkgl/addSpok",
          meta: {
            title: '抽检详情',
          },
        });
        
      }
      const api = this.type == 'view' ? 'detail' : 'detail'
      await Api[api](id,{detailStatus:this.from ==='THXQ'?'2':''}).then(({ data }) => {
        this.$nextTick(async () => {
          this.loading = false;
          this.title = "编辑";
          await this.loadFormConfig();
          console.log(data,'data')
         const   materialCirculationDetailsTableDTOS = data.materialCirSamplingDetailList.map(item=>{
          return {
            ...item,
            hgzfj: item.fileByList ? JSON.parse(item.fileByList).hgz : [],
            cjbgfj: item.fileByList ? JSON.parse(item.fileByList).cjbg : [],
            fileList:item.fileList ? JSON.parse(item.fileList) : [],
          }
         }) 
          // fileList回显 
          const newData = {
            ...data,
            materialCirculationDetailsTableDTOS,
            fileList: data.fileList ? JSON.parse(data.fileList) : [],
          };
          this.detail = newData
          this.$refs.vFormRef.setFormData(newData);

          //   form action
          this.$refs.vFormRef.setReadMode(this.type === "view");

        });
      });
    },
    async getDetail() {
      const { data } = await Wms.detailStore(this.id);
      // 将附件字段映射到 fileUpload 组件需要的格式
      if (data.materialCirculationDetailsTableDTOS) {
        data.materialCirculationDetailsTableDTOS.forEach(item => {
          // 合格证附件：hgz -> hgzfj
          item.hgzfj = item.fileByList ? JSON.parse(item.fileByList).hgz : [];
          // 厂检报告附件：cjbg -> cjbgfj
          item.cjbgfj = item.fileByList ? JSON.parse(item.fileByList).cjbg : [];

          // 如果新增则清空remark
          if (this.type === 'create') {
            item.remark = '';
          }
        });
      }
      this.$refs["vFormRef"].setFormData({
        ...data,
      });
    },
    init() {
      this.getDetail();
    },

    /** 加载表单配置 */
    async loadFormConfig() {
      const { data } = await formFillInPage("addSpok");
      this.$refs.vFormRef.setFormJson(data);
      this.$refs.vFormRef.setReadMode(true);
    },

    /** 顶部按钮点击 */
    handleButtonClick(buttonCode) {
      const actions = {
        cancel: () => this.cancel(),
        save: () => this.handleSubmit(),
        pass: () => {
          this.$refs.toBereview.init("pass", this.queryAuditArr, this.name);
        },
        reject: () => {
          this.$refs.toBereview.init("reject", this.queryAuditArr, this.name);
        },
        flowSee: () => {
          this.workFlowViewVisible = true
          this.selectedRow = { businessId: this.id }
        },
      };
      actions[buttonCode]?.();
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

    /** 按钮显示控制 */
    buttonShow(item) {
      if (item.buttonCode === "save") {
        return this.type !== "view";
      }
      // 审核中才能显示同意和不同意按钮
      if (item.buttonCode === "pass" || item.buttonCode === "reject") {
        return this.name == 'audit'
      }

      // 已提交、已生效、修改后同意、已驳回、允许查看流程
      // 流程查看 
      if (item.buttonCode === 'flowSee') {
        return !['1'].includes(this.detail.status) && ['handle', 'toBeDeal', 'audit'].includes(this.name)
      }

      return true;
    },

    /** 表单提交 */
    handleSubmit() {
      // 先验证子组件（不合格时抽检材料附件必填）
      if (!this.$refs.spokTable.validate()) return;

      this.$refs.vFormRef.validateForm(async (valid) => {
        if (!valid) return;

        this.loading = true;
        try {
          const formData = await this.$refs.vFormRef.getFormData();
          const newMaterialCirculationDetailsTableDTOS = formData.materialCirculationDetailsTableDTOS.filter(x => x.detailStatus).map(x => ({
            ...x,
            fileList: JSON.stringify(x.fileList),
            id: this.type === 'create' ? null : x.id,
            cirDetailId: this.type === 'create' ? x.id : x.cirDetailId,
          }))
          const apiMethod = this.type === "update" ? "edit" : "save";
          const payload = {
            cirId: this.id,
            ...formData,
            fileList: JSON.stringify(formData.fileList),
            materialCirSamplingDetailList: newMaterialCirculationDetailsTableDTOS
          }


          const { message } = await Api[apiMethod](payload);
          this.$modal.msgSuccess(message);
          this.$tab.closeOpenPage(true)
          setTimeout(() => {
            this.$router.push({name:'spokRecords'})
          }, 200);
        } finally {
          this.loading = false;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .label-right-align .el-form-item__label {
  text-align: right;
}

/* 动态列垂直布局 */
::v-deep .label-top-layout {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 18px;

  .el-form-item__label {
    text-align: left;
    line-height: 1.5;
    padding-bottom: 8px;
    width: auto !important;
    float: none;
  }

  .el-form-item__content {
    margin-left: 0 !important;
    width: 100%;
  }
}

/* 动态列容器 */
.section-list-wrapper {
  width: 70%;
  margin: 0 auto;
}
</style>
