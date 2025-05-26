<template>
	<div>
		<logo v-if="showLogo" :collapse="isCollapse" />
		<div class="horizontal_div">
			<el-menu :default-active="activeMenu" mode="horizontal">
				<template v-for="(item, index) in sidebarRoutersHidden">
					<sidebar-item :key="item.path + index" :index="index" :item="item" v-if="index <= visibleNumber"
						:base-path="item.path" :firstOrder="true"  />
				</template>
				<!-- 顶部菜单超出数量折叠 -->
				<el-submenu class="submenu-more" :style="{'--theme': theme}" index="more" v-if="sidebarRoutersHidden.length > visibleNumber + 1">
					<template slot="title">更多菜单</template>
					<template v-for="(item, index) in sidebarRoutersHidden">
						<sidebar-item :key="item.path + index" :index="index" :item="item" v-if="index > visibleNumber"
							:base-path="item.path" :typeBlock="true" :firstOrder="true" />
					</template>
				</el-submenu>
			</el-menu>
		</div>
	</div>
</template>

<script>
	import { mapGetters } from "vuex";
	import Logo from "./Logo";
	import SidebarItem from "./SidebarItem";
	import variablesa from "@/assets/styles/variablesa.scss";

	export default {
		components: { SidebarItem, Logo },
		data () {
			return {
				// 顶部栏初始数
				visibleNumber: 5,
			}
		},
		computed: {
			...mapGetters(["sidebarRouters", "sidebar", "sidebarRoutersHidden"]),
			activeMenu() {
				const route = this.$route;
				const { meta, path } = route;
				// if set path, the sidebar will highlight the path you set
				if (meta.activeMenu) {
					return meta.activeMenu;
				}
				return path;
			},
			showLogo() {
				return this.$store.state.settings.sidebarLogo;
			},
			variables() {
				return variablesa;
			},
			isCollapse() {
				return !this.sidebar.opened;
			},
			theme() {
				return this.$store.state.settings.theme;
			},
		},
		mounted() {
			this.setVisibleNumber();
		},
		methods: {
			// 根据宽度计算设置显示栏数
			setVisibleNumber() {
				const width = document.body.getBoundingClientRect().width / 2;
				this.visibleNumber = parseInt(width / 135);
			},
		}
	};
</script>
<style lang="scss" scoped>
.horizontal_div{
	float: left;
	height: 48px;
	line-height: 48px;
	margin-left: 20px;
	.submenu-more{
		float: none;
		display: inline-block;
	}
}
::v-deep .el-menu--horizontal > .el-submenu .el-submenu__title{
    height: 48px;
    line-height: 48px;
}
</style>