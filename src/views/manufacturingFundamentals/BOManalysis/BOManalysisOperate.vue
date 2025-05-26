<template>
  <div class="app-container container_flex" v-loading="loading">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
      @newButton="newButton"></button-top>
    <div class="container_flex_form">
      <VFormRender ref="vFormRef" @appendButtonClick="handleAppendButtonClick"
        :class="{ 'formRender_view': queryType === 'view' }" @buttonClick="handleButtonClick"
        @operationButtonClick="operationButtonClick" @selectChange="selectChange">
        <template slot="bomInfos">
          <bomInfos :dict="dict.type" :tableData="dataObj.bomInfos || []" />
        </template>
        <template slot="bomSubitem">
          <el-tabs v-model="activeOtherName">
            <el-tab-pane label="不同料" name="diffList">
              <span slot="label">
                不同料
                <tooltip content="完全不同，即每个BOM所独有。" v-if="activeOtherName === 'diffList'" />
              </span>
              <diff-map ref="diffList" :dict="dict.type" activeOtherName="diffList" :len="objArr.diffList && objArr.diffList.length"
                :bomInfos="dataObj.bomInfos || []" :tableData="formData.diffRawList || []" @handleSelect="handleSelect"
              />
            </el-tab-pane>
            <el-tab-pane label="同料不同参" name="partSameList">
              <span slot="label">
                同料不同参
                <tooltip content="料全部相同但不同参 或 料部分相同不同参。"  v-if="activeOtherName === 'partSameList'" />
              </span>
              <diff-map ref="partSameList" :dict="dict.type" activeOtherName="partSameList" :len="objArr.partSameList && objArr.partSameList.length"
                :bomInfos="dataObj.bomInfos || []" :tableData="formData.partSameRawList || []" @handleSelect="handleSelect"
              />
            </el-tab-pane>
            <el-tab-pane label="完全相同" name="allSameList">
              <span slot="label">
                完全相同
                <tooltip content="物料完全相同且参数相同。"  v-if="activeOtherName === 'allSameList'" />
              </span>
              <all-same-list ref="allSameList" :dict="dict.type" :tableData="dataObj.allSameRawList || []" @handleSelect="handleSelect" />
            </el-tab-pane>
          </el-tabs>
        </template>
        <template slot="bomReplace">
          <el-tabs v-model="replaceActiveOtherName">
            <el-tab-pane label="不同料" name="diffList">
              <span slot="label">
                不同料
                <tooltip content="完全不同，即每个BOM所独有。"  v-if="replaceActiveOtherName === 'diffList'" />
              </span>
              <diff-map ref="replaceDiffList" title="替代件" :dict="dict.type" activeOtherName="diffList" :len="objArr.diffList && objArr.diffList.length"
                :bomInfos="dataObj.bomInfos || []" :tableData="formData.diffReplaceList || []" :isSelection="false"
              />
            </el-tab-pane>
            <el-tab-pane label="同料不同参" name="partSameList">
              <span slot="label">
                同料不同参
                <tooltip content="料全部相同但不同参 或 料部分相同不同参。"  v-if="replaceActiveOtherName === 'partSameList'" />
              </span>
              <diff-map ref="replacePartSameList" title="替代件" :dict="dict.type" activeOtherName="partSameList" :len="objArr.partSameList && objArr.partSameList.length"
                :bomInfos="dataObj.bomInfos || []" :tableData="formData.partSameReplaceList || []" :isSelection="false"
              />
            </el-tab-pane>
            <el-tab-pane label="完全相同" name="allSameList">
              <span slot="label">
                完全相同
                <tooltip content="物料完全相同且参数相同。" v-if="replaceActiveOtherName === 'allSameList'" />
              </span>
              <all-same-list ref="replaceAllSameList" :dict="dict.type" :tableData="dataObj.allSameReplaceList || []" />
            </el-tab-pane>
          </el-tabs>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import indexMixin from '@/views/mixins'
