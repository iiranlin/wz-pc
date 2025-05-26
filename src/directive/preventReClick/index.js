
const preventReClick = {
  inserted(el, binding, vnode) {
    el.addEventListener('click', () => {
      if (!el.disabled) {
        el.disabled = true
        setTimeout(() => {
          el.disabled = false
        }, binding.value || 500)
      }
    })
  }
}
export default preventReClick