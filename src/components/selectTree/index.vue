<template>
    <el-select :disabled="disable" popper-class="treeSelectPopper" :value="valueTitle" :clearable="clearable" @clear="clearHandle"  ref="treeSelect">
        <el-input
            v-if="selectInputShow"
            class="selectInput"
            :placeholder="placeholder"
            v-model="filterText">
        </el-input>
        <el-option :value="valueTitle" :label="valueTitle" class="options">
            <el-tree  id="tree-option"
                ref="selectTree"
                :expand-on-click-node="expandOnClickNode"
                :accordion="accordion"
                :data="options"
                :props="props"
                :node-key="props.value"
                :default-expanded-keys="defaultExpandedKey"
                :filter-node-method="filterNode"
                @node-click="handleNodeClick">
            </el-tree>
        </el-option>
    </el-select>
</template>

<script>
export default {
    name: "select-tree",
    props:{
        /* 配置项 */
        props:{
            type: Object,
            default:()=>{
                return {
                    value:'id',             // ID字段名
                    label: 'deptName',         // 显示名称
                    children: 'children'    // 子级字段名
                }
            }
        },
        /* 选项列表数据(树形结构的对象数组) */
        options:{
            type: Array,
            default: ()=>{ return [] }
        },
        /* 初始值 */
        value:{
            type: String,
            default: ()=>{ return '' }
        },
        /* 可清空选项 */
        clearable:{
            type:Boolean,
            default:()=>{ return true }
        },
        /* 是否只点击箭头收缩 */
        expandOnClickNode: {
            type:Boolean,
            default:()=>{ return false }
        },
        /* 自动收起 */
        accordion:{
            type:Boolean,
            default:()=>{ return false }
        },
        /* 是否展示搜索 */
        selectInputShow: {
            type:Boolean,
            default:()=>{return false }
        },
        placeholder:{
            type:String,
            default:()=>{return "检索关键字"}
        },
        index: {
            type: Number,
            default: 0
        },
        disabledFun: {
            type: Function,
            default: null
        },
        disable: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            filterText: '',
            valueId:this.value,    // 初始值
            valueTitle:'',
            defaultExpandedKey:[]
        }
    },
    mounted(){
        this.initHandle()
    },
    methods: {
        // 初始化值
        initHandle(){
            this.$nextTick( () => {
                if(this.valueId){
                    this.valueTitle = this.$refs.selectTree.getNode(this.valueId) ? this.$refs.selectTree.getNode(this.valueId).data[this.props.label] : ''     // 初始化显示
                    this.$refs.selectTree.setCurrentKey(this.valueId)       // 设置默认选中
                    this.defaultExpandedKey = [this.valueId]      // 设置默认展开
                }else{
                    this.filterText = '';
                    this.valueTitle = '';
                }
                this.initScroll()
            })
        },
        // 初始化滚动条
        initScroll(){
            this.$nextTick(()=>{
                let scrollWrap = document.querySelectorAll('.treeSelectPopper .el-scrollbar .el-select-dropdown__wrap')[0]
                let scrollBar = document.querySelectorAll('.treeSelectPopper .el-scrollbar .el-scrollbar__bar')
                scrollWrap.style.cssText = 'margin: 0px; max-height: none; overflow: hidden;'
                scrollBar.forEach(ele => ele.style.width = 0)
            })
        },
        handleInputChange(node) {
            this.$emit('input', node, this.index, this.valueId)
        },
        // 切换选项
        handleNodeClick(node){
            if(this.disabledFun(node)) return
            this.valueTitle = node[this.props.label]
            this.valueId = node[this.props.value]
            this.$emit('getValue', node, this.index, this.valueId)
            this.$emit('input', node, this.index, this.valueId,)
            this.defaultExpandedKey = []
            // if(!node.children || !node.children.length) { //补录选择完选项弹框不能收起
            this.$refs.treeSelect.blur()
            // }
        },
        // 清除选中
        clearHandle(){
            this.valueTitle = ''
            this.valueId = null
            this.defaultExpandedKey = []
            this.clearSelected()
            this.$emit('getValue',null, this.index, null)
            this.$emit('input', undefined, this.index, undefined)
        },
        /* 清空选中样式 */
        clearSelected(){
            let allNode = document.querySelectorAll('#tree-option .el-tree-node')
            allNode.forEach((element)=>element.classList.remove('is-current'))
        },
        filterNode(value, data) {
            const {label} = this.props
            if (!value) return true;
            return !!this.$py.match(data[label], value);
        }
    },
    watch: {
        value(){
            this.valueId = this.value
            this.initHandle()
        },
        filterText(val) {
            this.$refs.selectTree.filter(val);
        }
    },
};
</script>
<style scoped>
    .el-scrollbar .el-scrollbar__view .el-select-dropdown__item{
        height: auto;
        max-height: 200px;
        padding: 0;
        overflow: hidden;
        overflow-y: auto;
    }
    .el-select-dropdown__item.selected{
        font-weight: normal;
    }
    ul li >>>.el-tree .el-tree-node__content{
        height:auto;
        padding: 0 20px;
    }
    .el-tree-node__label{
        font-weight: normal;
    }
    .el-tree >>>.is-current .el-tree-node__label{
        color: #409EFF;
        font-weight: 700;
    }
    .el-tree >>>.is-current .el-tree-node__children .el-tree-node__label{
        color:#606266;
        font-weight: normal;
    }
    .selectInput{
        padding: 0 5px;
        box-sizing: border-box;
    }
</style>
