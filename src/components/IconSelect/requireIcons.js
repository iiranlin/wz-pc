import iconfont from '@/assets/icons/iconfont.json'

import menusiconfont from 'blcd-icons/iconfont.json'

const req = require.context('../../assets/icons/svg', true, /\.svg$/)
const requireAll = requireContext => requireContext.keys()

const icons = requireAll(req).map(i => {
    const path = i.split('/')
    return path[path.length - 1].replaceAll(".svg", "")
})
const menusIcons = []

iconfont.glyphs.map(icon => {
    return icons.push(icon.font_class)
})

menusiconfont.glyphs.map(icon => {
    menusIcons.push(icon.font_class)
})

// const duplicates = icons.filter((number, index) => icons.indexOf(number) !== index);
const set = Array.from(new Set(icons))

export default set.sort()
export const mIcons =  Array.from(new Set(menusIcons))