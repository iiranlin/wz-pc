<template>
  <svg class="svg-icon-font" aria-hidden="true">
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script>
export default {
  name: 'icon-svg',
  props: {
    iconClass: {
      type: String,
      default:"",
      required: true
    }
  },
  computed: {
    iconName () {
      return `#Icon-${this.iconClass}`
    }
  }
}
</script>

<style>
.svg-icon-font {
  width: 1em;
  height: 1em;
  font-size: 24px;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>