<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton" 
                    :button-disable="handleTopButtonDisabled"/>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template v-slot:unitName="{data, i18nData}">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
        </form-data>
        <el-row type="flex" class="container_h">
            <collapse>
                <el-col :xs="24" class="container_flex_overflow" v-loading="treeLoading">
                    <el-input
                        class="search-input"
                        placeholder="输入关键字过滤"
                        v-model="filterText"
                        clearable>
                    </el-input>
                    <div class="head-container ov_head">
                        <el-tree
                            class="drawer-tree"
                            node-key="matlClassifyCode"
                            :indent="0"
                            :data="dataOptions"
                            :props="defaultProps"
                            :expand-on-click-node="false"
                            ref="tree"
                            :highlight-current="true"
                            :filter-node-method="filterNode"
                            @node-click="handleNodeClick"/>
                    </div>
                </el-col> 
            </collapse>
            <el-col :span="20" :xs="24" class="container_flex">
                <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
                    :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
                    @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
                    @cleanClick="cleanClick"></right-toolbar>
                <table-index ref="tableIndex" :loading="loading" idName="id" :tableIndexs="tableIndex" :tableData="list" :buttonDisable="handleButtonDisable"
                    :property="property" :numberShow="numberShow" @handleSelectionChange="handleSelectionChange"
                    @handleButton="handleButton" @selectChange="selectChange" @emitAblFilter="emitAblFilter" @clickLink="clickLink">
                    <template slot="frameType"  slot-scope="scope">
                        <div>
                            <span :class="checkFrameTypeCircle(scope.value)"></span>
                            <span class="frameType-font">{{scope.value | orderTypeFilter(dict.type.frameType)}}</span>
                        </div>
                    </template>
                    <template slot="fileList" slot-scope="scope">
                        <el-link :type="!scope.data.fileList || !scope.data.fileList.length ? 'info' : 'primary'"
                            :disabled="!scope.data.fileList || !scope.data.fileList.length"
                            @click.stop="linkClick(scope)">查看</el-link>
                    </template>
                </table-index>
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
                    @pagination="getList" />
            </el-col>
        </el-row>
        <fileList ref="fileList" />
        <warehouse-operate ref="warehouseOperate"/>
        <placeCode-operate ref="placeCodeOperate"/>
        <frame-operate ref="frameOperate" />
        <passageway-operate ref="passagewayOperate"/>
        <storage-area-operate ref="storageAreaOperate"/>
    </div>
</template>
<script>
import indexMixin from '@/views/mixins'
import {invMatlStorageRelList,invMatlStorageRelRemove,exportDetailList,exportBarCodeList} from '@/api/warehouseManage/materialStorage'
import {classTree} from '@/api/prodmgr-mm/matlClass';
import {download} from '@/utils/request'
import collapse from '@/components/Collapse'
import FormUnitId from '@/views/components/form-unitId'
import fileList from '@/views/components/fileList/index'

import placeCodeOperate from '@/views/warehouseManage/warehousFundamentals/goodsPosition/components/operate';
import warehouseOperate from '@/views/warehouseManage/warehousFundamentals/warehouse/warehouseOperate';
import frameOperate from '@/views/warehouseManage/warehousFundamentals/frame/components/operate';
import passagewayOperate from '@/views/warehouseManage/warehousFundamentals/passageway/components/operate';
import storageAreaOperate from '@/views/warehouseManage/warehousFundamentals/storageArea/components/operate';

