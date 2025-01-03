<template>
  <div class="pdf-container" ref="pdfContainer">
    <el-upload
      v-if="!pdfLoaded"
      class="upload-component"
      drag
      action="#"
      :http-request="uploadPdf"
      accept=".pdf"
      :auto-upload="true"
      ref="upload"
      :show-file-list="false"
      :limit="1"
      :on-exceed="handleExceed"
      @change="handleFileChange"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em style="color: #409EFF">点击上传</em></div>
      <div class="el-upload__tip" slot="tip">只允许上传 PDF 文件</div>
    </el-upload>

    <div v-if="loading && !pdfLoaded" style="text-align: center;">
      <el-spinner :size="50" />
      <p>正在加载 PDF，请稍候...</p>
    </div>

    <div v-if="error" style="color: red; text-align: center;">
      {{ error }}
    </div>

    <div v-if="pdfLoaded" class="pdf-toolbar">
      <el-button @click="prevPage" :disabled="currentPage === 1">上一页</el-button>
      <el-button @click="nextPage" :disabled="currentPage === totalPages">下一页</el-button>
      <span>页码: {{ currentPage }} / {{ totalPages }}</span>
      <el-input
        type="number"
        v-model.number="gotoPageNumber"
        placeholder="输入页码"
        style="width: 100px;"
        @keyup.enter.native="gotoPage"
      ></el-input>
      <el-button @click="gotoPage">跳转</el-button>
      <el-button @click="zoomIn">+</el-button>
      <el-button @click="zoomOut">-</el-button>
      <el-button @click="fitToWidth">适应宽度</el-button>
    </div>

    <div v-for="pageNumber in renderedPages" :key="pageNumber" class="pdf-page-container">
      <canvas :id="'pdf-canvas-' + pageNumber" class="pdf-canvas"></canvas>
    </div>
  </div>
</template>

<script>
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { TextLayerBuilder } from 'pdfjs-dist/web/pdf_viewer';

