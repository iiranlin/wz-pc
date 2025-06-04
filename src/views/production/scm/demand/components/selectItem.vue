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
        <template #itemSlot>
          <div class="flex">
            <span class="title">
              请选择本次发货物资 （已选择<span style="color: red">{{
                selection.length
              }}</span
              >项）
            </span>
            <el-select
              class="select-box"
              v-model="form.sectionId"
              placeholder="请选择标段项目"
              clearable
              style="width: 240px"
              size="small"
            >
              <el-option
                v-for="(item, key) in proList"
                :key="key"
                :label="item.name"
                :value="item.code"
              />
            </el-select>
          </div>
          <el-table
            :data="tableData"
            border
            style="width: 100%"
            :max-height="600"
            v-loading="loading"
            :row-key="getRowKey"
            @selection-change="handleSelectionChange"
            ref="dataTable"
          >
            <el-table-column
              type="index"
              label="序号"
              width="55"
              align="center"
              fixed="left"
            />
            <!-- ✅ 多选框列 -->
            <el-table-column
              type="selection"
              width="55"
              fixed="left"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="materialName"
              label="标段项目名称"
              width="250"
              fixed="left"
            >
            </el-table-column>
            <el-table-column
              prop="materialName"
              label="物资名称"
              width="250"
              fixed="left"
            >
            </el-table-column>
            <el-table-column
              prop="projectShortName"
              label="规格型号"
              width="120"
            ></el-table-column>

            <el-table-column
              prop="projectShortName"
              label="计量单位"
              width="120"
            ></el-table-column>
            <el-table-column
              prop="projectShortName"
              label="本次计划数量"
              width="120"
            ></el-table-column>
            <el-table-column
              prop="projectShortName"
              label="供应时间"
              width="120"
            ></el-table-column>
            <el-table-column
              prop="projectShortName"
              label="使用地点"
              width="120"
            ></el-table-column>
            <el-table-column
              prop="projectShortName"
              label="收货人及联系方式"
              width="120"
            ></el-table-column>
            <el-table-column
              prop="projectShortName"
              label="备注"
              width="120"
            ></el-table-column>
            <el-table-column
              prop="projectShortName"
              label="剩余待发货"
              width="120"
            ></el-table-column>
          </el-table>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import * as Api from "@/api/prodmgr-inv/project/scm.js";
import * as LineApi from "@/api/prodmgr-inv/project/line.js";
import TabTable from "./tabTable.vue";
import VFormRender from "@/components/form-render/index";
import { formFillInPage } from "@/api/form/form";
import { getToken } from "@/utils/auth";
import fileUpload from "@/components/upload";
import { listByDeptCode } from "@/api/system/dept.js";
import { getUserInfo } from "@/utils/user-info";
export default {
  name: "selectItem",
  components: {
    VFormRender,
    fileUpload,
    TabTable,
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
          buttonName: "保存",
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
      proList: [],
    };
  },
  computed: {
    type() {
      return this.$route.query.type;
    },
    id() {
      return this.$route.query?.id || "";
    },
    params() {
      return this.$route.params;
    },
  },
  async created() {},
  mounted() {
    this.init();
    this.findBdList();
    this.findWzList();
  },
  methods: {
    //初始化
    init() {
      this.$nextTick(async () => {
        await this.formFillInPage();
        this.$refs.vFormRef.setReadMode(true);
      });
    },
    // 编辑初始化
    async updateInit(id) {
      await Api.detail(id).then(({ data }) => {
        this.$nextTick(async () => {
          this.title = "编辑";
          await this.formFillInPage();
          // fileList回显
          const newData = {
            ...data,
            contractStatus: data.contractStatus == "2",
            fileList: data.fileList[0]?.fileList || [],
          };
          this.$refs.vFormRef.setFormData(newData);

          //   form action
          this.$refs.vFormRef.setReadMode(this.type === "view");

          this.tableData = data.materialList;
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
      return true;
    },
    //获取标段项目
    findBdList(){
       Api.findBdList({sellerId:this.params.sellerId,planId:this.params.supplyNumber})
        .then(({ data }) => {
          this.proList = data.list;
          
        })
        .finally(() => {
          
        });
    },
    //获取物资列表
    findWzList(){
       Api.listMaterials({sellerId:this.params.sellerId,planId:this.params.supplyNumber,sectionId:this.form.sectionId})
        .then(({ data }) => {
          this.tableData = data.list;
          
        })
        .finally(() => {
          
        });
    },
    //新建
    handleCreate() {
      this.$refs.vFormRef.validateForm(async (valid) => {
        if (!valid) {
          this.$message.warning("请完善信息");
          return;
        }
        // 校验表格
        const tableValid = this.$refs.tabTableRef.onCheck();
        if (!tableValid) {
          return;
        }

        // 如果表格内数据为空，则提示
        if (this.tableData.length === 0) {
          this.$message.warning("请添加合同物资科目");
          return;
        }

        if (valid) {
          this.loading = true;
          const formData = await this.$refs.vFormRef.getFormData();
          formData.contractStatus = formData.contractStatus ? "2" : "1";
          // 后端存入嵌套数组
          const fileList = formData.fileList;
          formData.fileList = [{ fileList }];
          await Api[this.type === "update" ? `edit` : `save`](
            Object.assign({ id: this.type === "update" ? this.id : null }, formData, {
              materialList: this.tableData.map((x) => ({
                ...x,
                id: null,
              })),
            })
          )
            .then(({ message }) => {
              this.loading = false;
              this.$modal.msgSuccess(message);
              this.cancel();
            })
            .finally((err) => {
              this.loading = false;
            });
        }
      });
    },

    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage("selectItem").then((res) => {
          this.$refs["vFormRef"].setFormJson(res.data);
          if (this.params) {
            this.$refs["vFormRef"].setFormData({
              supplyName: this.params.supplyName,
              supplyNumber: this.params.supplyNumber,
            });
          }
          resolve(true);
        });
      });
    },
    // 返回唯一行 key，用于多选保留状态
    getRowKey(row) {
      return `${row.id}`;
    },
    // 处理表格的勾选变化 - 修改版本
    handleSelectionChange(selection) {
      this.selection = selection;
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
