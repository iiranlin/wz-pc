<template>
    <form-item-wrapper :designer="designer" :field="field" :rules="rules" :design-state="designState"
                       :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                       :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">
                       <div class="slot-wrapper-render">
                        <slot :name="field.options.name" v-bind:formModel="formModel"></slot>
                       </div>
                       
    </form-item-wrapper>
  </template>
  
  <script>
    import FormItemWrapper from './form-item-wrapper'
    import emitter from '@/utils/emitter'
    import i18n, {translate} from "@/utils/i18n";
    import fieldMixin from "@/components/form-designer/form-widget/field-widget/fieldMixin";
  
    export default {
      name: "label-widget",
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
        inputType() {
          if (this.field.options.type === 'number') {
            return 'text'  //当input的type设置为number时，如果输入非数字字符，则v-model拿到的值为空字符串，无法实现输入校验！故屏蔽之！！
          }
  
          return this.field.options.type
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
    .readonly-mode-field {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .slot-wrapper-render {
        width: 100%;
    }
  </style>
  