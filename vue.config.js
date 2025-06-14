'use strict'
const path = require('path')
const versionUpdatePlugin = require("./src/utils/versionUpdatePlugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
function resolve(dir) {
    return path.join(__dirname, dir)
}

const CompressionPlugin = require('compression-webpack-plugin')

const name = process.env.VUE_APP_TITLE // 网页标题

const port = process.env.port || process.env.npm_config_port || 7890 // 端口
let timeStamp = new Date().getTime();
// vue.config.js 配置说明
//官方vue.config.js 参考文档 https://cli.vuejs.org/zh/config/#css-loaderoptions
// 这里只列一部分，具体配置参考文档
module.exports = {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，Vue CLI 会假设你的应用是被部署在一个域名的根路径上
    publicPath: process.env.NODE_ENV === "development" ? "/" : "/",
    // 在npm run build 或 yarn build 时 ，生成文件的目录名称（要和baseUrl的生产环境路径一致）（默认dist）
    outputDir: 'dist',
    // 用于放置生成的静态资源 (js、css、img、fonts) 的；（项目打包之后，静态资源会放在这个文件夹下）
    assetsDir: 'static',
    // 是否开启eslint保存检测，有效值：ture | false | 'error'
    lintOnSave: process.env.NODE_ENV === 'development',
    // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
    productionSourceMap: false,
    // webpack-dev-server 相关配置
    devServer: {
        // host: '0.0.0.0',
        port: port,
        open: false,
        overlay: {
            warnings: false,
            errors: true
        },
        proxy: {
            // [`/api${process.env.VUE_APP_PRODMGR_FA}`]: {
            //     target: `http://10.59.248.208:8014`, // 本地联调  将ip换成对应后端同事的ip  并且注释掉【业务开发环境】开发代理
            //     changeOrigin: true,
            //     pathRewrite: {
            //         ["^/api" + process.env.VUE_APP_PRODMGR_FA]: "",
            //     },
            // },
            // [`/api${process.env.VUE_APP_PRODMGR_INV}`]: {
            //     target: `http://10.59.248.229:8013`, // 本地联调  将ip换成对应后端同事的ip  并且注释掉【业务开发环境】开发代理
            //     changeOrigin: true,
            //     pathRewrite: {
            //         ["^/api" + process.env.VUE_APP_PRODMGR_INV]: "",
            //     },
            // },
            // [`/api${process.env.VUE_APP_WORK_FLOW_SERVER}`]: {
            //     target: `http://10.59.249.68:9002`, // 本地联调  将ip换成对应后端同事的ip  并且注释掉【业务开发环境】开发代理
            //     changeOrigin: true,
            //     pathRewrite: {
            //         ["^/api" + process.env.VUE_APP_WORK_FLOW_SERVER]: "",
            //     },
            // },
            // [`/api${process.env.VUE_APP_PRODMGR_PU}`]: {
            //     target: `http://10.59.248.143:8012`, // 本地联调  将ip换成对应后端同事的ip  并且注释掉【业务开发环境】开发代理
            //     changeOrigin: true,
            //     pathRewrite: {
            //         ["^/api" + process.env.VUE_APP_PRODMGR_PU]: "",
            //     },
            // },
            // [`/api${process.env.VUE_APP_PRODMGR_MM}`]: {
            //     target: `http://10.59.248.113:8011`, // 本地联调  将ip换成对应后端同事的ip  并且注释掉【业务开发环境】开发代理
            //     changeOrigin: true,
            //     pathRewrite: {
            //         ["^/api" + process.env.VUE_APP_PRODMGR_MM]: "",
            //     },
            // },



            // [`/api${process.env.VUE_APP_PRODMGR_SA}`]: {
            //     target: `http://10.59.248.143:8010`, // 本地联调  将ip换成对应后端同事的ip  并且注释掉【业务开发环境】开发代理
            //     changeOrigin: true,
            //     pathRewrite: {
            //         ["^/api" + process.env.VUE_APP_PRODMGR_SA]: "",
            //     },
            // },
            // detail: https://cli.vuejs.org/config/#devserver-proxy
            //  [`/api${process.env.VUE_APP_PRODMGR_INV}`]: {
            //     target: `http://10.59.248.167:8013`, // 本地联调  将ip换成对应后端同事的ip  并且注释掉【业务开发环境】开发代理
            //     changeOrigin: true,
            //     pathRewrite: {
            //         ["^/api" + process.env.VUE_APP_PRODMGR_INV]: "",
            //     },
            // },
            [process.env.VUE_APP_BASE_API]: {
                // target: `https://test-prodm.rails.cn/api/`,
                target: `http://192.168.117.1:8000/`,
                changeOrigin: true,
                pathRewrite: {
                    ['^' + process.env.VUE_APP_BASE_API]: ''
                }
            },
            // ['/text']: {
            //     target: 'http://192.168.82.213:9082/', // 设备管理后端服务的地址
            //     changeOrigin: true,
            //     pathRewrite: {
            //         ['^/text']: ''
            //     }
            // },
        },
        disableHostCheck: true
    },
    css: {
        loaderOptions: {
            sass: {
                sassOptions: { outputStyle: "expanded" },
            }
        }
    },
    configureWebpack: {
        name: name,
        resolve: {
            alias: {
            '@': resolve('src'),
            'public': resolve('public'),
            'blcd-ui': resolve("src/components/_common-vpage/blcd-ui")
            }
        },
        plugins: [
            new CompressionPlugin({
                cache: false,                   // 不启用缓存
                test: /\.(js|css|html)?$/i,     // 压缩文件格式
                filename: '[path].gz[query]',   // 压缩后的文件名
                algorithm: 'gzip',              // 使用gzip压缩
                // minRatio: 0.8,
                threshold: 10240,
                // deleteOriginalAssets: true                   // 压缩率小于1才会压缩
            }),
            new versionUpdatePlugin({
                version: timeStamp,
            })
        ],
    },
    chainWebpack(config) {
        config.plugins.delete('preload') // TODO: need test
        config.plugins.delete('prefetch') // TODO: need test

        // set svg-sprite-loader
        config.module
            .rule('svg')
            .exclude.add(resolve('src/assets/icons'))
            .end()
        config.module
            .rule('icons')
            .test(/\.svg$/)
            .include.add(resolve('src/assets/icons'))
            .end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({
                symbolId: 'Icon-[name]'
            })
            .end()
        config
            .when(process.env.ANALYZER == 'true', config => {
                config.plugin('webpack-bundle-analyzer').use(BundleAnalyzerPlugin)
            })
        config
            .when(process.env.NODE_ENV !== 'development',
                config => {

                    config.plugin('define').tap(args => {
                        args[0]['process.env'].VUE_APP_VERSION = `${timeStamp}`;
                        return args
                    });

                    config
                        .plugin('ScriptExtHtmlWebpackPlugin')
                        .after('html')
                        .use('script-ext-html-webpack-plugin', [{
                            // `runtime` must same as runtimeChunk name. default is `runtime`
                            inline: /runtime\..*\.js$/
                        }])
                        .end()
                    config
                        .optimization.splitChunks({
                            chunks: 'all',
                            cacheGroups: {
                                libs: {
                                    name: 'chunk-libs',
                                    test: /[\\/]node_modules[\\/]/,
                                    priority: 10,
                                    chunks: 'initial' // only package third parties that are initially dependent
                                },
                                elementUI: {
                                    name: 'chunk-elementUI', // split elementUI into a single package
                                    priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                                    test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                                },
                                commons: {
                                    name: 'chunk-commons',
                                    test: resolve('src/components'), // can customize your rules
                                    minChunks: 3, //  minimum common number
                                    priority: 5,
                                    reuseExistingChunk: true
                                }
                            }
                        })
                    config.optimization.runtimeChunk('single'),
                    {
                        from: path.resolve(__dirname, './public/robots.txt'), //防爬虫文件
                        to: './' //到根目录下
                    }
                }
            )
    }
}
