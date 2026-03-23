import { parseTime } from './publicMethods'
import * as menuConfig from './menu'
import * as tools from './util'
import * as db from './db'
import { IDB } from './db'
export {
    menuConfig,
    tools,
    db,
    IDB
}


/**
 * 表格时间格式化
 */
export function formatDate(cellValue) {
    if (cellValue == null || cellValue == "") return "";
    var date = new Date(cellValue)
    var year = date.getFullYear()
    var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
    var hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
    var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
    var seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
}

/**
 * @param {number} time
 * @param {string} optiong
 * @returns {string}
 */
export function formatTime(time, option) {
    if (('' + time).length === 10) {
        time = parseInt(time) * 1000
    } else {
        time = +time
    }
    const d = new Date(time)
    const now = Date.now()

    const diff = (now - d) / 1000

    if (diff < 30) {
        return '刚刚'
    } else if (diff < 3600) {
        // less 1 hour
        return Math.ceil(diff / 60) + '分钟前'
    } else if (diff < 3600 * 24) {
        return Math.ceil(diff / 3600) + '小时前'
    } else if (diff < 3600 * 24 * 2) {
        return '1天前'
    }
    if (option) {
        return parseTime(time, option)
    } else {
        return (
            d.getMonth() +
            1 +
            '月' +
            d.getDate() +
            '日' +
            d.getHours() +
            '时' +
            d.getMinutes() +
            '分'
        )
    }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function getQueryObject(url) {
    url = url == null ? window.location.href : url
    const search = url.substring(url.lastIndexOf('?') + 1)
    const obj = {}
    const reg = /([^?&=]+)=([^?&=]*)/g
    search.replace(reg, (rs, $1, $2) => {
        const name = decodeURIComponent($1)
        let val = decodeURIComponent($2)
        val = String(val)
        obj[name] = val
        return rs
    })
    return obj
}

/**
 * @param {string} input value
 * @returns {number} output value
 */
export function byteLength(str) {
    // returns the byte length of an utf8 string
    let s = str.length
    for (var i = str.length - 1; i >= 0; i--) {
        const code = str.charCodeAt(i)
        if (code > 0x7f && code <= 0x7ff) s++
        else if (code > 0x7ff && code <= 0xffff) s += 2
        if (code >= 0xDC00 && code <= 0xDFFF) i--
    }
    return s
}

/**
 * @param {Array} actual
 * @returns {Array}
 */
export function cleanArray(actual) {
    const newArray = []
    for (let i = 0; i < actual.length; i++) {
        if (actual[i]) {
            newArray.push(actual[i])
        }
    }
    return newArray
}

/**
 * @param {Object} json
 * @returns {Array}
 */
export function param(json) {
    if (!json) return ''
    return cleanArray(
        Object.keys(json).map(key => {
            if (json[key] === undefined) return ''
            return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
        })
    ).join('&')
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
    const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
    if (!search) {
        return {}
    }
    const obj = {}
    const searchArr = search.split('&')
    searchArr.forEach(v => {
        const index = v.indexOf('=')
        if (index !== -1) {
            const name = v.substring(0, index)
            const val = v.substring(index + 1, v.length)
            obj[name] = val
        }
    })
    return obj
}

/**
 * @param {string} val
 * @returns {string}
 */
export function html2Text(val) {
    const div = document.createElement('div')
    div.innerHTML = val
    return div.textContent || div.innerText
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
export function objectMerge(target, source) {
    if (typeof target !== 'object') {
        target = {}
    }
    if (Array.isArray(source)) {
        return source.slice()
    }
    Object.keys(source).forEach(property => {
        const sourceProperty = source[property]
        if (typeof sourceProperty === 'object') {
            target[property] = objectMerge(target[property], sourceProperty)
        } else {
            target[property] = sourceProperty
        }
    })
    return target
}

/**
 * @param {HTMLElement} element
 * @param {string} className
 */
export function toggleClass(element, className) {
    if (!element || !className) {
        return
    }
    let classString = element.className
    const nameIndex = classString.indexOf(className)
    if (nameIndex === -1) {
        classString += '' + className
    } else {
        classString =
            classString.substr(0, nameIndex) +
            classString.substr(nameIndex + className.length)
    }
    element.className = classString
}

/**
 * @param {string} type
 * @returns {Date}
 */
export function getTime(type) {
    if (type === 'start') {
        return new Date().getTime() - 3600 * 1000 * 24 * 90
    } else {
        return new Date(new Date().toDateString())
    }
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
    let timeout, args, context, timestamp, result

    const later = function () {
        // 据上一次触发时间间隔
        const last = +new Date() - timestamp

        // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
        if (last < wait && last > 0) {
            timeout = setTimeout(later, wait - last)
        } else {
            timeout = null
            // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
            if (!immediate) {
                result = func.apply(context, args)
                if (!timeout) context = args = null
            }
        }
    }

    return function (...args) {
        context = this
        timestamp = +new Date()
        const callNow = immediate && !timeout
        // 如果延时不存在，重新设定延时
        if (!timeout) timeout = setTimeout(later, wait)
        if (callNow) {
            result = func.apply(context, args)
            context = args = null
        }

        return result
    }
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
    if (!source && typeof source !== 'object') {
        throw new Error('error arguments', 'deepClone')
    }
    const targetObj = source.constructor === Array ? [] : {}
    Object.keys(source).forEach(keys => {
        if (source[keys] && typeof source[keys] === 'object') {
            targetObj[keys] = deepClone(source[keys])
        } else {
            targetObj[keys] = source[keys]
        }
    })
    return targetObj
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr) {
    return Array.from(new Set(arr))
}

/**
 * @param {Array, String} arr
 * @returns {Array}
 */
export function uniqueArrByField(arr, field) {
    if (!Array.isArray(arr) || !arr.length || !field) {
        return []
    }
    const keyObj = {}
    for (let i = 0; i < arr.length; i++) {
        const value = arr[i][field]
        keyObj[value] = ''
    }
    return Object.keys(keyObj)
}

/**
 * @returns {string}
 */
export function createUniqueString() {
    const timestamp = +new Date() + ''
    const randomNum = parseInt((1 + Math.random()) * 65536) + ''
    return (+(randomNum + timestamp)).toString(32)
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
    return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(ele, cls) {
    if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(ele, cls) {
    if (hasClass(ele, cls)) {
        const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
        ele.className = ele.className.replace(reg, ' ')
    }
}

export function makeMap(str, expectsLowerCase) {
    const map = Object.create(null)
    const list = str.split(',')
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true
    }
    return expectsLowerCase
        ? val => map[val.toLowerCase()]
        : val => map[val]
}

export const exportDefault = 'export default '

export const beautifierConf = {
    html: {
        indent_size: '2',
        indent_char: ' ',
        max_preserve_newlines: '-1',
        preserve_newlines: false,
        keep_array_indentation: false,
        break_chained_methods: false,
        indent_scripts: 'separate',
        brace_style: 'end-expand',
        space_before_conditional: true,
        unescape_strings: false,
        jslint_happy: false,
        end_with_newline: true,
        wrap_line_length: '110',
        indent_inner_html: true,
        comma_first: false,
        e4x: true,
        indent_empty_lines: true
    },
    js: {
        indent_size: '2',
        indent_char: ' ',
        max_preserve_newlines: '-1',
        preserve_newlines: false,
        keep_array_indentation: false,
        break_chained_methods: false,
        indent_scripts: 'normal',
        brace_style: 'end-expand',
        space_before_conditional: true,
        unescape_strings: false,
        jslint_happy: true,
        end_with_newline: true,
        wrap_line_length: '110',
        indent_inner_html: true,
        comma_first: false,
        e4x: true,
        indent_empty_lines: true
    }
}

// 首字母大小
export function titleCase(str) {
    return str.replace(/( |^)[a-z]/g, L => L.toUpperCase())
}

// 下划转驼峰
export function camelCase(str) {
    return str.replace(/_[a-z]/g, str1 => str1.substr(-1).toUpperCase())
}

// 驼峰转下划线
export function hump2Underline(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

export function isNumberStr(str) {
    return /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(str)
}

/**
 * 生成UUID
 * @param len 生成长度
 * @param radix 基数
 * @returns {string} 生成结果
 */
export function generateUUID(len, radix) {
    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    let uuid = [], i;
    radix = radix || chars.length;
    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        // rfc4122, version 4 form
        let r;
        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
}

/**
 * 计算小数运算，目前只支持加减
 * @param num1 数字1,可以小数
 * @param num2 数字2,可以小数
 * @param type 加 add,减subtract,默认加 add
 * @returns {number} 结果
 */
export function calFloat(num1, num2, type = 'add') {
    let r1, r2, m
    try {
        r1 = num1.toString().split('.')[1].length
    } catch (e) {
        r1 = 0
    }
    try {
        r2 = num2.toString().split('.')[1].length
    } catch (e) {
        r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2))
    if (type === 'add') {
        return Math.round(num1 * m + num2 * m) / m
    } else if (type === 'subtract') {
        return Math.round(num1 * m - num2 * m) / m
    }
}


/**
 * 规范数字输入,整数位默认8,小数位2
 * @param obj 表单项或绑定的对象
 * @param key 对象的属性名
 * @param intLimit 整数位限制,默认为8
 */
export function handleNumberLimit(obj, key, intLimit = 8) {
    // 先把非数字的都替换掉，除了数字和 .
    obj[key] = obj[key].replace(/[^\d.]/g, '')
    // 保证只有出现一个 . 而没有多个 .
    obj[key] = obj[key].replace(/\.{2,}/g, '.')
    // 必须保证第一个为数字而不是 .
    obj[key] = obj[key].replace(/^\./g, '')
    // 保证 . 只出现一次，而不能出现两次以上
    obj[key] = obj[key]
        .replace('.', '$#$')
        .replace(/\./g, '')
        .replace('$#$', '.')
    // 只能输入 2 位小数
    obj[key] = obj[key].replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
    // 动态生成整数位限制正则
    let intReg = new RegExp(`^\\D*(\\d{0,${intLimit}}(?:\\.\\d{0,2})?).*$`, 'g')
    obj[key] = obj[key].replace(intReg, '$1')
}

export function sleep(timer = 1500) {
    return new Promise((resolve) => {
        const t = setTimeout(() => {
            clearTimeout(t)
            resolve()
        }, timer)
    }
    )
}

/**
 * 
 * @param {*} arr 目标数据
 * @param {*} field 子节点属性
 * @param {*} expand 待追加得数据
 * @returns 
 */
export const deepTreeAddField = (arr, field = 'children', expand = { uid: '' }) => arr.map(item => {
    const { uid, ...other } = expand
    if (Array.isArray(item.rawList) && !!item.rawList.length) {
        item.rawList = item.rawList.map(raw => ({ ...raw }))
    }
    return {
        ...item,
        ...other,

        uid: generateUUID(),
        [field]: item[field] ? deepTreeAddField(item[field], field, expand) : []
    }
})

export const treeFind = (tree, func) => {
    for (const data of tree) {
        if (func(data)) return data
        if (data.children) {
            const res = treeFind(data.children, func)
            if (res) return res
        }
    }
    return null
}

export function stringParseObj(str = '', options = {}) {
    return new Promise((resolve) => {
        try {
            const obj = JSON.parse(str)
            resolve(obj)
        } catch (err) {
            resolve(options)
        }
    }
    )
}

export const treeProps = (list = [], prop = 'children', source = 'children') => {
    for (const data of list) {
        if (Array.isArray(data[source]) && data[source].length) {
            treeProps(data[source], prop, source)
            data[prop] = data[source]
            data['hasChildren'] = true
            delete data[source]
        }

    }
    return null
}

export const treeAddProps = (list = [], prop = 'children') => {
    for (const data of list) {
        if (Array.isArray(data[prop]) && data[prop].length) {
            treeAddProps(data[prop], prop)
            data['expandedRow'] = false
        }else {
            data['expandedRow'] = true
        }

    }
    return null
}

export const disabledFieldTree = (arr) => arr.map(item => {
    if (Array.isArray(item.children) && !!item.children.length) {
        item.disabled = true
    }
    return {
        ...item,
        children: Array.isArray(item.children) && !!item.children.length ? disabledFieldTree(item['children']) : []
    }
})

export const getRouteByInsource = (source = '') => {
    if (!source) {
        return ''
    }
    return {
        1: 'purchaseOrderOperate', // 采购入库
        2: 'salesReturnOperate', // 销退单
        3: 'createTransferOutOrder', // 调拨单
        4: 'lendReturnOrder', // 归还单
        5: 'productionOrderOperate', // 产品入库-完工报告 有问题
        6: 'productionOrderOperate', // 产品入库-生产订单
        7: 'productionRejectedOperate', // 生产退料单
        99: '', // 其它
    }[source]
}

export const getRouteByOutsource = (source = '') => {
    if (!source) {
        return ''
    }
    return {
        1: 'materialApplicationOperate', // 维修出库
        2: 'createTransferOutOrder', // 调拨出库
        3: 'scrapHandleOperate', // 报废出库
        4: 'saleShipmentMaintainOperate', // 销售出库
        5: 'createLendOrder', // 借出出库
        6: 'materialApplicationOperate', // 用料申请出库
        7: 'productionOrderOperate', // 领料出库
        8: 'purchaseReturnOperate', // 退供出库
        9: 'productionReceiveOperate', // 生产领料
    }[source]

}
export const getRouteByDemandPlanSourceType = (source = '') => {
    if (!source) {
        return ''
    }
    return {
        1: 'saleOrderOperate', // 销售订单
        2: '', // 调拨出库
        3: 'selfResearchDemandOperate', // 自研需求
    }[source]

}

export const flattenArr = (arr) => {
    return arr.reduce((result, item) => {
        return result.concat(item, Array.isArray(item.children) ? flattenColumn(item.children) : []);
    }, []);
};

export const flattenColumn = (arr) => {
    return flattenArr(arr).filter(item => !item.children.length);
};


export const flattenList = (arr, prop = 'children') => {
    return arr.reduce((result, item) => {
        return result.concat(item, Array.isArray(item[prop]) ? flattenList(item[prop], prop) : []);
    }, []);
};

export const flattenChildList = (arr, prop) => {
    return flattenList(arr).filter(item => !item[prop].length);
};

export const updateTreePropValue = (nodes, field, obj, prop, childProp) => {
    if (Array.isArray(nodes)) {
        for (let node of nodes) {
            updateTreePropValue(node, field, obj, prop, childProp); 
        }
    } else {
        if (nodes[field] !== undefined) {
            nodes[field] = obj[nodes[prop]];
        }
        if (nodes[childProp] && nodes[childProp].length > 0) {
            updateTreePropValue(nodes[childProp], field, obj, prop, childProp);
        }
    }
}

export const formatAmount = (value, decimalPlaces = 0) => {
    let config = {}
    if(decimalPlaces) {
        config = {
            minimumFractionDigits: decimalPlaces, // 保留的小数位数
            maximumFractionDigits: decimalPlaces
        }
    }

    if (!isNaN(value) && value !== '') {
        value = parseFloat(value);
         const val = value.toLocaleString('en-US', {
            style: 'decimal', // 格式化为数字
            ...config
        });
       return val
    } else {
        // 如果值无效，显示原始值或空
       return value || '';
    }
}

// 递归获取指定的属性值
export const collectField = (data, field) => {
    return data.reduce((acc, item) => {
      return acc.concat(
        item[field],
        item.children ? collectField(item.children, field) : []
      );
    }, []);
}
  

/**
 * 提取树形结构下所有 children 节点，构造成 Element UI Select 的数据源格式
 * @param {Object} node - 树形结构的根节点
 * @returns {Array} - [{ label, value }] 格式数组
 */
export function extractSelectOptions(node) {
  if (!node || !Array.isArray(node.children)) return [];

  const transform = (children) => {
    return children.map(child => {
      const option = {
        label: child.deptName,
        value: child.id
      };

      if (child.children && child.children.length > 0) {
        option.children = transform(child.children);
      }

      return option;
    });
  };

  return transform(node.children);
}

/**
 * 
 * @param {*} data 数组 
 * @param {*} targetBusinessType  目标业务类型
 * 51物资代理机构给供应商提供的需求计划表
 * 54需求计划表附件
 * @returns  目标业务类型的数组
 */
export function findByBusinessType(data, targetBusinessType) {
  // 找到第一个外层对象，内部 fileList 中包含目标 businessType
  const found = data.find(outer =>
    outer.fileList?.some(inner => inner.businessType === targetBusinessType)
  );

  // 如果找到就返回外层对象，否则返回空数组
  return found?.fileList || [];
}

/**
 * 递归设置菜单的 isHide
 * 如果一个节点的所有子节点都是隐藏的，则该节点也标记为隐藏
 * @param {Array} menus 菜单数组
 * @returns {Array} 修改后的菜单数组
 */
export function updateMenuHideStatus(menus) {
  return menus.map(menu => {
    // 如果有子菜单，递归处理
    if (menu.children && menu.children.length > 0) {
      menu.children = updateMenuHideStatus(menu.children)

      // 检查所有子节点的 isHide 是否都为 1
      const allChildrenHidden = menu.children.every(child => child.isHide === 1)

      // 若全部隐藏，则父级也隐藏
      if (allChildrenHidden) {
        menu.isHide = 1
      }
    }

    return menu
  })
}


/**
 * 通过 menuUrl 查找对应菜单项
 * @param {Array} menus - 菜单树数组
 * @param {string} menuUrl - 要查找的菜单 URL
 * @returns {Object|null} 匹配到的菜单项或 null
 */
export function findMenuByUrl(menus, menuUrl) {
  for (const item of menus) {
    // 当前节点匹配
    if (item.menuUrl === menuUrl) {
      return item
    }

    // 如果有 children 继续递归
    if (Array.isArray(item.children) && item.children.length > 0) {
      const found = findMenuByUrl(item.children, menuUrl)
      if (found) return found
    }
  }

  // 没有找到返回 null
  return null
}