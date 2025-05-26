<template >
  <el-form v-if="searchArr.length != 0" class="container form-data-search" ref="queryForm" :model="formData" :inline="true"
      v-show="showSearch" :label-width="labelWidth">
      <div class="form-content-box" v-show="showSearchDetail">
          <template v-for="item in searchArr">
              <el-form-item v-if="!item.slot" class="custom-form-item" :label="item.fieldName"
                  :prop="item.fieldType == 'date' ? '' : item.fieldCode" :key="item.id">
                  <el-select class="select-box" @change="changeData" v-if="item.fieldType == 'dict'" v-model="formData[item.fieldCode]"
                      :placeholder="'请选择' + item.fieldName" clearable style="width:100%" size="small">
                      <el-option v-for="(item, key)  in item.fieldFormatArr" :key="key" :label="item.name"
                          :value="item.code" />
                  </el-select>
                  <el-date-picker v-else-if="item.fieldType && item.fieldType.indexOf('date') != -1"
                      v-model="dateRange[item.fieldCode]" size="small" value-format="yyyy-MM-dd" type="daterange"
                      style="width:100%" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期">
                  </el-date-picker>
                  <treeselect v-else-if="item.fieldType == 'tree'" v-model="formData[item.fieldFormat]"
                      :options="treeList[item.fieldFormat]" :placeholder="'请选择' + item.fieldName" :normalizer="normalizera"
                      @select="selectTreeselect"></treeselect>
                  <el-input v-else-if="item.fieldType == 'String'" v-model="formData[item.fieldCode]"
                      :placeholder="'请输入' + item.fieldName" clearable size="small" maxlength="50"
                      @keyup.enter.native="handleQuery" />
                  <el-input v-else v-model="formData[item.fieldCode]" :placeholder="'请输入' + item.fieldName" clearable
                      size="small" @keyup.enter.native="handleQuery" />
              </el-form-item>
              <slot v-else :name="item.name"></slot>
          </template>
      </div>
      <el-form-item class="search-control">
          <el-button class="search" size="mini" @click="handleQuery" v-show="showSearchDetail">
              <icon-svg icon-class="Line-Search" />搜索
          </el-button>
          <el-button class="reset" size="mini" @click="resetQuery" v-show="showSearchDetail">
              <icon-svg icon-class="Line-Refresh" class="icon-svg-blue" />重置
          </el-button>
          <el-button class="toggleClose" size="mini" @click="toggleOpen" v-show="!showSearchDetail">
              <icon-svg icon-class="Line-Search" class="icon-svg-blue" />
              <span class="search-btn-text">展开搜索</span>
              <i class="el-icon-caret-bottom el-icon--right"></i>
          </el-button>
          <el-button class="toggleOpen" size="mini" @click="toggleClose" v-show="showSearchDetail">
              收起
              <i class="el-icon-caret-top el-icon--right"></i>
          </el-button>
      </el-form-item>
  </el-form>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
export default {
  name: "FormData",
  props: {
      showSearch: {
          type: Boolean,
          default: true
      },
      searchArr: {
          type: Array,
          default: []
      },
      treeList: {
          type: Object,
          default: function () {
              return {}
          }
      },
      formData: {
          type: Object,
          default: function (val) {
              return {}
          }
      },
      labelWidth: {
          type: String,
          default: '85px'
      },
      isClean: {
          type: Array,
          default: null
      }
  },
  components: { Treeselect },
  data() {
      return {
          // 日期范围
          dateRange: {},
          // formData: {},
          showSearchDetail: false,
          deptIdStr: '',
          menuIdStr: '',
      };
  },
  watch: {
      isClean: {
          handler: function (val) {
              if (val) {
                  this.resetQueryDateRange()
              }
          }
      },
      // searchArr: {
      //   handler: function(val, oldVal) {
      //     val.forEach((item) => {
      //       this.$set(this.formData, item.fieldCode, '')
      //     })
      //   },
      //   immediate: true
      // },
  },
  methods: {
      /** 转换字段数据结构 */
      normalizera(node) {
          if (node.children && !node.children.length) {
              delete node.children
          }
          return {
              id: node.id,
              label: node.deptName || node.menuName,
              children: node.children
          }
      },
      changeData(val){
        this.$emit('changeData', val);
      },
      selectTreeselect(val) {
          console.log(val)
          // if(val.deptName){
          //   this.deptIdStr = val.deptName
          // }
          // if(val.menuName){
          //   this.menuIdStr = val.menuName
          // }
      },
      handleQuery() {
          let dateRange = this.dateRange;
          for (let key in dateRange) {
              if (dateRange[key]) {
                  this.formData[key + 'Start'] = dateRange[key][0];
                  this.formData[key + 'End'] = dateRange[key][1];
              } else {
                  this.formData[key + 'Start'] = null;
                  this.formData[key + 'End'] = null;
              }
          }
          this.searchArr.forEach(item => {
            console.log(222);
              if (item.fieldType == 'tree' && this.formData[item.fieldCode]) {
                  if (item.fieldCode == 'deptId') {
                      this.formData[item.fieldCode + 'Str'] = this.deptIdStr
                  } else if (item.fieldCode == 'menuId') {
                      this.formData[item.fieldCode + 'Str'] = this.menuIdStr
                  }
              }
          })
          this.$emit('handleQuery', this.formData);
      },
      resetQueryDateRange() {
          for (const key of this.isClean) {
              if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
                  let reg = new RegExp("Start");
                  let dateKey = key.replace(reg, "");
                  delete this.dateRange[dateKey];
              }
          }
      },
      /** 重置按钮操作 */
      resetQuery() {
          // this.resetForm("queryForm");
          this.$emit('handleResetField');
          this.$nextTick(() => {
              this.dateRange = {};
              for (let key in this.formData) {
                  this.formData[key] = null;
              }
              this.formData.parentId = null
              this.formData.deptId = null
              this.deptIdStr = ''
              this.menuIdStr = ''
              this.handleQuery();
          })
      },
      //显示搜索
      toggleOpen() {
          this.showSearchDetail = true;
      },
      //隐藏搜索
      toggleClose() {
          this.showSearchDetail = false;
      }
  }
};
</script>
<style scoped>
.custom-form-item {
  white-space: nowrap;
}</style>
