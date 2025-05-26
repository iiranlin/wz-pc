<template >
  <el-form v-if="searchArr.length != 0" class="container form-data-select-header" ref="queryForm" :model="formData" :inline="true"
      v-show="showSearch" label-width="85px">
      <div class="form-content-box" :class="{'form-content-box-defaultSearch': defaultSearch && showDefaultSearch}">
          <template v-for="item in searchObjArr.searchArr">
              <el-form-item v-if="!item.formSlot" class="custom-form-item" :label="item.fieldName"
                  :prop="item.fieldType == 'date' ? '' : item.fieldCode" :key="item.id">
                  <template slot="label">
                      <el-tooltip :content="item.fieldName" placement="top" :disabled="isShowTooltip">
                          <span  @mouseenter="visibleTooltip">{{item.fieldName}}</span>
                      </el-tooltip>
                  </template>
                  <el-select class="select-box" v-if="item.fieldType == 'dict'" v-model="formData[item.fieldCode]" :multiple="item.isMutiple=='1'" collapse-tags
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
              <slot v-else :name="item.fieldCode" :data="item"></slot>
          </template>
      </div>
      <el-form-item class="search-control">
          <el-button class="search" size="mini" @click="handleQuery">
              <icon-svg icon-class="Line-Search" />搜索
          </el-button>
          <el-button class="reset" size="mini" @click="resetQuery">
              <icon-svg icon-class="Line-Refresh" class="icon-svg-blue" />重置
          </el-button>
      </el-form-item>
  </el-form>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "FormData",
  components: {Treeselect},
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
      }
  },
  data() {
      return {
          // 日期范围
          dateRange: {},
          // formData: {},
          showDefaultSearch: true,
          deptIdStr: '',
          menuIdStr: '',
          isShowTooltip: true
      };
  },
  computed: {
      defaultSearch () {
          return true
      },
      searchObjArr () {
          let defaultSearchArr = [], searchArr = [];
          this.searchArr.forEach( (item) => {
              if(item.defaultSearch === 1){
                  defaultSearchArr.push(item)
              }else{
                  searchArr.push(item)
              }
          })
          return {searchArr, defaultSearchArr}
      }
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
      selectTreeselect(val) {
      },
      handleQuery(type) {
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
              if (item.fieldType == 'tree' && this.formData[item.fieldCode]) {
                  if (item.fieldCode == 'deptId') {
                      this.formData[item.fieldCode + 'Str'] = this.deptIdStr
                  } else if (item.fieldCode == 'menuId') {
                      this.formData[item.fieldCode + 'Str'] = this.menuIdStr
                  }
              }
          })
          this.$emit('handleQuery', this.formData, type);
      },
      resetQueryDateRange(key) {
          let reg2 = new RegExp("Start");
          let a2 = key.replace(reg2, "");
          delete this.dateRange[a2];
      },
      /** 重置按钮操作 */
      resetQuery() {
        //   this.resetForm("queryForm");
        //   this.$emit('handleResetField');
          this.$nextTick(() => {
              this.dateRange = {};
              for (let key in this.formData) {
                  this.formData[key] = null;
              }
              this.deptIdStr = ''
              this.menuIdStr = ''
              this.handleQuery('queryForm');
          })
      },
      visibleTooltip (e) {
          const event = e || window.event;
          const eventDiv = event.target || event.srcElement;
          this.isShowTooltip = eventDiv.offsetWidth + 18 - eventDiv.parentNode.clientWidth > 0 ? false : true;
      }
  }
};
</script>
<style lang="scss" scoped>
.form-content-box{
  max-height: 162px;
  overflow-y: auto;
}
.form-content-box-defaultSearch{
  max-height: 108px;
  overflow: hidden;
}
.search,
.reset,
.toggleClose{
  border: 1px solid #1890ff;
}
::v-deep .el-form-item__label{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
::v-deep.form-data-select-header {
    padding-left: 10px;
    background-color: #ffffff;

    .el-input__inner {
        border-radius: 50px;
        height: 34px;
    }

    .vue-treeselect__control {
        border-radius: 18px;
        height: 34px;
    }

    .form-content-box {
        padding: 16px 0 8px 0;
    }

    .custom-form-item {
        width: 33%;
        margin: 0 0 8px 0;
    }

    @media (min-width: 1440px) {
        .custom-form-item {
            width: 25%;
        }
    }

    .custom-form-item .el-form-item__content {
        width: 70%;
    }

    .search-control {
        position: absolute;
        right: 0px;
        top: 9px;
    }

    .search,
    .reset,
    .toggleClose {
        border: none;
        border-radius: 50px;
        min-width: 100px;
        height: 32px;
        padding: 5px 24px 5px 44px;
        text-align: right;
        box-shadow: 0px 1px 2px rgba(0, 57, 186, 0.2);
        position: relative;
        margin-right: 6px;

        &:hover {
            border-color: none;

            .icon-svg-blue {
                color: #ffffff;
            }
        }
    }

    .toggleOpen {
        color: #1b1e22;
        min-width: 100px;
        height: 34px;
        border-radius: 5px 5px 0px 0px;
        border-width: 3px 0px 0px 0px;
        border-color: #ffffff;
        padding-left: 0px;
        padding-right: 0px;
        box-shadow: 0px 1px 2px rgba(0, 57, 186, 0.2);
        margin-right: 6px;

        &:hover {
            background-color: #ffffff;
            color: #3d8aff;
        }

        &::after {
            width: 100%;
            height: 10px;
            display: block;
            content: "";
            background-color: #ffffff;
            transform: translateY(10px);
        }
    }

    .search {
        background-color: #227aff;
        color: #ffffff;

        &:hover {
            background-color: #106df8;
        }
    }

    .reset {
        background-color: #ffffff;
        color: #1b1e22;

        &:hover {
            color: #ffffff;
            background-color: #106df8;
        }
    }

    .toggleClose {
        background-color: #ffffff;
        color: #1b1e22;

        &:hover {
            color: #ffffff;
            background-color: #3d8aff;
        }

        .search-btn-text {
            margin-left: 3px;
        }
    }

    .svg-icon-font {
        position: absolute;
        left: 20px;
        top: 3px;
    }

    .icon-svg-blue {
        color: #3d8aff;
    }
}
</style>