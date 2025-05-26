<template>
  <div class="contentDiv">
    <div class="app-container container_flex">
      <!-- 搜索 按钮 -->
      <el-row class="container_flex_button">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton" />
        能耗总值:{{this.allEnergy}}
        <!-- <el-col :span="1.5" v-for="item in property.buttonTop" :key="item.id">
          <button-top :item="item" :multiple="multiple" :single="single" @newButton="newButton"></button-top>
        </el-col> -->
       
        <el-col :span="1.5"> 
           <!-- <button-top></button-top> -->
        </el-col>
      </el-row>
      <form-data :formData="formData" :isClean="isCleanField" :label-width="labelWidth" :showSearch="showSearch"
                 :searchArr="property.search || []" @handleQuery="handleQuery"/>
      <!-- 搜索 种类-->
      <right-toolbar :formData="formDataSelf" :searchArr="property.search || []" :total="total"
                     :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
                     @clickReset="clickReset"
                     @numberChange="numberChange"></right-toolbar>
      <!-- 表格 -->
      <table-index ref="tableIndex" :rowStyleFun="rowStyleFun" @handleButton="handleButton" :loading="loading"
                   :tableData="dataList"
                   :property="property" :numberShow="numberShow"/>
      <!-- 分页 -->
      <pagination style="height: 165px;" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
                  @pagination="getList"/>
    </div>
  </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import {getTodayEnergyUserInfo} from '@/api/ksapi'
import {listStation, listWaterArea} from '@/api/ksapi';
import {listDeviceCategory} from '@/api/ksapi'
import {listDeviceArea} from '@/api/ksapi'
import {todayEnergyList} from '@/api/ksapi'
import {todayEnergyWaterList} from '@/api/ksapi'

// import formData from "@/components/common-vpage/formData/index.vue";

