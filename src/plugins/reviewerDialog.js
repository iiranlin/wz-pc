import Vue from 'vue'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { commitNextAssignee } from '@/api/system/workflow'

const reviewerDialog = async (options) => {
  const businessType = options.type
  const multiple = options.multiple !== undefined ? options.multiple : true
  const needSelectAssignee = !options.needSelectAssignee  // 默认为 true
  console.log(needSelectAssignee,'needSelectAssignee')
  const res = await commitNextAssignee({ businessType })
  
  if (res.data.length > 1 && needSelectAssignee) {
    const Assignee = Vue.extend(activitiAssignee)
    const msg = new Assignee()
    msg.$mount(msg.$el)
    Vue.set(msg,"multiple", multiple);
    msg.init(res.data)
    msg.remove = () => {
      document.body.removeChild(msg.$el)
      msg.$destroy()
    }
    msg.success = (assignee) => {
      options.success(assignee)
    }
  } else {
    let assignee = ''
    if (res.data[0]) {
      assignee = res.data[0].id
    }
    options.success(assignee)
  }
}
export default reviewerDialog