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
      <foMdata :formData="formData" @changeData="changeData" :isClean="isCleanField" :showSearch="showSearch"
        :searchArr="property.search || []" @handleQuery="handleQuery" />
      <div class="bottomBox">
        <div v-for="item in 90" style="height: 27%; width: 30%;flex: 0 0 calc(33.333% - 10px);position: relative;">
          <img class="elevator_offline" src="@/assets/stateMonitor/elevator_offline.png" alt="">
          <div class="imgBox">
            <img class="left-icon2" src="@/assets/stateMonitor/left-icon2.png" alt="">
          </div>
          <div class="bottomConcer">
            <div class="bottomConcer1">
              区域:西站房南区车场出站至高架客梯
            </div>
            <div class="bottomConcer1">
              运行模式:停止
            </div>
            <div class="bottomConcer1">
              报警信息:无
            </div>
            <div class="bottomConcer1">
              更新时间:2024-03-01 09:20:23
            </div>
          </div>
          <div class="rightText">
             离线
          </div>
          <div class="rightCamera">
            <img class="Camera" src="@/assets/stateMonitor/camera.png" alt="">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import indexMixin from '@/views/mixins'
  import foMdata from './fromData.vue' // 导向屏
  export default {
    name: 'deviceBus',
    mixins: [indexMixin],
    components: {foMdata},
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
      changeData(val) {
        // 根据code获取全部值
        let opq
        const selectedOption = this.property.search[0].fieldFormatArr.find(option => option.code === val);
        if (selectedOption) {
          opq = selectedOption;
        } else {
          opq = null;
        }
        console.log('选中的值:', val);
        console.log('选中的项:', opq);
      },
      handleQuery(row = {}, name = []) {
        this.formData = Object.assign({}, this.formData, row)
        this.formDataSelf = Object.assign({}, this.formData, row)
        this.isCleanField = name
        // this.getList()  列表接口
      }
    },
    created() {
      this.$store.dispatch('menuProperty', this.metaId).then((data) => {
      
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
  .bottomBox {
    display: flex;
    overflow-x: auto;
    height: 77vh;
    padding-bottom: 30px;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
  }

  .elevator_offline {
    width: 100%;
    height: 100%;
  }

  .imgBox {
    position: absolute;
    top: 36%;
    width: 12%;
    height: 30%;
    left: 10%;

    .left-icon2 {
      width: 100%;
      height: 100%;
    }
  }
  .rightText{
    position: absolute;
    right: 8%;
    top: 24%;
    font-size: 12px;
  }
  .rightCamera{
    position: absolute;
    top: 39%;
    right: 21%;
    .Camera{
      width: 100%;
      height: 100%;
    }
  }
  .bottomConcer{
    position: absolute;
    /* width: 49%; */
    font-size: 12px;
    top: 23%;
    left: 31%;
    .bottomConcer1{
      margin-top: 3px;
    }
  }
</style>
