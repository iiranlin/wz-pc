<template>
	<div v-if="!item.hidden" :class="{'item_hidden_box': (!typeBlock && (item.alwaysShow || firstOrder) && (item.path.split('/').length == 2 || item.path.split('/') == '')) || item.redirect == 'index'}">
		<!-- !onlyOneChild.children -->
    	<template v-if="!(item.meta && item.meta.menuType == '2')">
			<template
				v-if="hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren)&&!item.alwaysShow">
				<template>
					<app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path, onlyOneChild.query)">
						<el-menu-item :index="resolvePath(onlyOneChild.path)">
							<item :icon="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)" :title="$t(onlyOneChild.meta.menuCode && `menu.${onlyOneChild.meta.menuCode}`) || onlyOneChild.meta.title" />
						</el-menu-item>
					</app-link>
				</template>
			</template>
			<el-submenu v-else ref="subMenu" :index="resolvePath(item.path)" popper-append-to-body class="item_hidden_menu">
				<template slot="title">
					<item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="$t(item.meta.menuCode && `menu.${item.meta.menuCode}`) || item.meta.title" />
				</template>
				<sidebar-item v-for="child in item.children" :key="child.path + '-' +child.meta.id" :is-nest="true" :item="child"
					:base-path="resolvePath(child.path)"/>
			</el-submenu>
		</template>
		<template v-else>
			<template v-if="hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren)&&!item.alwaysShow">
				<template>
					<el-menu-item :index="resolvePath(onlyOneChild.path)" @click="openWidow(item.meta.componentUrl)">
						<item :icon="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)" :title="$t(onlyOneChild.meta.menuCode && `menu.${onlyOneChild.meta.menuCode}`) || onlyOneChild.meta.title" />
					</el-menu-item>
				</template>
			</template>
		</template>
	</div>
</template>

<script>
	import path from "path";
	import { isExternal } from "@/utils/validate";
	import Item from "./Item";
	import AppLink from "./Link";
	import FixiOSBug from "./FixiOSBug";
	import { getSnapTicket } from "@/api/login";
    import { getUnitListByUser } from "@/api/system/dept"
	export default {
		name: "SidebarItem",
		components: { Item, AppLink },
		mixins: [FixiOSBug],
		props: {
			// route object
			item: {
				type: Object,
				required: true
			},
			isNest: {
				type: Boolean,
				default: false
			},
			basePath: {
				type: String,
				default: ""
			},
			typeBlock: {
				type: Boolean,
				default: false
			},
            firstOrder: {
				type: Boolean,
				default: false
			},
		},
		data() {
			// To fix https://github.com/PanJiaChen/vue-admin-template/issues/237
			// TODO: refactor with render function
			this.onlyOneChild = null;
			return {
				userData:{
					fine_username:'',
					fine_password:'',
					validity:'-1'
				}
			};
		},
		computed: {
			theme() {
				return this.$store.state.settings.theme;
			},
		},
		mounted() {
		},
		methods: {
			hasOneShowingChild(children = [], parent) {
				if (!children) {
					children = [];
				}
				const showingChildren = children.filter(item => {
					if (item.hidden) {
						return false
					} else {
						// Temp set(will be used if only has one showing child)
						this.onlyOneChild = item
						return true
					}
				})

				// When there is only one child router, the child router is displayed by default
				if (showingChildren.length === 1) {
					return true
				}

				// Show parent if there are no child router to display
				if (showingChildren.length === 0) {
					this.onlyOneChild = { ... parent, path: '', noShowingChildren: true }
					return true
				}

				return false
			},
			resolvePath(routePath, routeQuery) {
				if (isExternal(routePath)) {
					return routePath
				}
				if (isExternal(this.basePath)) {
					return this.basePath
				}
				if (routeQuery) {
					let query = JSON.parse(routeQuery);
					return { path: path.resolve(this.basePath, routePath), query: query }
				}
				return path.resolve(this.basePath, routePath)
			},
        async openWidow(skipUrl) {
            if (skipUrl.indexOf('http') != -1) {
                let Url = new URL(skipUrl)
                let connector = Url.search ? "&" : "?"

                if (skipUrl.indexOf('#{p_unit_id}') != -1) {
                    skipUrl = await this.replaceUnitId(skipUrl)
                }

                getSnapTicket().then(res => {
                    if (res.success) {
                        this.url = `${skipUrl}${connector}snapTicket=${res.data.snapTicket}`
                    } else {
                        this.url = `${skipUrl}${connector}`
                    }
                    window.open(this.url)
                })
            } else {
                window.open(skipUrl, '_blank');
            }
        },
        replaceUnitId(skipUrl) {
            return new Promise(resolve => {
                if (sessionStorage.getItem("rank") != 0) {
                    getUnitListByUser().then(res => {
                        const list = res.data;
                        const idList = list.map((item) => {
                            return item.id;
                        })
                        const idstr = idList.join(',')
                        skipUrl = skipUrl.replace('#{p_unit_id}', idstr)
                        resolve(skipUrl)
                    })
                }else{
                    skipUrl = skipUrl.replace('#{p_unit_id}', "")
                    resolve(skipUrl)
                }
            })
        },
	}
};
</script>
<style lang="scss">
.item_hidden_box{
	display: inline-block;
	.item_hidden_menu{
		.el-submenu__title{
			height: 35px;
			line-height: 35px;
		}
	}
	.is-active{
		border-bottom: 2px solid #1890ff !important;
		color: #303133;
	}
	.el-menu-item{
		height: 35px;
		line-height: 35px;
	}
	.el-submenu__icon-arrow{
		right: 10px !important;
		margin-top: -5px;
	}
	.el-menu--popup{
		min-width: 150px;
	}
}
</style>