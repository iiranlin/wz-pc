<template>
  <Dialog
    :title="title"
    :visible.sync="visible"
    v-if="visible"
    :show-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :append-to-body="true"
    :destroy-on-close="true"
    class="dialog-route"
    width="600px"
  >
    <div class="form-render-wrapper" style="margin-top: 16px">
      <el-form
        ref="elform"
        class="process-form"
        label-position="right"
        labelWidth="120px"
        size="medium"
        :showMessage="true"
        :rules="rules"
        :model="form"
      >
        <el-row :span="24" :gutter="20">
          <el-col :span="24">
            <el-form-item :label="'物资大类'" prop="speciesCode">
              <el-select
                v-model="form.speciesCode"
                placeholder="请选择"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="item in speciesOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="'物资种类'" prop="categoriesCode">
              <el-select
                v-model="form.categoriesCode"
                placeholder="请选择"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="item in typeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="'细目编码'" prop="detailCode">
              <el-input
                v-model="form.detailCode"
                maxlength="240"
                placeholder="请输入"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="'细目名称'" prop="detailName">
              <el-input
                v-model="form.detailName"
                maxlength="240"
                placeholder="请输入"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer" v-if="type !== 'view'">
      <el-button round type="primary" @click="handleCreate">确认</el-button>
      <el-button round @click="visible = false">取消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as Api from "@/api/prodmgr-inv/project/itemDetail.js";
import * as TypeApi from "@/api/prodmgr-inv/project/itemType.js";
import { getListByParentCode } from "@/api/system/dict.js";

export default {
  name: "ItemAdd",
  data() {
    return {
      title: "新增",
      visible: false,
      type: "add",
      form: {
        speciesCode: "",
        categoriesCode: "",
        detailCode: "",
        detailName: ""
      },
      rules: {
        speciesCode: [
          { required: true, message: "请选择", trigger: "change" },
        ],
        categoriesCode: [
          { required: true, message: "请选择", trigger: "change" },
        ],
        detailCode: [{ required: true, message: "请输入", trigger: "blur" }],
        detailName: [{ required: true, message: "请输入", trigger: "blur" }],
      },
      speciesOptions: [], // 物资大类选项
      typeOptions: [], // 物资种类选项
      isEdit: false,
      originalForm: null, // 保存原始表单数据用于比较
      isInitialLoad: false, // 标记是否为初始加载
    };
  },
  watch: {
    // 监听物资大类变化
    "form.speciesCode": {
      async handler(newVal) {
        if (!newVal) return;
        
        // 设置物资大类名称
        const selectedSpecies = this.speciesOptions.find(x => x.value == newVal);
        if (selectedSpecies) {
          this.form.speciesName = selectedSpecies.label;
        }
        
        // 获取物资种类选项
        await this.getTypeOptions(newVal);
        
        // 只有在非编辑模式下，或者编辑模式下用户手动修改了值时，才清空子级
        if (!this.isEdit || 
            (this.isEdit && 
             this.originalForm && 
             this.originalForm.speciesCode != newVal && 
             !this.isInitialLoad)) {
          this.form.categoriesCode = null;
          this.form.categoriesName = null;
          this.form.categoriesId = null;
        }
      }
    },
    
    // 监听物资种类变化
    "form.categoriesCode": {
      handler(newVal) {
        if (!newVal) return;
        
        // 设置物资种类名称和ID
        const selectedType = this.typeOptions.find(x => x.value == newVal);
        if (selectedType) {
          this.form.categoriesName = selectedType.label;
          this.form.categoriesId = selectedType.id;
        }
      }
    }
  },
  methods: {
    //初始化
    init() {
      this.form = {
        speciesCode: "",
        categoriesCode: "",
        detailCode: "",
        detailName: ""
      };
      this.isEdit = false;
      this.originalForm = null;
      this.isInitialLoad = false;
      this.visible = true;
      this.$nextTick(() => {
        this.title = "新建";
        this.getSpeciesOptions();
      });
    },
    
    // 获取物资大类选项
    async getSpeciesOptions() {
      try {
        const res = await getListByParentCode("WZDL");
        this.speciesOptions = res.data.map(item => ({
          label: item.label,
          value: item.value
        }));
      } catch (error) {
        console.error("获取物资大类失败", error);
        this.speciesOptions = [];
      }
    },
    
    // 获取物资种类选项（依赖物资大类）
    async getTypeOptions(speciesCode) {
      if (!speciesCode) return;
      
      try {
        const params = { 
          pageNum: 1, 
          pageSize: -1,
          speciesCode: speciesCode 
        };
        
        const res = await TypeApi.itemList(params);
        this.typeOptions = res.data.list.map((x) => ({
          ...x,
          label: x.materialCategoriesName,
          value: x.materialCategoriesCode,
        }));
        
        // 检查编辑模式下的值是否存在于新数据源中
        if (this.isEdit && this.form.categoriesCode && !this.isInitialLoad) {
          const exists = this.typeOptions.some(item => item.value == this.form.categoriesCode);
          if (!exists) {
            this.form.categoriesCode = null;
            this.form.categoriesName = null;
            this.form.categoriesId = null;
          }
        }
      } catch (error) {
        console.error("获取物资种类失败", error);
        this.typeOptions = [];
      }
    },
    
    // 编辑初始化
    async updateInit(id) {
      this.isEdit = true;
      this.isInitialLoad = true; // 标记为初始加载
      this.visible = true;
      
      // 先获取物资大类选项
      await this.getSpeciesOptions();

      await Api.detail(id).then(async ({ data }) => {
        this.originalForm = { ...data }; // 保存原始数据用于比较
        this.form = Object.assign({}, data);
        
        // 如果有物资大类，预加载物资种类选项
        if (this.form.speciesCode) {
          await this.getTypeOptions(this.form.speciesCode);
        }
        
        this.$nextTick(() => {
          this.title = "编辑";
          // 初始加载完成后，重置标记
          setTimeout(() => {
            this.isInitialLoad = false;
          }, 500);
        });
      });
    },

    //新建
    handleCreate() {
      this.$refs.elform.validate(async (valid) => {
        if (valid) {
          this.loading = true;
          await Api[this.isEdit ? `edit` : `save`](Object.assign({}, this.form))
            .then(({ message }) => {
              this.loading = false;
              this.$modal.msgSuccess(message);
              this.visible = false;
              this.$emit("createSuccess");
            })
            .catch((err) => {
              this.loading = false;
            });
        }
      });
    },
    
    //取消
    handleCancel() {
      this.visible = false;
    },
    
    //关闭dialog回调
    handleDialogClose() {
      this.$refs.elform.resetFields();
    }
  },
};
</script>
