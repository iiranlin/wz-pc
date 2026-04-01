<template>
    <div class="fileView">
        <div @click.stop="handlePreview" class="fileViewLink">
            <span class="fileNameWarp">
                <slot></slot>
            </span>
        </div>
        <Dialog v-if="visible" custom-class="fileViewDialog" :show-close="false" :visible="true"
            :destroy-on-close="true" @close="handleClose" :close-on-click-modal="false" :modal-append-to-body="true"
            @full="handleFullChange" :append-to-body="true" :resizable="!isDialogFullscreen">
            <template slot="title">
                <div class="filePreviewTitle">
                    <div class="title">{{ title }}</div>
                </div>
            </template>
            <div class="pdfFloatingToolbar" v-if="isSuccess && ['pdf'].includes(fileType)">
                <el-tooltip content="缩小" placement="bottom">
                    <el-button circle size="mini" icon="el-icon-minus" @click="handlePdfZoomOut"
                        :disabled="pdfScale <= pdfScaleMin" />
                </el-tooltip>
                <span class="scale-text">{{ Math.round(pdfScale * 100) }}%</span>
                <el-tooltip content="放大" placement="bottom">
                    <el-button circle size="mini" icon="el-icon-plus" @click="handlePdfZoomIn"
                        :disabled="pdfScale >= pdfScaleMax" />
                </el-tooltip>
                <div class="divider"></div>
                <el-tooltip content="向左旋转" placement="bottom">
                    <el-button circle size="mini" icon="el-icon-refresh-left" @click="handlePdfRotate(-90)" />
                </el-tooltip>
                <el-tooltip content="向右旋转" placement="bottom">
                    <el-button circle size="mini" icon="el-icon-refresh-right" @click="handlePdfRotate(90)" />
                </el-tooltip>
            </div>
            <div ref="filePreview" v-loading="loading" :key="key" class="filePreview">
                <vue-office-docx v-if="isSuccess && fileType === 'docx'" :src="url" @rendered="handleRendered"
                    @error="handleError" />
                <div v-else-if="isSuccess && fileType === 'doc'" class="docx-container">
                    <div ref="docFile"></div>
                </div>
                <vue-office-pptx v-else-if="isSuccess && ['pptx'].includes(fileType)" :src="url"
                    @loaded="handleRendered" @error="handleError" />
                <vue-office-excel v-else-if="isSuccess && ['xlsx', 'xls'].includes(fileType)" :src="url"
                    :options="excelOptions" @rendered="handleRendered" @error="handleError" />
                <template v-else-if="isSuccess && ['pdf'].includes(fileType)">
                    <div class="pdfPreviewWrapper" :class="{ 'is-dragging': isPdfDragging }"
                        @mousedown="handlePdfDragStart" @dragstart.prevent>
                        <div class="pdfPreviewInner" :style="pdfPreviewInnerStyle">
                            <vue-office-pdf ref="pdf" :page="currentPage" :rotate="pdfRotate" @num-pages="pageCount = $event"
                                @page-loaded="currentPage = $event" :src="url" @loaded="handleRendered" />
                        </div>
                    </div>
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
import { renderAsync } from 'docx-preview'
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
            pdfScale: 1,
            pdfScaleStep: 0.25,
            pdfScaleMin: 0.5,
            pdfScaleMax: 2,
            pdfRotate: 0,
            isPdfDragging: false,
            pdfDragStartX: 0,
            pdfDragStartY: 0,
            pdfDragScrollLeft: 0,
            pdfDragScrollTop: 0,

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
            fileTypes: ['png', 'jpg', 'docx', 'doc', 'xlsx', 'xls', 'pdf', 'gif', 'jpeg', 'pptx'],
            pngTypes: ['png', 'gif', 'jpg', 'jpeg'],
            fileType: '',
            visible: false,
            isDialogFullscreen: false,
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
    computed: {
        pdfPreviewInnerStyle() {
            return {
                width: `${this.pdfScale * 100}%`
            }
        }
    },
    methods: {
        handleFullChange(isFullScreen) {
            this.isDialogFullscreen = Boolean(isFullScreen)
            this.key = `${Date.now()}`
        },
        async handlePreview() {
            this.resetPdfView()
            this.isDialogFullscreen = false
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
            this.isDialogFullscreen = false
            this.stopPdfDrag()
            this.resetPdfView()
        },

        handleRendered(res) {
            this.isSuccess = true
            this.loading = false
            this.currentPage = 1; // 加载的时候先加载第一页

        },
        resetPdfView() {
            this.pdfScale = 1
            this.pdfRotate = 0
        },
        handlePdfZoomIn() {
            this.pdfScale = Math.min(this.pdfScale + this.pdfScaleStep, this.pdfScaleMax)
        },
        handlePdfZoomOut() {
            this.pdfScale = Math.max(this.pdfScale - this.pdfScaleStep, this.pdfScaleMin)
        },
        handlePdfRotate(step) {
            this.pdfRotate = (this.pdfRotate + step + 360) % 360
        },
        handlePdfDragStart(event) {
            if (this.fileType !== 'pdf' || event.button !== 0) {
                return
            }
            if (event.target.closest('.pdfFloatingToolbar')) {
                return
            }
            const previewEl = this.$refs.filePreview
            if (!previewEl) {
                return
            }
            this.isPdfDragging = true
            this.pdfDragStartX = event.clientX
            this.pdfDragStartY = event.clientY
            this.pdfDragScrollLeft = previewEl.scrollLeft
            this.pdfDragScrollTop = previewEl.scrollTop
            window.addEventListener('mousemove', this.handlePdfDragMove)
            window.addEventListener('mouseup', this.stopPdfDrag)
            event.preventDefault()
        },
        handlePdfDragMove(event) {
            if (!this.isPdfDragging) {
                return
            }
            const previewEl = this.$refs.filePreview
            if (!previewEl) {
                return
            }
            const deltaX = event.clientX - this.pdfDragStartX
            const deltaY = event.clientY - this.pdfDragStartY
            previewEl.scrollLeft = this.pdfDragScrollLeft - deltaX
            previewEl.scrollTop = this.pdfDragScrollTop - deltaY
        },
        stopPdfDrag() {
            this.isPdfDragging = false
            window.removeEventListener('mousemove', this.handlePdfDragMove)
            window.removeEventListener('mouseup', this.stopPdfDrag)
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
        async renderDocFile(blob) {
            try {
                await this.$nextTick();
                await renderAsync(blob, this.$refs.docFile);
                this.handleRendered();
            } catch (err) {
                console.error('.doc文件渲染失败:', err);
                this.loading = false;
                this.isSuccess = false;
                this.errorMsg = '该 .doc 文件暂不支持预览，建议转为 .docx 格式';
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
                        if (this.fileType === 'doc') {
                            await this.renderDocFile(blob);
                        } else {
                            this.url = window.URL.createObjectURL(blob);
                            this.handleRendered();
                        }
                    }
                } else {
                    // MinIO文件：使用原有的MinIO下载接口
                    const downloadUrl = `${minioDownload}?filePath=${encodeURI(filePath)}&fileName=${encodeURI(fileName)}`;
                    const res = await this.$download.fileSource(downloadUrl);
                    const blob = new Blob([res.data])
                    this._blob = blob
                    if (this.fileType === 'doc') {
                        await this.renderDocFile(blob);
                    } else {
                        this.url = window.URL.createObjectURL(blob);
                        if (this.pngTypes.includes(this.fileType)) {
                            this.renderImg()
                        }
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
    beforeDestroy() {
        this.stopPdfDrag()
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
        position: relative;
    }

    .pdfFloatingToolbar {
        position: absolute;
        top: 20px;
        right: 30px;
        z-index: 10;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        padding: 6px 16px;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.05);
        border-radius: 30px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;

        .scale-text {
            font-size: 13px;
            color: #606266;
            min-width: 42px;
            text-align: center;
            font-weight: 500;
            user-select: none;
        }

        .divider {
            width: 1px;
            height: 16px;
            background: #dcdfe6;
            margin: 0 4px;
        }

        .el-button {
            margin-left: 0;
            border: none;
            background: rgba(255, 255, 255, 0.6);
            color: #606266;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
            
            &:hover:not(.is-disabled) {
                color: #1890ff;
                background: #e6f7ff;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(24, 144, 255, 0.15);
            }
            
            &.is-disabled {
                background: transparent;
                box-shadow: none;
            }
        }
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
        position: relative;
        height: 100%;
        min-height: 400px;
        overflow: auto;
        background-color: #fff;

        .pdfPreviewWrapper {
            position: relative;
            min-width: 100%;
            min-height: 100%;
            padding: 12px 0;
            box-sizing: border-box;
            cursor: grab;
            user-select: none;

            &.is-dragging {
                cursor: grabbing;
            }
        }



        .pdfPreviewInner {
            min-width: 320px;
            margin: 0 auto;
        }

        .gifFile {
            height: 100%;
            width: 100%;

            img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
        }

        .docx-container {
            width: 100%;
            height: 100%;
            overflow-y: auto;
            padding: 10px;
            box-sizing: border-box;
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

@media screen and (max-width: 768px) {
    .fileViewDialog {
        .pdfFloatingToolbar {
            display: none;
        }
    }
}
</style>