export default {
    name: 'materialStorage',
    mixins: [indexMixin],
    dicts: ['frameType'],

    components: {
        collapse,
        FormUnitId,
        warehouseOperate,
        placeCodeOperate,
        frameOperate,
        passagewayOperate,
        storageAreaOperate,
        fileList
    },

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
            numberShow: true,
            // 页面属性
            property: {},
            //总条数
            total: 0,
            // 查询参数
            listQuery: {
                pageNum: 1,
                pageSize: 30
            },
            // 表单参数
            formData: {
                matlClassifyId: null,
            },
            formDataClick: {
                
            },
            //左侧树
            treeLoading: false,
            filterText: "",
            dataOptions: undefined,
            defaultProps: {
                children: "children",
                label: "matlClassifyName",
            },
            treeCurrentKey: "",
        }
    },
    created() {
        this.menuProperty();
        this.classTree();
    },
    methods: {
        classTree () {
            this.treeLoading = true;
            classTree().then(({ data }) => {
                this.dataOptions = data || [];
            }).finally( () => {
                this.treeLoading = false;
            })
        },
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.matlClassifyName, value) || data.matlClassifyCode.indexOf(value) !== -1;
        },
        menuProperty() {
            let id = this.$route.meta.id
            this.$store.dispatch('menuProperty', id).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                data.buttonTop = data.buttonTop.map(item => {
                    if (item.buttonCode === 'export') {
                        item.children = [
                            {
                                buttonCode: 'export',
                                buttonName: '导出',
                                buttonIcon: "Blue-Export",
                                buttonMode: '',
                                options: '{\"prompt\":\"默认按查询明细导出\"}'
                            },
                            {
                                buttonCode: 'exportBarCode',
                                buttonName: '导出仓库货架标识牌',
                                buttonIcon: "Blue-Export",
                                buttonMode: ''
                            },
                        ]
                    }
                    return item
                })
                this.property = data
            })
        },
        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
            return false
        },
        numberChange(val) {
            this.numberShow = val
        },
        newButton(buttonCode, formId, buttonData) {
            this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
        },
        handleCheckAllChange(columns) {
            this.$refs.tableIndex.init(columns)
        },
        clickReset() {
            this.handleQuery()
        },
        selectChange(row) {
            let { formData, isWatch } = row
            if (!isWatch) {
                this.handleQuery(formData)
            } else {
                this.formData = Object.assign({}, this.formData, formData)
            }
        },
        cleanClick(data) {
            for (const key of data) {
                if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
                this.$refs.formData.resetQueryDateRange(key)
                }
                this.formData[key] = null
            }
            this.handleQuery()
        },
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row)
            this.formDataClick = Object.assign({}, this.formData, row)
            this.getList()
        },
        operateSuccess() {
            this.handleQuery()
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery()
        },
        handleSelectionChange(ids, single, multiple, selection) {
            this.ids = ids
            this.single = single
            this.multiple = multiple
            this.selection = selection
        },
        handleResetField() {
            
        },
        // 节点单击事件
        handleNodeClick(data) {
            if (data.matlClassifyId === this.treeCurrentKey) {
                // 再次点击当前节点取消选中,查询全部
                this.formData.matlClassifyId = null;
                this.$refs.tree.setCurrentKey(null);
                this.treeCurrentKey = "";
            } else {
                this.treeCurrentKey = data.matlClassifyId;
                this.formData.matlClassifyId = data.matlClassifyId;
            }
            this.getList()
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            if(buttonCode == 'create') {
                this.$router.push({ name: 'materialStorageOperate', query: { type: buttonCode } })
            }else if (buttonCode === 'delete') {
                this.$modal.confirm('是否删除该信息?').then((res) => {
                    let params = {
                        ids: idArr,
                    }
                    invMatlStorageRelRemove(params).then(({message}) => {
                        this.$modal.msgSuccess(message)
                        this.handleQuery();
                    }).catch((err) => {

                    })
                }).catch((err) => {

                })
            }else if (buttonCode == 'export') {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                download(`${exportDetailList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
            }else if (buttonCode == 'exportBarCode') {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                download(`${exportBarCodeList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
            }
        },
        getList() {
            this.loading = true

            invMatlStorageRelList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.list = data.list
                this.total = data.total
            }).finally(() => {
                this.loading = false
            })
        },
        clickLink(row, fieldCode, linkText) {
            if (fieldCode === 'warehouseCode') {
                this.$refs.warehouseOperate.init('view', 'warehouseOperate', row.warehouseId);
            }else if (fieldCode == 'matlCode') {
                this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, id: row.matlId } });
            }else if (fieldCode == 'placeCode') {
                this.$refs.placeCodeOperate.init('view', {id: row.placeId});
            }else if (fieldCode == 'frameCode') {
                this.$refs.frameOperate.init('view', { id: row.frameId })
            }else if (fieldCode == 'passageCode') {
                this.$refs.passagewayOperate.init('view', { id: row.passageId });
            }else if (fieldCode == 'storageCode') {
                this.$refs.storageAreaOperate.init('view', { id: row.storageId });
            }
        },
        linkClick(scope) {
            this.$refs.fileList.init(scope.value)
        },
        checkFrameTypeCircle(value){
            if(value == '1'){
                return 'frameType-1'
            }else if(value == '2'){
                return 'frameType-2'
            }else if(value == '4'){
                return 'frameType-4'
            }
        },
    },
}
</script>
<style lang="scss" scoped>
.frameType-1 {
    display: inline-block;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: #81d3f8;
    margin-right: 5px;
    transform: translateY(2px);
}
.frameType-2 {
    display: inline-block;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: #c280ff;
    margin-right: 5px;
    transform: translateY(2px);
}
.frameType-4 {
    display: inline-block;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: #d8001b;
    margin-right: 5px;
    transform: translateY(2px);
}
.frameType-font{
    width: 70px;
    display: inline-block;
}
</style>