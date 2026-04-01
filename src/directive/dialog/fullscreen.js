const dialogFullScreen = {
  name: 'dialogFullScreen',
  bind(el, binding, vnode, oldVnode) {
    let isFullScreen = false;
    const dialogHeaderEl = el.querySelector('.el-dialog__header');
    const fullBtnEl = el.querySelector('.full-btn');
    const dialogDom = el.querySelector('.el-dialog');
    let nowWidth = 0;
    let nowHight = 0;
    let nowMarginTop = 0;
    const updateFullBtnIcon = () => {
      if (!fullBtnEl) {
        return;
      }
      fullBtnEl.classList.remove('el-icon-plus', 'el-icon-minus');
      fullBtnEl.classList.add(isFullScreen ? 'el-icon-minus' : 'el-icon-plus');
    };
    const emitFullChange = () => {
      const fullListener = vnode.context && vnode.context.$listeners && vnode.context.$listeners.full;
      if (typeof fullListener === 'function') {
        fullListener(isFullScreen);
      }
    };
    const toggleFullScreen = (e) => {
      e.stopPropagation();
      if (isFullScreen == false) {
        el.classList.add('dialogFullScreen')
        nowHight = dialogDom.clientHeight;
        nowWidth = dialogDom.clientWidth;
        nowMarginTop = dialogDom.style.marginTop;
        dialogDom.style.left = 0;
        dialogDom.style.top = 0;
        dialogDom.style.height = "calc(100VH - 0px)";
        dialogDom.style.width = "100VW";
        dialogDom.style.overflow = "hidden";
        isFullScreen = true;
      } else {
        el.classList.remove('dialogFullScreen')
        dialogDom.style.width = nowWidth + 'px';
        dialogDom.style.height = nowHight + 'px';
        dialogDom.style.marginTop = nowMarginTop;
        isFullScreen = false;
      }
      updateFullBtnIcon();
      emitFullChange();
    };
    updateFullBtnIcon();
    if (dialogHeaderEl) {
      dialogHeaderEl.ondblclick = toggleFullScreen;
    }
    if (fullBtnEl) {
      fullBtnEl.onclick = toggleFullScreen;
    }

  }
};

export default dialogFullScreen
