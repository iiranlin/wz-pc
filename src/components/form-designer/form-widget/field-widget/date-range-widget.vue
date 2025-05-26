<template>
  <form-item-wrapper :designer="designer" :field="field" :rules="rules" :design-state="designState"
                     :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                     :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">
    <el-date-picker ref="fieldEditor" :type="field.options.type" v-model="fieldModel" v-show="!isReadMode" v-if="!field.options.readonlyText"
                    :class="[
                        'full-width-input',
                        `${field.options.isBorderRadius ? 'border-radius50' : ''}`,
                    ]"
                    :disabled="field.options.disabled" :readonly="field.options.readonly"
                    :size="field.options.size"
                    :clearable="field.options.clearable" :editable="field.options.editable"
                    :format="field.options.format" :value-format="field.options.valueFormat"
                    :start-placeholder="field.options.startPlaceholder || i18nt('render.hint.startDatePlaceholder')"
                    :end-placeholder="field.options.endPlaceholder || i18nt('render.hint.endDatePlaceholder')"
                    @focus="handleFocusCustomEvent" @blur="handleBlurCustomEvent"
                    @change="handleChangeEvent">
    </el-date-picker>
    <!-- <template v-if="isReadMode">
      <span class="readonly-mode-field">{{contentForReadMode}}</span>
    </template> -->
    <template v-if="(isReadMode || field.options.readonlyText) && fieldModel && fieldModel[0] && fieldModel[1]">
        <el-tooltip :content="parseTime(fieldModel[0],'{y}-{m}-{d}')+' - '+parseTime(fieldModel[1],'{y}-{m}-{d}')" effect="light">
            <span class="readonly-mode-field">{{parseTime(fieldModel[0],'{y}-{m}-{d}')+' - '+parseTime(fieldModel[1],'{y}-{m}-{d}')}}</span>
        </el-tooltip>
    </template>
  </form-item-wrapper>
</template>

<script>
  import FormItemWrapper from './form-item-wrapper'
  import emitter from '@/utils/emitter'
  import i18n, {translate} from "@/utils/i18n";
  import fieldMixin from "@/components/form-designer/form-widget/field-widget/fieldMixin";

  export default {
    name: "date-range-widget",
    componentName: 'FieldWidget',  //必须固定为FieldWidget，用于接收父级组件的broadcast事件
    mixins: [emitter, fieldMixin, i18n],
    props: {
      field: Object,
      parentWidget: Object,
      parentList: Array,
      indexOfParentList: Number,
      designer: Object,

      designState: {
        type: Boolean,
        default: false
      },

      subFormRowIndex: { /* 子表单组件行索引，从0开始计数 */
        type: Number,
        default: -1
      },
      subFormColIndex: { /* 子表单组件列索引，从0开始计数 */
        type: Number,
        default: -1
      },
      subFormRowId: { /* 子表单组件行Id，唯一id且不可变 */
        type: String,
        default: ''
      },

    },
    components: {
      FormItemWrapper,
    },
    inject: ['refList', 'globalOptionData', 'globalModel'],
    data() {
      return {
        oldFieldValue: null, //field组件change之前的值
        fieldModel: null,
        rules: [],
      }
    },
    computed: {
      contentForReadMode() {
        if (!this.fieldModel) {
          return '--'
        } else {
          return this.fieldModel[0] + ' - ' + this.fieldModel[1]
        }
      },

    },
    beforeCreate() {
      /* 这里不能访问方法和属性！！ */
    },

    created() {
      /* 注意：子组件mounted在父组件created之后、父组件mounted之前触发，故子组件mounted需要用到的prop
         需要在父组件created中初始化！！ */
      this.registerToRefList()
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

    }
  }
</script>

<style lang="scss" scoped>
  @import "../../../../assets/styles/global.scss"; //* form-item-wrapper已引入，还需要重复引入吗？ *//

  .full-width-input {
    width: 100% !important;
  }

.readonly-mode-field {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>
