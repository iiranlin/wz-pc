export default {
    props: {
        isDialog: {
            type: Boolean,
            default: false
        },
        dialogQuery: {
            type: Object,
            default: function () {
                return { id: '' }
            }
        },
        refreshChange: {
            type: Function,
            default: null
        },
        refName: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            listQuery: {
                pageNum: 1,
                pageSize: 30,
                isAsc: '',
                orderByColumn: ''
            }
        }
    },
    filters: {
        format(val) {
            if (val) {
                if (!isNaN(val)) {
                    let reg = /\d{1,3}(?=(\d{3})+$)/g
                    return (val + '').replace(reg, '$&,')
                } else {
                    return val
                }
            } else {
                if (val === null) {
                    return 0
                } else {
                    return 0
                }
            }

        },
        fieldFormat(val, dicts) {
            if (!dicts || !dicts.length) {
                return val
            }
            for (let dict of dicts) {
                if (val == dict.code) {
                    return dict.name
                }
            }
        },

        dealBigMoney(n = 0) {
            var fraction = ['角', '分'];
            var digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
            var unit = [['元', '万', '亿'], ['', '拾', '佰', '仟']];
            var head = n < 0 ? '欠' : '';
            n = Math.abs(n);

            var s = '';

            for (var i = 0; i < fraction.length; i++) {
                s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
            }
            s = s || '整';
            n = Math.floor(n);

            for (var i = 0; i < unit[0].length && n > 0; i++) {
                var p = '';
                for (var j = 0; j < unit[1].length && n > 0; j++) {
                    p = digit[n % 10] + unit[1][j] + p;
                    n = Math.floor(n / 10);
                }
                s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
            }
            return head + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
        },


        orderTypeFilter(val, code) {
            let v = val
            for (let key of code) {
                if (key.value == val) {
                    v= key.label
                    break
                }
            }
            return v
        }
    },
    methods: {
        handleRefresh(ref) {
            this.$refs[ref] && this.$refs[ref].handleQuery()
        },
        handleTableTypeChange(v) {
            this.tabChange && this.tabChange(v)
        },
        /**
         * 用于配置页面-新增对话框,非必填字段的灵活展示
         * 1.请不要对必填字段使用，以免引发意外的bug;
         * 2.布局上需要注意字段隐藏的布局变化,推荐用el-row包裹多el-col灵活布局,应用在el-col上;
         * 3.使用案例可参照src/views/system/position/index.vue
         *
         * @param field 字段名
         * @param property 页面配置信息,默认为 this.property
         * @returns {boolean} 返回是否可以新增，可新增则展示
         */
        isAddField(field, property = this.property) {
            return property.fields.filter(item => item.fieldCode === field && item.isAdd === 1).length === 1
        },
        /**
         * 用于配置页面-修改对话框,字段的可编辑状态
         * 使用案例可参照src/views/system/position/index.vue
         *
         * @param field 字段名
         * @param form 表单绑定实体,默认为 this.form
         * @param property 页面配置信息,默认为 this.property
         * @param keyField 主键,通过判断是否主键为空来区分更新和新增状态,默认为id
         * @returns {boolean} 返回是否可以修改，不可修改则置灰
         */
        isDisabledField(field, form = this.form, property = this.property, keyField = 'id') {
            return !!form[keyField] && !(property.fields.filter(item => item.fieldCode === field && item.isEdit === 1).length === 1)
        },
        sortableColumnChange({ order, prop }) {
            if (order) {
                this.listQuery.isAsc = (order === 'descending') ? 'desc' : 'asc'
                this.listQuery.orderByColumn = prop
            } else {
                this.listQuery.isAsc = ''
                this.listQuery.orderByColumn = ''
            }
            this.emitAblFilter()
        },
        tableIndex(index) {
            let { pageNum, pageSize } = this.listQuery
            return ((pageNum - 1) * pageSize) + (index + 1)
        },
        tableRowClassName({ row, rowIndex }) {   // 把每一行的索引放进row
            let { pageNum, pageSize } = this.listQuery
            row.index = ((pageNum - 1) * pageSize) + (rowIndex + 1)
        },
        iconClass(value) {
            const classObj = {
                0: "State-Fail", //审核不通过
                1: "State-Waiting", //未提交
                2: "State-Audit", //审核中
                3: "State-Success", //审核通过
                4: "State-Waiting", //待调整
                5: "State-Waiting" //待复核
            }
            return `${classObj[value] || classObj[1]}`
        },
        iconEnableStautsClass(value) {
            const classObj = {
                0: "State-Fail", //审核不通过
                1: "State-Waiting", //未提交
                2: "State-Audit", //审核中
                3: "State-Success" //审核通过
            }
            return `${classObj[value]}`
        },
        iconClassSize(value) {
            // if (value !== '3') {
            //     return "icon-size"
            // }
            return "icon-size"
        },
        i18nData(row, fatherCode, sonCode, sonName) {
            return (this.$t(row.options && JSON.parse(row.options).i18nCode) || this.$t(`${fatherCode}.${row[sonCode]}`) || row[sonName])
        },
    }
}
