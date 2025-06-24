# 基础开发平台

## 私服包安装
```
# pdfjs-dist
npm i pdfjs-dist@2.5.208 --registry=https://nexus.rails.cn/repository/npm-internal/
```

## 更新日志

### 2.1.0

#### 发布时间：2023-05-26

#### 更新详情

- 代码生成改版
- 集成工作流服务

### 2.0.1

#### 发布时间：2023-04-11

#### 更新详情

- 对应BASE服务release-2.1.1版本
- 增加系统配置信息接口调用
- 根据配置调整用户退出登录逻辑 (logoutMode：0-退出至系统登录页面 1-根据logoutReturnUrl跳转)
- 相关文件：

    ```
    src/layout/components/Navbar.vue
    src/permission.js
    src/store/modules/user.js
    src/utils/request.js
    src/views/login.vue
    src/views/system/test/index.vue
    src/api/system.js
    ```

### 2.0.0

#### 发布时间：2023-03-21

#### 更新详情：

- 接口请求添加Token过期更换功能，根据后端返回的新Token再次请求业务接口
- 相关文件：
    ```
        src/utils/request.js
    ```
