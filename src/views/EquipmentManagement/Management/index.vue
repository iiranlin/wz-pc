<template>
  <div style="display: flex;">
    <form id="downloadForm" target="_blank" method="post" style="display: none">
    </form>
    <form id="fileForm"  style="display: none">
      <input type="file" @change="fileChange" name="file" id="file"  accept=".xls,.xlsx"/>
  </form>
    <div class="leftDiv">
      <el-tabs style="width: 100%;" v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="按设备" name="first">
          <!-- <el-input v-model="inputData">
            <i slot="suffix"  @click.active="Clickinput" style="cursor: pointer;" class="el-input__icon el-icon-search"></i>
          </el-input> -->
          <el-tree :data="Treedatas" :props="defaultPropF" @node-click="handleNodeClick"></el-tree>
        </el-tab-pane>
        <!-- <el-tab-pane label="按区域" name="second">
          <el-input v-model="inputData">
            <i slot="suffix" @click.active="Clickinput" style="cursor: pointer;" class="el-input__icon el-icon-search"></i>
          </el-input>
          <el-tree :data="Treedata" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
        </el-tab-pane> -->
      </el-tabs>
    </div>
    <div class="rightDiv">
      <div class="app-container container_flex">
        <el-row class="container_flex_button">
          <el-col :span="1.5" v-for="item in property.buttonTop" :key="item.id">
            <button-top :item="item" :multiple="multiple" :single="single" @newButton="newButton"
              :button-disable="handleTopButtonDisabled" />
          </el-col>
        </el-row>
        <form-data :formData="formData" :isClean="isCleanField" :showSearch="showSearch"
          :searchArr="property.search || []" @handleQuery="handleQuery" />
        <right-toolbar :formData="formDataSelf" :searchArr="property.search || []" :total="total"
          :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
          @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset"
          @numberChange="numberChange"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
          :property="property" :buttonDisable="handleButtonDisable" :numberShow="numberShow"
          @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
          @emitAblFilter="emitAblFilter" @clickLink="clickLink" />
        <pagination style="height: 122px;" :total="total" :page.sync="listQuery.pageNum"
          :limit.sync="listQuery.pageSize" @pagination="getList" />
      </div>
      <el-dialog title="提示" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
        <div>
          <el-form :model="ruleForm" :rules="rules" ref="ruleForms" label-width="100px" class="demo-ruleForm">
            <el-form-item label="车站选择" prop="stationId">
              <!-- <el-input v-model="ruleForm.name"></el-input> -->
              <el-select style="width: 300px;" v-model="ruleForm.stationId" placeholder="请选择">
                <el-option v-for="item in Coptions" :key="item.id" :label="item.value" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="设备分类" prop="deviceCategoryName">
              <el-select style="width: 300px;" v-model="ruleForm.deviceCategoryName" placeholder="请选择">
                <el-option-group v-for="group in options" :key="group.id" :label="group.text">
                  <el-option v-for="item in group.item" :key="item.id" :label="item.text" :value="item.id">
                  </el-option>
                </el-option-group>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button style="margin-right: 20px;" @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="ClickstationID">确 定</el-button>
        </span>
      </el-dialog>
      <el-dialog title="提示" :visible.sync="dialogVissible" width="30%" :before-close="handleClose">
        <div>
          <el-form :model="ruleForm" :rules="rules" ref="ruleForms" label-width="100px" class="demo-ruleForm">
            <el-form-item label="车站选择" prop="stationId">
              <el-select style="width: 300px;" v-model="ruleForm.stationId" placeholder="请选择">
                <el-option v-for="item in Coptions" :key="item.id" :label="item.value" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button style="margin-right: 20px;" @click="dialogVissible = false">取 消</el-button>
          <el-button type="primary" @click="ClicksdowS">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import indexMixin from '@/views/mixins'
  import $ from 'jquery';
  import {deviceDownload, devicelistDevice, devicelistItemTree, devicelistDevicee, deviceDelete, deviceRecordStationAndRegion, devicecategory,

         deviceAlldetails } from "@/api/zqapi/index.js"
  export default {
    name: 'Management',
    mixins: [indexMixin],
    data() {
      return {
        dows:'',
        ruleForm: {},
        rules: {
          stationId: [
            { required: true, message: '请选择车站', trigger: 'blur' },
          ],
        },
        stationId: '', // 车站ID
        Coptions: [],
        options: [],
        dialogVisible: false,
        dialogVissible: false,
        inputData: '',
        activeName: 'first',
        Treedata: [],
        Treedatas: [],
        defaultProps: {
          children: 'items',
          label: 'text'
        },
        defaultPropF: {
          children: 'children',
          label: 'name'
        },
        treeData:[],
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
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称',
          },
          {
            shebeimingcheng: '测试名称',
            shebeidalei: '设备大类',
            shebeixiaolei: '设备小类',
            chezhan: '车站名字',
            shebeiquyu: '设备区域',
            shezhichusuo: '始用日期',
            shiyongriqi: '测试名称555',
          },
        ],
        // 日期范围
        dateRange: [],
        // 表格序号是否展示
        numberShow: false,
        // 页面属性
        property: { fields: [{ isAdd: 1, isEdit: 1 }] },
        isCleanField: [],
        selection: [],
        formDataSelf: {},
        total: 100,
        listQuery: {
          pageNum: 1,
          pageSize: 30
        },
        formData: {
          chezhan:'',
        },
        visible: false,
        metaId: this.$route.meta.id,
        selected: [],
        workFlowViewVisible: false,
        selectedRow: null,
        doachuIds: [],
        gettoken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI4YTgzOWM3NTgxNzZlZmYyMDE4MTc5NDc4ZGI5MDY0MyIsInVzZXJfbmFtZSI6Inp6bmdseTAwMSIsImF1dGhvcml0aWVzIjpbInpua3o6a3RweiIsIm5oZ2w6eWJ0aiIsInl3Z2w6c2J4eTp4eWdkIiwiamN4eDpjemdsIiwieHRnbDpqc2dsOnRpbmd5b25nIiwieHRnbDpqc2dsIiwieHRnbDp5aGdsOmRlbGV0ZSIsInl3Z2w6Z3p0aiIsInh0Z2w6Y2RnbCIsInh0Z2w6amdnbDphZGQiLCJ4dGdsOnloZ2w6dXBkYXRlIiwieHRnbDpqc2dsOnFpeW9uZyIsIm5oZ2w6bmh4eHRqIiwiem5reiIsImpjeHg6c2JxeSIsImpjeHg6Y3pyeiIsIm5oZ2w6bmh0aiIsInl3Z2w6Z3pieDpnemRqIiwiamNwejpzcGxkcHoiLCJuaGdsIiwibmhnbDpuaGdsIiwieXdnbDpzYnh5Onh5cGMiLCJ5d2dsOmd6Yng6Z3pwZiIsInh0Z2w6amdnbDp1cGRhdGUiLCJ4dGdsOmpnZ2w6cWl5b25nIiwieHRnbDpqZ2dsIiwiamN4eDpwYmdsIiwiamN4eDpzYmJqIiwieXdnbCIsInh0Z2w6anNnbDpxeHN6IiwienRqYzp6dGpjMi4wIiwiem5rejp5amtneiIsInl3Z2w6Z3pieDpnenhqIiwiamN4eCIsInp0amMiLCJ4dGdsOmpzZ2w6ZGVsZXRlIiwieHRnbDpqZ2dsOmRlbGV0ZSIsInl3Z2w6c2J4eTp4anhtIiwiem5rejprempoIiwieHRnbDpqc2dsOnVwZGF0ZSIsInpua3o6aHFqaCIsInh0Z2w6eWhnbDpxaXlvbmciLCJ5d2dsOmd6enNrIiwienRqYzpzYnp0bGIiLCJ4dGdsOnloZ2w6bW1jeiIsInh0Z2wiLCJ5d2dsOmd6enoiLCJ4dGdsOmpnZ2w6dGluZ3lvbmciLCJ5d2dsOnNieHk6eHl5cyIsInh0Z2w6eWhnbCIsInpua3o6ZHhqaCIsImpjeHg6c2JjcyIsInh0Z2w6eWhnbDphZGQiLCJ5d2dsOmd6Yng6d3hnZCIsInl3Z2w6c2J4eTp4eWpoIiwiem5rejpkeGpuIiwieHRnbDpqc2dsOmFkZCIsInl3Z2w6Z3p6c2s6Z3p6ZCIsInl3Z2w6c2JkciIsInpua3o6em56bSIsInl3Z2w6Z3p6c2s6anN3ZCIsInh0Z2w6eWhnbDp0aW5neW9uZyIsInp0amM6ZHR6dGpjIiwieXdnbDpnemJ4IiwieXdnbDpzYnh5OmJ5eG0iLCJ5d2dsOnNidHoiLCJ6bmt6OnJna3oiLCJ5d2dsOmRydHoiLCJ5d2dsOmd6Yng6Z2RzaCIsImpjeHg6c2JseCIsInl3Z2w6c2J4eSJdLCJqdGkiOiI4NjhmMzM1YS01YjdjLTQyOGYtYmQ0MS0wYmEyMDg3M2RmMWYiLCJjbGllbnRfaWQiOiJjbGllbnQiLCJzY29wZSI6WyJyZWFkLHdyaXRlIl19.LNfja5heO5kWtQ3kfB-C3lqaUhMoAp1RfbyCCBRKDMw',
      };
    },
    created() {
      this.$store.dispatch('menuProperty', this.metaId).then((data) => {
        this.property = data
        if (localStorage.getItem('columns_' + this.metaId)) {
          this.property.fields = JSON.parse(localStorage.getItem('columns_' + this.metaId))
        }
      })
      this.devicelistDevice()
      this.getList()
    },
    methods: {
      ClicksdowS() {
        console.log(this.ruleForm.stationId);
        var url = '/text' + '/device/download-device-templet'
        var fileName = "履历模板.xlsx";
        var form = $("<form></form>").attr("action", url).attr("method", "post").attr("target", "_blank");
        form.append($("<input></input>").attr("type", "hidden").attr("name", "fileName").attr("value", fileName));
        form.append($("<input></input>").attr("type", "hidden").attr("name", "token").attr("value", this.gettoken));
        form.append($("<input></input>").attr("type", "hidden").attr("name", "stationId").attr("value", this.ruleForm.stationId));
        form.appendTo('body').submit().remove();
        this.dialogVissible = false
      },
      ClickstationID() {
        this.$refs['ruleForms'].validate((valid) => {
          if (valid) {
            var url = '/text' + '/device/download-all-details'
            var form = $("<form></form>").attr("action", url).attr("target", "_blank").attr("method", "post");
            form.append($("<input></input>").attr("type", "hidden").attr("name", "token").attr("value", this.gettoken));
            form.append($("<input></input>").attr("type", "hidden").attr("name", "stationId").attr("value", this.ruleForm.stationId));
            form.append($("<input></input>").attr("type", "hidden").attr("name", "deviceCategoryIds").attr("value", this.ruleForm.deviceCategoryIds));
            form.appendTo('body').submit().remove();
            this.dialogVisible = false
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      // Clickinput(){
      //   this.devicelistDevice()
      // },
      handleClose() {
        this.dialogVisible = false
        this.dialogVissible = false
      },
      toTreeItem(data, selectIds, id, text, itemsName) {
        if (!data) return null;
        if (data instanceof Array && data.length == 0) return null;
        var items = new Array();
        for (var i = 0, len = data.length; i < len; i++) {
          var item = {
            id: id ? data[i][id] : data[i]['id'],
            text: text ? data[i][text] : data[i]['name'],
            open: true,
            checked: (selectIds && selectIds.indexOf(data[i]['id']) > -1) ? true : false,
            item: itemsName ? this.toTreeItem(data[i][itemsName], selectIds, id, text, itemsName) : this.toTreeItem(data[i]['children'], selectIds, id, text, 'children')
          };
          items.push(item);
        }
        return items;
      },
      devicelistDevice() {
        devicelistDevice(`?name=`).then(res => {
          this.Treedata = res.data
        })
        devicelistItemTree(`?name=`).then(res => {
          this.Treedatas = [{
            name: res.data[0][0].stationName,
            children: res.data[0][0].categorys
          }]
        })
        // 获取车站
        deviceRecordStationAndRegion().then(res => {
          this.Coptions = res.data
        })
        // 设备分类
        devicecategory().then(res => {
          this.options = this.toTreeItem(res.data)
        })
      },
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
        let params = []
        if(data.children.length){
          data.children.forEach(item=>{
            params.push(item.id)
            if(item.children.length){
              item.children.forEach(val=>{
                params.push(val.id)
              })
            }
          })
        }else{
          params.push(data.id)
        }
        this.treeData = params
        this.getList()
      },
      handleClick(tab, event) {
        console.log(tab, event);
      },
      clickReset() {
        this.handleQuery()
      },
      handleSelectionChange(ids, single, multiple, selected) {
        this.doachuIds = ids
        this.single = single
        this.multiple = multiple
        this.selected = selected
      },
      getList() {
        this.loading = true
        this.list = []
        let pageSize = this.listQuery.pageSize
        let posStart = (this.listQuery.pageSize * this.listQuery.pageNum) - this.listQuery.pageSize
        let params = `?pageSize=${pageSize}&posStart=${posStart}&queryInfo=${this.formData.chezhan}`
        if(this.treeData.length){
          // this.treeData
          // console.log(this.Coptions,this.treeData.join(','));
          params = `?pageSize=${pageSize}&posStart=${posStart}&queryInfo=${this.formData.chezhan}&stationId=${this.Coptions[0].id}&deviceCategoryId=${this.treeData.join(',')}`
        }
        devicelistDevicee(params).then(({ data }) => {
          this.list = data.content
          this.total = data.total_count
        }).finally(() => {
          this.loading = false
        })
      },
      emitAblFilter() {
        this.dateRange = []
        this.getList()
      },
      clickLink(row) {
        this.$router.push({ name: 'ManagementDetails', query: { type: 'Detail', deviceCategoryId: row.deviceLargeCategoryId, id: row.id } })
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
      newUploadFileFn(){
        var form = new FormData($("#fileForm")[0]);
        console.log(form,88888);
        deviceDownload(form).then(res=>{
          console.log(res,'res55555');
          // 判断NO长度为0的时候是正确返回直接刷新列表
          if(res.code == 200){
            if(res.data.no.length > 0){
              this.$message.error(res.data.no.join(',') + '上传失败')
            }else{
              // 直接刷新列表
            }
          }
        })
      },
      fileChange(val){
        var $input = $('#file');
        if($input[0].files.length > 0){
          this.newUploadFileFn()
        }
      },
      // 这里进行上方按钮操作，和表格中的操作列
      handleButton(id, buttonCode, data) {
        console.log(id, buttonCode, data);
        if (buttonCode === 'shanchu1') {
          deviceDelete({ ids: [id.id] }).then(res => {
            // if (res.code === 0) {
            this.$message.success('删除成功')
            this.getList()
            // }
          })
        }
        if (buttonCode === 'taizhang') {
          $("#file").click();
        }
        if (buttonCode === 'daochu') {
          var url = '/text' + 'device/download-details'
          var info = JSON.stringify(this.doachuIds);
          var input = "<input name='info' value='" + info + "'>";
          var form = $("#downloadForm");//定义form表单,通过表单发送请求
          form.html(input);
          form.attr("action", url);//设置请求路径
          form.submit();//表单submit
          form.html("");
        }
        if (buttonCode === 'xiazaimoban') {
          this.dialogVissible = true
        }
        if (buttonCode === 'create') {
          this.$router.push({ name: 'ManagementDetails', query: { type: 'create' } })
          return
        }
        if (buttonCode === 'delete') {
          deviceDelete({ ids: id }).then(res => {
            // if (res.code === 0) {
            this.$message.success('删除成功')
            this.getList()
            // }
          })
        }
        // 导出全部
        if (buttonCode === 'alldao') {
          this.dialogVisible = true
        }
        if (buttonCode === "xiazaierweima") {
          var url = '/text' + '/device/download-devices-qrcode'
          var info = JSON.stringify(this.doachuIds);
          var input = "<input name='info' value='" + info + "'>";
          var form = $("#downloadForm");//定义form表单,通过表单发送请求
          form.html(input);
          form.attr("action", url);//设置请求路径
          form.submit();//表单submit
          form.html("");
        }
      },
      handleQuery(row = {}, name = []) {
        // let params = {
        //   name: this.formData.name
        // }
        // this.formData = Object.assign({}, params, row)
        // this.formDataSelf = Object.assign({}, this.formData, row)
        // this.isCleanField = name
        this.getList()  // 列表接口
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
        console.log(buttonCode, 9999);
        this.$refs.tableIndex.newButton(buttonCode)
      },
    }
  };
</script>
<style lang="scss" scoped>
  .leftDiv {
    width: 15%;
    height: 100vh;
  }

  .rightDiv {
    width: 85%;
    height: 100vh;
  }

  ::v-deep .el-tabs__nav.is-top {
    padding-left: 25%;
  }

  ::v-deep .el-tabs__active-bar {
    left: 34%;
  }
</style>
