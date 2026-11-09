<template>
  <el-row class="container_flex_button" ref="containerFlexBtton">
    <el-col :span="1.5" v-for="item in buttonRow" :key="item.id">
      <template v-if="isShow(item)">
        <el-upload
          v-if="item.buttonCode.indexOf('import') !== -1"
          action="#"
          :http-request="customUpload"
          accept=".xlsx, .xls"
          :show-file-list="false"
          :on-success="uploadOnSuccess"
          :on-error="uploadOnError"
          :headers="uploadHeaders"
          :before-upload="beforeUpload"
          :auto-upload="true"
        >
          <el-button
            class="custom_button"
            :type="item.buttonType"
            plain
            size="mini"
          >
            <icon-svg
              v-if="item.buttonIcon"
              :icon-class="
                item.buttonIcon ? item.buttonIcon : 'Blue-Department'
              "
            />
            <span class="custom_button_text">{{
              i18nData(item, 'button', 'buttonCode', 'buttonName')
            }}</span>
          </el-button>
          <el-tooltip
            class="slotIcon-color"
            placement="top"
            effect="light"
            v-if="iconShow(item.options)"
          >
            <div slot="content" class="slotIcon-color-content">
              <div v-html="iconShow(item.options)"></div>
            </div>
            <i class="el-icon-question"></i>
          </el-tooltip>
        </el-upload>
        <el-dropdown
          v-else-if="item.children && item.children.length"
          @command="
            (command) => newButton(command.buttonCode, command.formId, item)
          "
        >
          <el-button el-button type="primary" class="custom_button">
            <icon-svg
              v-if="item.buttonIcon"
              :icon-class="
                item.buttonIcon ? item.buttonIcon : 'Blue-Department'
              "
              class="icon-State-Waiting"
            />
            <span class="custom_button_text">
              {{ i18nData(item, 'button', 'buttonCode', 'buttonName')
              }}<i class="el-icon--right el-icon-caret-bottom"></i>
            </span>
          </el-button>
          <el-tooltip
            class="slotIcon-color"
            placement="top"
            effect="light"
            v-if="iconShow(item.options)"
          >
            <div slot="content" class="slotIcon-color-content">
              <div v-html="iconShow(item.options)"></div>
            </div>
            <i class="el-icon-question"></i>
          </el-tooltip>
          <el-dropdown-menu slot="dropdown">
            <template v-for="val in item.children">
              <el-dropdown-item
                v-if="isShow(val)"
                :key="val.id"
                style="padding: 0"
              >
                <div
                  style="
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    font-size: 12px;
                  "
                >
                  <el-button
                    size="mini"
                    type="text"
                    @click.stop="
                      (e) => newButton2(e, val.buttonCode, val.formId, val)
                    "
                    :disabled="
                      buttonMode(val.buttonMode) || handleButtonDisabled(val)
                    "
                    style="
                      padding: 10px 15px;
                      box-sizing: border-box;
                      flex: 1;
                      border: none !important;
                    "
                  >
                    <icon-svg
                      v-if="val.buttonIcon"
                      :icon-class="
                        val.buttonIcon ? val.buttonIcon : 'Blue-Department'
                      "
                      class="icon-State-dropdown"
                      :class="{
                        'icon-State-dropdown-disabled':
                          buttonMode(val.buttonMode) ||
                          handleButtonDisabled(val),
                      }"
                    />
                    {{
                      i18nData(val, 'button', 'buttonCode', 'buttonName')
                    }}</el-button
                  >
                  <el-tooltip
                    class="slotIcon-color"
                    placement="top"
                    effect="light"
                    v-if="iconShow(val.options)"
                  >
                    <div slot="content" class="slotIcon-color-content">
                      <div v-html="iconShow(val.options)"></div>
                    </div>
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </div>
              </el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </el-dropdown>
        <template v-else>
          <el-button
            :loading="item.loading"
            :type="item.buttonType"
            plain
            size="mini"
            @click="newButton(item.buttonCode, item.formId, item)"
            :disabled="
              buttonMode(item.buttonMode) || handleButtonDisabled(item)
            "
            class="custom_button"
          >
            <icon-svg
              v-if="item.buttonIcon && !item.loading"
              :icon-class="
                item.buttonIcon ? item.buttonIcon : 'Blue-Department'
              "
            />
            <span class="custom_button_text">{{
              i18nData(item, 'button', 'buttonCode', 'buttonName')
            }}</span>
          </el-button>
          <el-tooltip
            class="slotIcon-color"
            placement="top"
            effect="light"
            v-if="iconShow(item.options)"
          >
            <div slot="content" class="slotIcon-color-content">
              <div v-html="iconShow(item.options)"></div>
            </div>
            <i class="el-icon-question"></i>
          </el-tooltip>
        </template>
      </template>
    </el-col>
    <el-col :span="1.5" key="slot">
      <slot></slot>
    </el-col>
    <el-col :span="1.5" v-if="isDropdown && showDropdown">
      <el-dropdown
        @command="
          (command) => newButton(command.buttonCode, command.formId, command)
        "
      >
        <el-button el-button type="primary" class="custom_button">
          <icon-svg icon-class="State-Waiting" class="icon-State-Waiting" />
          <span class="custom_button_text">
            更多操作<i class="el-icon--right el-icon-caret-bottom"></i>
          </span>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <div class="dropdown-div" v-for="item in buttonRows" :key="item.id">
            <el-dropdown-item
              class="dropdown-item-li"
              :command="item"
              v-if="item.buttonCode.indexOf('import') !== -1"
            >
              <el-upload
                action="#"
                :http-request="customUpload"
                accept=".xlsx, .xls"
                :show-file-list="false"
                :on-success="uploadOnSuccess"
                :on-error="uploadOnError"
                :headers="uploadHeaders"
                :before-upload="beforeUpload"
                :auto-upload="true"
              >
                <icon-svg
                  v-if="item.buttonIcon"
                  :icon-class="
                    item.buttonIcon ? item.buttonIcon : 'Blue-Department'
                  "
                  class="icon-State-dropdown"
                />
                <span class="custom_button_text">{{
                  i18nData(item, 'button', 'buttonCode', 'buttonName')
                }}</span>
              </el-upload>
            </el-dropdown-item>
            <el-dropdown-item
              class="dropdown-item-li"
              v-else-if="isShow(item)"
              :command="item"
              :key="item.id"
              :disabled="
                buttonMode(item.buttonMode) || handleButtonDisabled(item)
              "
            >
              <icon-svg
                v-if="item.buttonIcon"
                :icon-class="
                  item.buttonIcon ? item.buttonIcon : 'Blue-Department'
                "
                class="icon-State-dropdown"
                :class="{
                  'icon-State-dropdown-disabled':
                    buttonMode(item.buttonMode) || handleButtonDisabled(item),
                }"
              />
              <span>{{
                i18nData(item, 'button', 'buttonCode', 'buttonName')
              }}</span>
            </el-dropdown-item>
            <el-tooltip
              class="slotIcon-colorA"
              placement="top"
              effect="light"
              v-if="iconShow(item.options)"
            >
              <div slot="content" class="slotIcon-color-content">
                <div v-html="iconShow(item.options)"></div>
              </div>
              <i class="el-icon-question"></i>
            </el-tooltip>
          </div>
        </el-dropdown-menu>
      </el-dropdown>
    </el-col>
  </el-row>
