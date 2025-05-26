<template>
    <div id="app" :class="{'theme_colour': themeColour == '2', 'theme_colour_app': themeColour == '1', 'control_fillet': controlTheme == '1', 'control_straight': controlTheme == '2'}">
        <router-view />
    </div>
    
</template>

<script>
export default {
    name: 'App',
    computed: {
        themeColour() {
          const themeColour = this.$store.state.settings.themeColour
          this.body_class(themeColour, 'theme_colour_app', 'theme_colour')
          return themeColour
        },
        controlTheme() {
          const controlTheme = this.$store.state.settings.controlTheme
          this.body_class(controlTheme, 'control_fillet', 'control_straight')
          return controlTheme
        }
    },
    metaInfo() {
        return {
            title: this.$store.state.settings.dynamicTitle && this.$store.state.settings.title,
            titleTemplate: title => {
                return title ? `${title} - ${process.env.VUE_APP_TITLE}` : process.env.VUE_APP_TITLE
            }
        }
    },
    methods: {
      body_class (value, class1, class2) {
        const body = document.body
        const body_classname = body.className
        if(value == '1'){
          body.classList.add(class1)
          body_classname.indexOf(class2)  != -1 && body.classList.remove(class2)
        }else{
          body.classList.add(class2)
          body_classname.indexOf(class1)  != -1 && body.classList.remove(class1)
        }
      }
    }
}
</script>