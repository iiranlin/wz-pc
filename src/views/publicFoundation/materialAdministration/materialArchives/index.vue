<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton" @customUpload="customUpload"
          @uploadOnSuccess="uploadOnSuccess" @uploadOnError="uploadOnError" :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template slot="matlClassifyId" slot-scope="scope">
                <el-input :disabled="true" v-model="formDataClick.matlClassifyId"></el-input>
      </template>
        </form-data>
        <el-row type="flex" class="container_h">
            <collapse>
                <el-col :xs="24" class="container_flex_overflow" v-loading="treeLoading">
                    <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
                    </el-input>
                    <div class="head-container ov_head">
                        <el-tree class="drawer-tree" node-key="matlClassifyId" :indent="0" :data="dataOptions"
                            :props="defaultProps" :expand-on-click-node="false" ref="tree" :highlight-current="true"
                            :filter-node-method="filterNode" @node-click="handleNodeClick" />
                    </div>
                </el-col>
            </collapse>

            <!--用户数据-->
            <el-col :span="20" :xs="24" class="container_flex">
                <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
                    :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
                    @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
                    @cleanClick="cleanClick"></right-toolbar>
                <table-index ref="tableIndex" :loading="loading" idName="matlId" :tableIndexs="tableIndex"
                    :tableData="list" :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
                    @handleSelectionChange="handleSelectionChange" @clickLink="clickLink" @handleButton="handleButton"
                    @selectChange="selectChange" @emitAblFilter="emitAblFilter">
                    <template slot="bizStatus" slot-scope="scope">
                        <icon-svg :class="iconClassSize({0: 0, 1: 3}[scope.value])"
                            :icon-class="iconEnableStautsClass({0: 0, 1: 3}[scope.value])" />{{ { 0: '停用', 1: '启用' }[scope.value] }}
                    </template>
                </table-index>
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                    :limit.sync="listQuery.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
        <matl-sync-operate ref="matlSyncOperate" @matlSyncOperateConfirm="matlSyncOperateConfirm"></matl-sync-operate>
        <accept-operate ref="acceptOperate" @acceptOperateConfirm="acceptOperateConfirm"></accept-operate>
    </div>
</template>

<script>
import { matlList, matlBatchRemove, matlExport, matlImport } from '@/api/prodmgr-mm/matlMatl';
import { classTree } from '@/api/prodmgr-mm/matlClass';
import indexMixin from '@/views/mixins';
import collapse from '@/components/Collapse'
import { minioDownload } from '@/api/minio'
import matlSyncOperate from './components/matlSyncOperate'
import acceptOperate from './components/acceptOperate'

