import { Dialog } from 'element-ui'
import i18n from '@/utils/i18n_'
import Vue from 'vue'
let dialogInstance

const dialog = function ({ component, methods, props, componentProps={query: {}} }) {
  
  if (Vue.prototype.$isServer) return
  const dom = document.createElement('div')
  document.body.appendChild(dom)
  
  dialogInstance = new Vue({
    el: dom,
    i18n: i18n,
    data() {
      return {
        showModal: true
      }
    },
    components: {
      Dialog: Dialog,
      Plugin: component
    },
    render(createElement) {
      const plugin = this.showModal ? () => createElement('Plugin', {
        props: {
          ...componentProps,
        },
        on: {
          close: (e) => this.close(e),
          ...methods
        }
      }) : null
      return createElement(
        'Dialog', {
        props: {
          visible: this.showModal,
          ...props
        },
        on: {
          close: (e) => this.close(e)
        },
        scopedSlots: {
          default: plugin
        }
      })
    },
    methods: {
      close() {
        this.showModal = false
        document.body.removeChild(this.$el)
        this.$destroy()
      }
    }
  })
   return dialogInstance
}
export default dialog