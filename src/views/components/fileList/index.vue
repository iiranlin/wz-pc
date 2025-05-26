<template>
    <Dialog  tabindex='1' class="flex-dialog max-height-file-dialog" title="查看附件"
        :visible.sync="visible"    :close-on-click-modal="false" width="800px" id="fileView-table-wrapper" :append-to-body="true" >
        <div class="table-wrapper" >
            <el-table ref="tableRef" :data="tableData" border height="450">
                <el-table-column label="序号" align="left" type="index" width="60" />
                <el-table-column prop="name" label="附件描述" align="left" show-overflow-tooltip width="170" />
                <el-table-column prop="fileList" label="附件名称" align="left">
                    <template slot-scope="scope">
                        <div class="fileListViewRow">
                            <div :key="idx" class="el-upload-list__item fileItem" v-for="(file, idx) in scope.row.fileList">
                                <div class="fileNames">
                                    <el-tooltip :content="file.fileName" placement="top">
                                        <fileView :key="idx" :ref="'fileView_' + scope.$index + '_' + idx" :file="file">
                                            {{ file.fileName }}
                                        </fileView>
                                    </el-tooltip>
                                </div>
                                <div class="fileAction">
                                    <i class="el-icon-view file-a-icon" @click="handlePreview('fileView_' + scope.$index + '_' + idx)"></i>
                                    <i class="el-icon-download file-a-icon" @click="handleDownload('fileView_' + scope.$index + '_' + idx)"></i>
                                </div>
                            </div>
                        </div>

                    </template>
                </el-table-column>
            </el-table>
        </div>
        <template #footer>
            <el-button plain round @click.native="visible = false">关闭</el-button>
        </template>
    </Dialog>
</template>

<script>
export default {
    components: { 
        fileView: () => import('@/components/fileView')
     },
    data() {
        return {
            visible: false,
            tableData: [],
            openDataScope: false,
            tableHeight: 0
        }
    },
    
    methods: {
        handlePreview(ref) {
            this.$refs[ref][0].handlePreview()
        },
        handleDownload(ref) {
            this.$refs[ref][0].handleDownload()
        },
        init(tableData = []) {
            this.visible = true;
            this.tableData = tableData;
        },
        isFile(file) {
            let a = file.fileName.split('.');
            return ['png', 'jpg', 'jpeg'].includes(a[a.length - 1]);
        },
    }
}
</script>

<style scoped lang="scss">
.table-wrapper {
    flex: 1;
    height: 500px;
}

.fileListViewRow {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;

    .fileItem {
        display: inline-flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;

        .fileNames {
            max-width: calc(100% - 90px);
            display: inline-block;
        }

        .fileAction {
            width: 90px;
            font-size: 16px;
            padding: 0 7px;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            display: inline-flex;
            .file-a-icon {
                padding: 3px 4px;
            }
            i:hover {
                cursor: pointer;
                color: #1890ff;
            }

            i {
                color: #1890ff;
                line-height: 20px;
            }
        }

    }

}
</style>