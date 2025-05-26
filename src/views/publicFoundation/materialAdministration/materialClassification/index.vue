<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton" :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField"></form-data>

        <el-row type="flex" class="container_h">
            <collapse>
                <el-col :xs="24" class="container_flex_overflow" v-loading="treeLoading">
                    <el-input
                        class="search-input"
                        placeholder="输入关键字过滤"
                        v-model="filterText"
                        clearable
                    >
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
                            @node-click="handleNodeClick"
                        />
                    </div>
                </el-col> 
            </collapse>
               
            <!--用户数据-->
            <el-col :span="20" :xs="24" class="container_flex">
                <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
                    :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
                    @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
                    @cleanClick="cleanClick"></right-toolbar>
                <table-index ref="tableIndex" :loading="loading" idName="matlClassifyId" :tableIndexs="tableIndex" :tableData="list" :buttonDisable="handleButtonDisable"
                    :property="property" :numberShow="numberShow" @handleSelectionChange="handleSelectionChange"
                    @handleButton="handleButton" @selectChange="selectChange" @emitAblFilter="emitAblFilter">
                  <template slot="bizStatus"  slot-scope="scope">
                    <icon-svg :class="iconClassSize(scope.value)" :icon-class="iconEnableStautsClass(scope.value)"/>{{ {0: '停用', 1: '启用'}[scope.value] }}
                  </template>
                </table-index>
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
                    @pagination="getList" />
            </el-col>
        </el-row>
        <operate ref="operate" :dataOptions="dataOptions" @operateSuccess="operateSuccess"></operate>
    </div>
</template>

<script>
import operate from './components/operate';
import { classList, classTree, classBatchRemove } from '@/api/prodmgr-mm/matlClass';
import indexMixin from '@/views/mixins';
import collapse from '@/components/Collapse'
export default {
    name: "materialClassification",
    mixins: [indexMixin],
    components: { operate, collapse },
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
                pageSize:  30,
            },
            // 表单参数
            formData: {
                parentCode: null,
            },
            formDataClick: {
                parentName: '全部'
            },
            // 部门树选项
            treeLoading: false,
            filterText: "",
            dataOptions: undefined,
            defaultProps: {
                children: "children",
                label: "matlClassifyName",
            },
            treeCurrentKey: "",
        };

    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        },
    },
    created() {
        this.menuProperty();
        this.classTree();
    },
    methods: {
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.matlClassifyName, value) || data.matlClassifyCode.indexOf(value) !== -1;
        },
        menuProperty() {
            let id = this.$route.meta.id;
            this.$store.dispatch('menuProperty', id).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                for(let i=0; i< data.search.length; i++) {
                    if(["parentName"].includes(data.search[i].fieldCode)) {
                        data.search[i]['clear'] = true 
                        break
                    }
                }
                this.property = data;
            });
        },
        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
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
            this.listQuery.pageNum = 1;
            this.formData = Object.assign({}, this.formData, row);
            this.formDataClick = Object.assign({}, this.formData, row);
            if(!this.formDataClick.parentName) {
                this.formDataClick.parentName = '全部'
            } else {
                const node = this.$refs.tree.getCurrentNode()
                if(node && node.matlClassifyName) {
                    this.formDataClick.parentName = node.matlClassifyName
                }
               
            }
            this.getList();
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery();
        },
        handleSelectionChange(ids, single, multiple) {
            this.ids = ids
            this.single = single
            this.multiple = multiple
        },
        handleResetField() {
            this.formDataClick.parentName = '全部'
            this.formData.parentCode = null;
            this.$refs.tree.setCurrentKey(null);
            this.treeCurrentKey = "";
        },
        // 节点单击事件
        handleNodeClick(data) {
            if (data.matlClassifyCode === this.treeCurrentKey) {
                // 再次点击当前节点取消选中,查询全部
                this.formData.parentCode = null;
                this.$refs.tree.setCurrentKey(null);
                this.treeCurrentKey = "";
                this.formData.parentName = null;
                this.formDataClick.parentName = '全部'
            } else {
                this.treeCurrentKey = data.matlClassifyCode;
                this.formData.parentCode = data.matlClassifyCode;
                this.formData.parentName = data.matlClassifyName;
                this.formData.parentId = data.matlClassifyId;
                this.formDataClick.parentName = data.matlClassifyName;
            }

            this.getList();
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            if (buttonCode == 'update') {
                this.$refs.operate.init(buttonCode, {...rowArr[0], bizStatus: rowArr[0].bizStatus == '1' ? '0' : '1'});
            } else if (buttonCode === 'delete') {
                this.handleDelete(idArr);
            } else if (buttonCode === 'create') {
                this.$refs.operate.init(buttonCode, null, !!this.formData.parentCode ? {parentCode: this.formData.parentCode,parentId: this.formData.parentId, parentName: this.formData.parentName}: undefined);
            }
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true;
            if(this.formData.parentName == '全部') {
                delete this.formData.parentName
            }
            classList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.list = data.list.map((item) => ({...item, bizStatus: item.bizStatus == '1' ? '0' : '1'}));
                this.total = data.total;
            }).finally( () => {
                this.loading = false;
            })
        },
        classTree () {
            this.treeLoading = true;
            classTree().then(({ data }) => {
                this.dataOptions = data || [];
            }).finally( () => {
                this.treeLoading = false;
            })
        },
        operateSuccess () {
            this.getList();
            this.classTree();
        },
        handleDelete(ids) {
            this.$modal.confirm("是否确认删除?").then(function () {
                return classBatchRemove({ ids });
            }).then(() => {
                if ((this.total - ids.length) % (this.listQuery.pageSize) == 0) {
                    this.listQuery.pageNum -= 1
                }
                this.getList();
                this.classTree();
                this.$modal.msgSuccess("删除成功");
            })
        }
    }
};
</script>
<style lang="scss" scoped>
.ov_head {
    flex: 1;
    height: 100%;
    overflow-y: scroll;
}
</style>
