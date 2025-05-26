<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery" :formData="formData" />
    <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []" :showSearch.sync="showSearch" :columns="property.fields"
                    @queryTable="handleQuery" @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange" @cleanClick="cleanClick"
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

    <!-- 添加或修改操作记录对话框 -->
    <Dialog :title="title" :visible.sync="open" width="500px" :close-on-click-modal="false" append-to-body >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="操作人" prop="username">
          <el-input v-model="form.username" placeholder="请输入操作人"/>
        </el-form-item>
        <el-form-item label="执行模块" prop="module">
          <el-input v-model="form.module" placeholder="请输入执行模块"/>
        </el-form-item>
        <el-form-item label="执行方法" prop="methods">
          <el-input v-model="form.methods" placeholder="请输入执行方法"/>
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="form.ip" placeholder="请输入IP地址"/>
        </el-form-item>
        <el-form-item label="执行描述" prop="flag">
          <el-input v-model="form.flag" placeholder="请输入执行描述"/>
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

    <detail-drawer ref="detail"/>
  </div>
</template>

<script>
import {list, detail, delOperate, create} from "@/api/system/log-operate";
import indexMixin from '@/views/mixins';
import operate from "@/views/system/user/components/operate";
import roleDrawer from "@/views/system/user/components/roleDrawer";
import DetailDrawer from "@/views/system/log/operate/components/detailDrawer";

export default {
  mixins: [indexMixin],
  components: {operate, roleDrawer, DetailDrawer},
  name: "operate",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 操作记录表格数据
      dataList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      // 表单参数
      form: {
        id: null,
        username: null,
        module: null,
        methods: null,
        actionUrl: null,
        ip: null,
        createDate: null,
        flag: null,
        browser: null,
        reqData: null,
        resData: null
      },
      // 表单校验
      rules: {},
      property: {},
      formData: {},
      formDataClick: {},
      // 表格序号是否展示
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
    handleDetail(row) {
      this.$refs.detail.init(row)
    },
    numberChange (val) {
      this.numberShow = val;
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
    //选择框回调
    selectChange(row) {
      let {formData, isWatch} = row;
      if(!isWatch){
        this.handleQuery(formData);
      }else{
        this.formData = Object.assign({}, this.formData, formData);
      }
    },
    /** 查询操作记录列表 */
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
        module: null,
        methods: null,
        actionUrl: null,
        ip: null,
        createDate: null,
        flag: null,
        browser: null,
        reqData: null,
        resData: null
      };
      this.resetForm("form");
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
    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery)
      this.handleQuery();
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
    /** 新增按钮操作 */
    handleCreate() {
      this.reset();
      this.open = true;
      this.title = "添加操作记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      detail(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改操作记录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          create(this.form).then(response => {
            this.$modal.msgSuccess("新增成功");
            this.open = false;
            this.getList();
          });
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(ids) {
      this.$modal.confirm('是否确认删除？').then(function () {
        return delOperate({ids: ids});
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
      } else if (buttonCode === 'detail') {
        this.handleDetail(rowArr[0])
      }
    },
  }
};
</script>
