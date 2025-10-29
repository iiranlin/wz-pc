<template>
    <div class="fileView">
        <div @click.stop="handlePreview" class="fileViewLink">
            <span class="fileNameWarp">
                <slot></slot>
            </span>
        </div>
        <Dialog v-if="visible" custom-class="fileViewDialog" :show-close="false" :visible="true"
            :destroy-on-close="true" @close="handleClose" :close-on-click-modal="false" :modal-append-to-body="true"
            @full="handleFullChange" :append-to-body="true">
            <template slot="title">
                <div class="filePreviewTitle">
                    <div class="title">{{ title }}</div>
                </div>
            </template>
            <div v-loading="loading" :key="key" class="filePreview">
                <vue-office-docx v-if="isSuccess && ['docx'].includes(fileType)" :src="url" @rendered="handleRendered"
                    @error="handleError" />
                <vue-office-pptx v-else-if="isSuccess && ['pptx'].includes(fileType)" :src="url"
                    @loaded="handleRendered" @error="handleError" />
                <vue-office-excel v-else-if="isSuccess && ['xlsx', 'xls'].includes(fileType)" :src="url"
                    :options="excelOptions" @rendered="handleRendered" @error="handleError" />
                <template v-else-if="isSuccess && ['pdf'].includes(fileType)">
                    <vue-office-pdf ref="pdf" :page="currentPage" @num-pages="pageCount = $event"
                        @page-loaded="currentPage = $event" :src="url" @loaded="handleRendered" />
                </template>

                <div v-else-if="isSuccess && pngTypes.includes(fileType)" class="gifFile">
                    <img :src="url" />
                </div>
                <div v-else class="filePreviewError">
                    {{ errorMsg }}
                </div>
            </div>
            <div slot="footer" class="filePreviewFooter">
                <template v-if="isSuccess && fileType === 'pdf'">
                    <el-button plain round @click="prev" :disabled="currentPage <= 1" style="margin-right: 5px;">上一页</el-button>
                    <span>第 {{ currentPage }} 页 / 共 {{ pageCount }} 页</span>
                    <el-button plain round @click="next" :disabled="currentPage >= pageCount" style="margin-inline: 5px;">下一页</el-button>
                </template>
                <el-button plain round @click="handleDownload" style="margin-right: 5px;">下 载</el-button>
                <el-button plain round @click="handleClose">关 闭</el-button>
            </div>
        </Dialog>
    </div>
</template>

<script>

import { minioDownload } from '@/api/minio'