export default {
    name: "materialArchives",
    components: { collapse,matlSyncOperate,acceptOperate },
    mixins: [indexMixin],
    data() {
        return {
            optionsProps: {
                children: "children",
                label: "matlClassifyName",
                value: "matlClassifyId",
            },
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
            formData: {},
            formDataClick: {
                matlClassifyId: '全部'
            },
            // 部门树选项
            treeLoading: false,
            filterText: "",
            dataOptions: undefined,
            defaultProps: {
                children: "children",
                label: "matlClassifyName",
            },
            treeCurrentKey: '',
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
                    if(["matlClassifyId"].includes(data.search[i].fieldCode)) {
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
        handleResetField() {
            this.formData.matlClassifyId = null;
            this.$refs.tree.setCurrentKey(null);
            this.treeCurrentKey = "";
            this.formDataClick.matlClassifyId = '全部';
        },
        cleanClick(data) {
            for (const key of data) {
                if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
                    this.$refs.formData.resetQueryDateRange(key);
                }
                this.formData[key] = null;
            }
            
            this.handleQuery({matlClassifyId: '全部'});
        },
        handleQuery(row = {}) {
            
            this.listQuery.pageNum = 1;
            this.formData = Object.assign({}, this.formData, row);
            this.formDataClick = Object.assign({}, this.formData, row);
          
            if(!this.formDataClick.matlClassifyId) {
                this.formDataClick.matlClassifyId = '全部'
            }else {
               const node = this.$refs.tree.getCurrentNode()
               if(node && node.matlClassifyName) {
                this.formDataClick.matlClassifyId = node.matlClassifyName
               }
              
            }
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
            this.selection = selection;
        },
        // 节点单击事件
        handleNodeClick(data) {
            if (data.matlClassifyId === this.treeCurrentKey) {
                // 再次点击当前节点取消选中,查询全部
                this.formData.matlClassifyId = null;
                this.$refs.tree.setCurrentKey(null);
                this.treeCurrentKey = "";
                this.formDataClick.matlClassifyId = '全部';
            } else {
                this.treeCurrentKey = data.matlClassifyId;
                this.formData.matlClassifyId = data.matlClassifyId;
                this.formDataClick.matlClassifyId = data.matlClassifyName;
            }
            this.getList();
        },
        async handleButton(buttonCode, idArr, rowArr,  { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            if (buttonCode == 'update') {
                const matlCodes = rowArr.map((item) => item.matlCode)
                this.$router.push({ name: 'materialArchivesOperate', query: { type: buttonCode, id: idArr[0], matlCode: matlCodes[0] } });
            } else if (buttonCode === 'delete') {
                this.handleDelete(idArr);
            } else if (buttonCode === 'create') {
                this.$router.push({ name: 'materialArchivesOperate', query: { type: buttonCode, matlClassifyId: this.formData.matlClassifyId, matlClassifyName: this.formDataClick.matlClassifyId } });
            } else if(buttonCode === 'export'){
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter( item => !item.isHides && item.isHide != 1).map( item => item.fieldCode)
                const param = { ...this.formData, exportColumns }
                await matlExport(param)
            } else if(buttonCode === 'download'){
                this.$download.fileUrl(`${minioDownload}?filePath=${encodeURI('templates/物料档案模板.xls')}&fileName=${encodeURI('物料档案模板.xls')}`, null, 'get');
            } else if(buttonCode === 'sync'){
                this.$refs.matlSyncOperate.init();
            } else if(buttonCode === 'accept'){
                this.$refs.acceptOperate.init(this.selection[0]);
            }
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true;
            if(this.formData.matlClassifyId == '全部') {
                delete this.formData.matlClassifyId
            }
            const param = Object.assign({}, this.listQuery, this.formData)
            if (param.createDateStart) {
                param.createStartDate = param.createDateStart
                delete param.createDateStart
            }
            if (param.createDateEnd) {
                param.createEndDate = param.createDateEnd
                delete param.createDateEnd
            }
            if (param.updateDateStart) {
                param.updateStartDate = param.updateDateStart
                delete param.updateDateStart
            }
            if (param.updateDateEnd) {
                param.updateEndDate = param.updateDateEnd
                delete param.updateDateEnd
            }
            matlList(param).then(({ data }) => {
                this.list = data.list.map((item) => ({ ...item, bizStatus: item.bizStatus == '1' ? '0' : '1' }));
                this.total = data.total;
            }).finally(() => {
                this.loading = false;
            })
        },
        classTree() {
            this.treeLoading = true;
            classTree().then(({ data }) => {
                this.dataOptions = data || [];
            }).finally(() => {
                this.treeLoading = false;
            })
        },
        handleDelete(ids) {
            this.$modal.confirm("是否确认删除?").then(function () {
                return matlBatchRemove({ ids });
            }).then(() => {
                if ((this.total - ids.length) % (this.listQuery.pageSize) == 0) {
                    this.listQuery.pageNum -= 1
                }
                this.getList();
                this.classTree();
                this.$modal.msgSuccess("删除成功");
            })
        },
        clickLink(row, fieldCode, linkText) {
            if (fieldCode == 'matlCode') {
                this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, id: row.matlId } });
            }
        },
        uploadOnSuccess(code, data, message) {
            if(code === 0){
                if(data.msg){
                    this.$modal.msgError(data.msg)
                }else{
                    this.$modal.msgSuccess(message)
                }
                this.getList();
            }else{
                this.$modal.msgError(message)
            }
        },
        uploadOnError(err, file, fileList) {
            this.$modal.msgError('导入失败')
        },
        customUpload (option) {
          if(option.file){
            this.$download.fileUpload(matlImport, {file: option.file}).then(({code, data, message}) => {
              this.uploadOnSuccess(code, data, message)
            })
          }
        },
        matlSyncOperateConfirm(){
            this.handleQuery();
        },
        acceptOperateConfirm(){
            this.handleQuery();
        },
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
