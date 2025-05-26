<template>
  <div>
    <div class="app-container container_flex">
      <el-row class="container_flex_button">
        总数量100条，正常 <span style="color: green;">0</span> 条，异常 <span style="color: red;">100</span> 条
        <el-col :span="1.5" v-for="item in property.buttonTop" :key="item.id">
          <button-top :item="item" :multiple="multiple" :single="single" @newButton="newButton" :button-disable="handleTopButtonDisabled"/>
        </el-col>
      </el-row>
      <form-data :formData="formData" :isClean="isCleanField" :showSearch="showSearch"
        :searchArr="property.search || []" @handleQuery="handleQuery" />
    </div>
  </div>
</template>
<script>
import indexMixin from '@/views/mixins'
export default {
    name:'guide',
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
</style>
