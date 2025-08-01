<template>
    <div class="login-container">
      <div class="top-bar">
        <div class="top-content">
          <div class="logo"></div>
          <div class="user-list">
              <ul>
                <li v-for="(item,index ) in menuList" :key="index">
                  <el-dropdown trigger="click" v-if="item.option" >
                      <span class="el-dropdown-link" v-if="item.title=='用户'">
                       <img :src="item.icon" /><span>{{ username }}</span>
                      </span>
                       <span class="el-dropdown-link" v-else>
                        <img :src="item.icon" />{{ item.title }}
                      </span>
                      <el-dropdown-menu slot="dropdown"  class="custom-dropdown-menu" v-if="item.title=='用户'">
                        <el-dropdown-item @click.native="updatePwd">{{item.option[0].name}}</el-dropdown-item>
                        <el-dropdown-item @click.native="logout">{{item.option[1].name}}</el-dropdown-item>
                      </el-dropdown-menu>
                      <el-dropdown-menu slot="dropdown"  class="custom-dropdown-menu" v-else>
                        <el-dropdown-item @click.native="getToMenu(ops.path)" v-for="(ops,opsIndex) in item.option" :key="opsIndex">{{ops.name}}</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                    <div v-else class="el-dropdown-other">
                      <span>
                        <img :src="item.icon" />{{ item.title }}
                      </span>
                    </div>
                </li>
              </ul>
          </div>
        </div>
      </div>
      <div class="login-banner">
        <h1>物资管理解决方案</h1>
        <!-- <video :src="logoBg" width="1920" height="600" autoplay="autoplay" loop="loop" muted="true"></video> -->
        <img :src="logoBg1" alt="" width="100%" height="400px">
      </div>
      <div class="login-list">
        <div class="list-content">
          <ul>
            <li class="li-fisrt">
            </li>
            <li  class="li-second" @click="loginIndex">
            </li>
            <li  class="li-there">
            </li>
            <li  class="li-four">
            </li>
          </ul>
        </div>
      </div>
      <div class="information">
        <div class="list">
          <ul>
            <li class="list-li" @click="handleWaitClick('audit')">
              <span class="list-li-bg"></span>
              <span class="list-li-title">待审核：</span>
              <span class="list-li-value">{{ taskNum.auditNum || 0 }}</span>
            </li>
             <li class="list-li" @click="handleWaitClick('handle')">
              <span class="list-li-bg"></span>
              <span class="list-li-title">待处理：</span>
              <span class="list-li-value">{{ taskNum.handleNum || 0 }}</span>
            </li>
            <li class="list-li" @click="handleWaitClick('toBeDeal')">
              <span class="list-li-bg"></span>
              <span class="list-li-title">已审核：</span>
              <span class="list-li-value">{{ taskNum.auditedNum || 0 }}</span>
            </li>
             <li class="list-li" @click="handleWaitClick('todoList')">
              <span class="list-li-bg"></span>
              <span class="list-li-title">我的发起：</span>
              <span class="list-li-value">{{ taskNum.launchNum || 0 }}</span>
            </li>
          </ul>
        </div>
        <div class="content">
          <div class="message-center">
            <div class="message-title">
              <div class="left-title">
                <span class="left-title-bg"></span>
                <span class="left-title-text">消息中心</span>
              </div>
              <div class="right-title"  @click="handleNoticeMore()">
                <span>更多<i class="el-icon-arrow-right"></i></span>
              </div>
            </div>
            <div class="message-list">
              <ul>
                <li v-for="(item,index) in messageList" :key="index">
                  <span class="list-span1">{{item.list}}</span>
                  <span class="list-span2">{{item.time}}</span>
                </li>
              </ul>
            </div>
          </div>
          <div class="notice-announcement">
            <div class="message-title">
              <div class="left-title">
                <span class="left-title-bg"></span>
                <span class="left-title-text">通知公告</span>
              </div>
              <div class="right-title" @click="getNotic">
                <span>更多<i class="el-icon-arrow-right"></i></span>
              </div>
            </div>
            <div class="message-list">
              <ul>
                <li v-for="(item,index) in noticeList" :key="index">
                  <span class="list-span1">{{item.noticeTitle}}</span>
                  <span class="list-span2">{{ parseTime(item.updateTime, '{y}-{m}-{d}')}}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="footer">技术支持：中国铁道科学研究院集团有限公司电子计算技术研究所</div>
      <update-password ref="updatePassword"></update-password>
    </div>
