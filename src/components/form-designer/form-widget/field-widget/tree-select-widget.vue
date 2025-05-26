<template>
  <form-item-wrapper
    :designer="designer"
    :field="field"
    :rules="rules"
    :design-state="designState"
    :parent-widget="parentWidget"
    :parent-list="parentList"
    :index-of-parent-list="indexOfParentList"
    :sub-form-row-index="subFormRowIndex"
    :sub-form-col-index="subFormColIndex"
    :sub-form-row-id="subFormRowId"
  >
  <!-- field.options.alwaysOpen -->
    <treeselect
      ref="fieldEditor"
      :class="[
        'full-width-input',
        `${field.options.isBorderRadius ? 'border-radius50' : ''}`,
      ]"
      v-show="!isReadMode"
      v-model="fieldModelValue"
      :name="field.options.name"
      :multiple="field.options.multiple"
      :async="field.options.async"
      :clearable="field.options.clearable"
      :disabled="field.options.disabled"
      :options="field.options.optionItems"
      :normalizer="normalizer"
      :placeholder="field.options.placeholder"
      :flat="field.options.flat|| true"
      :searchable="field.options.searchable"
      :open-on-click="field.options.openOnClick"
      :open-on-focus="field.options.openOnFocus"
      :clear-on-select="field.options.clearOnSelect"
      :close-on-select="field.options.closeOnSelect"
      :always-open="field.options.alwaysOpen" 
      :limit="field.options.limit"
      append-to-body
      :max-height="field.options.maxHeight"
      :disable-branch-nodes="field.options.disableBranchNodes"
      :disableFuzzyMatching="true || field.options.disableFuzzyMatching"
      :show-count="field.options.showCount"
      noChildrenText="无子数据"
      noResultsText="无匹配数据"
      noOptionsText="无数据"
      clearValueText=""
      :zIndex="field.options.zIndex"
      :tabIndex="field.options.tabIndex"
      @open="handleTreeSelectOpenEvent"
      @close="handleTreeSelectCloseEvent"
      @input="handleTreeSelectInputEvent"
      @select="handleTreeSelectSelectEvent"
      @deselect="handleTreeSelectDeselectEvent"
      @search-change="handleTreeSelectSearchChangeEvent"
      :title="optionLabel"
    >
    <template v-slot:option-label="{ node }">
      <span :title="node.label">{{ node.label }}</span>
    </template>
    </treeselect>
    <template v-if="isReadMode">
        <el-tooltip :content="optionLabel+''" effect="light">
            <span class="readonly-mode-field">{{optionLabel}}</span>
        </el-tooltip>
    </template>
  </form-item-wrapper>
</template>

<script>
import FormItemWrapper from './form-item-wrapper'
import emitter from '@/utils/emitter'
import i18n, { translate } from '@/utils/i18n'
import fieldMixin from '@/components/form-designer/form-widget/field-widget/fieldMixin'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: 'tree-select-widget',
  componentName: 'FieldWidget', //必须固定为FieldWidget，用于接收父级组件的broadcast事件
  mixins: [emitter, fieldMixin, i18n],
  props: {
    field: Object,
    parentWidget: Object,
    parentList: Array,
    indexOfParentList: Number,
    designer: Object,

    designState: {
      type: Boolean,
      default: false,
    },

    subFormRowIndex: {
      /* 子表单组件行索引，从0开始计数 */ type: Number,
      default: -1,
    },
    subFormColIndex: {
      /* 子表单组件列索引，从0开始计数 */ type: Number,
      default: -1,
    },
    subFormRowId: {
      /* 子表单组件行Id，唯一id且不可变 */ type: String,
      default: '',
    },
  },
  components: {
    FormItemWrapper,
    Treeselect
  },
  inject: ['refList', 'globalOptionData', 'globalModel'],
  computed: {
    fieldModelValue: {
      get(){
        if(this.fieldModel == null || this.fieldModel == '') {
          return undefined
        }
          return this.fieldModel
      },
      set(v){
        this.fieldModel = v
      }
    }
  },
  data() {
    return {
      oldFieldValue: null, //field组件change之前的值
      fieldModel: null,
      rules: [],
    }
  },
  beforeCreate() {
    /* 这里不能访问方法和属性！！ */
  },

  created() {
    /* 注意：子组件mounted在父组件created之后、父组件mounted之前触发，故子组件mounted需要用到的prop
         需要在父组件created中初始化！！ */
    this.registerToRefList()
    this.initOptionItems()
    this.initFieldModel()
    this.initEventHandler()
    this.buildFieldRules()
    this.handleOnCreated()
  },

  mounted() {
    this.handleOnMounted()
  },

  beforeDestroy() {
    this.unregisterFromRefList()
  },

  methods: {
    normalizer(node) {
      let { id, label, children} = this.field.options.normalizer
      id = id
      label = label
      children = children
      if(this.field.options.valueKey){
        id = this.field.options.valueKey
      }
      if(this.field.options.labelKey){
        label = this.field.options.labelKey
      }
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node[id || 'id'],
        label: node[label || 'label'],
        children: node[children || 'children'],
        isDisabled: eval(this.field.options.normalizer.isDisabled) || false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../../../assets/styles/global.scss'; //* form-item-wrapper已引入，还需要重复引入吗？ *//

.full-width-input {
  width: 100% !important;
}
.readonly-mode-field {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
::v-deep .vue-treeselect {
  line-height: initial;
}
::v-deep .vue-treeselect__menu-container{ //浮层内部样式 写在全局中 浮层被加入到了body里
    font-size: 14px;
    color:#606266;
    font-weight: 100;
}
</style>
