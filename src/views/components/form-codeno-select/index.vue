<template>
    <div class="form-item-unitid" :key="fieldData.fieldCode">
        <el-select clearable v-model="selected" filterable>
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
        </el-select>
    </div>
</template>
<script>
import { listNoPage } from '@/api/calculateManagement/accounting'
export default {
    props: {
        i18nData: {
            type: Function,
        },
        clearable: {
            type: Boolean,
            default: true
        },
        filterable: {
            type: Boolean,
            default: true
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
        }
    },
    watch: {
        'selected': {
            immediate: true,
            deep: true,
            handler(newValue) {
                this.formData[this.fieldData.fieldCode] = newValue
            }
        },


    },
    computed: {
    },
    data() {
        return {
            selected: undefined,
            options: []

        }
    },
    created() {
        this.$watch(
            () => this.formData[this.fieldData.fieldCode],
            (newVal, oldVal) => {
                if (!newVal && this.selected) {
                    this.selected = undefined
                }
            }
        );
        this.loadOptions()
    },
    components: {
    },
    methods: {
        async loadOptions() {
            const fieldCode = this.fieldData.fieldCode
            const { data } = await listNoPage()
            const opts = []
            for (let i = 0; i < data.length; i++) {
                const val = data[i][fieldCode]
                if (opts.findIndex(item => item.value == val) == -1) {
                    opts.push({ label: val, value: val })
                }

            }
            this.options = opts
        },
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