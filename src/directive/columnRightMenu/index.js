
const handleRowContextmenu = (e, a, b) => {
}
const columnRightMenu = {
    name: 'columnRightMenu',
    bind(el, binding, vnode) {
       
    },

    inserted(el, binding, vnode) {
        const { propsData, listeners, Ctor } = vnode.componentOptions;
        vnode.componentOptions.listeners = {
            ...listeners,
            'row-contextmenu': handleRowContextmenu
        }
    },
    update(el, binding, vnode) {
    },
    unbind(el, binding, vnode) {

    }


}

export default columnRightMenu



