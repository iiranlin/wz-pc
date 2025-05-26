<template>
    <Dialog title="选择打印模板" :visible.sync="openWorkflow" width="600px" center :close-on-click-modal="false"
        append-to-body>
        <el-form ref="elForm" :model="form" label-width="110px">
            <el-row>
                <el-col :span="24">
                    <el-form-item label="打印模板:" prop="id"
                        :rules="{ required: true, message: '请选择打印模板', trigger: ['blur', 'change'] }">
                        <el-select v-model="form.id" placeholder="请选择打印模板" style="width:100%;">
                            <el-option v-for="item in list" :key="item.id" :label="item.templateName" :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="handleCancel">取 消</el-button>
            <el-button type="primary" style="margin-left: 20px;" @click="submitDataScope" :loading="loading">确
                定</el-button>
        </div>
    </Dialog>
</template>

<script>
import {userPrintTemplate, tmplAllList} from '@/api/system/print'
import Vue from "vue";

const PrintTemplateDialog = {
    name: "PrintTemplateDialog",
    props: {
        multiple: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            loading: false,
            openWorkflow: false,
            list: [],
            form: {
                id: null,
            },
            resolve: null,
            reject: null,
        };
    },
    methods: {
        getTmpls(arr1, arr2) {
            if (!!arr1.length) {
                return arr1
            }
            if (!!arr2.length) {
                return arr2
            }
            return []
        },
        async open(ids = [], args = {}, callback) {
            this._args = args;
            this._callback = callback;
            this.form.id = null
            try {
                const { data } = await tmplAllList();
                const res = await userPrintTemplate()
                const idsArr = res.data.map(({printTemplateId}) => printTemplateId)
              
                const arrList =  data.list.filter((item) => idsArr.includes(item.id));
                const list = arrList.filter((item) => ids.includes(item.id));
                if(!list.length) {
                    this.$modal.msgError('未找到对应的打印模板，请联系管理员')
                    return
                }
                const [node] = args.arr
                const nextList = []
                const defaultList = []
                for (let i = 0; i < list.length; i++) {
                    const { properties } = list[i]
                    if (!!properties) {
                        const obj = JSON.parse(properties)
                        if (obj.fieldCode  && obj.dictCode && node[obj.fieldCode]) {
                            if(node[obj.fieldCode] == obj.dictCode) {
                                nextList.push(list[i])
                            }
                        } else {
                            defaultList.push(list[i])
                        }


                    }
                }
                const arr = this.getTmpls(nextList, defaultList)
                if (arr.length > 1) {
                    this.list = arr
                    this.openWorkflow = true;
                    this.$nextTick(() => {
                        this.$refs.elForm.resetFields();
                    });
                } else {
                    arr.length && this._callback && this._callback({ id: arr[0].id, args: this._args })
                    this.cleanup();
                }


            } catch (error) {
                console.error("Failed to load template list:", error);
                return Promise.reject(error);
            }
        },
        handleCancel() {
            this.openWorkflow = false;

            this.cleanup();
        },
        submitDataScope() {
            this.$refs.elForm.validate((valid) => {
                if (valid) {
                    this.openWorkflow = false;
                    if (this._callback) {
                        this._callback({
                            id: this.form.id,
                            args: this._args,
                        });
                    }
                    this.cleanup();
                }
            });
        },
        cleanup() {
            this._callback = null
            this._args = {};
        },
    },
};

// 创建插件式安装方法
PrintTemplateDialog.install = function (Vue) {
    const PrintTemplateDialogConstructor = Vue.extend(PrintTemplateDialog);
    let instance = null;

    function $printTemplateDialog(ids = [], args = {}, callback) {
        if (!instance) {
            instance = new PrintTemplateDialogConstructor({
                el: document.createElement("div"),
            });
            document.body.appendChild(instance.$el);
        }
        Vue.nextTick(() => {
            instance.open(ids, args, callback);
        });
        return instance;
    }

    Vue.prototype.$printTemplateDialog = $printTemplateDialog;
};

export default PrintTemplateDialog;
</script>