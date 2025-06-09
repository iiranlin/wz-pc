<template>
  <!-- 添加或修改部门对话框 -->
  <Dialog :title="title" :visible.sync="openDataScope" :close-on-click-modal="false" width="700px" append-to-body >
    <el-form ref="elForm" :model="form" :rules="rules" label-width="85px">
        <el-row>
            <el-form-item label="所属部门:" prop="deptId">
                <treeselect v-model="form.deptId" :options="deptOptions" :normalizer="normalizer" @input="inputTreeselect"
                @open="handleOpen" @select="selectTreeselect" placeholder="选择所属部门" />
            </el-form-item>
        </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="用户账号:" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户账号" maxlength="20" :disabled="title === '修改用户'" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户名称:" prop="nickName">
            <el-input v-model="form.nickName" placeholder="请输入用户名称" maxlength="20" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="联系方式:" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入联系方式" maxlength="11" @input="(v)=>(form.phone=v.replace(/[^\d]/g,''))"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="电子邮箱:" prop="email">
            <el-input v-model="form.email" placeholder="请输入电子邮箱" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
            <el-form-item label="排序:" prop="sort">
                <el-input-number v-model="form.sort" controls-position="right" :min="1" :max="9999"></el-input-number>
            </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio v-for="dict in dict.type.enableStauts" :key="dict.value" :label="parseInt(dict.value)">{{ dict.label}}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- <el-row>
        <el-col :span="12">
          <el-form-item label="数据权限:" prop="rank">
            <el-select ref="upSelect0" v-model="form.rank" filterable placeholder="请选择所属级别" style="width: 100%"
              @change="handleRank">
              <el-option v-for="item in rankList" :key="item.code" :label="item.name" :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row> -->
      <el-row>
        <el-col :span="24" v-if="form.rank == 4">
          <el-form-item label="权限范围:" prop="deptIds">
            <div class="custom-box">
              <el-tree ref="tree" :data="customOptions" show-checkbox node-key="id" :props="defaultProps"
                @check="handleCustom"></el-tree>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="type == 'create' ? submitDataScope() : userModify()">确 定</el-button>
      <el-button @click="openDataScope = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import { userCreate, userDetail, userModify } from '@/api/system/user'
