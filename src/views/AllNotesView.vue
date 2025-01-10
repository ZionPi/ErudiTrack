<template>
  <div class="all-notes-view">
    <div class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="icon">
          <i class="fas fa-arrow-left"></i>
        </span>
        <span>返回</span>
      </button>
      <h1>我的笔记</h1>
      <el-button style="position: absolute; top: 0; right: 0; padding: 8px;" type="primary" @click="openChartDialog">
        <i class="el-icon-data-analysis" style="font-size: 20px;"></i>
      </el-button>
    </div>
    <div v-if="loading" class="empty-notes">
      <p>加载笔记中...</p>
    </div>
    <div v-else-if="savedNotes.length === 0" class="empty-notes">
      <p>你还没有保存任何笔记。</p>
    </div>
    <ul v-else class="notes-list">
      <li v-for="(note, index) in savedNotes" :key="index" class="note-item">
        <p class="note-text">{{ note.note_text }}</p>
        <div class="note-info">
          <span>题目ID: {{ note.question_id }}</span>
          <span> - {{ formatDate(note.created_at) }}</span>
        </div>
      </li>
    </ul>

    <el-dialog
      title="笔记统计"
      :visible.sync="showChartDialog"
      width="80%"
    >
      <div>
        <el-radio-group v-model="chartType" @change="drawChart">
          <el-radio label="bar">柱状图</el-radio>
          <el-radio label="line">折线图</el-radio>
          <el-radio label="pie">饼图</el-radio>
          <el-radio label="scatter">散点图</el-radio>
          <el-radio label="heatmap">热力图</el-radio>
        </el-radio-group>
      </div>
      <div style="margin-top: 15px;">
        <el-button size="small" @click="setChartTimeRange('week')">过去一周</el-button>
        <el-button size="small" @click="setChartTimeRange('month')">过去一月</el-button>
        <el-button size="small" @click="setChartTimeRange('quarter')">过去一个季度</el-button>
        <el-button size="small" @click="setChartTimeRange('year')">过去一年</el-button>
        <el-button size="small" @click="setChartTimeRange('all')">全部</el-button>
      </div>
      <div id="chart" style="width: 100%; height: 400px; margin-top: 15px;"></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showChartDialog = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import 'element-ui/lib/theme-chalk/index.css';
import { getUserDailyPracticeNotes } from '@/services/apiService'; 

