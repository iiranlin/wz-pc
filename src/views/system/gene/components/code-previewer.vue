<template>
  <div class="code-preview-container">
    <div class="menu-wrapper">
      <el-menu @select="menuSelected" default-active="Rest"
               :default-openeds="openMenuList"
      >
        <el-submenu index="java-0">
          <template slot="title">
            <span>接口(client)层</span>
          </template>
          <el-menu-item index="Rest">Rest</el-menu-item>
        </el-submenu>
        <el-submenu index="java-1">
          <template slot="title">
            <span>控制层</span>
          </template>
          <el-menu-item index="Controller">Controller</el-menu-item>
        </el-submenu>
        <el-submenu index="java-2">
          <template slot="title">
            <span>服务层</span>
          </template>
          <el-menu-item index="Service">Service</el-menu-item>
          <el-menu-item index="ServiceImpl">ServiceImpl</el-menu-item>
        </el-submenu>
        <el-submenu index="java-3">
          <template slot="title">
            <span>持久层</span>
          </template>
          <el-menu-item index="Mapper">Mapper</el-menu-item>
        </el-submenu>
        <el-submenu index="java-4">
          <template slot="title">
            <span>实体类</span>
          </template>
          <el-menu-item index="DO">DO</el-menu-item>
          <el-menu-item index="BO">BO</el-menu-item>
          <el-menu-item index="DTO">DTO</el-menu-item>
          <el-menu-item index="Param">CreateParam</el-menu-item>
          <el-menu-item index="ModifyParam">ModifyParam</el-menu-item>
          <el-menu-item index="Query">Query</el-menu-item>
        </el-submenu>
        <el-submenu index="java-5">
          <template slot="title">
            <span>转换层</span>
          </template>
          <el-menu-item index="Converter">Converter</el-menu-item>
        </el-submenu>
        <!-- <el-submenu index="vue-1">
          <template slot="title">
            <span>web页面</span>
          </template>
          <el-menu-item index="index">列表页</el-menu-item>
          <el-menu-item index="operate">编辑页</el-menu-item>
        </el-submenu>
        <el-submenu index="js-1">
          <template slot="title">
            <span>javascript</span>
          </template>
          <el-menu-item index="js">javascript</el-menu-item>
        </el-submenu> -->
        <el-submenu index="sql-1">
          <template slot="title">
            <span>sql</span>
          </template>
          <el-menu-item index="sql">建表语句</el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
    <div class="code-wrapper">
      <el-link :underline="false" icon="el-icon-document-copy" v-clipboard:copy="copyValue" style="float:right" v-if="copyValue !== ''">复制</el-link>
      <pre><code class="hljs" v-html="code"></code></pre>
    </div>
  </div>
</template>

<script>
import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/github-gist.css'

hljs.registerLanguage('java', require('highlight.js/lib/languages/java'))
hljs.registerLanguage('vue', require('highlight.js/lib/languages/xml'))
hljs.registerLanguage('js', require('highlight.js/lib/languages/javascript'))
hljs.registerLanguage('sql', require('highlight.js/lib/languages/sql'))

export default {
  props: {
    geneCode: Object
  },
  data() {
    return {
      // 当前展示代码
      code: '',
      copyValue: '',
      openMenuList: ['java-0', 'java-1', 'java-2', 'java-3', 'java-4', 'java-5', 'sql-1']
    }
  },
  watch: {
    geneCode: {
      handler: function(val) {
        this.code = ''
        if (Object.keys(this.geneCode).length !== 0) {
          // 初始显示接口类代码
          this.menuSelected('Rest', ['java-0', 'Rest'])
        }
      },
      immediate: true
    }
  },
  methods: {
    //菜单点击
    menuSelected(index, indexPath) {
      const type = indexPath[0].split('-')[0]
      this.copyValue = this.geneCode[index] || ''
      this.code = hljs.highlight(type, this.geneCode[index] || '', true).value
    }
  }
}
</script>

<style scoped lang="scss">
.code-preview-container {
  display: flex;
  border: 1px solid #E4E7ED;

  .menu-wrapper {
    width: 220px;
    flex-shrink: 0;
    height: 100%;
    overflow: hidden;

    .el-menu {
      height: 100%;
      overflow-y: scroll;
    }
  }

  .code-wrapper {
    flex: 1;
    height: 100%;
    padding: 5px 0 0 5px;
    position: relative;
    overflow: hidden;

    .el-link {
      position: absolute;
      right: 10px;
      top: 5px;
      visibility: hidden;
      transition: all .3s;
    }

    &:hover .el-link {
      visibility: visible;
    }

    pre {
      height: 100%;
      width: 100%;
      overflow: auto;
      margin: 0;

      .hljs {
        padding: 0;
      }
    }
  }
}
</style>
