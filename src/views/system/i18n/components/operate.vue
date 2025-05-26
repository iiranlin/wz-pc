<template>
    <Dialog :title="title" :visible.sync="dialogVisible" width="600px" append-to-body >
        <el-form ref="elForm" :model="form" label-width="85px">
            <el-row>
                <el-col :span="12">
                    <el-form-item :label="($t('field.i18nCode') || '语言编号') + ':'" prop="i18nCode">
                        <el-input v-model="form.i18nCode" placeholder="" size="normal"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-table :data="dataList" stripe header-align="center" style="margin: 0;">
                    <el-table-column prop="i18nType" :label="$t('field.i18nType') || '语言类型'" align="left"
                        width="80px"></el-table-column>
                    <el-table-column prop="i18nName" :label="$t('field.i18nName') || '类型说明'" align="left"
                        width="120px"></el-table-column>
                    <el-table-column prop="i18nDesc" :label="$t('field.i18nDesc') || '语言说明'" align="left">
                        <template slot-scope="scope">
                            <el-input v-model="scope.row.i18nDesc" placeholder="" size="normal"></el-input>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="onSubmit">确 定</el-button>
            <el-button @click="dialogVisible = false">取 消</el-button>
        </div>
    </Dialog>
</template>

<script>
import { i18nList, i18nDataSave, getDataByI18nCode } from '@/api/system/i18n'
export default {
    data() {
        return {
            dialogVisible: false,
            title: "新增语言",
            form: {
                i18nCode: "",
                oldI18nCode: ""
            },
            dataList: [],
        };
    },
    methods: {
        /** 提交按钮（数据权限） */
        init(code, row) {
            this.dialogVisible = true
            this.$nextTick(() => {
                this.$refs['elForm'].resetFields();
                this.form.i18nCode = row?.i18nCode || "";
                this.form.oldI18nCode = "";
            })
            i18nList().then(res => {
                this.dataList = res.data.map(item => {
                    return item = {
                        i18nId: item.id,
                        i18nType: item.i18nType,
                        i18nName: item.i18nName,
                        i18nDesc: "",
                    }
                })
                if (code == 'update') {
                    this.title = "编辑语言"
                    const i18nCode = row.i18nCode;
                    this.form.i18nCode = i18nCode;
                    this.form.oldI18nCode = i18nCode
                    getDataByI18nCode({ i18nCode: i18nCode }).then(res => {
                        this.dataList.forEach(element => {
                            element.i18nDesc = res.data[i18nCode][element.i18nType]
                        })
                    })
                }
            })
        },
        onSubmit() {
            const form = { ...this.form }
            form["i18nDataList"] = this.dataList
            i18nDataSave(form).then((res) => {
                this.$msg(res)
                if (res.success) {
                    this.dialogVisible = false
                    this.$store.dispatch('GetI18nMessages')
                    this.$emit('operateSuccess')
                }
            })
        }
    },
};
</script>
