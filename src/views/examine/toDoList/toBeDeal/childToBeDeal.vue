<template>
    <div class="app-container container_flex">
       
        <table-index ref="tableIndex" :loading="loading" idName="taskId" :tableData="dataList" :property="property"
            :numberShow="numberShow" @handleSelectionChange="handleSelectionChange" @handleButton="handleButton"
            @selectChange="selectChange" @emitAblFilter="emitAblFilter" @clickLink="clickLink">
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <div>
            <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
        </div>
    </div>
</template>

<script>
import mixins from '@/views/mixins'
import workFlowView from '@/components/workFlowView'
import { auditList } from '@/api/system/workflow'
import { FLOW_ROUTE } from '@/utils/constant'
import { getUserMenu } from '@/api/system/menu'
import { findMenuByUrl } from "@/utils/index";
export default {
    name: "toBeDeal",
    dicts: ['flowBusinessType'],
    mixins: [mixins],
    components: {
        workFlowView
    },
    data() {
        return {
            formDataClick: {},
            //是否展示序号
            numberShow: false,
            // 遮罩层
            loading: false,
            // 选中数组
            ids: [],
            // 非单个禁用
            single: true,
            // 非多个禁用
            multiple: true,
            // 显示搜索条件
            showSearch: true,
            // 表格数据
            dataList: [],
            // 弹出层标题
            title: "",
            //列表显示字段
            property: {},
            // 查询参数
            formData: {},
            total: 0,
            listQuery: {
                pageNum: 1,
                pageSize: 30,
            },
            // 指令
            command: "",
            // 勾选的数据
            selected: [],
            // 按钮状态
            disableFields: {},
            // 勾选的id
            ids: [],
            statusMap: {},
            workFlowViewVisible: false,
            selectedRow: null
        }
    },
    created() {
        this.menuProperty()
    },
    mounted() { },
    methods: {
        // 获取页面的属性
        menuProperty() {
             getUserMenu().then(menu => {

     console.log(menu.data,'sidebarMenu');
     const menuId = findMenuByUrl(menu.data,'toBeDeal')?.id;
     this.$store.dispatch("menuProperty", menuId).then((data) => {
       this.listQuery.pageSize = data.defaultPageSize || 30;
       this.property = data;
     });
   })
        },
        // 展示序号
        numberChange(val) {
            this.numberShow = val
        },
        newButton(buttonCode, formId, buttonData) {
            this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
        },
        handleCheckAllChange(columns) {
            this.$refs.tableIndex.init(columns)
        },
        //选择框回调
        selectChange(row) {
            let { formData, isWatch } = row
            if (!isWatch) {
                this.handleQuery(formData)
            } else {
                this.formData = Object.assign({}, this.formData, formData)
            }
        },
        // 节点单击事件
        handleNodeClick(data) {
            this.handleQuery()
        },
        /** 重置按钮操作 */
        resetQuery() {
            this.resetForm("queryForm")
            for (let key in this.formData) {
                this.formData[key] = null
            }
            this.handleQuery()
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery()
        },
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row)
            this.formDataClick = Object.assign({}, this.formData, row);
            // this.setCacheParams()
            this.getList()
        },
        handleSelectionChange(ids, single, multiple, selected) {
            this.ids = ids
            this.single = single
            this.multiple = multiple
            this.selected = selected
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            if (buttonCode == 'flowSee') {
                this.workFlowViewVisible = true
                this.selectedRow = rowArr[0]
            }
        },
        clickReset() {
            this.handleQuery()
        },
        // 获取流程列表数据
        getList() {
            this.loading = true
            auditList({
                ...this.listQuery,
                ...this.formData,
                status: '3'
            })
                .then((res) => {
                    this.loading = false
                    if (res.success && Array.isArray(res.data.list)) {
                        let { list, total } = res.data
                        this.dataList = list
                        this.total = total
                        // this.disableFields = { export: false }
                    } else {
                        this.dataList = []
                        this.total = 0
                        // this.disableFields = { export: true }
                    }
                })
        },
        clickLink(row) {
            const name = FLOW_ROUTE[row.businessType];
            const auditArr = [
                {
                    businessId: row.businessId,
                    businessType: row.businessType,
                    businessCode: row.businessCode,
                    taskId: row.taskId,
                }
            ];
            this.$router.push({ name, query: { type: 'view', id: row.businessId, name: 'toBeDeal' } });
        },
    },
}
</script>
<style lang="scss">
::v-deep {
    .el-button.is-disabled {
        -webkit-filter: none;
        color: none;
    }
}
</style>