export default {
  data() {
    return {
      pdfDoc: null,
      totalPages: 0,
      loading: false,
      error: null,
      renderedPages: [],
      pagesToRenderInitially: 1, // 初始只渲染一页
      pagesToRenderIncrementally: 1,
      hasFileSelected: false,
      isLoadingMore: false,
      pdfLoaded: false,
      currentPage: 1,
      zoomScale: 1.5,
      gotoPageNumber: null,
    };
  },
  watch: {
    currentPage(newVal, oldVal) {
      if (newVal >= 1 && newVal <= this.totalPages && newVal !== oldVal) {
        this.renderedPages = [newVal]; // 只渲染当前页
        this.$nextTick(() => {
          this.renderPage(newVal);
        });
      }
    },
  },
  mounted() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    console.log('Worker source set to:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    this.$refs.pdfContainer.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy() {
    this.$refs.pdfContainer.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    handleFileChange(file, fileList) {
      if (file) {
        this.hasFileSelected = true;
      } else {
        this.hasFileSelected = false;
      }
    },
    uploadPdf(options) {
      const file = options.file;
      this.loading = true;
      this.error = null;
      this.renderedPages = [];
      this.pdfDoc = null;
      this.totalPages = 0;
      this.pdfLoaded = false;
      this.currentPage = 1; // Reset current page
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const typedarray = new Uint8Array(reader.result);
          this.pdfDoc = await pdfjsLib.getDocument(typedarray).promise;
          this.totalPages = this.pdfDoc.numPages;
          console.log('totalPages:', this.totalPages);
          this.renderInitialPage(); // 只渲染第一页
          this.pdfLoaded = true;
        } catch (error) {
          console.error('Error loading PDF:', error);
          this.error = '加载 PDF 文件失败，请检查文件是否损坏。';
          this.pdfLoaded = false;
        } finally {
          this.loading = false;
        }
      };
      reader.onerror = () => {
        this.loading = false;
        this.error = '读取 PDF 文件失败。';
        this.pdfLoaded = false;
      };
      reader.readAsArrayBuffer(file);
    },
    async renderPage(pageNumber, scale = this.zoomScale) {
      if (!this.pdfDoc) {
        console.warn('PDF document is not loaded.');
        return;
      }
      try {
        const page = await this.pdfDoc.getPage(pageNumber);
        const canvas = document.getElementById(`pdf-canvas-${pageNumber}`);
        if (!canvas) {
          console.error(`Canvas element with ID pdf-canvas-${pageNumber} not found!`);
          return;
        }
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: scale });
        const devicePixelRatio = window.devicePixelRatio || 1;
        const backingStoreRatio =
          context.webkitBackingStorePixelRatio ||
          context.mozBackingStorePixelRatio ||
          context.msBackingStorePixelRatio ||
          context.oBackingStorePixelRatio ||
          context.backingStorePixelRatio ||
          1;
        const ratio = devicePixelRatio / backingStoreRatio;

        canvas.width = viewport.width * ratio;
        canvas.height = viewport.height * ratio;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';

        context.scale(ratio, ratio);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;

        const textContent = await page.getTextContent();
        const textLayerDiv = document.createElement('div');
        textLayerDiv.className = 'pdf-text-layer';
        textLayerDiv.style.width = `100%`;
        textLayerDiv.style.height = `100%`;
        textLayerDiv.style.position = 'absolute';
        textLayerDiv.style.top = '0';
        textLayerDiv.style.left = '0';
        textLayerDiv.style.overflow = 'hidden';
        canvas.parentNode.appendChild(textLayerDiv);

        const textLayer = new TextLayerBuilder({
          textLayerDiv: textLayerDiv,
          pageIndex: pageNumber - 1,
          viewport: viewport,
        });
        textLayer.setTextContent(textContent);
        textLayer.render();
      } catch (error) {
        console.error(`Error rendering page ${pageNumber}:`, error);
      }
    },
    renderInitialPage() {
      this.renderedPages = [1];
      this.$nextTick(() => {
        this.renderPage(1);
      });
    },
    loadMorePages() {
      if (this.isLoadingMore || this.renderedPages.length >= this.totalPages) {
        return;
      }
      this.isLoadingMore = true;
      const startPage = this.renderedPages[this.renderedPages.length - 1] + 1;
      const endPage = Math.min(startPage + this.pagesToRenderIncrementally - 1, this.totalPages);
      for (let i = startPage; i <= endPage; i++) {
        this.renderedPages.push(i);
        this.$nextTick(() => {
          this.renderPage(i);
        });
      }
      this.isLoadingMore = false;
    },
    handleScroll(event) {
      if (this.loading || this.isLoadingMore || this.renderedPages.includes(this.totalPages)) {
        return;
      }

      const container = event.target;
      const threshold = 200;

      if (container.scrollHeight - container.scrollTop - container.clientHeight < threshold) {
        this.loadMorePages();
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    gotoPage() {
      if (this.gotoPageNumber >= 1 && this.gotoPageNumber <= this.totalPages) {
        this.currentPage = this.gotoPageNumber;
      } else {
        this.$message.warning('请输入有效的页码');
      }
      this.gotoPageNumber = null;
    },
    zoomIn() {
      this.zoomScale += 0.2;
      this.renderPage(this.currentPage);
    },
    zoomOut() {
      this.zoomScale = Math.max(0.5, this.zoomScale - 0.2);
      this.renderPage(this.currentPage);
    },
    fitToWidth() {
      if (!this.pdfDoc) return;
      const canvas = document.getElementById(`pdf-canvas-${this.currentPage}`);
      if (!canvas) return;
      const containerWidth = canvas.parentNode.offsetWidth;
      this.pdfDoc.getPage(this.currentPage).then(page => {
        const viewport = page.getViewport({ scale: 1 });
        this.zoomScale = containerWidth / viewport.width;
        this.renderPage(this.currentPage);
      });
    },
  },
};
</script>

<style scoped>
.pdf-container {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
}

.upload-component {
  text-align: center;
  margin-bottom: 20px;
}

.pdf-toolbar {
  text-align: center;
  margin-bottom: 10px;
}

.pdf-page-container {
  width: 100%;
  text-align: center;
  margin-bottom: 10px;
}

.pdf-canvas {
  display: block;
}

.pdf-text-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  opacity: 0.8;
}

.pdf-text-layer > span {
  position: absolute;
  transform-origin: 0% 100%;
  white-space: pre;
  cursor: text;
}
</style>