<template>
    <Dialog class="dialog-route"   :title="title" :visible.sync="visible" v-if="visible" :close-on-click-modal="false"
        :close-on-press-escape="false" width="1300px" @close="handleClose" :append-to-body="true" >
        <slot :query="query"></slot>
    </Dialog>
</template>

<script>


export default {
    name: 'dialogWrapper',
    props: {
        title: {
            type: String,
            default: '标题'
        },
    },
    data() {
        return {
            visible: false,
            query: {id: ''}
        }
    },
    watch: {
       
    },
   
    methods: {
        open(param = {id: ''}) {
            this.visible = true
            this.query = param
        },
       
        handleClose() {
            this.visible = false

        },
    }
}
</script>
