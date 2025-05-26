<template>
    <div class="sidebar-logo-container" :class="{ 'collapse': collapse }"
        :style="{ backgroundColor: sideTheme === 'theme-dark' || sideTheme === 'theme-dark-top' ? variables.menuBackground : variables.menuLightBackground }">
        <transition name="sidebarLogoFade">
            <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
                <img v-if="logo && logoImgA" :src="themeColour == '2'?logoImgA:logo" class="collapse-logo sidebar-logo" />
                <!-- <h1 v-else class="sidebar-title" :style="{ color: sideTheme === 'theme-dark' || sideTheme === 'theme-dark-top' ? variables.logoTitleColor : variables.logoLightTitleColor }">{{ title }} </h1> -->
            </router-link>
            <router-link v-else key="expand" class="sidebar-logo-link" to="/">
                <img v-if="logo && logoImgA" :src="themeColour == '2'?logoImgA:logo" class="sidebar-logo" />
                <!-- <h1 class="sidebar-title" :style="{ color: sideTheme === 'theme-dark' || sideTheme === 'theme-dark-top' ? variables.logoTitleColor : variables.logoLightTitleColor }">{{ title }} </h1> -->
            </router-link>
        </transition>
    </div>
</template>

<script>

import variables from '@/assets/styles/variables.scss'

export default {
    name: 'SidebarLogo',
    props: {
        collapse: {
            type: Boolean,
            required: true
        }
    },
    computed: {
        variables() {
            return variables;
        },
        sideTheme() {
            return this.$store.state.settings.sideTheme
        },
        themeColour() {
            return this.$store.state.settings.themeColour
        }
    },
    data() {
        const logoDarkImg  = require(`@/assets/logo/${process.env.VUE_APP_DARK_LOGO}`)
        const logoImgA  = require(`@/assets/logo/${process.env.VUE_APP_BRIGHT_LOGO}`)
        return {
            title: process.env.VUE_APP_TITLE,
            logo: logoDarkImg,
            logoImgA
        }
    }
}
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
    transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
    opacity: 0;
}

.sidebar-logo-container {
    position: relative;
    width: 100%;
    height: 80px;
    line-height: 80px;
    background: #2b2f3a;
    text-align: center;
    overflow: hidden;

    & .sidebar-logo-link {
        height: 100%;
        width: 100%;

        & .collapse-logo {
            transform: translateX(-136px);
        }

        & .sidebar-logo {
            width: 100%;
            height: auto;
            display: block;
        }

        & .sidebar-title {
            display: inline-block;
            margin: 0;
            color: #fff;
            font-weight: 600;
            line-height: 50px;
            font-size: 14px;
            font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
            vertical-align: middle;
        }
    }

    &.collapse {
        .sidebar-logo {
            margin-right: 0px;
        }
    }
}
</style>
