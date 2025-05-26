<template>
  <div>
    <div class="app-container container_flex">
      <el-row class="container_flex_button">
        总数量100条，正常 <span style="color: green;">0</span> 条，异常 <span style="color: red;">100</span> 条
        <el-col :span="1.5" v-for="item in property.buttonTop" :key="item.id">
          <button-top :item="item" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled" />
        </el-col>
      </el-row>
      <form-data :formData="formData" :isClean="isCleanField" :showSearch="showSearch"
        :searchArr="property.search || []" @handleQuery="handleQuery" />
    </div>
    <div class="topContent">
      <div style="margin-left: 2%;">图例</div>

      <div class="oneCon">
        <div class="imgCon">
          <img class="0108-run" src="@/assets/stateMonitor/0108-run.png" alt="">
        </div>
        <div class="textCon">
          柱式检票机
        </div>
      </div>

      <div class="oneCon">
        <div class="imgCon">
          <img class="0108-run" src="@/assets/stateMonitor/0109-run.png" alt="">
        </div>
        <div class="textCon">
          柱式检票机
        </div>
      </div>

      <div class="oneCon">
        <div class="imgCon">
          <img class="0108-run" src="@/assets/stateMonitor/0110-run.png" alt="">
        </div>
        <div class="textCon">
          柱式检票机
        </div>
      </div>

      <div class="leftContent" style="background: rgb(0, 255, 122);"></div>
      <div class="rightContent">正常</div>

      <div class="leftContent" style="background: rgb(241, 110, 22);"></div>
      <div class="rightContent">告警</div>

      <div class="leftContent" style="background:red"></div>
      <div class="rightContent">故障</div>

      <div class="leftContent" style="background: rgb(253, 255, 2);"></div>
      <div class="rightContent">维修</div>

      <div class="leftContent" style="background: rgb(128, 128, 128);"></div>
      <div class="rightContent">未启用</div>

    </div>
    <div style="
    height: 70vh;
    overflow-y: auto;
    margin: 20px;
    padding-bottom: 7%;">
      <div v-for="opq in 5" style="text-align: center;margin: 20px;border: 1px solid red; padding: 0 2%;">
        <div>检票机</div>
       <div style="display: flex; flex-wrap: wrap;">
        <div v-for="val in 4" style="width: 30%;margin-left: 2%;">
          <div style="display: flex; flex-wrap: wrap;flex: 0 0 calc(33.333% - 10px);background: rgb(229, 231, 233);align-items: center;
          justify-content: center;">
            <div v-for="item in 4" style="margin: 0 5px ">
              <div>049</div>
              <img class="img0109" src="@/assets/stateMonitor/0109.png" alt="">
            </div>
            <div style="margin-left: 20px;">
              <div>054</div>
              <img class="img0108" src="@/assets/stateMonitor/0108.png" alt="" >
            </div>
          </div>
          <div>10A 11A</div>
       </div>
       </div>
      </div>
    </div>
  </div>
</template>
<script>
  import indexMixin from '@/views/mixins'
  export default {
    name: 'ticketCheck',
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
      newButton(buttonCode) {
        this.$refs.tableIndex.newButton(buttonCode)
      },
      handleQuery(row = {}, name = []) {
        this.formData = Object.assign({}, this.formData, row)
        this.formDataSelf = Object.assign({}, this.formData, row)
        this.isCleanField = name
        // this.getList()  列表接口
      },
    },
    created() {
      this.$store.dispatch('menuProperty', this.metaId).then((data) => {
      ;
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
    mounted() { },
  }
</script>
<style lang="scss" scoped>
  .topContent {
    display: flex;
    background: rgb(229, 231, 233);
    margin: 0 10%;
    text-align: center;
    align-items: center;
    height: 100px;
    .oneCon {
      display: flex;
      align-items: center;
      width: 18%;
      justify-content: center;

      .textCon {
        margin-left: 30px;
      }
    }

    .leftContent {
      width: 20px;
      height: 20px;
      border-radius: 20px;
      margin-left: 15px;
    }
    .rightContent{
      margin-left: 5px;
    }
  }
</style>
