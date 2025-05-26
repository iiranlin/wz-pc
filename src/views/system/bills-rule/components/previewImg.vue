<template>
    <el-popover placement="top" trigger="hover" v-model="visible" width="401">
        <div class="reference-popover">
            <p><svg-icon icon-class="Menu-Setting" />预览单据规则</p>
            <ul>
                <template v-for="item in formData.currentList">
                    <li v-if="formData[item.key].length" :key="item.id">
                        <p class="reference-popover-span" :class="'span'+item.id"><span v-for="(item, i) in formData[item.key]" :key="i">{{ item }}</span></p>
                        <p class="reference-popover-p" :class="'p'+item.id"><span>{{ item.name }}</span></p>
                    </li>
                </template>
                <!-- <li v-if="fixPrefix.length">
                    <p class="reference-popover-span span1"><span v-for="(item, i) in fixPrefix" :key="i">{{ item }}</span></p>
                    <p class="reference-popover-p p1"><span>固定字符</span></p>
                </li>
                <li v-if="dateString.length">
                    <p class="reference-popover-span"><span v-for="(item, i) in dateString" :key="i">{{ item }}</span></p>
                    <p class="reference-popover-p p2"><span>{{codeNameList[data && data.dateFormat]}}</span></p>
                </li>
                <li v-if="serialNumString.length">
                    <p class="reference-popover-span reference-popover-span-bottom"><span v-for="(item, i) in serialNumString" :key="i">{{ item }}</span></p>
                    <p class="reference-popover-p p3"><span>{{ serialNum }}位流水号</span></p>
                </li> -->
            </ul>
        </div>
        <!-- <el-button size="mini" style="float: right;" @click="visible = false">关闭</el-button> -->
        <el-button type="text" slot="reference" size="mini"><svg-icon icon-class="Blue-Search" />预览</el-button>
  </el-popover>
</template>

<script>
import { sysBillsRulePreview } from '@/api/system/bills-rule';
export default {
    props: {
        data: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {
            visible: false,
            codeNameList: {
                'yyyyMM': '年（四位）月',
                'yyyyMMdd': '年（四位）月日',
                'yy': '年（两位）',
                'yyMM': '年（两位）月',
                'yyMMdd': '年（两位）月日',
                'yyyy': '年（四位）',
            },
            formData: {
                fixPrefix: [],
                fixSuffix: [],
                dateString: [],
                serialNumString: [],
                serialNum: '',
                sorts: '123',
                currentList: []
            }
        }
    },
    watch: {
        visible (val) {
            if(val){
                this.visibleHover();
            }
        }
    },
    methods: {
        visibleHover() {
            if(this.visible){
                sysBillsRulePreview({ id: this.data.id }).then(({ data }) => {
                    this.formData = {
                        fixPrefix: data.fixPrefix && data.fixPrefix.split(''),
                        fixSuffix: data.fixSuffix,
                        dateString: data.dateString && data.dateString.split(''),
                        serialNumString: data.serialNumString && data.serialNumString.split(''),
                        serialNum: data.serialNum,
                        sorts: data.sorts,
                        currentList: [
                            {id: '1', key: 'fixPrefix', name: '固定字符'},
                            {id: '2', key: 'dateString', name: this.codeNameList[data.dateFormat]},
                            {id: '3', key: 'serialNumString', name: data.serialNum + '位流水号'}
                        ]
                    }
                    if(data.sorts){
                        let dataArr = [], sortsArr = data.sorts.split('');
                        sortsArr.forEach( (val) => {
                            this.formData.currentList.forEach( (item) => {
                                if(val === item.id){
                                    dataArr.push(item);
                                }
                            })
                        })
                        this.formData.currentList = dataArr;
                    }
                })
            }
        }
    }
};
</script>
<style lang="scss" scoped>
.reference-popover{
    p{
        margin: 0;
    }
    ul{
        width: 375px;
        height: 94px;
        padding: 0;
        margin-top: 0;
        border-bottom: 1px solid #dfe6ec;
        list-style:none;
        white-space: nowrap;
        overflow-x: auto;
        li{
            display: inline-block;
        }
    }
    .reference-popover-span{
        padding: 0;
        margin: 10px 0;
        height: 30px;
        span{
            width: 25px;
            height: 30px;
            border: 1px solid #ccc;
            display: inline-block;
            text-align: center;
            line-height: 29px;
            font-size: 12px;
            border-right: 0;
        }
    }
    .span1{
        span{
            color: red;
        }
    }
    .span3{
        span{
            color: #1890ff;
        }
        span:last-child{
            border: 1px solid #ccc;
        }
    }
    .reference-popover-p{
        width: 90%;
        min-width: 72px;
        height: 30px;
        line-height: 30px;
        margin: 0 auto;
        text-align: center;
        span{
            text-align: center;
        }
    }
    .p1{
        border-top: 1px solid red;
    }
    .p2{
        border-top: 1px solid #606266;
    }
    .p3{
        border-top: 1px solid #1890ff;
    }
}
</style>