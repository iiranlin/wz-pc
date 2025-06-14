<template>
    <fragment v-if="Array.isArray(field.children) && !!field.children.length">
        <el-table-column v-if="field.isHide === 0 && !field.isHides" :show-overflow-tooltip="true"
            :prop="field.fieldCode" :label="i18nData(field, 'field', 'fieldCode', 'fieldName')" :fixed="field.fixedColumn || null"
            :key="field.id"
            :align="field.align || (field.fieldCode.indexOf('name') != -1 || field.fieldCode.indexOf('Name') != -1 ? 'left' : 'center')"
            :min-width="field.fieldWidth || '150px'"
            :render-header="(h, obj) => field.isSearchHeader == 1 ? renderSpecNameHeader(h, obj, field) : renderHeader(h, obj, field)">
            <el-table-column width="1"></el-table-column>
            <table-index-column :clickLink="clickLink" :field="item" :renderSpecNameHeader="renderSpecNameHeader"
                :renderHeader="renderHeader"
                v-for="item in field.children" :key="item.field">
                <template v-for="(_, slot) in $scopedSlots" v-slot:[slot]="props">
                    <slot :name="slot" v-bind="props" />
                </template>
            </table-index-column>
        </el-table-column>
    </fragment>
    <fragment v-else>
        <el-table-column v-if="field.isHide === 0 && !field.isHides" :show-overflow-tooltip="true"
            :key="field.id" :prop="field.fieldCode" :label="i18nData(field, 'field', 'fieldCode', 'fieldName')"
            :fixed="field.fixedColumn || null"
            :align="field.align || (field.fieldCode.indexOf('name') != -1 || field.fieldCode.indexOf('Name') != -1 ? 'left' : 'center')"
            :min-width="field.fieldWidth || '150px'" :sortable="field.isOrder == 1 ? 'custom' : false"
            :filters="field.isOrder == 1 ? [] : null"
            :render-header="(h, obj) => field.isSearchHeader == 1 ? renderSpecNameHeader(h, obj, field) : renderHeader(h, obj, field)">
            <template slot-scope="{ row, $index }">
                <slot v-if="field.listSlot" :name="field.fieldCode" :$index="$index" :data="row" :value="row[field.fieldCode]"
                    :fieldFormatArr="field.fieldFormatArr"></slot>
                <span v-else-if="field.fieldType != null && field.fieldType.indexOf('date') != -1">
                    {{ parseTime(row[field.fieldCode], field.fieldFormat)
                    }}
                </span>
                <span v-else-if="field.fieldType === 'dict'">
                    {{ row[field.fieldCode] |
                        fieldFormat(field.fieldFormatArr) }}
                </span>
                <span v-else-if="!!field.link">
                    <el-link style="display: inline" :type="[0].includes(row[field.fieldCode]) ? 'info': 'primary'"
                        :disabled="[0].includes(row[field.fieldCode])"
                        @click="clickLink(row, field.fieldCode, field.link)">
                        {{ row[field.fieldCode] }}
                    </el-link>
                </span>
                <span v-else-if="field.fieldType === 'Number'">
                    {{ field.fieldFormat == '-1'?filterFmoney(row[field.fieldCode]):Number(row[field.fieldCode]).toFixed(field.fieldFormat) }}
                </span>
                <span v-else v-html="row[field.fieldCode]"></span>
            </template>
        </el-table-column>
    </fragment>


</template>
<script>

import indexMixin from "../../mixins";

export default {
    name: 'TableIndexColumn',
    mixins: [indexMixin],
    props: {
        field: {
            type: Object,
            default: () => {
                return {}
            }
        },
        renderSpecNameHeader: {
            type: Function
        },
        renderHeader: {
            type: Function
        },
        clickLink: {
            type: Function
        },
    },
    methods: {
      //千分位格式化：10000转为10,000.00
      filterFmoney (s, n) {
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
      }
    }
}
</script>