<template>
    <Dialog :title="title" :visible.sync="openDataScope" :close-on-click-modal="false" append-to-body >
        <template slot="title">
            <div class="avue-crud__dialog__header">
                <span class="el-dialog__title">
                    {{ title }}
                </span>
            </div>
        </template>
        <el-form ref="elForm" :model="formData" :rules="rules" label-width="115px">
            <el-form-item label="提示：" porp="prompt">
                <el-input type="textarea" autosize maxlength="200" v-model="formData.prompt" />
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="optionsClick">确 定
            </el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>

<script>
export default {
    data() {
        return {
            openDataScope: false,
            title: '高级配置',
            row:{},
            formData: {
                prompt: '',
            },
            rules: {

            }
        }
    },
    methods: {
        init (row) {
            this.openDataScope = true;
            this.$nextTick( () => {
                let data = JSON.parse(JSON.stringify(row));
                if(data.options){
                    this.formData = JSON.parse(data.options);
                }else{
                    this.formData = {
                        prompt: '',
                    };
                }
            })
        },
        optionsClick () {
            let data = this.formData;
            this.$emit('optionsSuccess', JSON.stringify(data));
            this.openDataScope = false;
        }
    }
}
</script>
<style lang="scss" scoped></style>
