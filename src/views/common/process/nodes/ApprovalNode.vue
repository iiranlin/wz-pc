<template>
  <node :title="config.name" :show-error="showError" :content="content" :error-info="errorInfo"
        @selected="$emit('selected')" @delNode="$emit('delNode')" @insertNode="type => $emit('insertNode', type)"
        placeholder="请设置审批人" :header-bgc="headerBgc" header-icon="el-icon-s-check"/>
</template>

<script>
import Node from './Node'

export default {
  name: "ApprovalNode",
  props:{
    config:{
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  components: {Node},
  data() {
    return {
      showError: false,
      errorInfo: '',
    }
  },
  computed:{
    headerBgc() {
      if (this.$store.state.process.diagramMode === 'viewer') {
        return this.config.props.headerBgc
      } else {
        return '#ff943e'
      }
    },
    content(){
      const config = this.config.props
      switch (config.assignedType){
        case "ASSIGN_USER":
          if (config.assignedUser.length > 0){
            let texts = []
            config.assignedUser.forEach(org => texts.push(org.name))
            return String(texts).replaceAll(',', '、')
          }else {
            return '请指定审批人'
          }
        case "SELF":
          return '发起人自己'
        case "SELF_SELECT":
          return config.selfSelect.multiple ? '发起人自选多人':'发起人自选一人'
        case "LEADER_TOP":
          return '多级主管依次审批'
        case "LEADER":
          return config.leader.level > 1 ? '发起人的第 ' + config.leader.level + ' 级主管' : '发起人的直接主管'
        case "FORM_USER":
          if (!config.formUser || config.formUser === ''){
            return '表单内联系人（未选择）'
          }else {
            let text = this.getFormItemById(config.formUser)
            if (text && text.title){
              return `表单（${text.title}）内的人员`
            }else {
              return '该表单已被移除😥'
            }
          }
        case "ROLE":
          if (config.role.length > 0){
            // 更改选择系统角色的变动处理 流程增加角色选项
            // return String(config.role).replaceAll(',', '、')
            let texts = ''
            texts = config.role?.[0].roleName
            return texts
          }else {
            return '指定角色（未设置）'
          }
          default: return '未知设置项😥'
      }
    }
  },
  methods: {
    getFormItemById(id){
      return this.$store.state.process.design.formItems.find(item => item.id === id)
    },
    //校验数据配置的合法性
    validate(err){
      try {
        this.showError = !this[`validate_${this.config.props.assignedType}`](err)

        if (this.config.props.nobody.handler === 'TO_USER' && this.config.props.nobody.assignedUser.length === 0) {
          this.errorInfo = '审批人为空时， 转交给指定人员：【请指定一个具体的人】'
          err.push('审批人为空时， 转交给指定人员：【请指定一个具体的人】')
          this.showError = true
        }

        return this.showError
      } catch (e) {
        return true;
      }
    },
    validate_ASSIGN_USER(err){
      if(this.config.props.assignedUser.length > 0){
        return true;
      }else {
        // this.errorInfo = '请指定审批人员'
        // err.push(`${this.config.name} 未指定审批人员`)
        // return false
        return true;
      }
    },
    validate_SELF_SELECT(err){
      return true;
    },
    validate_LEADER_TOP(err){
      return true;
    },
    validate_LEADER(err){
      return true;
    },
    validate_ROLE(err){
      if (this.config.props.role.length <= 0){
        this.errorInfo = '请指定负责审批的系统角色'
        err.push(`${this.config.name} 未指定审批角色`)
        return false
      }
      return true;
    },
    validate_SELF(err){
      return true;
    },
    validate_FORM_USER(err){
     if (this.config.props.formUser === ''){
       this.errorInfo = '请指定表单中的人员组件'
       err.push(`${this.config.name} 审批人为表单中人员，但未指定`)
       return false
     }
      return true;
    },
    validate_REFUSE(err){
      return true;
    },
  }
}
</script>

<style scoped>

</style>
