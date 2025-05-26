import { menuProperty } from '@/api/system/menu'
import { IDB } from '@/utils'

const deepFields = (arr, dictMap) => {
    for (let i = 0; i < arr.length; i++) {
        const field = arr[i]
        if (Array.isArray(field.children) && !!field.children.length) {
            deepFields(field.children, dictMap)
        } else {
            if (field.fieldType == 'dict') {
                field.fieldFormatArr = dictMap[field.fieldFormat] || [];
            }
        }
    }
}
const menu = {
    state: {
        menuPropertys: {},
    },
    mutations: {
        MENU_PROPERTY: (state, view) => {
            state.menuPropertys = view
        },
    },
    actions: {
        async menuProperty({ commit }, id) {
            return new Promise(async (resolve, reject) => {
                try {
                    // let data = await IDB.getObjectStore('menuProperty',id)
                    // if(!data) {
                     const data = (await menuProperty(id)).data
                        // await IDB.setObjectStore('menuProperty',id, data)
                    // }
                    data.defaultPageSize = Number(data.defaultPageSize) || 30
                    deepFields(data.search, data.dictMap)
                    deepFields(data.fields, data.dictMap)
                    commit('MENU_PROPERTY', data);
                    resolve(data)
                } catch (err) {
                    reject(err)
                }

            })
        },
    }
}

export default menu
