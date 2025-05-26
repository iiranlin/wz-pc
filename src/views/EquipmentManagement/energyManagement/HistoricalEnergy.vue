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
import {
  getTodayEnergyUserInfo,
  historyEnergyStatisticsList,
  historyShuiEnergyStatisticsList,
  listDeviceArea,
  listDeviceCategory,
  listStation, listWaterArea
} from "@/api/ksapi";

export default {
  name: "HistoricalEnergy",
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

      propertyShui: {},
      isCleanField: [],
      formDataSelf: {},

      id: this.$route.meta.id,

      // 1 登录用户信息
      userInfoDataHis: [],
      // 2 车站列表
      stationListDataHis: [],
      // 3 设备类型
      listDeviceCategoryHis: [],
      // 4 设备区域
      deviceAreaDataHis: [],
      // 5 标识（按日/月查询）
      biaoshi: [],
      // 6 水表区域
      waterAreaDataHis: [],

      // 判断是电表还是水表：1.电表 2.水表
      isDianOrShuiHis: 1,
      // 能耗总值
      allEnergy: ""
    };
  },
  created() {
    this.getHistoryEnergyUserInfo();
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
        // todo
        // this.property.search[3].updateTime = null
        this.property.search[2].fieldFormatArr = this.deviceAreaDataHis
        this.property.fields = this.dataDianTable
        this.isDianOrShuiHis = 1
        return
      }
      if (buttonCode === 'shui') {
        // console.log(this.formData,999);
        // this.formData = {}
        this.dataList = []
        this.allEnergy = ""
        this.property.search = this.dataShuiSearch
        // todo
        // this.property.search[3].updateTime = null
        this.property.search[1].fieldFormatArr = this.waterAreaDataHis
        this.property.fields = this.dataShuiTable
        this.isDianOrShuiHis = 2
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
    getHistoryEnergyUserInfo() {
      // 1 获取当前登录用户信息
      getTodayEnergyUserInfo().then(res => {
        this.userInfoDataHis = res.data

        // 6 获取水表区域
        const params = {StationCode: this.userInfoDataHis.stationCode};
        listWaterArea(params).then(res => {
          this.waterAreaDataHis = res.data.map((item, index) => {
            return {id: index, code: item, name: item, seq: index, value: item}
          })
        })
      })

      // 2 获取车站列表
      listStation().then(res => {
        this.stationListDataHis = res.data.map(item => {
          return {id: item.id, code: item.id, name: item.value, seq: item.id, value: item.value}
        })
      })
      // 3 获取设备类型
      listDeviceCategory().then(res => {
        this.listDeviceCategoryHis = res.data.map((item, index) => {
          return {id: index, code: item, name: item, seq: index, value: item}
        })
      })
      // 4 获取设备区域
      listDeviceArea().then(res => {
        this.deviceAreaDataHis = res.data.map((item, index) => {
          return {id: index, code: item, name: item, seq: index, value: item}
        })
      })
      // 5 按日/月查询
      this.biaoshi = [
        {id: 1, code: "day", name: "按日查询", seq: 1, value: 1},
        {id: 2, code: "month", name: "按月查询", seq: 2, value: 2}
      ]
    },

    //初始化获取按钮操作
    menuProperty() {
      this.$store.dispatch('menuProperty', this.id).then((data) => {
        this.property = JSON.parse(JSON.stringify(data))
        this.property.search[0].fieldFormatArr = this.stationListDataHis
        this.property.search[2].fieldFormatArr = this.listDeviceCategoryHis
        this.property.search[3].fieldFormatArr = this.deviceAreaDataHis
        this.property.search[5].fieldFormatArr = this.biaoshi

        // //电表搜索项
        this.dataDianSearch = [this.property.search[0], this.property.search[2], this.property.search[3], this.property.search[4], this.property.search[5]];
        // //电表表头
        this.dataDianTable = [this.property.fields[15], this.property.fields[18], this.property.fields[3], this.property.fields[16], this.property.fields[17]];
        // //水表搜索项
        this.dataShuiSearch = [this.property.search[0], this.property.search[3], this.property.search[4], this.property.search[5]];
        // //水表表头
        this.dataShuiTable = [this.property.fields[5], this.property.fields[12], this.property.fields[19]];
        this.property.search = this.dataDianSearch;
        this.property.fields = this.dataDianTable
      });
    },

    getList() {
      this.loading = true;

      // 获取当前时间：yyyy-MM-dd
      const date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      if (month < 10) month = `0${month}` // 如果月份是个位数，在前面补0
      if (day < 10) day = `0${day}` // 如果日是个位数，在前面补0
      let startTime = year + "-" + month + "-" + day;

      let pageSize = this.listQuery.pageSize;
      let posStart = (this.listQuery.pageSize * this.listQuery.pageNum) - this.listQuery.pageSize

      if (this.isDianOrShuiHis === 1) {
        if (this.formData.startTimeStart !== null && this.formData.biaoshi === 'month') {
          // 按月
          this.formData.startTime = this.formData.startTimeStart.slice(0, 7)
        }
        if (this.formData.startTimeStart !== null && this.formData.biaoshi === 'day') {
          // 按日
          this.formData.startTime = this.formData.startTimeStart.slice(0, 10)
        }
        let params = {}
        if (!this.formData.hasOwnProperty('stationId')) {
          params = {StationCode: this.userInfoDataHis.stationCode, startTime: startTime, biaoshi: 'day', pageSize, posStart, ...this.formData}
          // params = {StationCode: this.userInfoDataHis.stationCode, startTime: startTime, biaoshi: 'day', ...this.listQuery, ...this.formData}
        } else {
          params = {pageSize, posStart, ...this.formData, stationId: this.userInfoDataHis.stationId}
          // params = {...this.listQuery, ...this.formData, stationId: this.userInfoDataHis.stationId}
        }
        historyEnergyStatisticsList(params).then(({data}) => {
          this.dataList = data.content;
          this.total = data.total_count;
          this.allEnergy = data.allEnergy;
        }).finally(() => {
          this.loading = false;
        });
      } else if (this.isDianOrShuiHis === 2) {
        if (this.formData.startTimeStart !== null && this.formData.biaoshi === 'month') {
          // 按月
          this.formData.startTime = this.formData.startTimeStart.slice(0, 7)
        }
        if (this.formData.startTimeStart !== null && this.formData.biaoshi === 'day') {
          // 按日
          this.formData.startTime = this.formData.startTimeStart.slice(0, 10)
        }
        let params = {}
        if (!this.formData.hasOwnProperty('stationId')) {
          params = {StationCode: this.userInfoDataHis.stationCode, startTime: startTime, biaoshi: 'day', pageSize, posStart, ...this.formData}
          // params = {StationCode: this.userInfoDataHis.stationCode, startTime: startTime, biaoshi: 'day', ...this.listQuery, ...this.formData}
        } else {
          params = {pageSize, posStart, ...this.formData, StationCode: this.userInfoDataHis.stationCode}
          // params = {...this.listQuery, ...this.formData, StationCode: this.userInfoDataHis.stationCode}
        }
        historyShuiEnergyStatisticsList(params).then(({data}) => {
          this.dataList = data.content;
          this.total = data.total_count;
          this.allEnergy = data.allEnergy;
        }).finally(() => {
          this.loading = false;
        });
      }
    }
  }
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
