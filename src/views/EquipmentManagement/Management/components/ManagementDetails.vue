<template>
  <div class="TOPpage">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="设备总览" name="first" v-if="addParams == 2">
        <div class="twoBox">
          <div class="leftTwo">
            <!-- <img src="https://img0.baidu.com/it/u=2729937767,2539819725&fm=253&fmt=auto&app=138&f=JPEG?w=480&h=640"
              alt=""> -->
          </div>
          <div class="rightTwo">
            <div id="main" style="width: 25%;height:30vh;"></div>
            <div id="main2" style="width: 25%;height:30vh;"></div>
            <div id="main3" style="width: 25%;height:30vh;"></div>
            <div id="main4" style="width: 25%;height:30vh;"></div>
          </div>
        </div>
        <div class="threeBox">
          <div class="leftThree">
            <!-- <div style="height: 150px;overflow-y: auto;">
              <el-upload class="upload-demo" ref="upload" :action="'http://127.0.0.1:9082/deviceCategoryImg/deviceCategoryImgUp'+this.$route.query.deviceCategoryId"
                 :on-change="handleChange"
                :on-preview="handlePreview" :on-remove="handleRemove" :file-list="fileList" :auto-upload="false">
                <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                <el-button style="margin-left: 10px;" size="small" type="success"
                  @click="submitUpload">上传到服务器</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
              </el-upload>
            </div> -->
            <div>
              <div class="shouClass">
                <div class="shouClass1"> 设备名称：</div>
                <div> {{leftData.name}} </div>
              </div>
              <div class="shouClass">
                <div class="shouClass1"> 设备处所：</div>
                <div> {{leftData.address}}</div>
              </div>
              <div class="shouClass">
                <div class="shouClass1"> 设备分类：</div>
                <div> {{leftData.deviceCategoryName}}</div>
              </div>
              <div class="shouClass">
                <div class="shouClass1"> 设备状态：</div>
                <div> {{leftstats[leftData.status]}}</div>
              </div>
              <div class="shouClass">
                <div class="shouClass1"> 使用日期：</div>
                <div> {{leftData.enableDate}}</div>
              </div>

            </div>
          </div>
          <div class="rightThree">
            <el-steps :active="5" align-center>
              <el-step title="采购日期" :description="timeX.purchaseDate"></el-step>
              <el-step title="使用日期" :description="timeX.enableDate"></el-step>
              <el-step title="当前日期" :description="timeX.nowDate"></el-step>
              <el-step title="保修截至日期" :description="timeX.warrantyEndDate"></el-step>
              <el-step title="报废日期" :description="timeX.disableDate"></el-step>
            </el-steps>
            </el-steps>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="设备信息" name="second">
        <el-row class="container_flex_button">
          <el-col :span="1.5" v-for="item in property.buttonTop" :key="item.id">
            <button-top :item="item" @newButton="newButton"></button-top>
          </el-col>
        </el-row>
        <div style="height: 70vh;overflow-y: auto;">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>基本信息</span>
            </div>
            <el-form :rules="rules" ref="form" :model="form" :inline="true" label-width="90px">
              <el-form-item label="设备名称" prop="name">
                <el-input style="width: 300px;" v-model="form.name"></el-input>
              </el-form-item>

              <el-form-item label="设备分类" prop="deviceCategoryName">
                <el-select style="width: 300px;" v-model="form.deviceCategoryName" placeholder="请选择">
                  <el-option-group v-for="group in options" :key="group.id" :label="group.text">
                    <el-option v-for="item in group.item" :key="item.id" :label="item.text" :value="item.id">
                    </el-option>
                  </el-option-group>
                </el-select>
              </el-form-item>

              <el-form-item label="所属车站" prop="stationId">
                <el-select style="width: 300px;" v-model="form.stationId" placeholder="请选择">
                  <el-option v-for="item in Coptions" :key="item.id" :label="item.value" :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="设备区域" prop="stationRegionId">
                <el-select style="width: 300px;" v-model="form.stationRegionId" placeholder="请选择">
                  <el-option v-for="item in Qoptions" :key="item.id" :label="item.name" :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="设备标签">
                <el-select style="width: 300px;" v-model="form.deviceTag" placeholder="请选择">
                  <el-option label="机房设备" value="机房设备"></el-option>
                  <el-option label="特种设备" value="特种设备"></el-option>
                  <el-option label="重点设备" value="重点设备"></el-option>
                  <el-option label="一般设备" value="一般设备"></el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="IP地址">
                <el-input style="width: 300px;" v-model="form.ip"></el-input>
              </el-form-item>

              <el-form-item label="详细位置" prop="address">
                <el-input style="width: 300px;" v-model="form.address"></el-input>
              </el-form-item>
              <!-- <el-form-item label="资产编码">
                <el-input style="width: 300px;" v-model="form.name"></el-input>
              </el-form-item> -->

              <!-- <el-form-item label="唯一编码">
                <el-input style="width: 300px;" v-model="form.name"></el-input>
              </el-form-item> -->

            </el-form>
          </el-card>
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>维保信息</span>
            </div>
            <el-form ref="form" :rules="rules" :model="form" :inline="true" label-width="90px">
              <el-form-item label="自修/委外" prop="deviceType">
                <!-- <el-input style="width: 300px;" v-model="form.deviceType"></el-input> -->
                <el-select style="width: 300px;" v-model="form.deviceType" placeholder="请选择">
                  <el-option label="自修" value="自修"></el-option>
                  <el-option label="委外" value="委外"></el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="运维企业">
                <el-input style="width: 300px;" v-model="form.operationEnterprises"></el-input>
              </el-form-item>

              <el-form-item label="保管人">
                <el-input style="width: 300px;" v-model="form.equipmentCustodian"></el-input>
              </el-form-item>
              <el-form-item label="采购日期">
                <el-date-picker style="width: 300px;" value-format="yyyy-MM-dd" v-model="form.procurementDate"
                  type="date" placeholder="选择日期">
                </el-date-picker>
              </el-form-item>

              <el-form-item label="使用年限">
                <el-input style="width: 300px;" v-model="form.period"></el-input>
              </el-form-item>

              <el-form-item label="安装日期">
                <el-date-picker style="width: 300px;" value-format="yyyy-MM-dd" v-model="form.installDate" type="date"
                  placeholder="选择日期">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="使用日期">
                <el-date-picker style="width: 300px;" value-format="yyyy-MM-dd" v-model="form.enableDate" type="date"
                  placeholder="选择日期">
                </el-date-picker>
              </el-form-item>

              <el-form-item label="保修期至">
                <el-date-picker style="width: 300px;" value-format="yyyy-MM-dd" v-model="form.warrantyEndDate"
                  type="date" placeholder="选择日期">
                </el-date-picker>
              </el-form-item>

            </el-form>
          </el-card>
          <!-- <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>技术参数</span>
            </div>
            <el-form ref="form" :model="form" :inline="true" label-width="90px">
              <el-form-item label="型号">
                <el-input style="width: 300px;" v-model="form.name"></el-input>
              </el-form-item>

              <el-form-item label="设备厂商">
                <el-input style="width: 300px;" v-model="form.name"></el-input>
              </el-form-item>

              <el-form-item label="联系人">
                <el-input style="width: 300px;" v-model="form.name"></el-input>
              </el-form-item>
              <el-form-item label="技术参数">
                <el-input style="width: 300px;" v-model="form.name"></el-input>
              </el-form-item>

              <el-form-item label="设备序列号">
                <el-input style="width: 300px;" v-model="form.name"></el-input>
              </el-form-item>

              <el-form-item label="设备功耗">
                <el-input style="width: 300px;" v-model="form.name"></el-input>
              </el-form-item>
              <el-form-item label="备注">
                <el-input style="width: 300px;" v-model="form.name"></el-input>
              </el-form-item>

            </el-form>
          </el-card> -->
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
  import * as echarts from 'echarts'
  import {
    devicecategory,
    deviceRecordlistRegionsByStationId,
    deviceRecordStationAndRegion,
    devicevVerifyDataUnique,
    deviceCategoryImgUp,
    deviceCategoryImgDeviceCategoryImgUp,
    deviceRecordgetone,
    getDeviceInfo
  } from "@/api/zqapi/index.js"
  export default {
    data() {
      return {
        value: '',
        options: [],
        Coptions: [],
        Qoptions: [],
        activeName: 'first',
        form: {

        },
        rules: {
          name: [
            { required: true, message: '请输入设备名称', trigger: 'blur' },
          ],
          deviceCategoryName: [
            { required: true, message: '请选择设备分类', trigger: 'blur' },
          ],
          stationId: [
            { required: true, message: '请选择车站', trigger: 'blur' },
          ],
          stationRegionId: [
            { required: true, message: '请选择设备区域', trigger: 'blur' },
          ],
          address: [
            { required: true, message: '请输入详细位置', trigger: 'blur' },
          ],
          deviceType: [
            { required: true, message: '请选择自修/委外', trigger: 'blur' },
          ],
        },
        timerId: '',
        fileList:[],
        queryName: '',
        leftData:{},
        leftstats:{
          '-1':'在库',
          '0':'正常',
          '1':'维护',
          '2':'暂停',
          '3':'关机',
          '4':'故障',
          '5':'报废',
          '6':'自动采集',
        },
        timeX:{},
        property: {
          buttonTop: [
            { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
            { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
          ]
        },
        addParams: 1,
        fileBinaryData:null
      }
    },
    mounted() {
      if (this.$route.query.type == 'Detail') {
        this.addParams = 2
        setTimeout(() => {
          this.myEcharts()
          this.myEcharts2()
          this.myEcharts3()
          this.myEcharts4()
          this.myImg()
        }, 1000)
      } else {
        this.addParams = 1
        this.activeName = 'second'
      }
      this.init()
      this.listData()
      this.getDeviceInfo()
      console.log(this.$route.query, 8888);
    },
    methods: {
      getDeviceInfo(){
        getDeviceInfo(`?id=`+this.$route.query.id).then(res=>{
          if(res.code == 200){
            this.timeX = res.data
            console.log(this.timeX);
          }
        })
      },
      handleChange(file, fileList) {
      // 这里你可以获取到文件对象 file
      console.log('选中的文件：', file,fileList);
        this.fileList = fileList
        if (file) {
        // 创建一个FileReader实例
        const reader = new FileReader();
        // 读取文件内容的回调函数
        reader.onload = (e) => {
          // e.target.result 包含文件的二进制数据
          this.fileBinaryData = e.target.result;
          console.log('文件的二进制数据：', this.fileBinaryData);

          // 这里可以处理二进制数据，例如发送到服务器等
        };

        // 读取文件为ArrayBuffer（如果需要其他格式，可以使用readAsText、readAsDataURL等）
        reader.readAsArrayBuffer(file.raw); // 注意：Element UI的file对象可能没有raw属性，直接使用file对象可能需要一些额外处理
      }
      // 根据需要处理文件对象，例如添加到已上传文件列表
      // this.fileList = fileList;
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
      myImg() {
        deviceCategoryImgUp(`?deviceCategoryId=` + this.$route.query.deviceCategoryId).then(res => {
          console.log(res,'返回的图片');
        })
      },
      listData() {
        devicecategory().then(res => {
          this.options = this.toTreeItem(res.data)
        })
        deviceRecordlistRegionsByStationId('?stationId=8a839c758176eff2018176f1b8630000').then(res => {
          this.Qoptions = res.data

        })
        deviceRecordStationAndRegion().then(res => {
          this.Coptions = res.data
        })
         // deviceCategoryId
        deviceRecordgetone(`?id=`+  this.$route.query.id).then(res=>{
            this.leftData = res.data
        })
      },
      submitUpload() {
        console.log(222, this.fileList);
        this.$refs.upload.submit();

//         if(this.fileList.length > 1){
//           this.$message.error('仅支持单个图片上传');
//         }else{
//           deviceCategoryImgDeviceCategoryImgUp(`?deviceCategoryId=` + this.$route.query.deviceCategoryId,{file:this.fileBinaryData
// }).then(res=>{
//           console.log(res,'上传成功的返回');
//           this.myImg()
//         })
//         }

      },
      handleRemove(file, fileList) {
        console.log(file, fileList, 6666);
      },
      handlePreview(file) {
        console.log(file, 88888);
      },
      myEcharts() {
        var chartDom = document.getElementById('main');
        var myChart = echarts.init(chartDom);
        var option;

        option = {
          series: [
            {
              type: 'pie',
              radius: ['80%', '50%'],
              label: {
                show: true,
                position: 'center',
                color: ['rgb(19,220,51)',],
                formatter: function (params) {
                  // 使用 rich 中定义的样式
                  return '{a|' + params.name + '} \n {b|' + params.value + '}';
                },
                rich: {
                  a: {
                    // 定义名为 a 的样式
                    color: '#ff0000', // 红色
                    fontWeight: 'bold' // 加粗
                  },
                  b: {
                    // 定义名为 b 的样式
                    color: '#00ff00', // 绿色
                    fontSize: 16 // 字体大小
                  }
                }
              },
              data: [{ value: this.timeX.runTime, name: '运行时长' }]
            }
          ]
        };
        option && myChart.setOption(option);
      },
      myEcharts2() {
        var chartDom = document.getElementById('main2');
        var myChart = echarts.init(chartDom);
        var option;

        option = {
          series: [
            {
              type: 'pie',
              radius: ['80%', '50%'],
              color: ['rgb(255,168,0)',],
              label: {
                show: true,
                position: 'center',
                formatter: function (params) {
                  // 使用 rich 中定义的样式
                  return '{a|' + params.name + '} \n {b|' + params.value + '}';
                },
                rich: {
                  a: {
                    // 定义名为 a 的样式
                    color: '#ff0000', // 红色
                    fontWeight: 'bold' // 加粗
                  },
                  b: {
                    // 定义名为 b 的样式
                    color: '#00ff00', // 绿色
                    fontSize: 16 // 字体大小
                  }
                }
              },
              data: [{ value: this.timeX.faultCount3 + this.timeX.faultCount2 + this.timeX.faultCount1, name: '故障次数' }]
            }
          ]
        };
        option && myChart.setOption(option);
      },
      myEcharts3() {
        var chartDom = document.getElementById('main3');
        var myChart = echarts.init(chartDom);
        var option;

        option = {
          series: [
            {
              type: 'pie',
              color: ['rgb(87,43,237)',],
              radius: ['80%', '50%'],
              label: {
                show: true,
                position: 'center',
                formatter: function (params) {
                  // 使用 rich 中定义的样式
                  return '{a|' + params.name + '} \n {b|' + params.value + '}';
                },
                rich: {
                  a: {
                    // 定义名为 a 的样式
                    color: '#ff0000', // 红色
                    fontWeight: 'bold' // 加粗
                  },
                  b: {
                    // 定义名为 b 的样式
                    color: '#00ff00', // 绿色
                    fontSize: 16 // 字体大小
                  }
                }
              },
              data: [{ value: 0, name: '换件次数' }]
            }
          ]
        };
        option && myChart.setOption(option);
      },
      myEcharts4() {
        var chartDom = document.getElementById('main4');
        var myChart = echarts.init(chartDom);
        var option;

        option = {
          series: [
            {
              type: 'pie',
              radius: ['80%', '50%'],
              color: ['rgb(2,93,198)'],
              label: {
                show: true,
                position: 'center',
                formatter: function (params) {
                  // 使用 rich 中定义的样式
                  return '{a|' + params.name + '} \n {b|' + params.value + '}';
                },
                rich: {
                  a: {
                    // 定义名为 a 的样式
                    color: '#ff0000', // 红色
                    fontWeight: 'bold' // 加粗
                  },
                  b: {
                    // 定义名为 b 的样式
                    color: '#00ff00', // 绿色
                    fontSize: 16 // 字体大小
                  }
                }
              },
              data: [{ value: this.timeX.maintainCount, name: '保养次数' }]
            }
          ]
        };
        option && myChart.setOption(option);
      },
      init() {
        let { type, name, id, auditArr } = this.$route.query;
        console.log(type, name, id, auditArr);
        // this.queryType = type || 'create';
        // this.queryId = id || '';
        this.queryName = name || 'Management';
      },
      onSubmit() {
        console.log('submit!');
      },
      newButton(buttonCode) {
        if (buttonCode == 'save') {
          this.form.deviceCategoryId = '8a83cb4e754563ca01754928b21968ab'
          devicevVerifyDataUnique(this.form).then(res => {
            if (res.code == 200) {
              // 成功
              this.$message({
                message: '添加成功',
                type: 'success'
              });
              this.$tab.closeOpenPage({ name: this.queryName });

            } else {
              // 失败
              this.$message({
                message: res.message,
                type: 'success'
              });
              this.$tab.closeOpenPage({ name: this.queryName });
            }
          })
        }
        if (buttonCode == 'cancel') {
          // 关闭当前tabs
          this.$tab.closeOpenPage({ name: this.queryName });
          return
        }
      },
      handleClick(tab, event) {
        console.log(tab, event);
      }
    }
  }
</script>
<style lang="scss" scoped>
  .TOPpage {
    margin-left: 5px;
  }

  .twoBox {
    display: flex;

    .leftTwo {
      height: 30vh;
      width: 30%;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .rightTwo {
      height: 30vh;
      width: 70%;
      display: flex;
    }
  }

  .threeBox {
    display: flex;

    .leftThree {
      height: 50vh;
      width: 30%;

      .shouClass {
        display: flex;
        height: 30px;
        align-items: center;
        margin-left: 20px;
        /* border: 1px solid #aaa5a5; */
        width: 87%;
        margin-top: 5px;
        border-radius: 5px;

        .shouClass1 {
          margin-left: 10px;
        }
      }
    }

    .rightThree {
      height: 50vh;
      width: 70%;
      padding-top: 5%;
    }
  }
</style>
