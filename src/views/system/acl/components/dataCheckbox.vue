<template>
    <div class="acl_checkbok">
        <div class="button_checked">
            <div class="button_list">
                <el-radio-group v-model="radio">
                    <el-radio v-for="city in item" :key="city.id" :label="city.id" @click.native.prevent="radioClick(city.id)">{{city.ruleName}}</el-radio>
                </el-radio-group>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        item: {
            type: Array,
            default: () => [],
        },
        id: {
            type: String,
            default: () => '',
        }
    },
    data() {
        return {
            radio: '',
        }
    },
    watch: {
        radio: {
            handler: function (newRadio){
                this.$emit("radioAll", newRadio, this.id);
            }
        }
    },
    created() {
        this.item.forEach( val => {
            if(val.isBind == 1){
                this.radio = val.id;
            }
        })
    },
    methods: {
        //监听菜单选中状态
        isWatch () {
            this.radio = '';
            this.item.forEach( val => {
                if(val.isBind == 1){
                    this.radio = val.id;
                }
            })
        },
        radioClick (val) {
            val === this.radio ? this.radio = '' : this.radio = val
        }
    }
};
</script>
<style lang="scss" scoped>
.acl_checkbok{
    margin-top: 10px;
    .button_checked{
        display: flex;
        margin-bottom: 10px;
        .button_list{
            float: left;
        }
    }
    .el-checkbox{
        min-width: 100px;
    }
}
</style>