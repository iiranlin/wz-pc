<template>
    <div class="navbar">
        <hamburger v-if="sideTheme == 'theme-dark' || sideTheme == 'theme-dark-top'" id="hamburger-container"
            :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
        <breadcrumb id="breadcrumb-container" class="breadcrumb-container"
            v-if="!topNav && (sideTheme == 'theme-dark' || sideTheme == 'theme-dark-top')" />
        <top-nav id="topmenu-container" class="topmenu-container"
            v-if="topNav && (sideTheme == 'theme-dark' || sideTheme == 'theme-dark-top')" />
        <Sidebara class="topmenu-containera" v-if="sideTheme != 'theme-dark' && sideTheme != 'theme-dark-top'" />
        <div class="top-text">{{ testFlag }}</div>
        <div class="right-menu">
            <el-dropdown class="avatar-container right-menu-item hover-effect" style="margin-right: 15px;" @command="i18nCommand">
                <div class="avatar-wrapper">
                    <span>{{ i18nTypeList[$i18n.locale] }}</span>
                    <i class="el-icon-caret-bottom" />
                </div>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="(val, key) in i18nTypeList" :key="key" :command="key">{{ val }}</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
                <div class="avatar-wrapper">
                    <span>{{ username }}</span>
                    <i class="el-icon-caret-bottom" />
                </div>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="setting = true">
                        <span>布局设置</span>
                    </el-dropdown-item>
                    <el-dropdown-item divided @click.native="switchProject">
                        <span>切换项目</span>
                    </el-dropdown-item>
                    <el-dropdown-item divided @click.native="updatePwd">
                        <span>修改密码</span>
                    </el-dropdown-item>
                    <!-- <el-dropdown-item divided @click.native="clearCache">
                        <span>清除缓存</span>
                    </el-dropdown-item> -->
                    <el-dropdown-item divided @click.native="logout">
                        <span>退出登录</span>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <search-bar :root="'#appMainSearch'" :highlightClass="'myHighLight'" :selectedClass="'selected-highlight'" :hiden.sync="showSearchBar"/>
        <div class="top-right-nav">
            <el-link :underline="false" @click="searchClick()"><svg-icon icon-class="search-bar" /> 全局搜索</el-link>
            <el-divider direction="vertical"></el-divider>
            <el-link @click="toHelpDia"><svg-icon icon-class="question" /> 系统帮助</el-link>
            <el-divider direction="vertical"></el-divider>
            <!-- <el-link @click="inspection()">系统巡检</el-link>
            <el-tooltip content="意见反馈" placement="bottom">
                <i class="el-icon-edit-outline" @click="goFeedback()"></i>
            </el-tooltip> -->
            <!-- <el-tooltip content="消息通知" placement="bottom">
                <i class="el-icon-chat-dot-round"></i>
            </el-tooltip> -->
            <!-- <el-divider direction="vertical"></el-divider> -->
            <screenfull id="screenfull" />
            <el-divider direction="vertical"></el-divider>
        </div>
        <update-password ref="updatePassword"></update-password>
        <inspection-info ref="inspectionInfo"></inspection-info>
        <helpDoc ref="helpDoc"></helpDoc>
        <select-project ref="selectProject" :showCancelButton="true"></select-project>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import Sidebara from './Sidebara'
