<template>
  <Dialog title="预览" :visible.sync="dialogFlag" v-if="dialogFlag" :show-close="true" :close-on-click-modal="false"
    :close-on-press-escape="false" center  class="small-padding-dialog"  
    width="75%">
    <template v-for="(item, index) in formList">
      <div :key="index" class="form-render-card" v-if="item.status == 0">
        <div class="form-render-title">
          <svg-icon :icon-class="item.formIcon" />{{ item.formName }}
        </div>
        <div class="form-render-wrapper">
          <VFormRender ref="preForm" :form-json="JSON.parse(item.formContent)" :preview-state="true"/>
        </div>
      </div>
    </template>
  </Dialog>
</template>
<script>
import VFormRender from '@/components/form-render/index'
export default {
  props: {
    formList: {
      type: Array,
      default: []
    }
  },
  components: { VFormRender },
  data() {
    return {
      dialogFlag: false,
    }
  },
  methods: {
    init() {
      this.dialogFlag = true
    }
  }
}
</script>
<style lang="scss" scoped>
.form-render-card {
  border-radius: 5px;
  padding: 12px 6px;
  box-shadow: 0px 1px 3px rgb(0 0 0 / 10%);
  margin-bottom: 10px;
  background-color: #fff;
}

.svg-icon {
  width: 32px;
  height: 32px;
  display: inline-block;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  vertical-align: -0.5em;
}

.form-render-title {
  color: #1b1e22;
  font-size: 18px;
  height: 38px;
  border-bottom: 1px solid rgba(112, 112, 112, 0.11);
}

.form-render-wrapper {
  margin-top: 18px;
}

::v-deep .el-dialog {
  background-color: #f1f3f8;
}

::v-deep .el-dialog .el-dialog__body {
  flex: 1;
  overflow-y: scroll;
}
</style>