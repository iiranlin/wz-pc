<template>
    <Dialog :title="title" :visible.sync="openDataScope" :close-on-click-modal="false" width="600px" append-to-body v-loading="loading" >
        <el-form ref="elForm" :model="formData" label-width="90px">
            <el-form-item label="标记结果" class="border-radius50">
                <el-select v-model="formData.quotationResult" clearable style="width:100%">
                    <el-option v-for="(item, index) in dict.type.quotationResult" :key="index"
                        :label="item.label" 
                        :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitDataScope">确 定</el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>
<script>
import {quotationMark} from '@/api/saleManage/quotation'

export default {
    name:'markOperate',
    dicts: ['quotationResult'],

    data() {
        return {
            loading: false,
            openDataScope: false,
            title: "提示",
            rowList:[],

            formData: {
               quotationResult:'',
            },
        };
    },
    created() { 

    },
    methods: {
        init(rowList) {
            this.openDataScope = true;
            this.rowList = rowList;

            this.$nextTick(async () => {
              
            });
        },
        submitDataScope () {
            this.loading = true;

            let ids = this.rowList.map((item) => item.quotationId);

            let params = {
                quotationResult: this.formData.quotationResult,
                quotationIds: ids,
            }
            quotationMark(params).then(({message}) => {
                this.$modal.msgSuccess(message);
                this.openDataScope = false;
                this.$emit('markOperateConfirm')
            }).catch((err) => {
                
            }).finally(() => {
                this.loading = false;
            })
        }
    },
};
</script>
