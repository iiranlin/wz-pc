<template>
  <el-popover placement="bottom" width="260" trigger="click" v-model="visible">
    <span slot="reference" class="default-svg-icon" :style="buttonStyle">
      <svg-icon icon-class="icon-filter-default" />
    </span>
    <el-input v-model="search" size='mini' placeholder="请输入过滤内容" />
    <el-checkbox v-if="!search" class="checkboxAll" :indeterminate="isIndeterminate" v-model="checkAll"
      @change="handleCheckAllChange">全选</el-checkbox>
    <el-checkbox-group v-model="checkList" class="checkbox-group" @change="handleCheckedCitiesChange">
      <el-checkbox :label="item.id" class="checkbox" v-for="(item, index) in dataList" :key='index'>
        <span v-if="item.fieldType.indexOf('dict') != -1">{{ item.id | fieldFormat(item.fieldFormatArr) }} {{ item.num }}</span>
        <span v-else>{{ item.id }} {{ item.num }}</span>
      </el-checkbox>
    </el-checkbox-group>
    <div class="render_header_popover">
      <el-button type="primary" icon="el-icon-search" size="mini" @click="select">筛选</el-button>
      <el-button icon="el-icon-refresh" size="mini" @click="reset">重置</el-button>
    </div>
  </el-popover>
</template>

<script>
import indexMixin from "@/views/mixins";
export default {
  name: 'filterData',
  mixins: [indexMixin],
  props: {
    dataArr: {
      type: Array,
      default: () => []
    },
    property: {
      type: String,
      default: ''
    },
    propertyFields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      search: '',
      visible: false,
      checkList: [],
      checkLists: [],
      dataList: [],
      defaultData: [],
      checkAll: true,
      isIndeterminate: false,
      fieldObj: null
    }
  },
  watch: {
    visible(newVal) {
      if (newVal && this.checkLists.length) {
        this.checkList = this.checkLists;
      }
    },
    search(newVal) {
      this.handleData(newVal);
    },
    dataArr: {
      handler: function (newVal) {
        this.fieldObj = {
          fieldType: '',
          fieldFormatArr: '',
          fieldFormat: ''
        };
        this.propertyFields.forEach((item) => {
          if (this.property === item.fieldCode) {
            this.fieldObj = {
              fieldType: item.fieldType,
              fieldFormatArr: item.fieldFormatArr,
              fieldFormat: item.fieldFormat,
            };
          }
        })
        // 统计数组中相同元素的个数
        let obj = {};
        for (let i = 0; i < newVal.length; i++) {
          const value = this.fieldObj.fieldType.indexOf('date') != -1?this.parseTime(newVal[i][this.property], this.fieldObj.fieldFormat):newVal[i][this.property]
          if (obj[value]) {
            obj[value]++;
          } else {
            obj[value] = 1;
          }
        }
        // 将相同元素的个数转换为数组
        let arr = [];
        this.checkList = [];
        for (let key in obj) {
          arr.push({
            id: this.fieldObj.fieldType.indexOf('date') != -1?this.parseTime(key, this.fieldObj.fieldFormat):key,
            num: `(${obj[key]})`,
            ...this.fieldObj
          });
          this.checkList.push(key);
        }
        this.defaultData = arr;
        this.dataList = arr;
        this.checkLists = this.checkList;
      },
      deep: true, // 开启深度监听
      immediate: true //刷新加载  立马触发一次handler
    }
  },
  computed: {
    buttonStyle() {
      if (this.checkLists.length < this.defaultData.length) {
        return {
          color: '#005ede !important'
        }
      }
    },
  },
  methods: {
    handleData(newVal) {
      this.dataList = this.defaultData.filter(item => {
        if (item.id === null) return newVal === '';
        let name = ''
        if (typeof item.id === 'string') {
          item.fieldFormatArr && item.fieldFormatArr.forEach(val => {
            if (item.id === val.value) {
              name = val.label
            }
          })
          return name.includes(newVal) || item.id.includes(newVal);
        }
        return item.id.toString().includes(newVal);
      })
    },
    select() {
      this.checkLists = this.checkList;
      const filterData = this.checkList.filter(item => this.dataList.map(val => val.id).includes(item))
      this.$emit('updateFilterData', { data: filterData, property: this.property, fieldObj: this.fieldObj });
      this.visible = false;
    },
    reset() {
      this.search = '';
      this.checkAll = true;
      this.isIndeterminate = false;
      this.checkList = this.defaultData.map(item => item.id)
      this.checkLists = this.checkList;
      this.$emit('updateFilterData', { data: this.checkList, property: this.property, fieldObj: this.fieldObj });
      this.visible = false;
    },
    handleCheckAllChange(val) {
      this.checkList = val ? this.defaultData.map(item => item.id) : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      let defaultDataList = this.defaultData.map(item => item.id);
      let checkedCount = value.length;
      this.checkAll = checkedCount === defaultDataList.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < defaultDataList.length;
    }
  }
}
</script>

<style scoped lang='scss'>
.render_header_popover {
  margin-top: 10px;
  float: right;
}

.svg-icon {
  width: 20px;
  height: 20px;
}

.default-svg-icon {
  color: red !important;
}

.checkboxAll {
  margin-top: 10px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  max-height: 300px;
  overflow: auto;
}

.checkbox {
  margin: 4px 0;
}
</style>
<style>
.theme_colour_app .default-svg-icon {
  color: #fff !important;
}

.theme_colour .default-svg-icon {
  color: #C9CDD4 !important;
}
</style>