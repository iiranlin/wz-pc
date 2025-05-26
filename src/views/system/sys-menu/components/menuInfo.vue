<template>
  <el-form ref="menuForm" :model="form" :rules="rules" label-width="110px">
    <el-row>
      <el-col :span="6">
        <el-form-item label="上级菜单:" prop="parentId">
          <treeselect v-model="form.parentId" @select="handleTreeSelectSelectEvent" :options="menuOptions" :normalizer="normalizer"
                      placeholder="选择上级菜单"
          />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="菜单编号:" prop="menuCode">
          <el-input v-model="form.menuCode" maxlength="200" placeholder="请输入菜单编号"/>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="菜单名称:" prop="menuName">
          <el-input v-model="form.menuName" maxlength="200" placeholder="请输入菜单名称"/>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="菜单图标:" prop="menuIcon">
          <el-popover
            placement="bottom-start"
            width="510"
            trigger="click"
            @show="handleIcon"
          >
            <IconSelect ref="iconSelect" menus @select="handleSelect"/>
            <el-input
              slot="reference"
              v-model="form.menuIcon"
              placeholder="点击选择图标"
            >
              <i slot="prefix">
                <svg-icon v-if="form.menuIcon" :iconFont="true" :icon-class="form.menuIcon"/>
                <!-- <icon-svg v-if="form.menuIcon" :icon-class="form.menuIcon"/>  -->
                <svg-icon v-else icon-class="Line-Search"/>
              </i>
              <!-- <span v-if="form.menuIcon">{{form.menuIcon}}</span>
              <i v-else slot="prefix" class="el-icon-search el-input__icon"/> -->
            </el-input>
          </el-popover>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
        <el-col :span="6">
        <el-form-item label="排序:" prop="seq">
          <el-input-number v-model="form.seq" controls-position="right" :min="1" :max="99"></el-input-number>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="菜单类型:" prop="menuType">
          <el-select v-model="form.menuType" placeholder="请选择菜单类型">
            <el-option v-for="item in menuTypeList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="菜单URL:" prop="menuUrl">
          <el-input v-model="form.menuUrl" maxlength="200" placeholder="请输入URL"/>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="组件地址:" prop="component">
          <el-input v-model="form.component" maxlength="200" placeholder="请输入组件地址"/>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        <el-form-item label="子系统服务:" prop="serviceId">
          <el-select v-model="form.serviceId" placeholder="请选择子系统服务" clearable>
            <el-option v-for="item in serviceList" :key="item.id" :label="item.serviceName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
        <el-col :span="6">
        <el-form-item label="启用:" prop="status">
          <el-switch v-model="form.status" :active-value="0" :inactive-value="1">
          </el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="页面缓存:" prop="isCache">
          <el-switch v-model="form.isCache" :active-value="1" :inactive-value="0">
          </el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="字段权限:" prop="isAcl">
          <el-switch v-model="form.isAcl" :active-value="1" :inactive-value="0">
          </el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="隐藏:" prop="isHide">
          <el-switch v-model="form.isHide" :active-value="1" :inactive-value="0">
          </el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="默认分页条数:" prop="defaultPageSize">
          <el-input-number v-model="form.defaultPageSize" controls-position="right" :min="30" :max="500" placeholder="请输入菜单默认分页条数"/>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import { menuTree, getMaxSeqByParentId } from '@/api/system/menu'
import { serviceDict } from '@/api/system/frontend'
import IconSelect from '@/components/IconSelect'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  components: { IconSelect, Treeselect },
  props: {
    form: {
      type: Object,
      default: () => {
        return {
          'parentId': undefined,
          'menuName': '',
          'menuIcon': 'Menu-Setting',
          'seq': 0,
          'isHide': 0,
          'status': 0,
          'isCache': 1,
          'defaultPageSize': 30,
          'menuType': '1',
          'menuUrl': '',
          'component': '',
          'isAcl': 0,
          'serviceId': ''
        }
      }
    }
  },
  data() {
    return {
      menuTypeList: [
        { label: '内部', value: '1' },
        { label: '外部', value: '2' }
      ],
      menuOptions: [],
      // 表单校验
      rules: {
        menuName: [
          { required: true, message: '菜单名称不能为空', trigger: 'blur' }
        ],
        menuUrl: [
          { required: true, message: '菜单地址不能为空', trigger: 'blur' }
        ]
      },
      serviceList: []
    }
  },
  created() {
    this.getMenuTree()
    this.serviceDict()
  },
  methods: {
    handleTreeSelectSelectEvent (val) {
        this.getMaxSeqByParentId(val.id);
    },
    getMaxSeqByParentId (val = '') {
        const parentId = val || this.form.parentId;
        getMaxSeqByParentId({parentId}).then( ({data}) => {
            this.form.seq = data;
        })
    },
    getMenuTree() {
      menuTree().then(({ data }) => {
        this.menuOptions = data
      })
    },
    serviceDict () {
      serviceDict().then(({ data }) => {
        this.serviceList = data
      })
    },
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.menuName,
        children: node.children
      }
    },
    handleIcon() {
      this.$refs.iconSelect.init()
    },
    handleSelect(name) {
      this.form.menuIcon = name
    }
  }
}
</script>
