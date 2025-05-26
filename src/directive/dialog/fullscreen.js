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
    if (dialogHeaderEl) {
      dialogHeaderEl.ondblclick = (e) => {
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
        if(vnode.context.$listeners.full) {
          vnode.context.$listeners.full()
        }
       
      }
    }
    if (fullBtnEl) {
      fullBtnEl.onclick = (e) => {
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
        if(vnode.context.$listeners.full) {
          vnode.context.$listeners.full()
        }
      }
    }

  }
};

export default dialogFullScreen