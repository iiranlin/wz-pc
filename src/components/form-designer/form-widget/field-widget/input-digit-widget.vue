<template>
    <form-item-wrapper :designer="designer" :field="field" :rules="rules" :design-state="designState"
        :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
        :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">
        <el-input ref="fieldEditor" v-model="fieldModel" v-show="!isReadMode" v-if="!field.options.readonlyText" :disabled="field.options.disabled"
            :readonly="field.options.readonly" :size="field.options.size"
            :class="[
                'hide-spin-button',
                `${field.options.isBorderRadius ? 'border-radius50' : ''}`,
            ]"
            :type="inputType"
            :show-password="field.options.showPassword" :placeholder="field.options.placeholder"
            :clearable="field.options.clearable" :minlength="field.options.minLength" :maxlength="field.options.maxLength"
            :show-word-limit="field.options.showWordLimit" :prefix-icon="field.options.prefixIcon"
            :suffix-icon="field.options.suffixIcon" @focus="() => { this.fieldModel = remoney(this.fieldModel) }" @blur="costChange"
            @input="limitInput($event)" @change="handleChangeEvent">
            <el-button slot="append" v-if="field.options.appendButton"
                :disabled="field.options.disabled || field.options.appendButtonDisabled" :class="field.options.buttonIcon"
                @click.native="emitAppendButtonClick"></el-button>
        </el-input>
        <template v-if="isReadMode || field.options.readonlyText">
            <span class="readonly-mode-field">{{ fieldModel }}</span>
        </template>
    </form-item-wrapper>
</template>
  
<script>
import FormItemWrapper from './form-item-wrapper'
import emitter from '@/utils/emitter'
import i18n, { translate } from "@/utils/i18n";
import fieldMixin from "@/components/form-designer/form-widget/field-widget/fieldMixin";

export default {
    name: "input-digit-widget",
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
        limitInput(value) {
            this.fieldModel =
                ("" + value) // 第一步：转成字符串
                    .replace(/[^\d^\.]+/g, "") // 第二步：把不是数字，不是小数点的过滤掉
                    .replace(/^0+(\d)/, "$1") // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
                    .replace(/^\./, "0.") // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
                    .match(/^\d*(\.?\d{0,2})/g)[0] || ""; // 第五步：最终匹配得到结果 以数字开头，只有一个小数点，而且小数点后面只能有0到2位小数
        },
        costChange(e) {
            //获取输入的数据，若不写这行，数据可能输不进去
            this.fieldModel = e.target.value;
            //将用户输入的数据，自动转换为带千分符的
            this.fieldModel = this.fmoney(this.fieldModel);
        },
        //千分位格式化：10000转为10,000.00
        fmoney(s, n) {
            if (s == '' || s == null || s == undefined | isNaN(Number(s))) {
                return s
            }
            s = Number(s) ? Number(s) : s
            n = ((n || n == 0) && n > -1 && n <= 20) ? n : 2;
            s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
            var l = s.split(".")[0].split("").reverse();
            var r = s.split(".")[1];
            var t = "";
            for (var i = 0; i < l.length; i++) {
                t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
            }
            if (n > 0) {
                r = '.' + r
            } else if (n == 0) {
                r = ''
            }
            let returnT = t.split("").reverse().join("") + r;
            //负数处理
            if (returnT[0] == '-' && returnT[1] == ',') {
                returnT = '-' + returnT.substring(2)
            }
            return returnT;
        },
        //千分位反格式化:10,000.00转为10000.00
        remoney(s) {
            let str = ''
            if (s) {
                str = String(s).replace(/,/g, "")
            }
            if (s && (s + "").indexOf('.') > -1 && Number(str)) {
                return String(s).replace(/[^\d\.-]/g, "");
            } else if (s && Number(str)) {
                return str;
            } else {
                return s
            }
        },
    }
}
</script>
  
<style lang="scss" scoped>
@import "../../../../assets/styles/global.scss"; //* form-item-wrapper已引入，还需要重复引入吗？ *//
</style>
  