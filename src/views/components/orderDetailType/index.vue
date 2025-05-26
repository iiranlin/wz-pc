<template>
  <div class="order-detail-type" :style="styleObj">
    <slot name="title"></slot>
    <el-radio-group :value="value" @input="handleChange">
      <el-radio v-removeAriaHidden :label="radio.value" v-for="radio in options" :key="radio.value">{{ radio.label }}</el-radio>
    </el-radio-group>
    <slot></slot>
  </div>
</template>

<script>

export default {
  name: 'orderDetailType',
  props: {
    value: {
      type: [String],
      required: false,
      default: '1'
    },
    styleObj: {
      type: [Object, String],
      default: () => {
        return {}
      }
    },
    options: {
      type: Array,
      required: false,
      default: () => {
        return [
          { value: '1', label: '主单' },
          { value: '2', label: '主单+明细' },
        ]
      }
    }
  },
  data() {
    return {
    }
  },
  mounted() {
  },
  methods: {
    handleChange(v) {
      this.$emit('input', v)
    }
  }
}
</script>

<style lang="scss" scoped>
.order-detail-type {
  padding-left: 14px;
  margin-right: 20px;
  
}
</style>