import UpdatePassword from '@/components/UpdatePassword'
import InspectionInfo from '@/views/dashboard/components/inspection-info'
import { systemPassportConfig } from '@/api/system'
import { i18nList } from '@/api/system/i18n'
import helpDoc from './helpDoc'
import { IDB } from '@/utils'
import SelectProject from '@/components/SelectProject'
export default {
    components: {
        Breadcrumb,
        TopNav,
        Hamburger,
        Screenfull,
        SizeSelect,
        Search,
        Sidebara,
        UpdatePassword,
        InspectionInfo,
        helpDoc,
        SelectProject
    },
    computed: {
        ...mapGetters([
            'sidebar',
            'avatar',
            'device',
            'userInfo'
        ]),
        ...mapState({
            sideTheme: state => state.settings.sideTheme
        }),
        setting: {
            get() {
                return this.$store.state.settings.showSettings
            },
            set(val) {
                this.$store.dispatch('settings/changeSetting', {
                    key: 'showSettings',
                    value: val
                })
            }
        },
        topNav: {
            get() {
                return this.$store.state.settings.topNav
            }
        },
        username() {
            return `${this.userInfo.nickName}(${this.userInfo.username})`;
        }
    },
    data() {
        return {
            testFlag: process.env.VUE_APP_TEST_FLAG,
            i18nTypeList: {},
            showSearchBar: true
        }
    },
    created () {
        this.i18nList();
    },
    methods: {
        toggleSideBar() {
            this.$store.dispatch('app/toggleSideBar')
        },
        logout() {
            this.$modal.confirm('确定注销并退出系统吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$store.dispatch('LogOut')
            }).catch(() => {
            })
        },
        /**修改密码*/
        updatePwd() {
            this.$refs.updatePassword.initUpdatePassword(true, false, this.name)
        },
        /**切换项目*/
        switchProject() {
            this.$refs.selectProject.dialogShow = true
            this.$store.commit('SET_SELECT_PROJECT_DIALOG', true)
        },
        goFeedback() {
            systemPassportConfig().then(({ success, data }) => {
                if (success) {
                    const appId = data["appId"];
                    let FEEDBACK_WEB_URL = data["apiUrl"]["FEEDBACK_WEB_URL"]
                    if (!!FEEDBACK_WEB_URL || !!appId) {
                        window.open(`${FEEDBACK_WEB_URL}/feedback/?userUUid=${this.userInfo.username}&appId=${appId}`, "_blank");
                    } else {
                        this.$message.error(`操作失败：该功能未接入`);
                    }
                } else {
                    this.$message.error(`操作失败：请稍后再试或联系管理员`);
                }
            })
        },
        inspection() {
            const userCode = this.userInfo.username;
            this.$refs['inspectionInfo'].init(userCode)
        },
        i18nList () {
            i18nList({ status: 0 }).then(res => {
                const data = res.data;
                let map = {}
                data.forEach(element => {
                    map[element.i18nType] = element.i18nName
                })
                this.i18nTypeList = map
            });
        },
        i18nCommand(command) {
            localStorage.setItem("language", command)
            this.$i18n.locale = command
            window.location.reload()
        },
        // 清除缓存
       async clearCache () {
          this.$modal.loading("正在清除设置缓存并刷新，请稍候...");
          const keys = this.getOtherKeys([], "TokenKey")

          keys.forEach(key => localStorage.removeItem(key))
          await IDB.clearDB()
          setTimeout("window.location.reload()", 1000)
        },
        getOtherKeys(keys = [], TokenKey) {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key !== TokenKey) {
              keys.push(key);
            }
          }
          return keys;
        },
        toHelpDia () {
          this.$refs.helpDoc.init()
        },
        searchClick () {
          this.showSearchBar = !this.showSearchBar
        }
    }
}
</script>

<style lang="scss" scoped>
.navbar {
    height: 48px;
    overflow: hidden;
    position: relative;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

    .top-text {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        color: red;
        font-weight: bold;
        font-size: 18px;
        line-height: 48px;
    }

    .hamburger-container {
        line-height: 48px;
        height: 100%;
        float: left;
        cursor: pointer;
        transition: background .3s;
        -webkit-tap-highlight-color: transparent;

        &:hover {
            background: rgba(0, 0, 0, .025)
        }
    }

    .breadcrumb-container {
        float: left;
    }

    .topmenu-container {
        position: absolute;
        left: 80px;
    }

    .topmenu-containera {
        position: absolute;
        height: 50px;
        left: 22px;
    }

    .errLog-container {
        display: inline-block;
        vertical-align: top;
    }

    .top-right-nav {
        float: right;
        height: 100%;
        line-height: 50px;

        .nav-padding {
            padding: 0 7px;
        }

        i {
            vertical-align: middle;
            font-size: 18px;
        }
    }

    .right-menu {
        float: right;
        height: 100%;
        line-height: 50px;

        &:focus {
            outline: none;
        }

        .right-menu-item {
            display: inline-block;
            padding: 0 8px;
            height: 100%;
            font-size: 14px;
            color: #5a5e66;
            vertical-align: text-bottom;

            &.hover-effect {
                cursor: pointer;
                transition: background .3s;

                &:hover {
                    background: rgba(0, 0, 0, .025)
                }
            }
        }

        .avatar-container {
            margin-right: 30px;

            .avatar-wrapper {
                // margin-top: 5px;
                position: relative;

                .user-avatar {
                    cursor: pointer;
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                }

                .el-icon-caret-bottom {
                    cursor: pointer;
                    position: absolute;
                    right: -20px;
                    top: 19px;
                    font-size: 12px;
                    opacity: .7;
                }
            }
        }
    }
}
.search-bar{
  right: 485px !important;
}
</style>
