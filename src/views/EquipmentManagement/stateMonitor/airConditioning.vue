<template>
  <div>
    <div class="app-container container_flex">
      <el-row class="container_flex_button">
        总数量{{total}}条
        <!-- ，正常 <span style="color: green;">0</span> 条，异常 <span style="color: red;">100</span> 条 -->
        <el-col :span="1.5" v-for="item in property.buttonTop" :key="item.id">
          <button-top :item="item" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled" />
        </el-col>
      </el-row>
      <!-- <form-data :formData="formData" :isClean="isCleanField" :showSearch="showSearch"
        :searchArr="property.search || []" @handleQuery="handleQuery" /> -->
      <div class="pageContent">
        <div v-for="val in tableData" class="topContent">
          <img class="room_bg_grey" src="@/assets/stateMonitor/room_bg_grey.png" alt="">
          <div class="twoContent">
            <div class="thContent">
              {{val.deviceName}}
            </div>
            <div class="fwContent">
              更新时间:
              {{val.updateTime}}
            </div>
            <div class="DisCon">
              <div class="SmoContent">
                <div class="TexCon">运行状态</div>
                <div class="StaCon">
                  {{val.runState == '-1' ? '离线' : runStatus[val.runState]}}
                </div>
              </div>
              <div class="SmoContent">
                <div class="TexCon">手自动状态</div>
                <div class="StaCon">
                  {{
                    val.autoState ? autoState[val.autoState] : '- -'
                  }}
                </div>
              </div>
              <div class="SmoContent">
                <div class="TexCon">开关状态</div>
                <div class="StaCon">
                  {{
                    val.onOffState == '-1' ? '- -' :  val.onOffState ? onOffState[val.onOffState] : '- -'
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import indexMixin from '@/views/mixins'
  import { getAirJC2 } from "@/api/zqapi/index.js"
  export default {
    name: 'airConditioning',
    mixins: [indexMixin],
    components: {},
    props: {},
    data() {
      return {
        formData: {},
        isCleanField: [],
        showSearch: true,
        multiple: true,
        property: { fields: [{ isAdd: 1, isEdit: 1 }] },
        metaId: this.$route.meta.id,
        formDataSelf: {},
        total: 100,
        tableData: [],
        runStatus: ['', '正常', '故障', '维修', '告警'],
        autoState : ['', '自动', '手动'],
        onOffState: ['关', '开']
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
      getList(){
        getAirJC2().then(res=>{
        console.log(res,999);
        if(res.code == 200){
          this.tableData = res.data
          this.total = res.data.length
        }
      })
      },
      newButton(buttonCode) {
        this.$refs.tableIndex.newButton(buttonCode)
      },
      handleQuery(row = {}, name = []) {
        // this.formData = Object.assign({}, this.formData, row)
        // this.formDataSelf = Object.assign({}, this.formData, row)
        // this.isCleanField = name
        this.getList()
      },
    },
    created() {
      this.$store.dispatch('menuProperty', this.metaId).then((data) => {
        console.log(data, 888);
        this.property = data
        this.property.search[0].fieldFormatArr[0].name = '全部'
        this.property.search[0].fieldFormatArr[1].name = '扶梯'
        this.property.search[0].fieldFormatArr[2].name = '直梯'
        // 第二个
        this.property.search[1].fieldFormatArr[0].name = '全部'
        this.property.search[1].fieldFormatArr[1].name = '站台'
        this.property.search[1].fieldFormatArr[2].name = '西站房'
        this.property.search[1].fieldFormatArr[3].name = '候车厅'
        this.property.search[1].fieldFormatArr[4].name = '东站房'
        if (localStorage.getItem('columns_' + this.metaId)) {
          this.property.fields = JSON.parse(localStorage.getItem('columns_' + this.metaId))
        }
      })
    },
    mounted() {
      this.getList()
    },
  }
</script>
<style lang="scss" scoped>
  .pageContent {
    height: 77vh;
    padding-bottom: 30px;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;

    .topContent {
      margin: 2% 0 0 2%;
      width: 31%;
      height: 40%;
      position: relative;

      .room_bg_grey {
        width: 100%;
        height: 100%;
      }

      .twoContent {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;

        .thContent {
          height: 24%;
          text-align: center;
          padding-top: 2%;
        }

        .fwContent {
          text-align: center;
        }

        .DisCon {
          display: flex;
          .SmoContent {
            width: 33%;
            text-align: center;
            margin-top: 5%;

            /* .SmoContent{

          } */
            .StaCon {
              margin: 14% 10% 0px 10%;
              border: 1px solid;
              /* background: red; */
              color: red;
              border-radius: 40px;
            }
          }

        }
      }
    }
  }
</style>
