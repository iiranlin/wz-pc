import Vue from 'vue'
import DataDict from '@/utils/dict'
import {getListByParentCode} from "@/api/system/dict";

function install() {
  Vue.use(DataDict, {
    metas: {
      '*': {
        labelField: 'dictLabel',
        valueField: 'dictValue',
        request(dictMeta) {
          return getListByParentCode(dictMeta.type).then(res => res.data)
        },
      },
    },
  })
}

export default {
  install,
}
