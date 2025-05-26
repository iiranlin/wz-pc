<template>
  <el-input v-model="price" v-number-input.float="2" @blur="(val) => $emit('blur', val)" @change="(val) => $emit('change', val)" @input="$emit('input', price)">
    <span slot="suffix" style="color: #606266;">元</span>
  </el-input>
</template>

<script>
export default {
  props: {
    /* 初始值 */
    value:{
      type: [String, Number],
      default: ()=>{ return '' }
    },
  },
  data() {
    return {
      price: this.value
    }
  },
  watch: {
    value(){
      this.price = this.value
    }
  },
  methods: {
  }
}
</script>