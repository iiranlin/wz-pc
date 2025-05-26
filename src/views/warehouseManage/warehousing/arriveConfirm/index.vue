<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField"></form-data>
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
            :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
            @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
            @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" idName="puSendId" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
            :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
            @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
            @emitAblFilter="emitAblFilter" @clickLink="clickLink">
            <template slot="bizStatus" slot-scope="scope">
                <icon-svg :class="iconClassSize(scope.value)" :icon-class="iconClass(scope.value)" />{{ scope.value |
                    fieldFormat(scope.fieldFormatArr) }}
            </template>
            <template slot="receiverAccount" slot-scope="scope">
                <el-input-number v-model="scope.data.receiverAccount" :min="1" :max="scope.data.account"
                    controls-position="right" v-if="scope.data.bizStatus == '-1'"></el-input-number>
                <span v-else>{{ scope.data.receiverAccount }}</span>
            </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { sendList, sendArrive, sendArriveList } from '@/api/prodmgr-pu/send';

export default {
    name: "arriveConfirm",
    mixins: [indexMixin],
    data() {
        return {
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
            list: [],
            //列表选中数据
            selection: [],
            // 表格序号是否展示
            numberShow: false,
            // 页面属性
            property: {},
            total: 0,
            // 查询参数
            listQuery: {
                pageNum: 1,
                pageSize: 30,
            },
            // 表单参数
            formData: {},
            formDataClick: {},
            selectedRow: null
        };

    },
    created() {
        this.menuProperty();
    },
    methods: {
        menuProperty() {
            let id = this.$route.meta.id;
            this.$store.dispatch('menuProperty', id).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                this.property = data;
            });
        },
        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
            if (button.buttonCode === 'arriveConfirm' && row.bizStatus != '-1') {
                return true
            }
            if (button.buttonCode === 'cancelArrive' && row.bizStatus != '0') {
                return true
            }
            return false
        },
        numberChange(val) {
            this.numberShow = val;
        },
        newButton(buttonCode, formId, buttonData) {
            this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
        },
        handleCheckAllChange(columns) {
            this.$refs.tableIndex.init(columns);
        },
        clickReset() {
            this.handleQuery();
        },
        //选择框回调
        selectChange(row) {
            let { formData, isWatch } = row;
            if (!isWatch) {
                this.handleQuery(formData);
            } else {
                this.formData = Object.assign({}, this.formData, formData);
            }
        },
        cleanClick(data) {
            for (const key of data) {
                if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
                    this.$refs.formData.resetQueryDateRange(key);
                }
                this.formData[key] = null;
            }
            this.handleQuery();
        },
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row);
            this.formDataClick = Object.assign({}, this.formData, row);
            this.getList();
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery();
        },
        handleSelectionChange(ids, single, multiple, selection) {
            this.ids = ids
            this.single = single
            this.multiple = multiple
            this.selection = selection
        },
        handleResetField() {
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            if (buttonCode === 'arriveConfirm') {
                this.$modal.confirm('是否到货确认?').then(() => {
                    const ids = rowArr.map((item) => {
                        return { puSendId: item.puSendId, receiverAccount: item.receiverAccount, bizStatus: '0' }
                    })
                    return sendArriveList(ids);
                }).then((data) => {
                    if (data.success) {
                        this.$modal.msgSuccess(data.message);
                    } else {
                        this.$modal.msgError(data.message);
                    }
                    this.getList();
                })
                return
            }
            if (buttonCode === 'cancelArrive') {
                this.$modal.confirm('是否取消到货?').then(() => {
                    return sendArrive({ puSendId: idArr[0], bizStatus: '-1' });
                }).then((data) => {
                    if (data.success) {
                        this.$modal.msgSuccess(data.message);
                    } else {
                        this.$modal.msgError(data.message);
                    }
                    this.getList();

                })
                return
            }
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true;
            sendList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.list = data.list.map(item => {
                    return Object.assign(item, { receiverAccount: item.bizStatus == '-1' ? item.account - item.receiverAccount : item.receiverAccount })
                });
                this.total = data.total;
            }).finally(() => {
                this.loading = false;
            })
        },
        clickLink(row, code) {
            if (code === 'suOrderCode') {
                this.$router.push({ name: 'purchaseOrderOperate', query: { type: 'view', id: row.puSuId, name: 'arriveConfirm' } });
            } else if (code === 'projectCode') {
                this.$router.push({ name: 'projectManagementOperate', query: { name: 'arriveConfirm', type: 'view', id: row.projectId } })
            }
        },
    }
};
</script>

<style scope>
.icon-size {
    width: 16px;
    height: 16px;
    margin-left: 4px;
    margin-right: 3.5px;
}
</style>