</template>

<script>
import indexMixin from '../mixins';
import { canShowRollbackButton } from '@/utils/workflow-review'
export default {
  name: "ButtonTop",
  mixins: [indexMixin],
  components: {
    IconSvg: () => import('../iconComponent')
  },
  props: {
    buttonTopData: {
      type: Array,
      default: () => {
        return []
      }
    },
    uploadHeaders: {
      type: Object,
      default: () => {
        return {
          'Authorization': window.localStorage.getItem('TokenKey')
        }
      }
    },
    showDropdown: {
      type: Boolean,
      default: true
    },
    // 非单个禁用
    single: {
      type: Boolean,
      default: true
    },
    // 非多个禁用
    multiple: {
      type: Boolean,
      default: true
    },
    buttonDisable: {
      type: Function,
      default: null
    },
    buttonShow: {
      type: Function,
      default: null
    },
  },
  data () {
    return {
      buttonRow: [],
      buttonRows: [],
      isDropdown: false,
      buttonCode: ''
    }
  },
  watch: {
    buttonTopData: {
      handler: function (val, oldVal) {

        this.buttonF(val);
      }
    }
  },
  mounted () {
    this.buttonF(this.buttonTopData);
  },
  methods: {
    buttonF (val) {
      if (val && val.length) {
        this.isDropdown = false;
        this.buttonRow = val;
        const timer = setTimeout(() => {
          if (!this.showDropdown) {
            return
          }
          const divArr = this.$refs.containerFlexBtton.$el.children;
          const boxW = this.$refs.containerFlexBtton.$el.offsetWidth - 380;
          let divW = 0;
          const index1 = () => {
            for (let i = 0; i < divArr.length; i++) {
              const item = divArr[i];
              divW += item.offsetWidth;
              if (divW > boxW && boxW > 0) {
                this.isDropdown = true;
                return i
              }
            }
          }
          let index = index1();
          if (!!index) {
            index = index - 1;
            this.buttonRow = val.slice(0, index);
            this.buttonRows = val.slice(
              index,
              val.length
            );
          }
          if (timer) {
            clearTimeout(timer)
          }
        })
      }
    },
    newButton (buttonCode, formId, buttonData) {
      const disabled = this.handleButtonDisabled(buttonData)
      if (!disabled) {
        this.buttonCode = buttonCode
        this.$emit('newButton', buttonCode, formId, buttonData)
      }
    },
    newButton2 (e, buttonCode, formId, buttonData) {
      const disabled = this.handleButtonDisabled(buttonData)
      if (!disabled) {
        this.buttonCode = buttonCode
        this.$emit('newButton', buttonCode, formId, buttonData)
      }
    },
    buttonMode (buttonMode) {
      if (buttonMode) {
        return buttonMode === '1' ? this.single : this.multiple
      } else {
        return false
      }
    },
    uploadOnSuccess ({ code, data, message }) {
      this.$emit('uploadOnSuccess', code, data, message)
    },
    uploadOnError (err, file, fileList) {
      this.$emit('uploadOnError', err, file, fileList)
    },
    beforeUpload (file) {
      this.$emit('beforeUpload', file)
    },
    handleButtonDisabled (item) {
      if (this.buttonDisable) {
        return this.buttonDisable(item)
      } else {
        return false
      }
    },
    isShow (item) {
      if (item.buttonCode === 'rollbackToPrevious' && !canShowRollbackButton(this.$route?.query)) {
        return false
      }
      if (this.buttonShow) {
        return this.buttonShow(item)
      }
      return true
    },
    iconShow (options) {
      if (options) {
        const text = JSON.parse(options);
        return text.prompt;
      } else {
        return false;
      }
    },
    customUpload (option) {
      this.$emit('customUpload', option)
    }
  },
  destroyed () {
    if (['save', 'saveSubmit', 'change'].includes(this.buttonCode) && this.$route.meta && !this.$route.meta.noCache) {
      this.$tab.refreshPage(this.$route)
    }
  }
};
</script>

