<template>
  <!-- 添加或修改部门对话框 -->
  <Dialog
    :title="title"
    :visible.sync="openDataScope"
    :close-on-click-modal="false"
    width="600px"
    append-to-body
  >
    <el-form ref="elForm" :model="form" :rules="rules" label-width="85px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="上级部门:" prop="parentId">
            <treeselect
              v-model="form.parentId"
              :options="deptOptions"
              :normalizer="normalizer"
              placeholder="选择上级部门"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="部门编号:" prop="deptCode">
            <el-input
              v-model="form.deptCode"
              placeholder="请输入部门编号"
              maxlength="150"
              :disabled="title === '修改部门'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门名称:" prop="deptName">
            <el-input
              v-model="form.deptName"
              placeholder="请输入部门名称"
              maxlength="150"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="部门简称:" prop="deptAlias">
            <el-input
              v-model="form.deptAlias"
              placeholder="请输入部门简称"
              maxlength="150"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序:" prop="seq">
            <el-input-number
              v-model="form.seq"
              controls-position="right"
              :min="1"
              :max="99"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="状态:" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in statusOpt"
                :key="dict.label"
                :label="dict.value"
                >{{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="级别:" prop="unitFlag">
            <el-radio-group
              v-model="form.unitFlag"
              :disabled="type === 'update'"
            >
              <el-radio
                v-for="dict in [
                  { label: '部门', value: 0 },
                  { label: '单位', value: 1 },
                ]"
                :key="dict.value"
                :label="dict.value"
                >{{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        :loading="loading"
        @click="type == 'create' ? submitDataScope() : deptModify()"
        >确 定</el-button
      >
      <el-button @click="openDataScope = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import { deptCreate, deptDetail, deptModify } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  props: {
    deptOptions: {
      type: Array,
      default: () => [],
    },
  },
  components: { Treeselect },
  data () {
    return {
      loading: false,
      title: "新增部门",
      type: "add",
      id: "",
      openDataScope: false,
      company: [],
      form: {
        deptName: "",
        deptCode: "",
        parentId: undefined,
        seq: 0,
        deptAlias: "",
        flag: 1,
        status: 0,
        unitFlag: 0
      },
      // 表单校验
      rules: {
        deptName: [
          { required: true, message: "部门名称不能为空", trigger: "blur" },
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              let reg = /\S/;
              if (!reg.test(value)) {
                callback(
                  new Error(
                    '部门名称不能为空'
                  )
                )
              } else {
                callback()
              }
            }
          }
        ],
        // deptCode: [
        //   { required: true, message: "部门编号不能为空", trigger: "blur" },
        //   {
        //     trigger: 'blur',
        //     validator: (rule, value, callback) => {
        //       var deptCodereg = /[^\a-\z\A-\Z0-9]/
        //       if (deptCodereg.test(value)) {
        //         callback(
        //           new Error(
        //             '部门编号只能是数字或字母'
        //           )
        //         )
        //       } else {
        //         callback()
        //       }
        //     }
        //   }
        // ],
      },
      flagOption: [
        { code: 0, name: '统一' },
        { code: 1, name: '自建' }
      ],
      statusOpt: [
        { value: 0, label: '启用' },
        { value: 1, label: '停用' },
      ],
    };
  },
  created () { },
  methods: {
    /** 提交按钮（数据权限） */
    init (type, id) {
      this.type = type;
      this.id = id;
      this.openDataScope = true;
      this.loading = false;
      this.$nextTick(() => {
        this.$refs.elForm.resetFields();
        this.form.unitFlag = 0
        if (type === "update") {
          this.title = "修改部门";
          this.deptDetail(id);
        } else {
          this.title = "新增部门";
          this.form.parentId = id || undefined;
        }
      });
    },
    /** 转换部门数据结构 */
    normalizer (node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: `【${node.deptCode}】` + node.deptName,
        children: node.children,
      };
    },
    deptDetail (id) {
      deptDetail(id).then(({ data }) => {
        this.form = {
          deptName: data.deptName,
          deptCode: data.deptCode,
          parentId: data.parentId || undefined,
          seq: data.seq || 0,
          deptAlias: data.deptAlias,
          flag: data.flag == undefined ? 1 : data.flag,
          status: data.status || 0,
          unitFlag: data.unitFlag || 0
        }
      });
    },
    submitDataScope () {
      this.$refs["elForm"].validate((valid) => {
        if (valid) {
          this.loading = true;
          deptCreate(this.form).then(({ success, message }) => {
            this.loading = false;
            if (success) {
              this.$modal.msgSuccess(message);
              this.openDataScope = false;
              this.$emit("deptSuccess");
            } else {
              this.$modal.msgError(message);
            }
          });
        }
      });
    },
    deptModify () {
      this.$refs["elForm"].validate((valid) => {
        if (valid) {
          this.loading = true;
          deptModify(Object.assign({}, this.form, { id: this.id })).then(({ success, message }) => {
            this.loading = false;
            if (success) {
              this.$modal.msgSuccess(message);
              this.openDataScope = false;
              this.$emit("deptSuccess");
            } else {
              this.$modal.msgError(message);
            }
          });
        }
      });
    },
  },
};
</script>
