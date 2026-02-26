<template>
  <div class="app-container container_flex">
    <button-top
      :buttonTopData="buttonTop"
      :buttonShow="buttonShow"
      @newButton="handleButtonClick"
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
       <template #itemTable>
        <div style="max-height: 450px">
          <el-table :data="itemList" border style="width: 100%" max-height="450" v-loading="loading"
         ref="itemTable" row-key="id">

          <el-table-column label="序号" width="88" align="center" type="index"></el-table-column>
          <el-table-column label="物资名称" prop="itemName" align="center"></el-table-column>
          <el-table-column label="规格型号" prop="guige" align="center"></el-table-column>
          <el-table-column label="计量单位" prop="jlUnit" align="center"></el-table-column>
          <el-table-column label="发货数量" prop="sendQulity" align="center"></el-table-column>
          <el-table-column label="可抽检数量" prop="spokNum" align="center"></el-table-column>
          <el-table-column label="包装形式" prop="spokNum" align="center"></el-table-column>
          <el-table-column label="生产日期" prop="spokNum" align="center"></el-table-column>
          <el-table-column label="有效期截期日期" prop="spokNum" align="center"></el-table-column>
          <el-table-column label="合格证附件" prop="hgFIle" align="center">
            <template slot-scope="scope">
              <fileUpload v-model="scope.formModel.fileList" :limit="9999" :fileSize="500" :fileType="['pdf']"
              :preview="type === 'update'"
              />
            </template>
           </el-table-column>
          <el-table-column label="厂检报告附件" prop="cjFile" align="center">
             <template slot-scope="scope">
              <fileUpload v-model="scope.formModel.fileList" :limit="9999" :fileSize="500" :fileType="['pdf']"
              :preview="type === 'update'"
              />
             </template>
           </el-table-column>
          <el-table-column label="当前库存数量" prop="spokNum" align="center"></el-table-column>

          <el-table-column label="抽检结果" align="center">
            <template slot-scope="scope">
              <el-select  v-model="scope.row.cjResult"
                 size="mini" @change="handleChange(scope.row)"
                style="width: 100%" filterable>
                <el-option v-for="item of samplingResult" :key="item.value" :label="item.label"
                  :value="item.value"></el-option>
              </el-select>
            </template>
            </el-table-column>

          <el-table-column label="结果处理" align="center">
            <template slot-scope="scope">
              <el-select v-if="scope.row.cjResult === '0'"  v-model="scope.row.materialId"
                 size="mini"
                style="width: 100%" filterable>
                <el-option v-for="res of dealResult" :key="res.value" :label="res.label"
                  :value="res.value"></el-option>
              </el-select>
              <span v-else>{{ scope.row.dealResult }}</span>
            </template>
          </el-table-column>
           <el-table-column label="退换货数量" prop="thNum" align="center"></el-table-column>
            <el-table-column label="抽检材料附件" prop="cjFile" align="center">
             <template slot-scope="scope">
              <fileUpload v-model="scope.formModel.fileList" :limit="9999" :fileSize="500" :fileType="['pdf']"
              :preview="type === 'update'"
              />
             </template>
           </el-table-column>
           <el-table-column label="备注" prop="remark" align="center"></el-table-column>
          </el-table>
        </div>
       </template>
        <!-- 附件 -->
        <template #fileListSlot="scope">
          <el-form-item label="抽检结果材料上传:">
            <fileUpload v-model="scope.formModel.fileList" :limit="9999" :fileSize="500" :fileType="['pdf']"/>
          </el-form-item>
        </template>
        <!-- 附件 -->
        <template #remark="scope">
          <el-form-item label="说明:">
           <el-input v-model="scope.formModel.remark" placeholder="请输入" />
          </el-form-item>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import Decimal from 'decimal.js';
import fileUpload from '@/components/upload'
export default {
  name: "addSpok",

  components: { VFormRender,fileUpload },

  data() {
    return {
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
      // 顶部按钮配置
      buttonTop: [
        { buttonName: "返回", buttonCode: "cancel", buttonIcon: "Blue-Cancel", type: "create, update" },
        { buttonName: "保存", buttonCode: "save", buttonIcon: "Blue-Save", type: "create, update" },
      ],
      itemList:[],
      samplingResult:[
        {value:'0',label:'合格'},
        {value:'1',label:'不合格'}
      ],
      dealResult:[
        {value:'0',label:'无'},
        {value:'1',label:'只退换库存数量'},
        {value:'2',label:'退换入库质检通过数量'}
      ]
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

  mounted() {
    this.initPage();
  },

  methods: {
    // ==================== 页面初始化 ====================
    /** 根据页面类型初始化 */
    initPage() {
        this.initCreateMode();
    },

    /** 新建模式初始化 */
    async initCreateMode() {
      this.title = "新建";
      await this.loadFormConfig();
      // 调用接口,获取详情
      //  await Api.xxxx(id).then(({ data }) => {
      //   this.$nextTick(async () => {
      //     this.title = "新建";
      //     await this.loadFormConfig();
      //   })
      // })
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
        cancel: () => this.$router.go(-1),
        save: () => this.handleSubmit(),
      };
      actions[buttonCode]?.();
    },

    /** 按钮显示控制 */
    buttonShow(item) {
      if (item.buttonCode === "save") {
        return this.type !== "view";
      }
      return true;
    },
    handleChange(row){
     
    },

    /** 表单提交 */
    handleSubmit() {
      this.$refs.vFormRef.validateForm(async (valid) => {
        if (!valid) return;

        this.loading = true;
        try {
          const formData = await this.$refs.vFormRef.getFormData();
          const apiMethod = this.type === "update" ? "edit" : "save";
          const payload = this.type === "update"
            ? { id: this.id, ...formData }
            : formData;

          const { message } = await Api[apiMethod](payload);
          this.$modal.msgSuccess(message);
          this.$router.go(-1);
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
