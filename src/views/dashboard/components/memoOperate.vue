<template>
    <Dialog class="pop-dialog" :visible.sync="visible" width="600px" :close-on-click-modal="false" append-to-body
        v-loading="loading" >
        <div slot="title" class="dialog-title">
            <span class="title">{{ title }}</span>
        </div>
        <div class="content-container">
            <el-form :model="formData" ref="elForm" label-width="60px">
                <el-form-item label="日期">
                    <el-input v-model="formData.memoDate" readonly prefix-icon="el-icon-date"></el-input>
                </el-form-item>
                <el-form-item label="内容">
                    <el-input type="textarea" :rows="6" v-model="formData.memoContent" placeholder="内容字数500字以内"
                        maxlength="500" show-word-limit />
                </el-form-item>
            </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
            <div class="pop-btn-box">
                <el-button class="pop-button sure" @click="handleConfirm">确 定</el-button>
                <el-button class="pop-button" @click="visible = false">取 消</el-button>
            </div>
        </div>
    </Dialog>
</template>
<script>
// import { memoSave } from '@/api/system/dashboard.js';

export default {
    data() {
        return {
            //是否显示
            visible: false,
            //表格loading
            loading: false,
            //弹框标题
            title: '备忘录',
            //表单数据
            formData: {
                memoDate: '',
                memoContent: '',
            }
        }
    },
    methods: {
        init(memoDate, memoContent) {
            this.visible = true;
            this.formData.memoDate = memoDate;
            this.formData.memoContent = memoContent;
        },
        //确定
        handleConfirm() {
            this.loading = true;

            let params = {
                memoDate: this.formData.memoDate,
                memoContent: this.formData.memoContent,
            }
            memoSave(params).then(({ data }) => {
                this.loading = false;
                this.visible = false;
                this.$emit('memoOperateSuccess');
            }).catch((err) => {
                this.loading = false;
            })
        }
    },
}
</script>
<style lang="scss" scoped>
::v-deep.el-dialog__wrapper.pop-dialog>div.el-dialog {
    min-height: 350px !important;
}



.content-container {
    border-top: 1px solid #f3f5f7;
    border-bottom: 1px solid #f3f5f7;
    padding: 20px 20px 0 0;
}

.dialog-footer {
    display: block;
}

::v-deep .el-dialog:not(.is-fullscreen) {
    margin-top: 20vh !important;
}
</style>