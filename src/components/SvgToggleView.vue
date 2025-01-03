<template>
    <div class="full-width-container">
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>SVG 代码编辑器</span>
                <el-switch style="float: right" v-model="showCode" active-text="代码视图"
                    inactive-text="SVG 视图"></el-switch>
            </div>
            <div v-if="showCode">
                <el-input type="textarea" :rows="10" placeholder="请输入 SVG 代码" v-model="svgCode"></el-input>
            </div>
            <div v-else style="position: relative; border: 1px solid #ccc; padding: 10px;" ref="svgView">
                <div v-if="svgCode" v-html="svgCode"></div>
                <div v-else style="text-align: center; color: #999;">请输入 SVG 代码以预览</div>
                <el-button v-if="svgCode" type="primary" icon="el-icon-download"
                    style="position: absolute; top: 10px; right: 10px;" circle @click="downloadSVG"></el-button>
            </div>
        </el-card>
    </div>
</template>

<script>

import { SVG_CODE_TEMPLATE } from '@/constants/svg-templates'; // 请根据你的实际路径调整

export default {
    data() {
        return {
            svgCode:SVG_CODE_TEMPLATE,
            showCode: false, // 默认显示 SVG 视图
        };
    },
    methods: {
        downloadSVG() {
            if (!this.svgCode) {
                return;
            }

            const svgElement = this.$refs.svgView.querySelector('div > svg');
            if (!svgElement) {
                console.error('SVG element not found.');
                return;
            }

            const svgData = new XMLSerializer().serializeToString(svgElement);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const bbox = svgElement.getBBox();
            const scale = 4; // 设置放大比例
            canvas.width = bbox.width * scale;
            canvas.height = bbox.height * scale;
            ctx.scale(scale, scale); // 缩放上下文

            const img = new Image();
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);

            img.onload = () => {
                ctx.drawImage(img, 0, 0, bbox.width, bbox.height); // 绘制时使用原始 SVG 尺寸
                const pngUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');

                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hour = String(now.getHours()).padStart(2, '0');
                const minute = String(now.getMinutes()).padStart(2, '0');
                const second = String(now.getSeconds()).padStart(2, '0');
                const filename = `${year}-${month}-${day}_${hour}-${minute}-${second}.png`;

                link.href = pngUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(pngUrl);
            };

            img.src = svgUrl;
        },
    },
};
</script>

<style scoped>
.full-width-container {
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
}

.clearfix:before,
.clearfix:after {
    display: table;
    content: "";
}

.clearfix:after {
    clear: both;
}

.box-card {
    width: 100%;
    display: flex; /* 使 el-card 成为 Flex 容器 */
    flex-direction: column; /* 设置垂直方向布局 */
}

.box-card > .el-card__header {
    flex-shrink: 0; /* 防止 header 被压缩 */
}

/* 当 showCode 为 true 时，让包含 el-input 的 div 占据剩余空间 */
.box-card > div:nth-of-type(2) {
    flex: 1; /* 占据剩余空间 */
    display: flex; /* 内部使用 Flexbox */
    flex-direction: column; /* 垂直排列 textarea */
}

/* 让 textarea 撑满其父容器的高度 */
.el-input.el-textarea {
    height: 100%;
}

.el-textarea__inner {
    height: 100%;
    resize: none; /* 可选：禁用手动调整大小 */
}
</style>