<template>
  <div class="contentDiv">
    <div class="app-container container_flex">
      <!-- 搜索 按钮 -->
      <el-row class="container_flex_button">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton" />
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
  dianInstrumentStatisticsList,
  getTodayEnergyUserInfo,
  listDeviceCategory,
  listStation, listWaterArea
} from "@/api/ksapi";

export default {
  name: "EnergyInstrument",
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

      // 用户信息
      userInfoDataInstrument: [],
      // 仪表统计车站
      stationListInstrument: [],
      // 仪表统计设备类型列表
      DeviceCategoryInstrument: [],
      // 水表区域
      waterAreaInstrument: [],
      // 判断是电表还是水表
      isDianOrShuiInstrument: 1,
      // mark 电表为Ep  水表为Wu
      mark: 'Ep'
    };
  },
  created() {
    this.getInstrumentEnergyUserInfo();
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
        // 原数组 property
        this.property.search = this.dataDianSearch
        this.property.fields = this.dataDianTable
        this.isDianOrShuiInstrument = 1
        return
      }
      if (buttonCode === 'shui') {
        this.formData = {}
        this.dataList = []
        this.property.search = this.dataShuiSearch
        this.property.search[1].fieldFormatArr = this.waterAreaInstrument
        this.property.fields = this.dataShuiTable
        this.isDianOrShuiInstrument = 2
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
    getInstrumentEnergyUserInfo() {
      // 1 获取当前登录用户信息
      getTodayEnergyUserInfo().then(res => {
        this.userInfoDataInstrument = res.data

        // 4 水表区域
        const params = {StationCode: this.userInfoDataInstrument.stationCode};
        listWaterArea(params).then(res => {
          this.waterAreaInstrument = res.data.map((item, index) => {
            return {id: index, code: item, name: item, seq: index, value: item}
          })
        })
      })
      // 2 获取车站列表
      listStation().then(res => {
        this.stationListInstrument = res.data.map(item => {
          return {id: item.id, code: item.id, name: item.value, seq: item.id, value: item.value}
        })
      })
      // 3 获取设备类型
      listDeviceCategory().then(res => {
        this.DeviceCategoryInstrument = res.data.map((item, index) => {
          return {id: index, code: item, name: item, seq: index, value: item}
        })
      })
    },

    //初始化获取按钮操作
    menuProperty() {
      this.$store.dispatch('menuProperty', this.id).then((data) => {
        this.property = JSON.parse(JSON.stringify(data))
        this.property.search[0].fieldFormatArr = this.stationListInstrument
        this.property.search[6].fieldFormatArr = this.DeviceCategoryInstrument
        this.property.search[3].fieldFormatArr = this.waterAreaInstrument

        // 电表搜索项
        this.dataDianSearch = [this.property.search[0], this.property.search[6]];
        // 电表表头
        this.dataDianTable = [this.property.fields[5], this.property.fields[6], this.property.fields[21]];
        //水表搜索项
        this.dataShuiSearch = [this.property.search[0], this.property.search[3]];
        //水表表头
        this.dataShuiTable = [this.property.fields[5], this.property.fields[12], this.property.fields[21]];
        this.property.search = this.dataDianSearch;
        this.property.fields = this.dataDianTable
      });
    },

    getList() {
      this.loading = true;
      let params = {}
      let pageSize = this.listQuery.pageSize;
      let posStart = (this.listQuery.pageSize * this.listQuery.pageNum) - this.listQuery.pageSize
      if (this.isDianOrShuiInstrument === 1) {
        params = {
          StationCode: this.userInfoDataInstrument.stationCode,
          mark: 'Ep',
          pageSize,
          posStart, ...this.formData
        }
      } else if (this.isDianOrShuiInstrument === 2) {
        params = {
          pageSize, posStart, ...this.formData,
          StationCode: this.userInfoDataInstrument.stationCode,
          mark: 'Wu'
        };
      }
      dianInstrumentStatisticsList(params).then(({data}) => {
        this.dataList = data.content
        this.total = data.total_count;
      }).finally(() => {
        this.loading = false;
      })
    },
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