</template>

<script>
import logoBg from '../assets/login/Banner.mp4';
import logoBg1 from '../assets/login/BannerMask@2x.webp';
import { getCookie, setCookie, removeCookie } from "@/utils/auth";
import { getVerificationCode, autoLogin } from "@/api/login";
import { generateUUID } from "@/utils";
import UpdatePassword from "@/components/UpdatePassword";
import logo1 from "@/assets/login/IconFavor@2x.png";
import logo2 from "@/assets/login/Icon(2)@2x.webp";
import logo3 from "@/assets/login/Icon(3)@2x.webp";
import logo4 from "@/assets/login/Icon(4)@2x.webp";

import loginTitle from '../assets/login/Login Title@2x.webp';
import { setToken } from "@/utils/auth";
import { mapGetters, mapState } from 'vuex'
import { wfTodoCount } from "@/api/system/workflow";
import { getUserMenu } from '@/api/system/menu'
import { noticePage } from "@/api/system/notice";

export default {
    name: "Login",
    components: {
      UpdatePassword,
    },
    data() {
        return {
           logoBg,
           logoBg1,
           logo1,
           logo2,
           logo3,
           logo4,
           loginTitle,
          menuList:[
              {title:"用户",icon:logo4,option:[
                {name:"修改密码",value:"update"},
                {name:"退出登录",value:"out"}
              ]},
              {title:"帮助",icon:logo3},
              // {title:"通讯录",icon:logo2},
              {title:"常用菜单",icon:logo1,option:[]
              },
            ],
            messageList:[
              {list:"您有一条用料需求计划需要审核，请及时处理",time:"2025-06-26"},
              {list:"您有一条入库单需要审核，请及时处理",time:"2025-06-26"},
              {list:"您有一条用料需求计划需要审核，请及时处理",time:"2025-06-26"},
              {list:"您有一条入库单需要审核，请及时处理",time:"2025-06-26"},
              {list:"您有一条用料需求计划需要审核，请及时处理",time:"2025-06-26"},
              {list:"您有一条入库单需要审核，请及时处理",time:"2025-06-26"},
              {list:"您有一条用料需求计划需要审核，请及时处理",time:"2025-06-26"},
              {list:"您有一条入库单需要审核，请及时处理",time:"2025-06-26"},
            ],
            noticeList:[
              {list:"关于物资管理信息系统建设推进会的通知",time:"2025-06-26"},
              {list:"关于物资管理情况通报优化工作的征求意见通知",time:"2025-06-26"},
              {list:"关于物资管理信息系统建设推进会的通知",time:"2025-06-26"},
              {list:"关于物资管理情况通报优化工作的征求意见通知",time:"2025-06-26"},
              {list:"关于物资管理信息系统建设推进会的通知",time:"2025-06-26"},
              {list:"关于物资管理情况通报优化工作的征求意见通知",time:"2025-06-26"},
              {list:"关于物资管理信息系统建设推进会的通知",time:"2025-06-26"},
              {list:"关于物资管理情况通报优化工作的征求意见通知",time:"2025-06-26"},
            ],
             //待办数量对象
            taskNum: {},
            // 动态路由
            menuOptions:[],

        };
    },
    computed:{
      ...mapGetters([
        'userInfo'
      ]),
      username() {
          return `${this.userInfo.nickName}(${this.userInfo.username})`;
      }
    },
    watch: {


    },
    created() {
      this.getAllTaskNumByUser()
      this.getUserMenu()
      this.getList()
       
    },
    mounted() {

    },
    methods: {
      /**修改密码*/
      updatePwd() {
          this.$refs.updatePassword.initUpdatePassword(true, false, this.name)
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
      getToMenu(name){
        if(name){
          this.$router.push({ name })
        }
      },
      loginIndex(){
        let route = { path: '/' }
        this.$router
            .push(route)
            .catch(() => { });
      },
        //获取待办数量
      getAllTaskNumByUser() {
          // const loading = this.$loading(this.$c.loadingCommonOptions);

          wfTodoCount().then((res) => {
              if (res.success) {
                  this.taskNum = res.data;
              } else {
                  this.$modal.msgError(res.message);
              }
          }).catch((err) => {

          }).finally(() => {
              // loading?.close();
          })
      },
      handleWaitClick(name) {
          if(name){
              this.$router.push({ name })
          }
      },
      //通知消息点击更多
      handleNoticeMore() {
        console.log("更多消息通知")
          // this.$router.push({
          //     name: 'myMessage',
          //     query: {

          //     },
          // })
      },
       getUserMenu() {
        getUserMenu().then(({ data }) => {
          let that =  this
          this.menuOptions = data;
          this.menuOptions.forEach(item=>{
            if(item.children.length){
              item.children.forEach(child=>{
                 if(child.menuName=='合同列表'||child.menuName=='用料需求管理'||child.menuName=='供应需求列表'
                      ||child.menuName=='收货列表'||child.menuName=='入库列表'||child.menuName=='需求库存'||child.menuName=='出库列表'){
                  that.menuList.find(mu=>mu.title=='常用菜单').option.push(
                      {name:child.menuName,path:child.menuUrl}
                    )
                 }
              })
            }
          })
        });
      },
      getList() {
        noticePage({pageNum:1,pageSize:8}).then(
            ({ data }) => {
                this.noticeList = data.list;
            }
          );
      },
      getNotic(){
        let name= this.menuOptions.find(item=>item.menuName=='系统管理').children.find(child=>child.menuName=='通知公告').menuUrl
        this.$router.push({ name })
      }
    },
    beforeDestroy() {
      
    }
};
</script>

<style lang="scss" scoped>
* {
		padding: 0;
		margin: 0;
	}
	body {
		overflow-x: hidden;
		background-color: #fff;
		font-family: "Microsoft YaHei", "Pingfang SC", "Hiragino Sans GB", "Helvetica", "Droid Sans", "Arial", "sans-serif";
	}
	ul, li {
		list-style: none;
	}
  .custom-dropdown-menu{
    background: #fff;
    text-align: center;
    top: 62px !important;
    border: none;
    .el-dropdown-menu__item{
       padding: 0 20px;
    }
  }

.imgVerification{
  vertical-align: middle;
  height: 36px;
  top: -3px;
  position: relative;
}
.login-container{
  .top-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 74px;
    line-height: 74px;
    background-image: linear-gradient(180deg, #f5faff 0%, rgba(245, 250, 255, 0) 100%);
    background: #fff;
    z-index: 4;
    .top-content{
      margin: 0 auto;
      width: 1220px;
      height: 74px;
      .logo{
        float: left;
        margin-top: 10px;
        width: 222px;
        height: 66px;
        background: url(../assets/login/Logo.png) no-repeat left top;
        background-size: contain;
      }
      .user-list{
        float:right;
        width: 600px;
        height:66px;
        ul{
          width: 100%;
          li{
          float: right;
          margin-left: 27px;
          margin-top: 16px;
          .el-dropdown-link{
            font-family:Microsoft YaHei;
            color:#0e183b;
            img{
              width: 20px;
              height: 20px;
              vertical-align: middle;
              margin-top: -3px;
            }
          }
          .el-dropdown-link:hover{
              cursor: pointer;;
            }
          .el-dropdown-other{
            img{
              width: 20px;
              height: 20px;
              vertical-align: middle;
            }
            span{
              font-family:Microsoft YaHei;
              color:#0e183b;
              font-size:14px;
            }
            span:hover{
              cursor: pointer;;
            }
          }
        }
        } 
      }
    }
  }
  .login-banner{
    position: relative;
    width: 100%;
    height: 400px;
    background: #F5FAFF;
    overflow: hidden;
    margin-top: 74px;
    &::before {
      content: "";
      position: absolute;
      left: 50%;
      transform: translateX(-960px);
      width: 75px;
      height: 100%;
      background-image: linear-gradient(270deg, rgba(245, 250, 255, 0) 0%, #f5fafe 100%);
      z-index: 2;
    }
     &::after {
      content: "";
      position: absolute;
      right: 50%;
      transform: translateX(960px);
      width: 75px;
      height: 100%;
      background-image: linear-gradient(-270deg, rgba(245, 250, 255, 0) 0%, #f5fafe 100%);
      z-index: 2;
    }
    h1{
      position: absolute;
      text-align: center;
      width: 1150px;
      height: 400px;
      z-index: 3;
      top: 0px;
      left: 50%;
      padding: 0 0.5em;
      transform: translateX(-48%);
      font-size: 52px;
      line-height: 999px;
      color: #0F2241;
      overflow: hidden;
      background: url(../assets/login/Title.png) no-repeat center top;
      background-size: contain;
    }
    .banner-login-btn{
      position: absolute;
      top: 376px;
      left: 50%;
      width: 168px;
      height: 44px;
      background: #2B53FF;
      border-radius: 4px;
      line-height: 44px;
      transform: translateX(-50%);
      z-index: 3;
      color: #fff;
      text-align: center;
      text-decoration: none;
      transition: all 0.2s ease-in-out 0s;
      cursor: pointer;
    }
    video{
      position: absolute;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      display: block;
      margin: 0 auto;
    }
  }
  .login-list{
    width: 100%;
    height: 126px;
    background:#ffffff;
    .list-content{
      width: 1220px;
      height: 126px;
      margin: 0 auto;
      ul {
        height: 126px;
        li{
          width:290px;
          height:98px;
          border-radius:5px;
          float: left;
          margin: 14px 14px 14px 0px;
        }
        li:hover{
          cursor: pointer;
        }
        .li-fisrt{
          background: url(../assets/login/A@2x.png) no-repeat;
          background-size:cover ;
        }
        .li-second{
          background: url(../assets/login/B@2x.png) no-repeat;
          background-size:cover ;
        }
        .li-there{
          background: url(../assets/login/C@2x.png) no-repeat;
          background-size:cover ;
        }
         .li-four{
          background: url(../assets/login/D@2x.png) no-repeat;
          background-size:cover ;
        }
      }
    }
  }
  .information{
    width: 100%;
    height: 578px;
    background:#f4f4f4;
    overflow: hidden;
    .list{
      width:1220px;
      height: 110px;
      margin: 0 auto;
    
      
      margin-top: 14px;
      ul{
        padding: 13px 38px;
        height: 110px;
        position: absolute;
        background:#ffffff;
        border-radius:7px;
        width: 1200px;
        .list-li{
          float: left;
          width: 260px;
          height: 84px;
          border-right: 1px solid #f2f2f2;
          margin-right: 28px;
          display: flex;
          align-items: center;
          padding-left: 16px;
          span{
            display: inline-block;
          }
          .list-li-bg{
            width:54px;
            height:54px;
            margin-right: 16px;
          }
          .list-li-title{
            width:65px;
            line-height:normal;
            font-family:PingFang SC;
            font-weight:600;
            color:#3e3e3e;
            font-size:16px;
          }
          .list-li-value{
            width:23px;
            line-height:normal;
            font-family:LcdD;
            color:#3a7be3;
            font-size:44px;
          }

        }
        .list-li:hover {
            cursor: pointer;
            .list-li-bg {
                transform: scale(1.1);
            }
        }
        .list-li:nth-child(1){
          .list-li-bg{
            background-image: url('../assets/login/Icon(3)@2x.png');
            background-size: cover;
          }
          
        }
        .list-li:nth-child(2){
           .list-li-bg{
            background-image: url('../assets/login/Icon(2)@2x.png');
            background-size: cover;
          }
        }
        .list-li:nth-child(3){
           .list-li-bg{
            background-image: url('../assets/login/Icon(1)@2x.png');
            background-size: cover;
          }
          
          
        }
        .list-li:nth-child(4){
           border-right: none;
           margin-right: 0px;
          .list-li-bg{
            background-image: url('../assets/login/Icon@2x.png');
            background-size: cover;
          }
          .list-li-title{
            width:85px;
          }
        }
        
      }
    }
    .content{
      height: 360px;
      width: 1220px;
      margin: 0 auto;
      display: flex;
      margin-top: 14px;
      .message-center{
        width:590px;
        height:360px;
        background:#ffffff;
        border-radius:7px;
        margin-right: 20px;
        padding: 10px;
        .message-title{
          display: flex;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 1px solid #f4f4f4;
          .left-title{
            .left-title-bg{
              display: inline-block;
              width: 24px;
              height: 24px;
              background-image: url('../assets/login/Icon@2x.webp');
              background-size:cover ;
              vertical-align: middle;
              margin-left: 5px;
              margin-left: 3px;
              margin-right: 10px;
            }
            .left-title-text{
              width:66px;
              line-height:normal;
              font-family:PingFang SC;
              color:#0e142f;
              font-size:16px;
              vertical-align: middle;
              
            }
          }
          .right-title{
            line-height: 24px;
            span{
              opacity:50%;
              width:25px;
              height:17px;
              line-height:normal;
              font-family:PingFang SC;
              color:#0e142f;
              font-size:12px;
            }
            span:hover{
              cursor: pointer;
            }
          }
        }
        .message-list{
          padding:5px 20px 20px 20px;
          ul li{
            display: flex;
            justify-content: space-between;
            padding-top: 15px;
            .list-span1{
              width:410px;
              height:20px;
              line-height:normal;
              font-family:PingFang SC;
              color:#0e142f;
              font-size:14px;
              white-space: nowrap; /* 防止文本换行 */
              overflow: hidden; /* 隐藏溢出的内容 */
              text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
            }
            .list-span1:hover{
              cursor: pointer;
              color: #2B53FF;
            }
            .list-span2{
                opacity:50%;
                width:78px;
                height:17px;
                line-height:normal;
                font-family:PingFang SC;
                color:#0e142f;
                font-size:12px;
                text-align: right;
            }
          }
        }
      }
      .notice-announcement{
        width:590px;
        height:360px;
        background:#ffffff;
        border-radius:7px;
        margin-right: 20px;
        padding: 10px;
        .message-title{
          display: flex;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 1px solid #f4f4f4;
          .left-title{
            .left-title-bg{
              display: inline-block;
              width: 24px;
              height: 24px;
              background-image: url('../assets/login/Icon(1)@2x.webp');
              background-size:cover ;
              vertical-align: middle;
              margin-left: 5px;
              margin-left: 3px;
              margin-right: 10px;
            }
            .left-title-text{
              width:66px;
              line-height:normal;
              font-family:PingFang SC;
              color:#0e142f;
              font-size:16px;
              vertical-align: middle;
              
            }
          }
          .right-title{
            line-height: 24px;
            span{
              opacity:50%;
              width:25px;
              height:17px;
              line-height:normal;
              font-family:PingFang SC;
              color:#0e142f;
              font-size:12px;
            }
            span:hover{
              cursor: pointer;
            }
          }
        }
        .message-list{
          padding:5px 20px 20px 20px;
          ul li{
            display: flex;
            justify-content: space-between;
            padding-top: 15px;
            .list-span1{
              width:410px;
              height:20px;
              line-height:normal;
              font-family:PingFang SC;
              color:#0e142f;
              font-size:14px;
              white-space: nowrap; /* 防止文本换行 */
              overflow: hidden; /* 隐藏溢出的内容 */
              text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
            }
            .list-span1:hover{
              cursor: pointer;
              color: #2B53FF;
            }
            .list-span2{
                opacity:50%;
                width:78px;
                height:17px;
                line-height:normal;
                font-family:PingFang SC;
                color:#0e142f;
                font-size:12px;
                text-align: right;
            }
          }
        }
      }
    }
  }
	.footer {
		width: 100%;
    height: 46px;
		background-color: #fff;
		text-align: center;
    line-height:46px;
    font-family:PingFang SC;
    color:#394962;
    font-size:14px;

	}

	@media screen and (max-width:1440px) {
		#Banner {
			height: 500px;
		}
		#Banner video {
			width: 1600px;
			height: 500px;
			z-index: 1;
		}
		#Banner h1 {
			top: 180px;
			font-size: 48px;
			line-height: 67px;
		}
		#Banner h2 {
			top: 256px;
			font-size: 16px;
			line-height: 22px;
		}
		.bannerlogin {
			top: 316px;
		}
		.features video {
			transform: translateX(-90px);
		}
	}
  ::v-deep.custom-label .el-form-item__label {
    display: block; /* 使标签独占一行 */
    width: 100%;
    text-align: left;
  }
  .hz-form .el-form-item{
    margin-bottom:10px;
    ::v-deep.el-form-item__content{
      .img-code{
        display: inline-block;
        width: 130px;
        height: 40px;
        text-align: center;
        border:1px solid #DCDFE6;
        border-radius:5px;
        vertical-align:middle;
        margin-left: 7px;
      }
    }
  }
  ::v-deep.el-input .el-input__prefix{
    top: 5px;
 
  }
  ::v-deep.el-form-item .el-form-item__content{
    .el-input--prefix  .el-input__inner{
      padding-left: 35px;
     }
  }
  
  .btn{
    margin-top: 32px;
    .btn-el{
      width:308px;
      height:46px;
      border-radius:4px;
      background:#1e38c4;
      span{
        color: #fff;
      }
    }
  }
 
}
</style>
