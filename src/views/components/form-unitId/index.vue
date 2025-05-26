<template>
    <div class="form-item-unitid">
        <treeselect v-model="treeData" :options="treeList" :z-index="zIndex"
          :placeholder="($t(`please_select`) || '请选择') + i18nData(fieldData, 'field', 'fieldCode', 'fieldName')"
          :normalizer="normalizera" @select="selectTreeselect" :appendToBody="appendToBody" @input="inputTreeselect">
          <template v-slot:option-label="{ node }">
            <span :title="node.label">{{ node.label }}</span>
          </template>
        </treeselect>
    </div>
</template>
<script>
import Treeselect from "@riophae/vue-treeselect";
import { getUnitTree } from '@/api/system/dept'
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
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
        },
    },
    watch: {

    },
    data() {
        return {
            treeList: [],
            treeData: undefined

        }
    },
    created() {
        this.$watch(
            () => this.formData[this.fieldData.fieldCode],
            (newVal, oldVal) => {
                if (!newVal && this.treeData) {
                    this.treeData = undefined
                }
                if( newVal != oldVal) {
                   
                    this.initNameFun(newVal)
                }
            }
        );
        this.loadTreeData()
    },
    components: {
        Treeselect,
    },
    methods: {
        async loadTreeData() {
            const res = await getUnitTree({ status: 0 })
            this.treeList = res.data
        },
        selectTreeselect(val, b) {
            this.formData[this.fieldData.fieldCode] = val.deptName
            this.idNameFun(val.id)

            //更新仓库下拉组件状态
            eventBus.$emit('unitIdChange')
        },
        inputTreeselect(val) {
          if(!val){
            this.formData[this.fieldData.fieldCode] = undefined
            this.idNameFun(val)
          }
        },
        normalizera(node) {
            if (node.children && !node.children.length) {
                delete node.children
            }
            return {
                id: node.id,
                label: node.deptName,
                children: node.children
            }
        },
        initNameFun() {
            let idName = this.fieldData.fieldCode.substring(0,this.fieldData.fieldCode.length-4)
             idName += "Id"
            this.treeData = this.formData[idName]
        },
        idNameFun (val) {
          let idName = this.fieldData.fieldCode.substring(0,this.fieldData.fieldCode.length-4)
          idName += "Id"
          this.formData[idName] = val
        }
    }
}
</script>

<style>
.control_straight .form-item-unitid .vue-treeselect__control{
    border-radius: 5px !important;
}
.control_fillet .form-item-unitid .vue-treeselect__control{
    border-radius: 50px !important;
}

</style>