
// 鼠标按下
function mousedownFunc(event, vnode, { list = [], index = 0, prop = '' }, parentDom) {
    event && event.stopPropagation();
    event && event.preventDefault();
    if(!list.length) {
        return
    }
    vnode.context._COLUMN_FORMAT_FLAG = true
    vnode.context._COLUMN_FORMAT_VALUE = list[index][prop]
    vnode.context._COLUMN_FORMAT_INDEX = index
    
    parentDom.classList.add("column_format_bg")
}
// 鼠标松开
function mouseupFunc(event, vnode, data, parentDom) {
    event && event.stopPropagation();
    event && event.preventDefault();
    vnode.context._COLUMN_FORMAT_FLAG = false
    const els = document.getElementsByClassName('column_format_bg')
    for (let i = 0; i < els.length; i++) {
        els[i].classList.remove("column_format_bg")
    }

}
// 鼠标移入
function mouseEnterFunc(event, vnode, { list = [], index = 0, prop = '' }, parentDom) {
    event && event.stopPropagation();
    event && event.preventDefault();
    if(!list.length) {
        return
    }

    if (vnode.context._COLUMN_FORMAT_FLAG) {
        list[index][prop] = vnode.context._COLUMN_FORMAT_VALUE
        parentDom.classList.add("column_format_bg")
        const fun = vnode.componentOptions.listeners.change || vnode.componentOptions.listeners.select  || vnode.componentOptions.listeners.input
        fun(vnode.context._COLUMN_FORMAT_VALUE, vnode.context._COLUMN_FORMAT_INDEX)
    }

}
// 鼠标移出
function mouseOverFunc(event, vnode, data, parentDom) {
    event && event.stopPropagation();
    event && event.preventDefault();
}
const columnFormat = {
    name: 'columnFormat',
    bind(el, binding, vnode) {
    },

    inserted(el, binding, vnode) {
       
        if(!binding.value || !Array.isArray(binding.value.list) || !binding.value.list.length) {
            return
        }
        vnode.context._COLUMN_FORMAT_FLAG = false
        el.style.width = `calc(100% - 30px)`;
        el.style.position = `relative`;
        const iconDom = `<i class="el-icon-brush" title="长按鼠标左键拖动开始复制" />`
        const box = document.createElement('div')
        box.style.boxSizing = 'border-box'
        box.style.padding = '3px'
        box.style.cursor = 'pointer'
        box.style.display = 'inline-flex'
        box.style.position = 'absolute'
        box.style.right = '-24px'
        box.style.top = '50%'
        box.style.justifyContent = 'center'
        box.style.alignItems = 'center'
        box.style.flexDirection = 'row'
        box.style.transform = 'translateY(-50%)'
        const parentTdDom = el.closest('td')
        box.innerHTML = iconDom
        box.addEventListener('mousedown', (event) => mousedownFunc(event, vnode, binding.value, parentTdDom), false)
        window.addEventListener('mouseup', (event) => mouseupFunc(event, vnode, binding.value, parentTdDom), false)
        parentTdDom.addEventListener('mouseenter', (event) => mouseEnterFunc(event, vnode, binding.value, parentTdDom), false)
        parentTdDom.addEventListener('mouseover', (event) => mouseOverFunc(event, vnode, binding.value, parentTdDom), false)
        el.append(box)
    },
    update(el, binding, vnode) {
    },
    unbind(el, binding, vnode) {
        // box.removeEventListener('mousedown', mousedownFunc)
        window.removeEventListener('mouseup', mouseupFunc)
        vnode.context._COLUMN_FORMAT_FLAG = false
        vnode.context._COLUMN_FORMAT_VALUE = undefined
        vnode.context._COLUMN_FORMAT_INDEX = undefined
        delete binding.value

    }


}

export default columnFormat



