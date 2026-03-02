<template>
    <!-- 站点维护 -->
    <Dialog :title="title" :visible.sync="openDataScope" append-to-body :close-on-click-modal="false"
        v-loading="loading" >
        <el-form ref="elForm" :model="form" :rules="rules" label-width="120px">
             <el-form-item label="建设项目:" prop="projectId">
                 <el-select class="select-box" v-model="form.projectId" :placeholder="'请选择建设项目'"
                   clearable filterable style="width: 100%" size="small" @change="getOptions">
                    <el-option v-for="(item, key) in lineOptions" :key="key" :label="item.label" :value="item.value" />
                  </el-select>
             </el-form-item>
           
             <el-form-item label="站点名称:" prop="siteName">
                <el-input :maxlength="50" v-model="form.siteName" />
            </el-form-item>
            <el-form-item label="经度:" prop="longitude">
                <el-input :maxlength="50" v-model="form.longitude" />
            </el-form-item>
            <el-form-item label="纬度:" prop="latitude">
                <el-input :maxlength="50" v-model="form.latitude" />
            </el-form-item>
             <el-form-item label="排序:" prop="sort">
                <el-input :maxlength="50" v-model="form.sort" />
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="type == 'create' ? submitDataScope() : siteModify()">确 定</el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>

<script>
import { siteSave, siteDetail, siteModify } from "@/api/system/projectSite";
import * as LineApi from '@/api/prodmgr-inv/project/line.js'
export default {
    data() {
        return {
            lineOptions:[],
            loading: false,
            title: '新增站点',
            type: 'add',
            id: '',
            openDataScope: false,
            form: {
               siteName:'',
               longitude:'',
               latitude:'',
               projectId:'',
               sort:'',
               projectShortName:'',
               projectName:''
            },
            
            // 表单校验
            rules: {
                 projectId: [{ required: true, message: "请选择建设项目", trigger: "blur" }],
                 siteName: [{ required: true, message: "站点名称不能为空", trigger: "blur" }],
                 longitude: [
                    { required: true, message: "经度不能为空", trigger: "blur" },
                    {
                        trigger: 'blur',
                        validator: (rule, value, callback) => {
                            let reg = /\S/
                            if (!reg.test(value)) {
                                callback(
                                    new Error(
                                        '经度不能为空'
                                    )
                                )
                            } else {
                                callback()
                            }
                        }
                    }
                ],
                latitude: [{ required: true, message: "纬度不能为空", trigger: "blur" }],
            }
        }
    },
    methods: {
        /** 提交按钮 */
        init(type, id) {
            this.type = type;
            this.id = id;
            this.getLineOptions();
            this.openDataScope = true;
            if (this.$refs.elForm) this.$refs.elForm.resetFields();
            this.$nextTick(() => {
                if (type === 'update') {
                    this.title = "修改站点";
                    this.siteDetail(id);
                } else if (type === 'create') {
                    this.title = "新增站点";
                }
            })
        },
         getLineOptions() {
           LineApi.lineSelectOptions().then(({ data }) => {
              this.lineOptions = data.map(x => ({
               label: x.projectName,
               value: x.id,
               projectShortName: x.projectShortName || ''
             }))
           })
        },
        getOptions(val){
            const selectedOption = this.lineOptions.find(item => item.value === val);
            if (selectedOption) {
                this.form.projectName = selectedOption.label;
                this.form.projectShortName = selectedOption.projectShortName;
            } else {
                this.form.projectName = '';
                this.form.projectShortName = '';
            }
        },
        siteDetail(id) {
            siteDetail(id).then(({ data }) => {
                this.form = data;
            })
        },
        submitDataScope() {
            this.$refs["elForm"].validate(valid => {
                if (valid) {
                    this.loading = true;
                     delete this.form.id
                    siteSave(this.form).then(({ message }) => {
                        this.$modal.msgSuccess(message);
                        this.openDataScope = false;
                        this.loading = false;
                        this.$emit('operateSuccess')
                    });
                }
            })
        },
        siteModify() {
            this.$refs["elForm"].validate(valid => {
                if (valid) {
                    this.loading = true;
                    siteModify(Object.assign({}, this.form, { id: this.id })).then(({ message }) => {
                        this.$modal.msgSuccess(message);
                        this.openDataScope = false;
                        this.loading = false;
                        this.$emit('operateSuccess')
                    });
                }
            })
        },
    }
};
</script>
