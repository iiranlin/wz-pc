<template>
  <div style="height: 100vh;">
    <div class="app-container container_flex">
      <el-row class="container_flex_button">
        <el-col :span="1.5" v-for="item in property.buttonTop" :key="item.id">
          <button-top :item="item" @newButton="newButton" :button-disable="handleTopButtonDisabled" />
        </el-col>
      </el-row>
      <form-data :formData="formData" :isClean="isCleanField" :showSearch="showSearch" :searchArr="property.search || []"
        @handleQuery="handleQuery" />
      <right-toolbar :formData="formDataSelf" :searchArr="property.search || []" :total="total"
        :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery" @clickReset="clickReset"
        @numberChange="numberChange"></right-toolbar>
      <table-index ref="tableIndex" :loading="loading" :tableData="list" :property="property"
        :buttonDisable="handleButtonDisable" :numberShow="numberShow" @handleButton="handleButton" />
    </div>
    <el-dialog :title="dialogType[operateType].title" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <el-form label-width="80px" :model="dialogParams">
        <el-form-item label="区域名称">
          <el-input v-model.trim="dialogParams.areaName"></el-input>
        </el-form-item>
        <el-checkbox v-model="dialogParams.halfOpen">半开</el-checkbox>
        <el-checkbox v-model="dialogParams.quarterOpen">1/4开</el-checkbox>
        <el-checkbox v-model="dialogParams.eighthOpen">1/8开</el-checkbox>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
        <el-button @click="handleClose">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getLightAreaList, addRegion, updateRegion } from './api'
export default {
  name: 'areaConfig',
  components: {},
  props: {},
  data() {
    return {
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      // 表格数据
      list: [],
      // 表格序号是否展示
      numberShow: false,
      // 页面属性
      property: { fields: [{ isAdd: 1, isEdit: 1 }] },
      isCleanField: [],
      selection: [],
      formDataSelf: {},
      total: 0,
      formData: {},
      metaId: '',
      dialogVisible: false,
      dialogParams: {
        areaName: '',
        fullOpen: true, // 全开
        fullClose: true, // 全关
        halfOpen: false, // 半开
        quarterOpen: false, // 1/4开
        eighthOpen: false, // 1/8开
      },
      curRow: null,
      operateType: 'add',
      dialogType: {
        'add': {
          title: '新增区域',
        },
        'edit': {
          title: '修改区域',
        },
      },
    }
  },
  watch: {},
  computed: {},
  methods: {
    // 控制顶部按钮
    handleTopButtonDisabled(button) {
      return this.selection.some(row => this.handleButtonDisable(button, row))
    },
    handleButtonDisable(button, row) {
      if ((button.buttonCode === 'delete' || button.buttonCode === 'update' || button.buttonCode === 'submit') && ['2', '3'].includes(row.status)) {
        return true
      } else if (button.buttonCode === 'flowSee' && ['1'].includes(row.dataSource)) {
        return true
      } else if (button.buttonCode === 'supplement' && row.status != '3') {
        return true
      }
    },
    handleNodeClick(data) {
      console.log(data);
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    clickReset() {
      this.handleQuery()
    },
    getList() {
      this.loading = true
      getLightAreaList().then(({ data }) => {
        this.list = data.map(item => {
          return {
            id: item.items[0].id,
            areaName: item.title,
            fullOpen: item.items.filter(_ => _.statusName === '全开')[0]?.status ? '启用' : '停用',
            fullClose: item.items.filter(_ => _.statusName === '全关')[0]?.status ? '启用' : '停用',
            halfOpen: item.items.filter(_ => _.statusName === '半开')[0]?.status ? '启用' : '停用',
            quarterOpen: item.items.filter(_ => _.statusName === '1/4开')[0]?.status ? '启用' : '停用',
            eighthOpen: item.items.filter(_ => _.statusName === '1/8开')[0]?.status ? '启用' : '停用',
          }
        })
        this.total = data.length
      }).finally(() => {
        this.loading = false
      })
    },
    // 这里进行上方按钮操作，和表格中的操作列
    handleButton(id, buttonCode, data) {
      if (buttonCode === 'create') {
        this.operateType = 'add';
        this.dialogVisible = true;
        return
      }
      if (buttonCode === 'edit') {
        this.curRow = data;
        const dict = {
          '启用': true,
          '停用': false,
        };
        Object.assign(this.dialogParams, {
          areaName: data.areaName,
          fullOpen: dict[data.fullOpen],
          fullClose: dict[data.fullClose],
          halfOpen: dict[data.halfOpen],
          quarterOpen: dict[data.quarterOpen],
          eighthOpen: dict[data.eighthOpen],
        });
        this.operateType = 'edit';
        this.dialogVisible = true;
        return
      }
    },
    handleQuery(row = {}, name = []) {
      this.formData = Object.assign({}, this.formData, row)
      this.formDataSelf = Object.assign({}, this.formData, row)
      this.isCleanField = name
      this.getList()
    },
    resetQuery() {
      this.handleQuery()
    },
    numberChange(val) {
      this.numberShow = val
    },
    newButton(buttonCode) {
      this.$refs.tableIndex.newButton(buttonCode)
    },
    handleSubmit() {
      if(this.dialogParams.areaName.length === 0) {
        this.$modal.msgWarning('请输入区域名称');
        return
      }
      if(this.operateType === 'add') {
        addRegion({
          ...this.dialogParams,
          fullOpen: Number(this.dialogParams.fullOpen),
          fullClose: Number(this.dialogParams.fullClose),
          halfOpen: Number(this.dialogParams.halfOpen),
          quarterOpen: Number(this.dialogParams.quarterOpen),
          eighthOpen: Number(this.dialogParams.eighthOpen),
        }).then(res => {
          if(res.code == '200') {
            this.$modal.msgSuccess('操作成功');
            this.handleClose();
            this.getList();
          } else {
            this.$modal.msgError('操作失败');
          }
        });
      } else {
        updateRegion({
          ...this.dialogParams,
          areaId: this.curRow.id,
          fullOpen: Number(this.dialogParams.fullOpen),
          fullClose: Number(this.dialogParams.fullClose),
          halfOpen: Number(this.dialogParams.halfOpen),
          quarterOpen: Number(this.dialogParams.quarterOpen),
          eighthOpen: Number(this.dialogParams.eighthOpen),
        }).then(res => {
          if(res.code == '200') {
            this.$modal.msgSuccess('操作成功');
            this.handleClose();
            this.getList();
          } else {
            this.$modal.msgError('操作失败');
          }
        });
      }
    },
    handleClose() {
      Object.assign(this.dialogParams, {
        areaName: '',
        fullOpen: true, // 全开
        fullClose: true, // 全关
        halfOpen: false, // 半开
        quarterOpen: false, // 1/4开
        eighthOpen: false, // 1/8开
      });
      this.dialogVisible = false;
    }
  },
  created() {
    let st = this.$store.state.permission.sidebarRoutersHidden
    st.forEach(val => {
      if (val.meta) {
        if (val.meta.title == '设备管理') {
          this.metaId = val.children.filter(item => { return item.meta.title == '区域配置' })[0].meta.id

        }
      }
    });
    this.$store.dispatch('menuProperty', this.metaId).then((data) => {
      this.property = data
      // if (localStorage.getItem('columns_' + this.metaId)) {
      //   this.property.fields = JSON.parse(localStorage.getItem('columns_' + this.metaId))
      // }
    })
    this.getList()
  },
  mounted() {
  },
}
</script>
<style lang="scss" scoped></style>
