<template>
    <div class="pptxfileView">
        <div id="pptxResult"></div>
    </div>
</template>

<script>
import { sleep } from '../utils'
export default {
    name: "ppt",
    props: {
        src: String,
    },
    watch: {
        src: {
            immediate: true,
            handler(val, oval) {
                if (!!val && oval != val) {
                    this.initRender()
                }
            }
        }
    },
    async created() {


    },
    data() {
        return {
            scriptSrc: [
                '/pptx/js/jquery-1.11.3.min.js',
                '/pptx/js/jszip.min.js',
                '/pptx/js/filereader.js',
                '/pptx/js/d3.min.js',
                '/pptx/js/pptxjs.js',
                '/pptx/js/divs2slides.js',
                '/pptx/js/jquery.fullscreen-min.js',
            ],
            styleSrc: [
                '/pptx/css/pptxjs.css',
                '/pptx/css/nv.d3.min.css'
            ]
        }
    },
    methods: {
        async initRender() {
            try {
                await this.appendStyle()
                await this.appendScript()
                await this.renderPptx()
                this.handleLoaded()
            } catch (err) {
                this.handleError(err)
            }

        },
        renderPptx() {
            const that = this
            return new Promise(async (resolve, reject) => {
                try {
                    $("#pptxResult").pptxToHtml({
                        pptxFileUrl: that.src,
                        fileInputId: "uploadFileInput",
                        slideMode: false,
                        keyBoardShortCut: false,
                        slideModeConfig: {
                            first: 1,
                            nav: false,
                            navTxtColor: "white",
                            navNextTxt: "&#8250;",
                            navPrevTxt: "&#8249;",
                            showPlayPauseBtn: false,
                            keyBoardShortCut: false,
                            showSlideNum: false,
                            showTotalSlideNum: false,
                            autoSlide: false,
                            randomAutoSlide: false,
                            loop: false,
                            background: "black",
                            transition: "default",
                            transitionTime: 1
                        }
                    });
                    await sleep(300)
                    that.$nextTick(() => {

                            const $slides = $(".slides");
                            if ($slides.children().length) {
                                const slidesWidth = Math.max(...Array.from($slides.children()).map((s) => s.offsetWidth))
                                const $wrapper = $('#pptxResult');
                                const wrapperWidth = $wrapper[0].offsetWidth;
                                $wrapper.css({
                                    transform: `scale(${wrapperWidth / slidesWidth})`,
                                    "transform-origin": "top left",
                                })

                            }
                        resolve()
                    })

                } catch (err) {
                    reject()
                }
            })



        },
        loadScript(url) {
            return new Promise((resolve) => {
                const script = document.createElement('script')
                script.onload = function () {
                    resolve()
                }
                script.async = 'async'
                script.src = url
                document.head.appendChild(script)
            })
        },
        loadLink(url) {
            return new Promise((resolve) => {
                const link = document.createElement('link');
                link.onload = function () {
                    resolve()
                }
                link.setAttribute('type', 'text/css');
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('href', url);
                document.head.appendChild(link);
            })
        },
        async appendScript() {
            const reqArr = []
            for (let i = 0; i < this.scriptSrc.length; i++) {
                reqArr.push(this.loadScript(this.scriptSrc[i]))
            }
            const res = await Promise.allSettled(reqArr)
        },
        async appendStyle() {
            const reqArr = []
            for (let i = 0; i < this.styleSrc.length; i++) {
                reqArr.push(this.loadLink(this.styleSrc[i]))
            }
            const res = await Promise.allSettled(reqArr)
        },
        handleLoaded() {
            this.$emit('loaded')
        },
        handleError(err) {
            this.$emit('error', err)
        }
    }
};
</script>
<style lang="scss">
.pptxfileView {
    width: 100%;

}
</style>