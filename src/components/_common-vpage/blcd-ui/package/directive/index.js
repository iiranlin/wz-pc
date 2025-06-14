import lottieLoading from './loading/loading'
const install = function(Vue) {
  Vue.directive('lottieLoading', lottieLoading)
}

if (window.Vue) {
  Vue.use(install); // eslint-disable-line
}

export default install
