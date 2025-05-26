<template>
  <div style="height: 100vh;">
    <div class="app-container container_flex">
      <el-row class="container_flex_button">
        <el-col :span="1.5" v-for="item in property.buttonTop" :key="item.id">
          <button-top :item="item" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled" />
        </el-col>
      </el-row>
      <form-data :formData="formData" :isClean="isCleanField" :showSearch="showSearch" :searchArr="property.search || []"
        @handleQuery="handleQuery" />
      <el-row type="flex" class="container_h">
        <!--区域数据-->
        <el-col :xs="24" class="container_flex_overflow">
          <div class="head-container">
            <div style="overflow:auto">
              <div class="li-item" v-for="(item, index) in areaList" :key="index" @click="getList(item, index)"
                :class="{ 'active-item': index == activeIndex }">{{ item.title }}</div>
            </div>
          </div>
        </el-col>
        <!--用户数据-->
        <el-col :span="20" :xs="24" class="container_flex">
          <right-toolbar :formData="formDataSelf" :searchArr="property.search || []" :total="total"
            :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery" @clickReset="clickReset"
            @numberChange="numberChange"></right-toolbar>
          <table-index ref="tableIndex" :loading="loading" :tableData="list" :property="property"
            :buttonDisable="handleButtonDisable" :numberShow="numberShow" @handleSelectionChange="handleSelectionChange"
            @handleButton="handleButton" />
        </el-col>
      </el-row>
    </div>
    <el-dialog :title="dialogType[operateType].title" :visible.sync="dialogVisible" width="30%"
      :before-close="handleClose">
      <el-form label-width="80px" :model="dialogParams">
        <el-form-item label="模块">
          <el-input v-model.trim="dialogParams.loopkey" placeholder="请输入" :disabled="operateType === 'edit'"></el-input>
        </el-form-item>
        <el-form-item label="回路">
          <el-select v-model="dialogParams.loopid" style="width: 100%;" multiple placeholder="请选择"
            :disabled="operateType === 'edit'">
            <el-option v-for="item in loopDict" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <div v-show="operateType == 'edit'">
          <el-checkbox v-model="dialogParams.half">半开</el-checkbox>
          <el-checkbox v-model="dialogParams.fourth">1/4开</el-checkbox>
          <el-checkbox v-model="dialogParams.eight">1/8开</el-checkbox>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
        <el-button @click="handleClose">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  getLightAreaList,
  getLoopList,
  getLoopById,
  addLoop,
  updateLoop,
  getLoopDetail,
  deleteLoop
} from './api'
export default {
  name: 'loopConfig',
  components: {},
  props: {},
  data() {
    return {
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      areaList: [],
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
      visible: false,
      metaId: '',
      selected: [],
      workFlowViewVisible: false,
      selectedItem: null,
      activeIndex: 0,
      loopDict: [
        { label: '第一回路', value: '03' },
        { label: '第二回路', value: '04' },
        { label: '第三回路', value: '05' },
        { label: '第四回路', value: '06' },
        { label: '第五回路', value: '07' },
        { label: '第六回路', value: '08' },
        { label: '第七回路', value: '09' },
        { label: '第八回路', value: '0A' },
        { label: '第九回路', value: '0B' },
        { label: '第十回路', value: '0C' },
        { label: '第十一回路', value: '0D' },
        { label: '第十二回路', value: '0E' },
      ],
      dialogVisible: false,
      dialogParams: {
        loopkey: '',
        loopid: [],
        half: false, // 半开
        fourth: false, // 1/4开
        eight: false, // 1/8开
      },
      curRow: null,
      operateType: 'add',
      dialogType: {
        'add': {
          title: '新增回路',
        },
        'edit': {
          title: '修改回路',
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
    handleSelectionChange(ids, single, multiple, selected) {
      this.single = single
      this.multiple = multiple
      this.selected = selected
    },
    // 获取区域列表
    getAreaList() {
      getLightAreaList().then(({ data }) => {
        this.areaList = data.map(item => {
          return {
            title: item.title,
            id: item.items[0].id,
          }
        });
        this.areaList.unshift({
          title: '全部',
          id: '',
        });
      })
    },
    // 获取全部回路信息
    getAllList() {
      this.loading = true;
      const loopMap = {};
      this.loopDict.forEach(item => {
        loopMap[item.value] = item.label;
      });
      const dict = {
        1: '启用',
        0: '停用',
      };
      getLoopList().then(({ data }) => {
        this.list = data.content.map(item => {
          return {
            ...item,
            loopname: loopMap[item.loopid],
            half: dict[item.half],
            fourth: dict[item.fourth],
            eight: dict[item.eight],
          }
        });
        this.total = data.content.length;
      }).finally(() => {
        this.loading = false;
      })
    },
    // 根据id获取回路信息
    getList(item, index) {
      this.activeIndex = index;
      this.selectedItem = item;
      this.loading = true;
      const fun = item?.id ? getLoopById({ id: item.id }) : getLoopList();
      const loopMap = {};
      this.loopDict.forEach(item => {
        loopMap[item.value] = item.label;
      });
      const dict = {
        1: '启用',
        0: '停用',
      };
      fun.then(({ data }) => {
        this.list = data.content.map(item => {
          return {
            ...item,
            loopname: loopMap[item.loopid],
            half: dict[item.half],
            fourth: dict[item.fourth],
            eight: dict[item.eight],
          }
        });
        this.total = data.content.length;
      }).finally(() => {
        this.loading = false;
      })
    },
    // 这里进行上方按钮操作，和表格中的操作列
    handleButton(id, buttonCode, data) {
      if (buttonCode === 'create') {
        if (!this.selectedItem?.id) {
          this.$modal.msgWarning('请先选择区域');
          return
        }
        this.operateType = 'add';
        this.dialogParams.areaname = this.selectedItem.title;
        this.dialogVisible = true;
        return
      }
      if (buttonCode === 'edit') {
        this.curRow = data;
        getLoopDetail(this.curRow.id).then(res => {
          if (res.code == 200) {
            Object.assign(this.dialogParams, {
              ...res.data,
              loopid: [res.data.loopid],
              half: Boolean(res.data.half), // 半开
              fourth: Boolean(res.data.fourth), // 1/4开
              eight: Boolean(res.data.eight), // 1/8开
            });
          }
        });
        this.operateType = 'edit';
        this.dialogVisible = true;
        return
      }
      if (buttonCode === 'delete') {
        this.$modal.confirm('是否确认删除?').then(() => {
          return deleteLoop(data.id)
        }).then(res => {
          if (res.code == 200) {
            this.$modal.msgSuccess('删除成功');
            this.getList(this.selectedItem, this.activeIndex);
          } else {
            this.$modal.msgError(res.msg);
          }
        }).catch(() => {
          console.log('取消删除');
        });
        return
      }
    },
    handleQuery(row = {}, name = []) {
      this.formData = Object.assign({}, this.formData, row)
      this.formDataSelf = Object.assign({}, this.formData, row)
      this.isCleanField = name
      // this.getList()  列表接口
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
      if (this.dialogParams.loopkey.length === 0) {
        this.$modal.msgWarning('请输入模块');
        return
      }
      if (this.dialogParams.loopid.length === 0) {
        this.$modal.msgWarning('请选择回路');
        return
      }
      if (this.operateType === 'add') {
        const params = this.dialogParams.loopid.map(item => {
          return {
            areaid: this.selectedItem.id,
            areaname: this.selectedItem.title,
            loopkey: this.dialogParams.loopkey,
            loopid: item,
            half: '1',
            fourth: '1',
            eight: '1',
          }
        });
        addLoop(params).then(res => {
          if (res.code == '200') {
            this.$modal.msgSuccess('操作成功');
            this.handleClose();
            this.getList(this.selectedItem, this.activeIndex);
          } else {
            this.$modal.msgError('操作失败');
          }
        });
      } else {
        const params = {
          ...this.dialogParams,
          loopid: this.dialogParams.loopid[0],
          half: Number(this.dialogParams.half),
          fourth: Number(this.dialogParams.fourth),
          eight: Number(this.dialogParams.eight),
        };
        updateLoop(params).then(res => {
          if (res.code == '200') {
            this.$modal.msgSuccess('操作成功');
            this.handleClose();
            this.getList(this.selectedItem, this.activeIndex);
          } else {
            this.$modal.msgError('操作失败');
          }
        });
      }
    },
    handleClose() {
      Object.assign(this.dialogParams, {
        loopkey: '',
        loopid: [],
        half: false, // 半开
        fourth: false, // 1/4开
        eight: false, // 1/8开
      });
      this.dialogVisible = false;
    }
  },
  created() {
    let st = this.$store.state.permission.sidebarRoutersHidden
    st.forEach(val => {
      if (val.meta) {
        if (val.meta.title == '设备管理') {
          this.metaId = val.children.filter(item => { return item.meta.title == '回路配置' })[0].meta.id

        }
      }
    });
    this.$store.dispatch('menuProperty', this.metaId).then((data) => {
      this.property = data
      // if (localStorage.getItem('columns_' + this.metaId)) {
      //   this.property.fields = JSON.parse(localStorage.getItem('columns_' + this.metaId))
      // }
    })
    this.getAreaList();
    this.getAllList();
  },
  mounted() {
  },
}
</script>
<style lang="scss" scoped>
.li-item {
  height: 38px;
  line-height: 38px;
  font-size: 14px;
  padding-left: 28px;
  cursor: pointer;
  border-radius: 5px;
  margin: 0 8px;
}

.active-item {
  background-color: #e6edff;
}
</style>
