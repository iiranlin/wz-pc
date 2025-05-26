<template>
  <div class="form-item-unitid">
    <treeselect v-model="formData[fieldData.fieldCode]" :options="treeList" :z-index="zIndex"
      :placeholder="($t(`please_select`) || '请选择') + i18nData(fieldData, 'field', 'fieldCode', 'fieldName')"
      :normalizer="normalizera" @select="selectTreeselect" :appendToBody="appendToBody" @open="handleOpen">
      <template v-slot:option-label="{ node }">
        <span :title="node.label">{{ node.label }}</span>
      </template>
    </treeselect>
  </div>
</template>
<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { WarehouseList } from '@/api/warehouseManage/warehouse'
import { eventBus } from '@/store'
export default {
  props: {
    i18nData: {
      type: Function,
    },
    fieldData: {
      type: Object,
    },
    formData: {
      type: Object,
      default: function (val) {
        return {}
      }
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
    zIndex: {
      type: String,
      default: '999'
    }
  },
  data() {
    return {
      treeList: [],
      treeData: undefined

    }
  },
  created() {
    eventBus.$on('unitIdChange', this.handleUnitIdChange)
  },
  components: {
    Treeselect,
  },
  methods: {
    async loadTreeData() {
      const res = await WarehouseList({ status: 0, ofOrgan: this.formData.unitId })
      this.treeList = res.data.list || []
    },
    selectTreeselect(val, b) {
      this.formData[this.fieldData.fieldCode] = val.id
      // this.idNameFun(val.warehouseName)
    },
    normalizera(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.warehouseName,
        children: node.children
      }
    },
    idNameFun (val) {
      let idName = this.fieldData.fieldCode.substring(0,this.fieldData.fieldCode.length-2)
      idName += "Name"
      this.formData[idName] = val
    },
    handleOpen(){
      this.loadTreeData();
    },
    handleUnitIdChange(){
      this.treeList = [];
      this.formData[this.fieldData.fieldCode] = null;
    },
    destroyed () {
      eventBus.$off()
    }
  }
}
</script>

<style>
.control_straight .form-item-unitid .vue-treeselect__control {
  border-radius: 5px !important;
}

.control_fillet .form-item-unitid .vue-treeselect__control {
  border-radius: 50px !important;
}
</style>