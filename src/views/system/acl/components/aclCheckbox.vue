<template>
  <div class="acl_checkbok">
    <div class="button_checked" v-if="item.buttonList && item.buttonList.length > 0">
      <el-checkbox :indeterminate="isIndeterminateButton" v-model="checkAllButton" @change="handleCheckAllButtonChange" :disabled="disabled">功能按钮</el-checkbox>
      <div class="button_list">
        <el-checkbox-group v-model="checkedButton" @change="handlecheckedButtonChange" :disabled="disabled">
          <template v-for="city in item.buttonList">
            <el-checkbox :label="city.id" :key="city.id" :checked="city.isBind == 1">{{city.aclName}}</el-checkbox>
          </template>
        </el-checkbox-group>
      </div>
    </div>
    <div class="button_checked" v-if="item.fieldList && item.fieldList.length > 0">
      <div class="button_all">
        <el-checkbox :indeterminate="isIndeterminateList" v-model="checkAllList" @change="handleCheckAllListChange" :disabled="disabled">列表字段</el-checkbox>
      </div>
      <div class="button_list">
        <el-checkbox-group v-model="checkedList" @change="handlecheckedListChange" :disabled="disabled">
          <el-checkbox v-for="city in item.fieldList" :label="city.id" :key="city.id" :checked="city.isBind == 1">{{city.aclName}}</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
        type: Object,
        default: () => {},
    },
    id: {
        type: String,
        default: () => '',
    },
    disabled: {
        type: Boolean,
        default: () => false
    }
  },
  data() {
    return {

      checkAllButton: false,
      isIndeterminateButton: true,
      checkedButton: [],

      checkAllList: false,
      isIndeterminateList: true,
      checkedList: [],

      arrButton: [],
      arrfieldList: []
    }
  },
  created() {
    let arrButton = [], arrButtonTrue = [], arrfieldList = [], arrfieldListTrue = [];
    if(this.item.buttonList){
      this.item.buttonList.forEach(item => {
        arrButton.push(item.id);
        if (item.isBind == 1) {
          arrButtonTrue.push(item);
        }
      });
      this.arrButton = arrButton;
      if (arrButtonTrue.length === arrButton.length) {
        this.$nextTick( () => {
          this.checkAllButton = true;
          this.isIndeterminateButton = false;
        })
      }
    }
    if(this.item.fieldList){
      this.item.fieldList.forEach(item => {
        arrfieldList.push(item.id);
        if (item.isBind == 1) {
          arrfieldListTrue.push(item);
        }
      });
      this.arrfieldList = arrfieldList;
      if (arrfieldListTrue.length === arrfieldList.length) {
        this.$nextTick( () => {
          this.checkAllList = true;
          this.isIndeterminateList = false;
        })
      }
    }
    this.$nextTick(() => {
      let arr = this.checkedButton.concat(this.checkedList);
      if(arr.length > 0){
        this.$emit("changeAll", arr, this.id);
      }
    })
  },
  methods: {
    //监听菜单选中状态
    isWatch () {
      if(this.item.id === this.id && this.item.isSelect == true){
        this.checkedButton = this.arrButton;
        this.checkAllButton = true;
        this.isIndeterminateButton = false;

        this.checkedList = this.arrfieldList;
        this.checkAllList = true;
        this.isIndeterminateList = false;

        let arr = this.checkedButton.concat(this.checkedList);
        this.$emit("changeAll", arr, this.id);
      }else{
        
        this.checkedButton = [];
        this.checkAllButton = false;
        this.isIndeterminateButton = false;

        this.checkedList = [];
        this.checkAllList = false;
        this.isIndeterminateList = false;

        let arr = this.checkedButton.concat(this.checkedList);
        this.$emit("changeAll", arr, this.id);
      }
    },
    //按钮单
    handlecheckedButtonChange (value) {
      let checkedCount = value.length;
      this.checkAllButton = checkedCount === this.arrButton.length;
      this.isIndeterminateButton = checkedCount > 0 && checkedCount < this.arrButton.length;
      
      let arr = this.checkedButton.concat(this.checkedList);
      this.$emit("changeAll", arr, this.id, this.item);
    },
    //按钮全
    handleCheckAllButtonChange (val) {
      this.checkedButton = val ? this.arrButton : [];
      this.isIndeterminateButton = false;
      
      let arr = this.checkedButton.concat(this.checkedList);
      this.$emit("changeAll", arr, this.id, this.item);
    },
    //列表字段单
    handlecheckedListChange (value) {
      let checkedCount = value.length;
      this.checkAllList = checkedCount === this.arrfieldList.length;
      this.isIndeterminateList = checkedCount > 0 && checkedCount < this.arrfieldList.length;

      let arr = this.checkedButton.concat(this.checkedList);
      this.$emit("changeAll", arr, this.id, this.item);
    },
    //列表字段全
    handleCheckAllListChange (val) {
      this.checkedList = val ? this.arrfieldList : [];
      this.isIndeterminateList = false;

      let arr = this.checkedButton.concat(this.checkedList);
      this.$emit("changeAll", arr, this.id, this.item);
    },
  }
};
</script>
<style lang="scss" scoped>
.acl_checkbok{
  margin-top: 10px;
  .button_checked{
    display: flex;
    margin-left: 75px;
    margin-bottom: 10px;
    .button_all{
      float: left;
    }
    .button_list{
      float: left;
    }
  }
  .el-checkbox{
    min-width: 100px;
  }
}
</style>