export default {
  name: 'AllNotesView',
  data() {
    return {
      savedNotes: [],
      showChartDialog: false,
      chartTimeRange: 'all',
      chartType: 'bar',
      chartInstance: null,
      loading: false,
      userId: 1, 
    };
  },
  mounted() {
    this.loadSavedNotes();
  },
  watch: {
    showChartDialog(newValue) {
      if (newValue) {
        this.$nextTick(() => {
          this.initOrUpdateChart();
        });
      } else {
        this.disposeChart();
      }
    },
    savedNotes(newValue) {
      if (this.showChartDialog) {
        this.$nextTick(() => {
          this.initOrUpdateChart();
        });
      }
    },
    chartType() {
      if (this.showChartDialog) {
        this.$nextTick(() => {
          this.initOrUpdateChart();
        });
      }
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async loadSavedNotes() {
      this.loading = true;
      try {
        const notes = await getUserDailyPracticeNotes(this.userId);
        this.savedNotes = notes;
      } catch (error) {
        console.error('加载笔记失败', error);
        // 可以添加错误提示给用户
        this.$message.error('加载笔记失败，请稍后重试。');
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
      return new Intl.DateTimeFormat('zh-CN', options).format(new Date(dateString));
    },
    formatDateForChart(timestamp) {
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    },
    openChartDialog() {
      this.chartTimeRange = 'all';
      this.showChartDialog = true;
    },
    setChartTimeRange(range) {
      this.chartTimeRange = range;
      this.initOrUpdateChart();
    },
    initOrUpdateChart() {
      const chartDom = document.getElementById('chart');
      if (chartDom) {
        if (!this.chartInstance) {
          this.chartInstance = echarts.init(chartDom);
        }
        this.drawChart();
      }
    },
    disposeChart() {
      if (this.chartInstance) {
        this.chartInstance.dispose();
        this.chartInstance = null;
      }
    },

    drawChart() {
      if (!this.chartInstance) {
        const chartDom = document.getElementById('chart');
        if (chartDom) {
          this.chartInstance = echarts.init(chartDom);
        } else {
          return;
        }
      }

      this.chartInstance.dispose();
      this.chartInstance = null;

      const chartDom = document.getElementById('chart');
      if (chartDom) {
        this.chartInstance = echarts.init(chartDom);
      } else {
        return;
      }

      const now = new Date();
      let startDate;

      const filteredNotesForChart = this.savedNotes.filter(note => {
        if (this.chartTimeRange === 'all') return true;
        const noteDate = new Date(note.created_at);
        if (this.chartTimeRange === 'week') {
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        } else if (this.chartTimeRange === 'month') {
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        } else if (this.chartTimeRange === 'quarter') {
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        } else if (this.chartTimeRange === 'year') {
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        }
        return noteDate >= startDate;
      });

      const dailyCounts = {};
      const hourlyCounts = {};

      filteredNotesForChart.forEach(note => {
        const date = this.formatDateForChart(note.created_at);
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;

        const hour = new Date(note.created_at).getHours();
        hourlyCounts[date] = hourlyCounts[date] || {};
        hourlyCounts[date][hour] = (hourlyCounts[date][hour] || 0) + 1;
      });

      // 修改排序方式
      const sortedDates = Object.keys(dailyCounts).sort((a, b) => new Date(a) - new Date(b));
      const data = sortedDates.map(date => dailyCounts[date]);

      let option = {};

      if (this.chartType === 'bar') {
        option = {
          title: { text: '每日笔记数量' },
          tooltip: {},
          xAxis: { type: 'category', data: sortedDates },
          yAxis: { type: 'value' },
          series: [{ name: '笔记数量', type: 'bar', data: data }]
        };
      } else if (this.chartType === 'line') {
        option = {
          title: { text: '每日笔记数量趋势' },
          tooltip: {},
          xAxis: { type: 'category', data: sortedDates },
          yAxis: { type: 'value' },
          series: [{ name: '笔记数量', type: 'line', data: data }]
        };
      } else if (this.chartType === 'pie') {
        const pieData = sortedDates.map(date => ({ value: dailyCounts[date], name: date }));
        option = {
          title: { text: '笔记日期分布' },
          tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
          series: [{
            name: '日期',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: pieData,
            emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
          }]
        };
      } else if (this.chartType === 'scatter') {
        const scatterData = filteredNotesForChart.map(note => [new Date(note.created_at)]);
        option = {
          title: { text: '笔记时间分布' },
          tooltip: { formatter: (params) => this.formatDate(params.value[0]) },
          xAxis: { type: 'time' },
          yAxis: { type: 'category', data: ['笔记'] },
          series: [{ type: 'scatter', symbolSize: 10, data: scatterData.map(item => [item[0], '笔记']) }]
        };
      } else if (this.chartType === 'heatmap') {
        const heatmapData = [];
        sortedDates.forEach(date => {
          for (let hour = 0; hour < 24; hour++) {
            const count = hourlyCounts[date] && hourlyCounts[date][hour] ? hourlyCounts[date][hour] : 0;
            heatmapData.push([date, hour, count]);
          }
        });

        option = {
          title: { text: '每日每小时笔记数量' },
          tooltip: { formatter: (params) => `${params.value[0]} ${params.value[1]}时: ${params.value[2]}条` },
          xAxis: { type: 'category', data: sortedDates, splitArea: { show: true } },
          yAxis: { type: 'category', data: Array.from({ length: 24 }, (_, i) => i), splitArea: { show: true } },
          visualMap: {
            min: 0,
            max: Math.max(...heatmapData.map(item => item[2]), 1),
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '15%'
          },
          series: [{ type: 'heatmap', data: heatmapData }]
        };
      }

      this.chartInstance.setOption(option);
    },
  }
};
</script>

<style scoped>
.all-notes-view {
  padding: 20px;
}

.top-bar {
  position: relative;
  margin-bottom: 30px;
}

.back-button {
  position: absolute;
  top: 0;
  left: 0;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  color: #333;
  display: flex;
  align-items: center;
}

.back-button .icon {
  margin-right: 5px;
}

.top-bar h1 {
  text-align: center;
  margin: 0;
  font-size: 1.5rem;
}

.empty-notes {
  text-align: center;
  color: #777;
  padding: 20px;
  border: 1px dashed #ccc;
  border-radius: 4px;
}

.notes-list {
  list-style: none;
  padding: 0;
}

.note-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.note-text {
  font-size: 1.1rem;
  margin-bottom: 10px;
  line-height: 1.4;
}

.note-info {
  font-size: 0.9rem;
  color: #888;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-info span:first-child {}

.note-info span:last-child {}
</style>