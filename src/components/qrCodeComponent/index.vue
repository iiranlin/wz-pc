<template>
    <div class="qrPreview">
        <el-popover ref="popover" placement="top" trigger="hover">
            <el-image ref="preview" style="width: 100%; height: 100%" :src="previewSrc" fit="cover"></el-image>
        </el-popover>
        <canvas v-popover:popover ref="qrcodeCanvas"></canvas>
    </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
    name: 'QrCodeComponent',
    props: {
        text: {
            type: String,
            required: true
        },
        width: {
            type: String,
            default: '100'
        },
        height: {
            type: String,
            default: '100'
        },
    },
    data() {
        return {
            previewSrc: ''
        }
    },
    mounted() {
        this.generateQRCode()
    },
    methods: {
        generateQRCode() {
            const canvas = this.$refs.qrcodeCanvas
            const options = {
                width: this.width,
                height: this.height
            }
            QRCode.toCanvas(canvas, this.text, options, error => {
                if (error) console.error(error)
            })

            QRCode.toDataURL(this.text, {
                errorCorrectionLevel: "L",
                margin: 1,
                height: 200,
                width: 200,
                type: "10",
                scal: 177,
                type: "10",
                rendererOpts: {
                    quality: 0.9
                }
            }).then(base64 => {
                this.previewSrc = base64
            }).catch((err) => {
                console.log(err)
            })

        }
    }
}
</script>
<style scoped>
.qrPreview {
    cursor: pointer;
}
</style>