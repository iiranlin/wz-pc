  // 去除控制台无障碍警告
  const removeAriaHidden = {
    bind(el, binding) {
      const ariaEls = el.querySelectorAll('.el-radio__original')
      ariaEls.forEach((item) => {
        item.removeAttribute('aria-hidden')
      })
    }
  }

  export default removeAriaHidden