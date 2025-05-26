<template>
    <div class="attachmentTable" :key="queryType" ref="attachmentTableContent">
        <div class="attachmentTableTop" v-if="queryType !== 'view'">
            <button-top :showDropdown="false" :buttonTopData="buttonTop" :buttonShow="handleButtonShow"
                @newButton="handleNewButton" style="margin-top: 0;padding: 0px 0 0 0 !important;">
                <!-- <span>支持上传png、jpg、gif等格式，文件大小10mb以内</span> -->
            </button-top>
               
        </div>
        <div class="attachmentTableContent">
            <el-table border :data="fileList" @selection-change="handleFileSelectionChange" ref="fileList"
                :maxHeight="400" @row-click="rowClick" style="margin: 0px;">
                <!-- <el-table-column v-if="queryType !== 'view'" type="selection" align="center" width="55">
                </el-table-column> -->
                <el-table-column label="描述" align="left" prop="name">
                    <template slot="header">
                        描述
                    </template>
                    <template slot-scope="scope">
                        <div v-if="queryType != 'view'" class="fileDisc">
                            <el-input type="textarea" :rows="2" show-word-limit v-model.trim="scope.row.name" maxlength="50">
                            </el-input>
                        </div>
                        <span v-else>{{ scope.row.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="文件名" align="left" prop="fileList">
                    <template slot="header">
                        文件名<span style="padding-left: 5px;font-size: 12px;"></span>
                    </template>
                    <template slot-scope="scope">
                        <fileUpload :businessType="businessType" :preview="queryType == 'view'"
                            :value="scope.row.fileList" @input="(files) => handleFileChange(scope.row, files)"
                            :isShowTip="false" :isShowButton="false" :ref="'fileUploadRef' + scope.$index"></fileUpload>
                    </template>
                </el-table-column>
                <el-table-column v-if="queryType !== 'view'" label="操作" align="center" fixed="right">
                    <template slot-scope="scope">
                        <el-link  :underline="false" icon="el-icon-upload2" style="margin-right: 30px;"  @click="handleUpload(scope.$index)">上传文件</el-link>
                        <el-link :underline="false"  icon="el-icon-delete"  @click="handleFileDel(scope.$index)">删除行</el-link>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
import { generateUUID } from '@/utils'
export default {
    props: {
        queryType: {
            type: String,
            default: 'create'
        },
        businessType: {
            type: String,
            default: '01'
        },
        value: {
            type: Array,
            default: () => {
                return []
            }
        },
        tHeight: {
            type: Number,
            default: 0
        }
    },
    watch: {
        value: {
            handler(val) {
                this.fileList = val.map(item => {
                    if (item.uid) {
                        return item
                    }
                    return { ...item, uid: generateUUID() }
                })
                if (this.$refs.fileList) {
                    this.$refs.fileList.doLayout()
                }

            },
            deep: true,
            immediate: true
        }
    },
    components: {
        fileUpload: () => import('@/components/FileUpload')
    },
    mounted() {
        // this.setTableHeight()

    },
    data() {
        const t = ["docx", "xls", "pptx", "xlsx", "pdf", "png", "jpg", "jpeg", "gif"]
        return {
            fileType: t,
            fileSize: 5,
            fileList: [],
            height: 0,
            tooltip: t.join('/'),
            fileSelected: [],
            buttonTop: [
                { buttonName: '新增附件', buttonCode: 'addFile', buttonIcon: 'Blue-Upload', options: `{\"prompt\":\"支持上传png、jpg、gif、docx、xls、pptx、xlsx、pdf、jpeg格式，文件大小${process.env.VUE_APP_FILE_SIZE}mb以内\"}` },
            ],
        }
    },
    methods: {
        handleUpload(idx) {
            this.$refs[`fileUploadRef${idx}`].$refs.upload.$children[0].$refs.input.click()
        },
        rowClick(row) {
            const uids = this.fileSelected.map(({ uid }) => uid)
            this.$refs.fileList.toggleRowSelection(row, !uids.includes(row.uid))
        },
        setTableHeight() {
            if (this.tHeight) {
                this.height = this.tHeight - 5
            } else {
                if (this.$refs.attachmentTableContent) {
                    this.height = this.$refs.attachmentTableContent.clientHeight + 120
                }
            }
        },
        // 附件改变事件
        handleFileChange(row, files) {
            if (!!files.length) {
                row.fileList = files
                if(!row.name){
                  row.name = files[0].fileName.split('.')[0]
                }
            } else {
                row.fileList = []
            }
            this.$emit('input', this.fileList)
        },
        // 附件信息批量选择
        handleFileSelectionChange(arr) {
            this.fileSelected = arr
        },
        // 明细按钮权限
        handleButtonShow() {
            return true
        },
        // 按钮事件处理器
        handleNewButton(buttonCode) {
             if (buttonCode === 'addFile') {
                this.handleFileAdd()
            }
        },
        // 增加附件条目
        handleFileAdd() {
            this.fileList.push({
                uid: generateUUID(),
                id: '',
                name: '',
                fileList: [],
            })
            this.$emit('input', this.fileList)
        },
        // 根据指定的索引删除附件条目
        handleFileDel(idx) {
            this.fileList.splice(idx, 1)
            this.$emit('input', this.fileList)
        },
        // 验证
        validate() {
            if (!this.fileList.length) {
                return ''
            }
            let flag = ''
            for (let i = 0; i < this.fileList.length; i++) {
                const file = this.fileList[i]
                // delete file.uid
                // if (!file.id) {
                //     delete file.id
                // }
                if (!file.name) {
                    flag = '附件描述不能为空'
                    break
                }
                if (!file.fileList.length) {
                    flag = '附件不能为空'
                    break
                }
            }
            return flag
        }
    }
}
</script>

<style scoped lang="scss">
.attachmentTable {
    flex: 1;
    width: 100%;

    .attachmentTableTop {
        width: 100%;
        height: 46px;
    }

    .attachmentTableContent {
        width: 100%;

        .fileDisc {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;

            span {
                padding-left: 5px;
            }
        }

        .el-table {
            width: 100%;
            height: 100%;
        }
        
      ::v-deep .el-table--border .el-table__cell:first-child .cell {
        padding-left: 10px !important;
        padding-right: 10px !important;
      }
    }
}
</style>