import VFormRender from '@/components/form-render/index'
import { bomDifferenceAnalysis } from '@/api/prodmgr-mm/bom'
import bomInfos from './components/bomInfos'
import diffMap from './components/diffMap'
import allSameList from './components/allSameList'
export default {
  name: "BOManalysisOperate",
  dicts: ['MeasureUnit', 'bomType', 'replaceIdentification', 'flowStatus', 'planAttribute', 'replaceMethod', 'hmMode', 'YesNo', 'bomPurpose'],
  mixins: [indexMixin],
  components: { VFormRender, bomInfos, diffMap, allSameList, tooltip: () => import('@/components/tooltip') },
  data() {
    return {
      loading: false,
      queryType: '',
      queryId: '',
      queryName: '',
      formData: {
        diffRawList: [],
        diffReplaceList: [],
        partSameRawList: [],
        partSameReplaceList: [],
      },
      // 菜单按钮、字段等数据
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create' },
        { buttonName: '复制并新增', buttonCode: 'save', buttonIcon: '', type: 'create', options: "{\"prompt\":\"可以勾选子件，插入到新增BOM中。\"}" },
      ],
      activeOtherName: 'diffList',
      objArr: {
        diffList: [{ label: '子件编码', code: 'matlCode' }, { label: '子件名称', code: 'matlName' }, { label: '规则型号', code: 'matlType' }, { label: '计量单位', code: 'matlUnit', type: 'dict', fieldFormatName: 'MeasureUnit' }],
        partSameList: [
          { label: '子件编码', code: 'matlCode' }, { label: '子件名称', code: 'matlName' }, { label: '规则型号', code: 'matlType' }, { label: '计量单位', code: 'matlUnit', type: 'dict', fieldFormatName: 'MeasureUnit' },
          { label: '计划属性', code: 'planAttribute', type: 'dict', fieldFormatName: 'planAttribute' }, { label: '子件用量', code: 'childNum' }, { label: '母件底数', code: 'baseNum' }, { label: '单位用量', code: 'unitNum' },
          { label: '损耗率', code: 'lossRate' }, { label: '替代方式', code: 'replaceMethod', type: 'dict', fieldFormatName: 'replaceMethod' }, { label: '领料方式', code: 'issueType', type: 'dict', fieldFormatName: 'hmMode' },
          { label: '是否主料', code: 'isMainMatl', type: 'dict', fieldFormatName: 'YesNo' }
        ]
      },
      dataObj: {},
      matlCodeList: [],

      replaceData: {},
      replaceActiveOtherName: 'diffList'
    }
  },
  created() {
    this.init();
  },
  methods: {
    buttonShow(item) {
      if (item.type.indexOf(this.queryType) != -1) {
        return true
      } else {
        return false
      }
    },
    init() {
      let { type, name, ids } = this.isDialog ? this.dialogQuery : this.$route.query;
      this.queryType = type || 'create';
      this.queryId = (ids || '').split(',')
      this.queryName = name || 'BOManalysis'
      this.$nextTick(async () => {
        this.$refs['vFormRef'].resetForm();
        await this.formFillInPage();
        this.bomDifferenceAnalysis(this.queryId)
      })
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('BOManalysisOperate').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data);
          resolve(true);
        })
      })
    },
    selectChange(fieldName, newValue, oldValue, subFormName, subFormRowId) {
    },
    handleAppendButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
    },
    handleButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
    },
    cancel(name) {
      // 关闭当前tabs
      this.$tab.closeOpenPage({ name })
    },
    newButton(buttonCode) {
      if (buttonCode === 'cancel') {
        this.cancel(this.queryName)
        return
      }
      if (buttonCode === 'save') {
        if(!this.matlCodeList.length){
          this.$modal.msgError('请勾选子件')
          return
        }
        this.$store.dispatch('setCopyBomData', this.matlCodeList)
        this.$router.push({ name: 'BOMAdministrationOperate', query: { type: 'create', copyHistoryCreate: '3' } })
        return
      }
      
    },
    operationButtonClick(dataTable, buttonName, rowIndex, row) {

    },
    bomDifferenceAnalysis(ids) {
      this.loading = true
      bomDifferenceAnalysis({ ids }).then(({ data }) => {
        this.dataObj = data
        for (const key in this.formData) {
          this.dataDiffList(key, data)
        }
      }).finally(() => {
        this.loading = false
      })
    },
    dataDiffList (code, data) {
      let arr = [], index = 0
      for (const val of data[code]) {
        index++
        if (val) {
          let elementArr = [], objArr = {}, partSameObj = {...val}, nameIndex = '子件' + index, key = 'diffList'
          if(code === 'partSameRawList' || code === 'partSameReplaceList'){
            val.forEach( (item) => {
              objArr[item.parentBomId] = item
            })
            partSameObj = {partSameObj: objArr}
            key = 'partSameList'
          }
          if(code === 'diffReplaceList' || code === 'partSameReplaceList'){
            nameIndex = '替代件' + index
          }
          this.objArr[key].forEach(item => {
            elementArr.push({ nameIndex, ...partSameObj, ...item })
          })
          arr.push(...elementArr)
        }
      }
      this.formData[code] = arr
    },
    handleSelect () {
      let array = [], arrName = ['diffList', 'partSameList', 'allSameList']
      arrName.forEach((name) => {
        if(name === 'partSameList'){
          const arrCode = this.$refs[name].selectionData.map( item => Object.values(item.partSameObj)[0])
          array.push(...arrCode)
        }else{
          const arrCode = this.$refs[name].selectionData.map( item => item)
          array.push(...arrCode)
        }
      })
      this.matlCodeList = array
    },
  }
};
</script>
<style lang="scss" scoped>
.slotIcon-color {
  color: #1890ff;
  font-size: 16px;
  margin-right: 10px;
}
</style>