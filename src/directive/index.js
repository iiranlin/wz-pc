import dialogDrag from './dialog/drag'
import dialogDragWidth from './dialog/dragWidth'
import dialogDragHeight from './dialog/dragHeight'
import dialogFullScreen from './dialog/fullscreen'
import clipboard from './module/clipboard'
import lottieLoading from './loading/loading'
import numberInput from './numberInput'
import removeAriaHidden from './removeAriaHidden'
import columnFormat from './columnFormat'
import columnRightMenu from './columnRightMenu'
import thousandSeparator from './thousandSeparator'
import preventReClick from './preventReClick'
const install = function(Vue) {
  Vue.directive('clipboard', clipboard)
  Vue.directive('dialogDrag', dialogDrag)
  Vue.directive('dialogDragWidth', dialogDragWidth)
  Vue.directive('dialogDragHeight', dialogDragHeight)
  Vue.directive('lottieLoading', lottieLoading)
  Vue.directive('numberInput',numberInput)
  Vue.directive('removeAriaHidden',removeAriaHidden)
  Vue.directive('columnFormat',columnFormat)
  Vue.directive('columnRightMenu',columnRightMenu)
  Vue.directive('dialogFullScreen',dialogFullScreen)
  Vue.directive('thousandSeparator',thousandSeparator)
  Vue.directive('preventReClick',preventReClick)
  
}

if (window.Vue) {
  Vue.use(install); // eslint-disable-line
}

export default install
