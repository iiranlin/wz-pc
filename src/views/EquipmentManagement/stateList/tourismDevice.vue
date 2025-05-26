<template>
  <div style="height: 100vh;">
    <div class="app-container container_flex">
      <el-row class="container_flex_button">
        <el-col :span="1.5" v-for="item in property.buttonTop" :key="item.id">
          <button-top :item="item" :multiple="multiple" :single="single" @newButton="newButton" :button-disable="handleTopButtonDisabled"/>
        </el-col>
      </el-row>
      <form-data :formData="formData" :isClean="isCleanField" :showSearch="showSearch"
        :searchArr="property.search || []" @handleQuery="handleQuery" />
      <right-toolbar :formData="formDataSelf" :searchArr="property.search || []" :total="total"
        :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
        @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset"
        @numberChange="numberChange"></right-toolbar>
      <table-index ref="tableIndex" :loading="loading"  :tableData="list"
        :property="property" :buttonDisable="handleButtonDisable" :numberShow="numberShow"
        @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
        @emitAblFilter="emitAblFilter" @clickLink="clickLink" />
      <pagination style="height: 170px;" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
        @pagination="getList" />
    </div>
  </div>
</template>
<script>export default {
    name:'visitorDevice',
    components: {},
    props: {},
    data() {
      return {
        // 回头删除没用变量

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
        // 表格数据
        list: [
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
          {
            shebeimingcheng:'旅服设备',
            shebeidalei:'1站台南时钟',
            shebeixiaolei:'异步屏',
            chezhan:'1站台',
            shebeiquyu:'10.97.60.145',
            shezhichusuo:'始用日期',
            shiyongriqi:'旅服设备',
          },
        ],
        // 日期范围
        dateRange: [],
        // 表格序号是否展示
        numberShow: false,
        // 页面属性
        property: { fields: [{ isAdd: 1, isEdit: 1 }] },
        isCleanField: [],
        selection:[],
        formDataSelf: {},
        total: 100,
        listQuery: {
          pageNum: 1,
          pageSize: 30
        },
        formData: {},
        visible: false,
        metaId: '',
        selected: [],
        workFlowViewVisible: false,
        selectedRow: null
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
      getList() {
        console.log('表格数据');
        // this.loading = true
        // toHandleList(Object.assign({}, this.listQuery, this.formData, {status: '2'})).then(({data}) => {
        //   this.list = data.list
        //   this.total = data.total
        // }).finally(() => {
        //   this.loading = false
        // })
      },
      emitAblFilter() {
        console.log(4444);
        this.dateRange = []
        this.getList()
      },
      clickLink(row) {
         console.log(row,66666);
         this.$router.push({name: 'ManagementDetails', query:{type: 'create'}})
      },
      //选择框回调
      selectChange(row) {
        console.log('选择框');
        let { formData, isWatch } = row
        if (!isWatch) {
          this.handleQuery(formData)
        } else {
          this.formData = Object.assign({}, this.formData, formData)
        }
      },
      // 这里进行上方按钮操作，和表格中的操作列
      handleButton(id, buttonCode, data) {
        console.log(id, buttonCode, data,8888);
         if (buttonCode === 'create') {
                this.$router.push({name: 'ManagementDetails', query:{type: 'create'}})
                return
            }
            // if (buttonCode === 'update') {
            //     this.handleUpdate(id);
            //     return
            // }
            // if (buttonCode === 'delete') {
            //     this.handleDelete(id);
            //     return
            // }
            // if (buttonCode === 'view') {
            //     this.$router.push({name: 'projectDetails', query:{type: 'view', id: id.projectId}})
            //     return
            // }
            // if(buttonCode === 'submit'){
            //     const orderIds = this.selection.map( (item) => item.projectId);
            //     this.handleSubmit(orderIds);
            //     return
            // }
            // if(buttonCode === 'flowSee'){
            //     this.workFlowViewVisible = true;
            //     this.selectedRow = {businessId: id.projectId};
            //     return
            // }
            // if (buttonCode === 'supplement') {
            //     this.filterCondition.excludeProjectId = id.projectId;
            //     this.$refs.contract.open();
            //     return
            // }
      },
      handleQuery(row = {}, name = []) {
        this.formData = Object.assign({}, this.formData, row)
        this.formDataSelf = Object.assign({}, this.formData, row)
        this.isCleanField = name
        // this.getList()  列表接口
      },
      handleCheckAllChange(columns) {
        localStorage.setItem('columns_' + this.metaId, JSON.stringify(columns))
        this.$refs.tableIndex.init(columns)
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
    },
    created() {
      let st = this.$store.state.permission.sidebarRoutersHidden
      st.forEach(val => {
        if(val.meta){
          if(val.meta.title == '设备管理'){
          this.metaId = val.children.filter(item => {return item.meta.title == '旅服设备'})[0].meta.id

        }
        }
      });
      this.$store.dispatch('menuProperty', this.metaId).then((data) => {
        this.property = data
        if (localStorage.getItem('columns_' + this.metaId)) {
          this.property.fields = JSON.parse(localStorage.getItem('columns_' + this.metaId))
        }
      })
      this.getList()
    },
    mounted() {
     },
  }
</script>
<style lang="scss" scoped>
</style>
