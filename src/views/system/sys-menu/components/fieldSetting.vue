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
                <el-input type="textarea" maxlength="200" v-model="formData.prompt" />
            </el-form-item>
          <el-form-item label="提示位置：" porp="placement">
            <el-checkbox-group v-model="formData.placement">
              <el-checkbox label="search">搜索</el-checkbox>
              <el-checkbox label="table">表格</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
            <el-form-item label="国际化：" porp="prompt">
                <el-input maxlength="200" v-model="formData.i18nCode">
                    <el-button slot="prepend" icon="el-icon-search"></el-button>
                    <el-button slot="append" icon="el-icon-plus" @click="i18nCreate">新增</el-button>
                </el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="optionsClick">确 定
            </el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
        <i18nOption ref="i18nOption"></i18nOption>
    </Dialog>
</template>

<script>
import i18nOption from '@/views/system/i18n/components/operate.vue'
export default {
    components: { i18nOption },
    data() {
        return {
            openDataScope: false,
            title: '高级配置',
            row:{},
            formData: {
                prompt: '',
                i18nCode: '',
                placement: []
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
                this.row = data;
                if(data.options){
                    const options = JSON.parse(data.options);
                    if(!options.placement) {
                      options.placement = []
                    }
                    this.formData = options
                }else{
                    this.formData = {
                        prompt: '',
                        i18nCode: '',
                        placement: []
                    };
                }
            })
        },
        optionsClick () {
            let data = this.formData;
            this.$emit('optionsSuccess', JSON.stringify(data));
            this.openDataScope = false;
        },
        i18nCreate() {
            this.$refs['i18nOption'].init('create', { i18nCode: `field.${this.row['fieldCode']}` })
        }
    }
}
</script>
<style lang="scss" scoped></style>
