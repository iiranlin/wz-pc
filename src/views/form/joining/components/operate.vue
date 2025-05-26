<template>
  <div>
    <Dialog :title="title" :close-on-click-modal="false" :visible.sync="dialogFlag" width="1200px" append-to-body top="3vh"  >
      <el-form class="form-box" ref="elForm" :model="formData" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="组合编号:" prop="joiningCode">
              <el-input v-model="formData.joiningCode" placeholder="请输入组合编号" :disabled="this.type == 'update'" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="组合名称:" prop="joiningName">
              <el-input v-model="formData.joiningName" placeholder="请输入组合名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态:">
              <el-switch v-model="formData.status" :active-value="0" :inactive-value="1">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <div class="form-table-title">
            <span>表单列表</span>
            <div>
              <el-button type="primary" size="mini" @click="selectFormList">引用表单</el-button>
              <el-button type="primary" size="mini" @click="previewForm(formData.childForm)">预览组合</el-button>
            </div>
          </div>
          <el-table class="child_form_table" :data="childFormList" style="width: 100%" :row-key="getRowKey"
            :row-class-name="tableRowClassName">
            <el-table-column prop="id" align="center" width="50" type="index">
              <i class="el-icon-s-operation drag"></i>
            </el-table-column>
            <el-table-column label="序号" align="left" width="50" type="index" :show-overflow-tooltip="true">
            </el-table-column>
            <el-table-column prop="formCode" label="表单名称" align="left">
            </el-table-column>
            <el-table-column prop="formName" label="表单名称" align="left">
            </el-table-column>
            <el-table-column label="表单内容" align="left">
              <template slot-scope="{row}">
                <el-link type="primary" :disabled="row.status == 1" round @click="previewForm([row])">预览</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="启用" align="center" width="100">
              <template slot-scope="{row}">
                <el-switch v-model="row.status" :active-value="0" :inactive-value="1"></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="操作" prop="status" align="center" width="100">
              <template slot-scope="{row}">
                <el-button size="mini" plain type="danger" @click="delChildForm(row)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="type == 'create' ? create() : modify()" :loading="loading">确 定
        </el-button>
        <el-button @click="dialogFlag = false">取 消</el-button>
      </div>
    </Dialog>

    <ChildForm ref="childForm" :formIdList="childFormIdList" />

    <PreviewForm ref="previewForm" :formList="formList" />

  </div>
</template>

<script>
import { create, detail, modify } from "@/api/form/form-joining";
import ChildForm from './childForm';
import PreviewForm from './previewForm';
import Sortable from 'sortablejs';

export default {
  components: { ChildForm, PreviewForm },
  data() {
    return {
      dialogFlag: false,
      loading: false,
      title: "新增",
      type: "add",
      id: "",
      formData: {
        joiningCode: "",
        joiningName: "",
        status: 0,
      },
      childFormList: [],
      childFormIdList: [],
      // 组合校验
      rules: {
        joiningCode: [
          { required: true, message: "组合编号不能为空", trigger: "blur" },
        ],
        joiningName: [
          { required: true, message: "组合名称不能为空", trigger: "blur" },
        ],
      },
      formList: [],
    };
  },
  watch: {
    "childFormList": {
      handler(val) {
        this.childFormIdList = val.map(res => res.id);
      },
      deep: true
    }
  },
  methods: {
    /** 提交按钮（数据权限） */
    init(type, id) {
      this.type = type;
      this.id = id || null;
      this.loading = false;
      this.childFormList = []
      this.dialogFlag = true;
        this.$nextTick(() => {
          this.$refs.elForm.resetFields();
          this.rowDropPage();
        });
      if (type === "create") {
        this.title = "新增组合"
      } else if (type === "update") {
        this.title = "修改组合";
        detail(id).then(({ data }) => {
          this.formData = data;
          this.childFormList = data.childForm;
        });
      }
    },
    create() {
      this.$refs["elForm"].validate((valid) => {
        if (valid) {
          this.loading = true;
          const data = this.formData
          data["childForm"] = this.childFormList
          create(this.formData).then(({ message, data }) => {
            this.$modal.msgSuccess(message);
            this.dialogFlag = false;
            this.loading = false;
            this.$emit("success");
          });
        }
      });
    },
    modify() {
      this.$refs["elForm"].validate((valid) => {
        if (valid) {
          this.loading = true;
          const data = this.formData
          data["childForm"] = this.childFormList
          modify(Object.assign({}, this.formData, { id: this.id })).then(({ message, data }) => {
            this.$modal.msgSuccess(message);
            this.dialogFlag = false;
            this.loading = false;
            this.$emit("success");
          });
        }
      });
    },
    selectFormList() {
      this.$nextTick(() => {
        this.$refs["childForm"].init()
      })
    },
    addChildForm(row) {
      if (this.childFormIdList.indexOf(row.id) == -1) {
        this.childFormList.push(row)
      }
    },
    delChildForm(row) {
      const idx = this.childFormIdList.indexOf(row.id);
      if (idx > -1) {
        this.childFormList.splice(idx, 1)
      }
    },
    previewForm(formList) {
      this.formList = formList

      this.$nextTick(() => {
        this.$refs["previewForm"].init()
      })
    },
    rowDropPage() { // 行拖拽
      const tbodys = document.querySelector('.child_form_table .el-table__body-wrapper tbody')
      const _this = this
      Sortable.create(tbodys, {
        handle: '.drag',
        onEnd({ newIndex, oldIndex }) {
          const currRow = _this.childFormList.splice(oldIndex, 1)[0]
          _this.childFormList.splice(newIndex, 0, currRow)
        }
      })
    },
    tableRowClassName(e) {
      e.row.index = e.rowIndex
      e.row.seq = e.rowIndex + 1
      return 'rowPadding'
    },
    getRowKey(row) {
      if (row.id) {
        return row.id
      } else {
        return row.ids
      }
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep .container_table .el-input__inner {
  background: none;
  border: none;
}

.form-table-title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
::v-deep .el-table {
  margin: 0;
}
::v-deep .el-dialog {
  display: flex;
  flex-direction: column;
  height: calc(100% - 12vh);
  overflow-y: hidden;
}

::v-deep .el-dialog__body {
  flex: 1;
  overflow-y: hidden;
}

::v-deep .form-box {
  height: 100%;
  display: flex;
  flex-direction: column;
}

::v-deep .el-form .el-row:nth-child(2){
  flex: 1;
}

::v-deep .el-dialog__body .el-table {
  height: calc(100% - 120px);
  overflow-y: scroll;
}

.child_form_table {
  ::v-deep.cell {
    overflow: unset;
  }
}

.drag {
  cursor: move;
  font-size: 20px;
}
</style>