import '@vue-office/docx/lib/index.css'
import '@vue-office/excel/lib/index.css'
import audioIcon from '@/assets/file/audio.png'
import docIcon from '@/assets/file/doc.png'
import excelIcon from '@/assets/file/excel.png'
import fileIcon from '@/assets/file/file.png'
import imgIcon from '@/assets/file/img.png'
import linkIcon from '@/assets/file/link.png'
import pdfIcon from '@/assets/file/pdf.png'
import pptIcon from '@/assets/file/ppt.png'
import txtIcon from '@/assets/file/txt.png'
import videoIcon from '@/assets/file/video.png'
import zipIcon from '@/assets/file/zip.png'
import { saveAs } from 'file-saver'
export default {
    name: "fileView",
    components: {
        VueOfficeDocx: () => import('@vue-office/docx'),
        VueOfficePptx: () => import('./pptx.vue'),
        VueOfficeExcel: () => import('@vue-office/excel'),
        VueOfficePdf: () => import('vue-pdf'),
    },
    props: {
        file: Object,
        icon: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        file: {
            immediate: true,
            handler(val) {
                if ('response' in val) {
                    this.fileObject = val.response.data
                } else {
                    this.fileObject = val
                }
                this.title = this.fileObject.fileName
                if (this.title) {
                    const fileType = this.title.split('.').pop()
                    this.fileType = fileType
                }

            }
        },
    },
    data() {
        return {
            currentPage: 0, // pdf文件页码
            pageCount: 0, // pdf文件总页数

            svgIcon: {
                png: imgIcon,
                jpg: imgIcon,
                jpeg: imgIcon,
                docx: docIcon,
                xlsx: excelIcon,
                xls: excelIcon,
                pdf: pdfIcon,
                gif: imgIcon,
                file: fileIcon
            },
            fileObject: {},
            key: `${Date.now()}`,
            isSuccess: true,
            fileTypes: ['png', 'jpg', 'docx', 'xlsx', 'xls', 'pdf', 'gif', 'jpeg', 'pptx'],
            pngTypes: ['png', 'gif', 'jpg', 'jpeg'],
            fileType: '',
            visible: false,
            title: '附件预览',
            loading: false,
            url: '',
            errorMsg: '',
            excelOptions: {
                xls: false,
                minColLength: 0,
                minRowLength: 0,
                widthOffset: 10,
                heightOffset: 10,
                beforeTransformData: (workbookData) => { return workbookData },
                transformData: (workbookData) => { return workbookData },
            }
        }
    },
    methods: {
        handleFullChange() {
            this.key = `${Date.now()}`
        },
        async handlePreview() {
            if (['xlsx', 'xls'].includes(this.fileType)) {
                this.excelOptions.xls = this.fileType == 'xls'
            }
            this.visible = true
            if (!this.fileTypes.includes(this.fileType)) {
                this.isSuccess = false
                this.errorMsg = '该文件类型目前不支持预览'
                return
            }
            this.loadSource()
        },
        handleClose() {
            this.visible = false
        },

        handleRendered(res) {
            this.isSuccess = true
            this.loading = false
            this.currentPage = 1; // 加载的时候先加载第一页

        },
        //上一页
        prev() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        //下一页
        next() {
            if (this.currentPage < this.pageCount) {
                this.currentPage++;
            }
        },
        handleError(err) {
            this.loading = false
            this.isSuccess = false
            this.errorMsg = '该文件预览失败请重新尝试'
        },
        renderImg() {
            const imgEl = new Image()
            imgEl.src = this.url
            imgEl.onload = () => {
                this.handleRendered()
            }
            imgEl.onerror = () => {
                this.handleError()
            }
        },
        async handleDownload() {
            const { filePath, fileName, uploadType } = this.fileObject

            // 判断是否为OSS文件
            if (uploadType === 'oss' || (filePath && filePath.includes('oss-cn-'))) {
                // OSS文件：直接走流式下载
                try {
                    const response = await fetch(filePath);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const blob = await response.blob();
                    this.saveAs(blob, decodeURI(fileName));
                } catch (error) {
                    console.error('OSS文件下载失败:', error);
                    this.$message.error('文件下载失败，请重试');
                }
            } else {
                // MinIO文件：使用原有方式
                await this.loadSource();
                this.saveAs(this._blob, decodeURI(fileName));
            }
        },
        saveAs(text, name, opts) {
            saveAs(text, name, opts);
        },
        async loadSource() {
            try {
                this.loading = true
                const { filePath, fileName, uploadType } = this.fileObject

                // 判断文件类型：OSS文件还是MinIO文件
                if (uploadType === 'oss' || (filePath && filePath.includes('oss-cn-'))) {
                    // OSS文件：直接走流式处理
                    // 对于图片文件，直接使用OSS URL
                    if (this.pngTypes.includes(this.fileType)) {
                        this.url = filePath;
                        this.renderImg();
                    } else {
                        // 对于其他文件类型，通过fetch直接获取流式数据
                        const response = await fetch(filePath);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const blob = await response.blob();
                        this._blob = blob;
                        this.url = window.URL.createObjectURL(blob);
                        this.handleRendered();
                    }
                } else {
                    // MinIO文件：使用原有的MinIO下载接口
                    const downloadUrl = `${minioDownload}?filePath=${encodeURI(filePath)}&fileName=${encodeURI(fileName)}`;
                    const res = await this.$download.fileSource(downloadUrl);
                    const blob = new Blob([res.data])
                    this._blob = blob
                    this.url = window.URL.createObjectURL(blob);
                    if (this.pngTypes.includes(this.fileType)) {
                        this.renderImg()
                    }
                }
            } catch (err) {
                this.isSuccess = false
                this.errorMsg = '该文件加载失败请重新尝试'
                this.loading = false
                console.error('加载失败', err)
            }
        }
    },
};
</script>
<style lang="scss">
.fileView {
    display: inline-block;
    width: 100%;

    .fileViewLink {
        width: 100% !important;
        display: flex !important;
        flex-direction: row !important;
        justify-content: flex-start !important;
        align-items: center !important;

        .fileIcon:hover {
            cursor: pointer;
        }

        .fileNameWarp {
            padding-left: 5px;
            display: inline-block;
            max-width: calc(100%);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            height: 20px;
            line-height: 20px;
        }
    }

    .fileViewLink:hover {
        color: #1890ff;
        cursor: pointer;
    }

    .el-link--inner {
        width: 100% !important;
        display: inline-block !important;
        flex-direction: row !important;
        justify-content: flex-start !important;
        align-items: center !important;
    }

    .el-link.is-underline:hover:after {
        border-bottom: 0 !important;
    }




}

.fileViewDialog {
    height: 60vh;

    .el-dialog__body,
    .el-dialog__footer,
    .el-dialog__header {
        padding: 0 0px;
        box-sizing: border-box;
    }

    .el-dialog__body {
        height: calc(100% - 100px);
    }

    .filePreviewTitle {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        background-color: #f0f0f0;
        padding: 0 20px;

        .title {
            font-size: 16px;
            font-weight: 600;
        }

        .action {
            padding: 5px;
            cursor: pointer;
            font-size: 16px;
        }

        .action:hover {
            color: #1890ff;
        }
    }

    .filePreviewFooter {
        height: 50px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        padding: 0 20px;
    }


    .filePreview {
        height: 100%;
        min-height: 400px;
        overflow-y: auto;
        background-color: #fff;

        .gifFile {
            height: 100%;
            width: 100%;

            img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
        }

        .filePreviewError {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #999;
        }
    }
}
</style>