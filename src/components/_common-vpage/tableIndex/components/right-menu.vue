<template>
    <div id="menu" ref="menu">
        <ul>
            <li @click="refresh"><svg-icon class="menu-icon" icon-class="Icon-refresh" /><span>刷新</span></li>
            <li :data-clipboard-text="selectedData?selectedData:tableRowText" @click="copyClick"><svg-icon class="menu-icon" icon-class="Icon-copy" /><span>复制</span></li>
            <li :data-clipboard-text="copyAllText" @click="copyAllClick"><svg-icon class="menu-icon" icon-class="Icon-copy-all" /><span>全部复制</span></li>
            <hr>
            <li @click="listSet"><i class="el-icon-setting font-icon"></i><span>列设置</span></li>
            <li @click="collapseClick" v-if="!!isCollapse && !isExpand"><i class="el-icon-full-screen font-icon"></i><span>全阶展开</span></li>
            <li @click="expandClick" v-if="!!isCollapse && isExpand"><i class="el-icon-crop font-icon"></i><span>全阶关闭</span></li>
            
            <li>
                <svg-icon class="menu-icon" icon-class="Icon-sort" /><span>排序</span><span class="iconfont el-icon-arrow-right"></span>
                <ul class="menu_ul">
                    <li @click="listSort(null)"><span>清除排序</span></li>
                    <li @click="listSort('ascending')"><span :class="listQuery.isAsc == 'asc'?'menu_span_color':''">升序</span><span v-show="listQuery.isAsc == 'asc'" class="el-icon-check menu_span_color"></span></li>
                    <li @click="listSort('descending')"><span :class="listQuery.isAsc == 'desc'?'menu_span_color':''">倒序</span><span v-show="listQuery.isAsc == 'desc'" class="el-icon-check menu_span_color"></span></li>
                </ul>
            </li>
        </ul>
    </div>
</template>

<script>
import { copyToClipboard } from "@/utils/util"
export default {
    props: {
        tabConfig: {
            type: Array,
            default: () => []
        },
        tableRowText: {
            type: String,
            default: () => ''
        },
        selectedData: {
            type: String,
            default: () => ''
        },
        listQuery: {
            type: Object,
            default: () => {
                return {}
            }
        }
    },
    data() {
        return {
            copyAllText: '',
            isCollapse: undefined,
            isExpand: false,
            prop: 'children'
        };
    },
    mounted() {
        document.addEventListener('click', (e) => {
            const event = e || window.event;
            this.hide(event);
        });
        document.addEventListener('mousedown', (e) => {
            const event = e || window.event;
            if(event.button === 2){
                this.hide(event);
            }
        });
    },
    methods: {
        show (e, $el, row, prop = 'children') {
            let menu = this.$refs.menu, left = 0, top = 0, collapse = undefined, expand = false;
            menu.style.position = "fixed";
            menu.style.display = "block";
            if(row && row[prop] && Array.isArray(row[prop]) && row[prop].length) {
                collapse = row
                expand = row.isExpand
            }
            this.isCollapse = collapse
            this.isExpand = expand
            this.$nextTick( () => {
                let menu_ul = document.querySelector(".menu_ul");
                const x = e.clientX-$el.offsetWidth;
                const y = e.clientY-$el.offsetHeight;
                if(x > $el.offsetLeft){
                    left = e.clientX - menu.offsetWidth;
                    menu_ul.style.left = "-140px";
                }else{
                    left = e.clientX;
                    menu_ul.style.left = "140px";
                }
                if(y > $el.offsetTop){
                    top = e.clientY - menu.offsetHeight;
                    menu_ul.style.top = "-60px";
                }else{
                    top = e.clientY;
                    menu_ul.style.top = "0px";
                }
                menu.style.left = left + "px";
                menu.style.top = top + "px";
            })
        },
        hide (e) {
            let menu = this.$refs.menu;
            menu ? (menu.style.display = "none") : '';
        },
        collapseClick() {
            this.$emit("collapseAll", this.isCollapse);
        },
        expandClick() {
            this.$emit("expandAll", this.isCollapse);
        },
        copyClick (e) {
            const event = e || window.event;
            const text = this.selectedData?this.selectedData:this.tableRowText;
            copyToClipboard(text, event, this.$message, '复制成功', '复制失败', 'currentTarget');
        },
        copyAllClick (e) {
            const event = e || window.event;
            let copyList = [];
            const tableBody = this.$parent.$refs.elTable.$el.querySelector(".el-table__body");
            tableBody.children[1].childNodes.forEach((element) => {
                for (let index = 0;index < element.childNodes.length;index++) {
                    // 获取当前单元格
                    const cell = element.childNodes[index];
                    if(cell.className.indexOf('table-operate') == -1){
                        copyList.push(cell.innerText);
                    }
                }
            })
            const tabConfigList = JSON.parse(JSON.stringify(this.tabConfig.filter((item) => item.isHide == 0 && !item.isHides)));
            let str = '';
            copyList.forEach( (val, i) => {
                if(((i+1)/tabConfigList.length)%1 === 0){
                    str += `${val}\n`;
                }else{
                    str += `${val} `;
                }
            })
            this.copyAllText = str;
            copyToClipboard(str, event, this.$message, '复制成功', '复制失败', 'currentTarget');
        },
        refresh () {
            this.$emit("selectChange");
        },
        listSet () {
            this.$emit("listSet");
        },
        listSort (order) {
            this.$emit("listSort", order);
        }
    }
};
</script>
<style lang="scss" scoped>
#menu {
    position: absolute;
    display: none;
    box-shadow: 0 12px 15px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.4);
    background: #ffffff;
    cursor: pointer;
    color: #2a2e33;
    width: 140px;
    font-size: 12px;
    z-index: 100;
    .menu-icon{
        font-size: 24px;
        vertical-align: -0.25em;
    }
    ul {
        list-style: none;
        margin: 0px;
        padding: 0px;
        li {
            height: 38px;
            line-height: 38px;
            position: relative;
            box-sizing: border-box;
            text-indent: 8px;
            .font-icon {
                font-size: 16px;
                display: inline-block;
                position: relative;
                left: -4px;
                bottom: -2px;
            }
            &:hover {
                background-color: #ecf5ff;
                ul {
                    display: block;
                }
            }
            .iconfont {
                float: right;
                padding-top: 13px;
                padding-right: 6px;
            }
            ul {
                display: none;
                position: absolute;
                left: 140px;
                top: 0px;
                width: 140px;
                border: 1px solid #e4e7ed;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
                li {
                    background-color: #fff;
                    .menu_span_color{
                        color: #1890ff;
                    }
                }
            }
        }
        hr {
            width: 92%;
            margin: 2px auto;
            border: 0;
            height: 1px;
            background: #e3e3e3;
        }
    }
}
</style>