export default {
  name: "todaysEnergy",
  mixins: [indexMixin],
  data() {
    return {
      // 遮罩层
      loading: false,
      // 顶部搜索labelWidth
      labelWidth: '',
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 选中数据
      selection: [],
      // 总条数
      total: 100,
      listQuery: {
        pageNum: 1,
        pageSize: 30
      },
      dataDianSearch: [],//电表搜索
      dataDianTable: [],//电表表头
      dataShuiSearch: [],//水表搜索
      dataShuiTable: [],//水表表头
      // 表格数据
      dataList: [],
      // 表格序号是否展示
      numberShow: true,
      // 表单参数
      formData: {},
      // 菜单按钮、字段等数据
      property: {},
      propertyWater: {},

      propertyShui: {},
      isCleanField: [],
      formDataSelf: {},

      id: this.$route.meta.id,

      // 0 登录用户信息
      userInfoData: [],
      // 1 车站列表
      stationListData: [],
      // 2 查询方式
      selectWayData: 2,
      // 3 设备类型
      deviceCategoryData: [],
      // 4 设备区域
      deviceAreaData: [],
      // 5 水表区域
      waterAreaData: [],
      // 能耗所属车站列表
      energyStationList: [],
      // 判断是电表还是水表：1.电表 2.水表
      isDianOrShui: 1,
      // 能耗总值
      allEnergy: ""
    };
  },
  created() {
    this.initialTodayEnergyData();
    this.menuProperty();
    this.getList();
  },
  methods: {
    rowStyleFun(row, index) {
      if (['1'].includes(row.isBack)) {
        return true
      }
      return false
    },
    handleButton(id, buttonCode, data) {
      //在这里判断电表水表
      if (buttonCode === 'dian') {
        this.formData = {}
        this.dataList = []
        this.allEnergy = ""
        // 原数组 property
        this.property.search = this.dataDianSearch
        this.property.search[3].fieldFormatArr = this.deviceAreaData
        this.property.fields = this.dataDianTable
        this.isDianOrShui = 1
        // 进入页面后默认不调用接口
        // this.getList();
        return
      }
      if (buttonCode === 'shui') {
        this.formData = {}
        this.dataList = []
        this.allEnergy = ""
        //水表搜索项
        this.property.search = this.dataShuiSearch
        this.property.search[2].fieldFormatArr = this.waterAreaData
        this.property.fields = this.dataShuiTable
        this.isDianOrShui = 2
        // 进入页面后默认不调用接口
        // this.getList();
        return
      }
    },
    numberChange(val) {
      this.numberShow = val;
    },
    newButton(buttonCode) {
      this.$refs.tableIndex.newButton(buttonCode);
    },
    handleCheckAllChange(columns) {
      localStorage.setItem('columns_' + this.metaId, JSON.stringify(columns))
      this.$refs.tableIndex.init(columns)
    },
    clickReset() {
      this.menuProperty();
      this.handleQuery();
    },
    /** 搜索按钮操作 */
    handleQuery(row = {}, name = []) {
      this.listQuery.pageNum = 1;
      this.formData = Object.assign({}, this.formData, row);
      this.formDataSelf = Object.assign({}, this.formData, row);
      this.isCleanField = name;
      this.getList();
    },

    // 初始化客设检索条件接口数据
    initialTodayEnergyData() {
      // 0 获取当前登录用户信息
      getTodayEnergyUserInfo().then(res => {
        this.userInfoData = res.data

        // 5 水表区域
        const params = {StationCode: this.userInfoData.stationCode};
        listWaterArea(params).then(res => {
          this.waterAreaData = res.data.map((item, index) => {
            return {id: index, code: item, name: item, seq: index, value: item}
          })
        })
      })
      // 1 车站列表
      listStation().then(res => {
        this.stationListData = res.data.map(item => {
          return {id: item.id, code: item.id, name: item.value, seq: item.id, value: item.value}
        });
      })
      // 2 查询方式固定
      this.selectWayData = [
        {id: 1, code: "1", name: "按能耗值升序查询", seq: 1, value: 1},
        {id: 2, code: "2", name: "按能耗值降序查询", seq: 2, value: 2}
      ]
      // 3 设备类型列表
      listDeviceCategory().then(res => {
        this.deviceCategoryData = res.data.map((item, index) => {
          return {id: index, code: item, name: item, seq: index, value: item}
        })
      })
      // 4 设备区域
      listDeviceArea().then(res => {
        this.deviceAreaData = res.data.map((item, index) => {
          return {id: index, code: item, name: item, seq: index, value: item}
        })
      })
    },

    // 初始化获取按钮操作
    menuProperty() {
      this.$store.dispatch('menuProperty', this.id).then((data) => {
        this.property = data
        this.property.search[0].fieldFormatArr = this.stationListData
        this.property.search[1].fieldFormatArr = this.selectWayData
        this.property.search[2].fieldFormatArr = this.deviceCategoryData
        this.property.search[3].fieldFormatArr = this.deviceAreaData

        //电表搜索项
        this.dataDianSearch = [this.property.search[0], this.property.search[1], this.property.search[2], this.property.search[3]];
        //电表表头
        this.dataDianTable = [this.property.fields[5], this.property.fields[6], this.property.fields[7], this.property.fields[8]];
        //水表搜索项
        this.dataShuiSearch = [this.property.search[0], this.property.search[1], this.property.search[3]];
        //水表表头
        this.dataShuiTable = [this.property.fields[5], this.property.fields[12], this.property.fields[13]];

        this.property.search = this.dataDianSearch;
        this.property.fields = this.dataDianTable
      });
    },
    /** 查询电表能耗 */
    getList() {
      this.loading = true;
      let pageSize = this.listQuery.pageSize;
      let posStart = (this.listQuery.pageSize * this.listQuery.pageNum) - this.listQuery.pageSize
      // todayEnergyList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
      if (this.isDianOrShui === 1) {
        let params = {}
        if (!this.formData.hasOwnProperty('stationId')) {
          params = {stationId: this.userInfoData.stationCode ,selectway: 2, pageSize, posStart, ...this.formData}
          // params = {stationId: this.userInfoData.stationCode ,selectway: 2, ...this.listQuery, ...this.formData}
        } else {
          params = {pageSize, posStart, ...this.formData}
          // params = {...this.listQuery, ...this.formData}
        }
        todayEnergyList(params).then(({data}) => {
          this.dataList = data.content;
          this.total = data.total_count;
          this.allEnergy = data.allEnergy;
        }).finally(() => {
          this.loading = false;
        });
      } else if (this.isDianOrShui === 2) {
        let params = {}
        if (!this.formData.hasOwnProperty('stationId')) {
          params = {StationCode: this.userInfoData.stationCode, selectway: 2, pageSize, posStart, ...this.formData}
        } else {
          params = {pageSize, posStart, ...this.formData, StationCode: this.userInfoData.stationCode}
        }
        todayEnergyWaterList(params).then(({data}) => {
          this.dataList = data.content;
          this.total = data.total_count;
          this.allEnergy = data.allEnergy;
        }).finally(() => {
          this.loading = false;
        });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.contentDiv {
  width: 100%;
  height: 100vh;
}

.el-tabs__header {
  padding: 0;
  position: relative;
  margin: 0 0 0 0;
}
</style>
