<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery" :formData="formData" />
    <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []" :showSearch.sync="showSearch" :columns="property.fields"
                     @queryTable="handleQuery" @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
                    @cleanClick="cleanClick"
      ></right-toolbar>
    <table-index ref="tableIndex" :loading="loading" :tableData="dataList" :property="property" :numberShow="numberShow"
                 @handleSelectionChange="handleSelectionChange"
                 @handleButton="handleButton"
                 @selectChange="selectChange"
                 @emitAblFilter="emitAblFilter"
    />
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改用户登录日志对话框 -->
    <Dialog :title="title" :visible.sync="open" width="500px" :close-on-click-modal="false" append-to-body >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入登录账号"/>
        </el-form-item>
        <el-form-item label="操作内容:" prop="operate">
          <el-radio-group v-model="form.operate">
            <el-radio
              v-for="dict in dict.type.logType"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="form.ip" placeholder="请输入IP地址"/>
        </el-form-item>
        <el-form-item label="登陆浏览器" prop="browser">
          <el-input v-model="form.browser" placeholder="请输入登陆浏览器"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </Dialog>
  </div>
</template>

<script>
import {list, delLogin, detail, modify, create} from "@/api/system/log-login";
import indexMixin from '@/views/mixins';

export default {
  mixins: [indexMixin],
  name: "login",
  dicts: ['logType'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户登录日志表格数据
      dataList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {
        username: null,
        createDate: null,
        operate: 1,
        ip: null,
        browser: null
      },
      formData: {},
      formDataClick: {},
      // 表单校验
      rules: {},
      //列表显示字段
      property: {},
      numberShow: false,
    };
  },
  created() {
    let id = this.$route.meta.id;
    this.$store.dispatch('menuProperty', id).then( (data) => {
      this.property = data;
    });
  },
  methods: {
    numberChange (val) {
      this.numberShow = val;
    },
    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery)
      this.handleQuery();
    },
    //选择框回调
    selectChange(row) {
      let {formData, isWatch} = row;
      if(!isWatch){
        this.handleQuery(formData);
      }else{
        this.formData = Object.assign({}, this.formData, formData);
      }
    },
    clickReset() {
      this.menuProperty();
      this.handleQuery();
    },
    newButton(buttonCode) {
      this.$refs.tableIndex.newButton(buttonCode)
    },
    handleCheckAllChange(columns) {
      this.$refs.tableIndex.init(columns);
    },
    /** 查询用户登录日志列表 */
    getList() {
      this.loading = true;
      list(Object.assign({}, this.listQuery, this.formData)).then(response => {
        this.dataList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        username: null,
        createDate: null,
        operate: 1,
        ip: null,
        browser: null
      };
      this.resetForm("form");
    },
    cleanClick(data) {
      for (const key of data) {
        if (key.indexOf("Start") != -1 || key.indexOf("End") != -1) {
          this.$refs.formData.resetQueryDateRange(key);
        }
        this.formData[key] = null;
      }
      this.handleQuery();
    },
    /** 搜索按钮操作 */
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row)
      this.formDataClick = Object.assign({}, this.formData, row)
      this.getList();
    },
    // 多选框选中数据
    handleSelectionChange(ids, single, multiple) {
      this.single = single
      this.multiple = multiple
    },
    /** 新增按钮操作 */
    handleCreate() {
      this.reset();
      this.open = true;
      this.title = "添加用户登录日志";
    },
    /** 修改按钮操作 */
    handleUpdate(id) {
      this.reset();
      detail(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改用户登录日志";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            modify(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            create(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(ids) {
      this.$modal.confirm('是否确认删除？').then(function () {
        return delLogin({ids: ids});
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    handleButton (buttonCode, idArr, rowArr, { formId }) {
      if (buttonCode === 'update') {
        this.handleUpdate(idArr[0])
      } else if (buttonCode === 'delete') {
        this.handleDelete(idArr)
      } else if (buttonCode === 'create') {
        this.handleCreate()
      }
    },
  }
};
</script>
