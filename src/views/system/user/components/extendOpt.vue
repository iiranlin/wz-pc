<template>
    <Dialog ref="" title="扩展操作" v-if="dialogVisible" :visible.sync="dialogVisible" width="30%" >
        <el-input v-if="!isVerify" v-model="secret" placeholder="请输入操作密钥" size="normal" clearable>
            <el-button slot="append" type="primary" size="default" @click="verifySecret">校验</el-button>
        </el-input>
        <template v-if="isVerify">
            <el-form :model="form" ref="form" :rules="rules" label-width="80px" :inline="false" size="normal">
                <el-form-item label="用户账号：">
                    <el-input v-model="form.username"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="minin" @click="createTempPass">临时密码</el-button>
                </el-form-item>
            </el-form>

        </template>
    </Dialog>
</template>

<script>
import { verifySecret, createTempPass } from '@/api/login'

export default {
    name: "extendOpt",
    data() {
        return {
            dialogVisible: false,
            secret: '',
            isVerify: false,
            form: {
                username: ""
            }
        }
    },
    methods: {
        init() {
            this.isVerify = false
            this.secret = ''
            this.dialogVisible = true
            this.form.username = ''
        },
        verifySecret() {
            const secret = this.secret;
            if (!!secret) {
                verifySecret(secret).then(({ success, message }) => {
                    if (success) {
                        this.$message.success("校验通过")
                        this.isVerify = true
                    } else {
                        this.$message.error(message)
                    }
                })
            } else {
                this.$message.error("校验失败")
            }
        },
        createTempPass() {
            const username = this.form.username;
            createTempPass(username).then(({ success, data, message }) => {
                if (success) {
                    this.$alert(`生成临时密码成功【${data}】, 有效期60秒`, '提示', {
                        confirmButtonText: '确定'
                    });
                } else {
                    this.$message.error(message)
                }
            })
        }
    },
}
</script>

<style lang="scss" scoped></style>