import { deptTree, getDeptTreeByIdForRank } from '@/api/system/dept'
import { getListByParentCode } from '@/api/system/dict'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name:"operate",
  dicts: ['enableStauts'],
  components: {Treeselect},
  data() {
    var validateUsername = (rule, value, callback) => {
      let reg = /^[\da-z]+$/i
      if (value == '') {
        callback(new Error('用户账号不能为空'))
      } else if (!reg.test(value)) {
        callback(new Error('用户账号只能是字母或数字'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      title: '新增用户',
      type: 'add',
      id: '',
      openDataScope: false,
      deptOptions: [],
      typeSelectDepart: false,
      // 所有等级
      allRankList: [],
      rankList: [],
      form: {
        username: '',
        nickName: '',
        deptId: undefined,
        status: 0,
        rank: '1',
        deptIds: [],
        sort: 1,
        flag: 1,
        phone: '',
        email: '',
      },
      // 表单校验
      rules: {
        username: [
          { required: true, validator: validateUsername, trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '用户名称不能为空', trigger: 'blur' },
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              let reg = /\S/
              if (!reg.test(value)) {
                callback(
                  new Error(
                    '用户名称不能为空'
                  )
                )
              } else {
                callback()
              }
            }
          }
        ],
        phone: [
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              let reg = /^1(3|4|5|6|7|8|9)\d{9}$/
              if(value){
                if (!reg.test(value)) {
                  callback(
                    new Error(
                      '联系电话格式错误'
                    )
                  )
                } else {
                  callback()
                }
              } else {
                callback()
              }
            }
          }
        ],
        email: [
            {
                trigger: 'blur',
                validator: (rule, value, callback) => {
                    let reg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/
                    if (value) {
                        if (!reg.test(value)) {
                            callback(
                                new Error(
                                    '电子邮箱格式错误'
                                )
                            )
                        } else {
                            callback()
                        }
                    } else {
                        callback()
                    }
                }
            }
        ],
        deptId: [
          { required: true, message: '所属部门不能为空', trigger: 'input' }
        ],
        // rank: [
        //   { required: true, message: '所属级别不能为空', trigger: 'change' }
        // ],
      },
      iteratorChildren: [],
      typeDeptId: false,
      customOptions: [],
      defaultProps: {
        children: 'children',
        label: 'deptName'
      },
      deptId: '',
      unitParentId: '',
      flagOption: [
        { code: 0, name: '统一' },
        { code: 1, name: '自建' }
      ]
    }
  },
  watch: {
    // 'form.username': {
    //   handler: function (newUsername) {
    //     this.form.username = newUsername.toLocaleUpperCase();
    //   }
    // }
  },
  created() {
    this.deptTree()
    this.getUserRankList()
  },
  watch: {
    'deptOptions': {
      handler: function (newFields) {
        this.selectDepartData(JSON.parse(JSON.stringify(newFields)))
      }
    },
  },
  methods: {
    deptTree() {
      deptTree().then(({ data }) => {
        this.deptOptions = data
        this.selectDepartData(this.deptOptions)
      })
    },
    /** 提交按钮（数据权限） */
    init(type, id) {
      this.type = type
      this.id = id
      this.openDataScope = true
      this.$nextTick(() => {
        this.$refs.elForm.resetFields()
        if (type === 'update') {
          this.title = '修改用户'
          this.userDetail(id)
        } else {
          this.title = '新增用户'
          this.typeDeptId = false
          this.form.rank = '1'
          if (!!id) {
            // 所选部门ID
            this.form.deptId = id
          }
        }
      })
    },
    /** 转换用户数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: `【${node.deptCode}】`+node.deptName,
        children: node.children
      }
    },
    inputTreeselect(value, instanceId) {
      if (value === '09900001') {
        this.typeSelectDepart = true
      } else {
        this.typeSelectDepart = false
        this.selectDepartData1(this.iteratorChildren, value)
      }
      if (!this.typeSelectDepart) {
        let list = [].concat(...this.allRankList)
        let delIndex = 0
        list.forEach((item, index) => {
          if (item.name === '院级') {
            delIndex = index
          }
        })
        list.splice(delIndex, 1)
        this.rankList = list
      } else {
        this.rankList = this.allRankList
      }
      if (this.typeDeptId) {
        this.$refs.elForm.validateField('deptId')
      }
      this.typeDeptId = true
    },
    selectTreeselect() {
      this.form.rank = ''
    },
    handleOpen() {
      // for (let i = 0; i < 2; i++) {
      //   this.$refs['upSelect' + i].blur()
      // }
      this.$refs['upSelect0'].blur()
    },
    selectDepartData1(iteratorChildren, value) {
      for (const iterator of iteratorChildren) {
        if (iterator.id == value) {
          this.typeSelectDepart = true
        }
        if (iterator.children && iterator.children.length > 0) {
          this.selectDepartData1(iterator.children, value)
        }
      }
    },
    selectDepartData(deptOptions) {
      for (const iterator of deptOptions) {
        if (iterator.children && iterator.children.length > 0) {
          if (iterator.id == '09900001') {
            this.iteratorChildren = iterator.children
            return false
          }
          this.selectDepartData(iterator.children)
        }
      }
    },
    userDetail(id) {
      userDetail(id).then(({ data }) => {
        this.form = data
        this.form.deptId = data.deptId || undefined
        this.form.flag = data.flag == undefined ? 1 : data.flag
        this.form.rank = '1'
        this.$nextTick(async () => {
          if (this.form.rank == 4) {
            await this.initCustom()
            this.initCheckedKeys()
          }
        })
      })
    },
    submitDataScope() {
      this.$refs['elForm'].validate(valid => {
        if (valid) {
          if (this.form.rank == '4') {
            if (this.form.deptIds.length) {
              this.create()
            } else {
              this.$modal.msgError('权限范围至少选择一个！')
            }
          } else {
            this.create()
          }
        }
      })
    },
    create() {
        this.loading = true
        userCreate({...this.form,rank:'1'}).then(({ success, message }) => {
            this.loading = false
            if (success) {
                this.$modal.msgSuccess(message)
                this.openDataScope = false
                this.$emit('operateSuccess')
            } else {
                this.$modal.msgError(message)
            }
        })
    },
    userModify() {
      this.$refs['elForm'].validate(valid => {
        if (valid) {
          if (this.form.rank == '4') {
            if (this.form.deptIds.length) {
              this.modify()
            } else {
              this.$modal.msgError('权限范围至少选择一个！')
            }
          } else {
            this.modify()
          }
        }
      })
    },
    modify() {
        this.loading = true
        userModify(Object.assign({rank:'1'}, this.form, { id: this.id })).then(({ success, message }) => {
            this.loading = false
            if (success) {
                this.$modal.msgSuccess(message)
                this.openDataScope = false
                this.$emit('operateSuccess')
            } else {
                this.$modal.msgError(message)
            }
        })
    },
    getUserRankList() {
      getListByParentCode('userRank').then(({ data }) => {
        this.allRankList = data
      })
    },
    handleRank(rank) {
      this.form.deptIds = []
      if (rank == 4) {
        this.initCustom()
      }
    },
    initCustom() {
      return new Promise((resolve) => {
        getDeptTreeByIdForRank({ id: this.form.deptId}).then(({ data }) => {
          this.customOptions = data
          resolve(true)
        })
      })
    },
    handleCustom(row, data) {
      let ids = []
      data.checkedNodes.map(item=>{
        if(!item.children || !item.children.length){
          ids.push(item.id)
        }
      })
      this.form.deptIds = ids
    },
    initCheckedKeys() {
      let checkedArr = []
      this.customOptions.forEach(item => {
        if (this.form.deptIds.indexOf(item.id) > -1) {
          checkedArr.push(item.id)
        }
        this.selectInitChild(item, checkedArr)
      })
      this.form.deptIds = checkedArr
      this.$refs.tree.setCheckedKeys(checkedArr);
    },
    selectInitChild(item, checkedArr) {
      if (item.children && item.children.length > 0) {
        item.children.forEach(childItem => {
          if (this.form.deptIds.indexOf(childItem.id) > -1) {
            checkedArr.push(childItem.id)
          }
          this.selectInitChild(childItem, checkedArr)
        })
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.custom-box {
  width: 400px;
  height: 260px;
  border: 1px #e5e6e7 solid;
}

.custom-box ::v-deep .el-tree {
  margin-top: 6px;
  max-height: 250px;
  overflow-y: scroll;
}

.custom-box ::v-deep .el-tree::-webkit-scrollbar {
  display: none;
}
</style>