<style lang="scss" scoped>
.custom_button {
  transform: translateY(-1px);
  background: #ffffff !important;
  border-radius: 50px;
  font-size: 12px;
  text-align: center;
  height: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 5px 30px 5px 30px;
  position: relative;
  min-width: 100px;
  margin-right: 6px;
  border: 1px solid #1890ff;
  box-sizing: border-box;
  line-height: 22px;
}

.svg-icon-font {
  float: left;
  margin-right: 3px;
  transform: translateY(-2px);
}

::v-deep.el-button.el-button--primary,
::v-deep.el-button.el-button--success,
::v-deep.el-button.el-button--info,
::v-deep.el-button.el-button--danger,
::v-deep.el-button.el-button--warning {
  color: #1b1e22;

  &:hover,
  &:focus {
    color: #0a7de8;
    border: 1px solid rgba(61, 138, 255, 1);
  }
}

::v-deep.el-button.is-disabled,
::v-deep.el-button.is-disabled:hover {
  border: 1px solid #ffffff;

  .svg-icon-font {
    filter: saturate(0.2);
  }
}

.icon-State-Waiting {
  font-size: 16px;
  transform: translateY(2px);
}

.icon-State-dropdown {
  float: none;
  transform: translate(0px, 2px);
}

.icon-State-dropdown-disabled {
  filter: saturate(0.2);
}

.el-dropdown {
  height: 32px;
}

.el-dropdown-menu--medium {
  border-radius: 10px !important;
  padding: 0 !important;
}

.icon-color {
  color: #227aff;
  font-size: 14px;
  margin-left: -5px;
}

::v-deep .el-dropdown-menu__item {
  width: 100%;
  padding: 0 28px;

  &:nth-child(1) {
    .el-dropdown-menu__item {
      border-top-left-radius: 10px !important;
      border-top-right-radius: 10px !important;
    }
  }

  &:nth-last-child(2) {
    .el-dropdown-menu__item {
      border-bottom-left-radius: 10px !important;
      border-bottom-right-radius: 10px !important;
    }
  }
}

.dropdown-div {
  position: relative;
  min-height: 36px;

  &:nth-child(1) {
    .el-dropdown-menu__item {
      border-top-left-radius: 10px !important;
      border-top-right-radius: 10px !important;
    }
  }

  &:nth-last-child(2) {
    .el-dropdown-menu__item {
      border-bottom-left-radius: 10px !important;
      border-bottom-right-radius: 10px !important;
    }
  }
}

.dropdown-item-li {
  float: left;
}

.slotIcon-color {
  color: #1890ff;
  font-size: 14px;
  margin-right: 10px;
}

.slotIcon-colorA {
  color: #1890ff;
  font-size: 14px;
  line-height: 36px;
  margin-left: 2px;
  position: absolute;
  top: 0;
  right: 8px;
}
</style>
