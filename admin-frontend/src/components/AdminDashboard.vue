<template>
  <div id="wrapper">
    <button @click="toggleTheme" class="theme-switcher">
      {{ isDark ? '🌙' : '☀️' }}
    </button>
    <div class="content-area">
      <div class="container-fluid">
        <div class="main">
          <!-- Stats Cards -->
          <div class="card-grid mt-4 mb-4">
            <div class="card" v-for="item in metrics" :key="item.title">
              <div class="card-title">
                <span :title="item.hint || ''">{{ item.icon }} {{ item.title }}</span>
              </div>
              <div class="card-value">
                <transition name="counter" mode="out-in">
                  <span :key="item.value">{{ animatedValues[item.title] }}</span>
                </transition>
                <span v-if="item.trend !== undefined" :class="['trend', item.trend > 0 ? 'up' : item.trend < 0 ? 'down' : '']">
                  <i :class="item.trend > 0 ? 'icon-up' : item.trend < 0 ? 'icon-down' : ''"></i>
                  {{ Math.abs(item.trend) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Bar & Donut -->
          <div class="row mt-5 mb-4">
            <div class="col-md-6">
              <div class="box">
                <div class="chart-subtitle">Monthly sales by category</div>
                <apexchart
                  ref="barChart"
                  width="100%"
                  height="380"
                  type="bar"
                  :options="barOptions"
                  :series="barSeries"
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="box">
                <div class="chart-subtitle">Sales share by category</div>
                <apexchart
                  :key="donutOptions.value && donutOptions.value.labels ? donutOptions.value.labels.join(',') : ''"
                  width="100%"
                  height="400"
                  type="donut"
                  :options="donutOptions"
                  :series="donutSeries"
                />
              </div>
            </div>
          </div>
          <!-- Area & Multi-Line Customers -->
          <div class="row mt-4 mb-4">
            <div class="col-md-6">
              <div class="box">
                <div class="chart-subtitle">Daily visits (Admins & Users)</div>
                <apexchart
                  width="100%"
                  height="340"
                  type="area"
                  :options="areaOptions"
                  :series="areaSeries"
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="box">
                <div class="chart-subtitle">
                  <span>Customers (last 7 days)</span>
                  <span class="chart-hint" title="Shows unique new, returning, and total customers per day.">
                    ℹ️
                  </span>
                </div>
                <apexchart
                  width="100%"
                  height="340"
                  type="line"
                  :options="multiLineOptions"
                  :series="multiLineSeries"
                />
                <div class="chart-legend">
                  <span class="legend-dot new"></span> New
                  <span class="legend-dot returning"></span> Returning
                  <span class="legend-dot total"></span> Total
                </div>
                <div class="chart-explanation">
                  <span>New: First-time customers</span> |
                  <span>Returning: Repeat customers</span> |
                  <span>Total: All unique customers</span>
                </div>
              </div>
            </div>
          </div>
          <!-- Orders & Users (Last Month) Chart -->
          <div class="box mt-5 mb-4">
            <div class="chart-subtitle">Orders & Users (Last Month)</div>
            <transition name="fade" mode="out-in">
              <apexchart
                v-if="series[0].data.length || series[1].data.length"
                width="100%"
                height="350"
                type="bar"
                :options="chartOptions"
                :series="series"
                :key="chartKey"
              />
            </transition>
            <div class="chart-explanation" style="margin-top:0.5rem;">
              <span>Shows total orders and new users for the most recent full month.</span>
            </div>
            <button @click="fetchChartData" class="btn btn-primary mt-3">Refresh Chart Data</button>
          </div>

          <!-- Recent Customers Table -->
          <div class="box mt-4">
            <transition-group name="fade" tag="table" class="table">
              <tr v-for="c in recentCustomers" :key="c.id">
                <td>{{ c.username }}</td>
                <td>{{ c.email }}</td>
                <td>{{ new Date(c.createdAt).toLocaleDateString() }}</td>
              </tr>
            </transition-group>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

// Register ApexCharts for <script setup>
defineProps()
defineEmits()
const apexchart = VueApexCharts

const isDark = ref(false)
function toggleTheme() {
  isDark.value = !isDark.value
  document.body.classList.toggle('dark-mode', isDark.value)
}

const barChart = ref(null)
const colorPalette = ['#00D8B6', '#008FFB', '#FEB019', '#FF4560', '#775DD0']

const stats = ref({
  users: 0,
  products: 0,
  categories: 0,
  subcategories: 0,
  sales: 0
})
const metrics = ref([
  { title: 'Users', value: 0, trend: 0, icon: '👤', hint: 'Registered users' },
  { title: 'Products', value: 0, trend: 0, icon: '📦', hint: 'Total products' },
  { title: 'Categories', value: 0, trend: 0, icon: '🗂️', hint: 'Product categories' },
  { title: 'Subcategories', value: 0, trend: 0, icon: '📁', hint: 'Product subcategories' },
  { title: 'Sales', value: '₹0', trend: 0, icon: '💰', hint: 'Total sales' }
])

// --- Animated Counter Logic ---
const animatedValues = ref({
  Users: 0,
  Products: 0,
  Categories: 0,
  Subcategories: 0,
  Sales: '₹0'
})

function animateValue(title, start, end, duration = 900) {
  if (typeof end === 'string' && end.startsWith('₹')) {
    // Animate numbers for sales, keep ₹
    const numEnd = parseInt(String(end).replace(/[^\d]/g, '')) || 0
    let startNum = parseInt(String(start).replace(/[^\d]/g, '')) || 0
    let startTime = null
    function step(timestamp) {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const value = Math.floor(progress * (numEnd - startNum) + startNum)
      animatedValues.value[title] = `₹${value.toLocaleString()}`
      if (progress < 1) requestAnimationFrame(step)
      else animatedValues.value[title] = end
    }
    requestAnimationFrame(step)
  } else {
    let startTime = null
    function step(timestamp) {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const value = Math.floor(progress * (end - start) + start)
      animatedValues.value[title] = value
      if (progress < 1) requestAnimationFrame(step)
      else animatedValues.value[title] = end
    }
    requestAnimationFrame(step)
  }
}

watch(metrics, (newMetrics, oldMetrics) => {
  newMetrics.forEach((item, idx) => {
    const oldValue = oldMetrics && oldMetrics[idx] ? oldMetrics[idx].value : 0
    animateValue(item.title, oldValue, item.value)
  })
}, { immediate: true, deep: true })

// Bar chart (Monthly Sales by Category)
const barSeries = ref([])
let lastClickedIndex = null
const barOptions = ref({
  chart: {
    type: 'bar',
    height: 380,
    stacked: false,
    animations: { enabled: true, easing: 'easeinout', speed: 1000 },
    events: {
      legendClick: function(chartContext, seriesIndex, config) {
        setTimeout(() => {
          const chart = barChart.value?.chart
          if (!chart) return
          if (lastClickedIndex !== seriesIndex) {
            for (let i = 0; i < barSeries.value.length; i++) {
              if (i !== seriesIndex) chart.hideSeries(barSeries.value[i].name)
              else chart.showSeries(barSeries.value[i].name)
            }
            lastClickedIndex = seriesIndex
          } else {
            for (let i = 0; i < barSeries.value.length; i++) chart.showSeries(barSeries.value[i].name)
            lastClickedIndex = null
          }
        }, 10)
        return false
      }
    }
  },
  plotOptions: { bar: { columnWidth: '45%' } },
  colors: colorPalette,
  xaxis: {
    categories: [],
    labels: { show: true },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: { labels: { style: { colors: '#78909c' } }, axisBorder: { show: false }, axisTicks: { show: false } },
  title: { text: '', align: 'left', style: { fontSize: '18px' } },
  legend: { show: true }
})

// Donut chart (Category Sales)
const donutSeries = ref([])
const donutOptions = ref({
  chart: { type: 'donut', width: '100%', height: 400, animations: { enabled: true, easing: 'easeinout', speed: 1000 } },
  colors: colorPalette,
  labels: [],
  legend: { position: 'left', offsetY: 80 },
  title: { text: '', style: { fontSize: '18px' } },
  dataLabels: { enabled: true },
  plotOptions: {
    pie: {
      customScale: 0.8,
      donut: {
        size: '75%',
        labels: {
          show: true,
          name: { show: true, fontSize: '16px', offsetY: -10 },
          value: { show: true, fontSize: '20px', offsetY: 16, formatter: (val) => `₹${Number(val).toLocaleString()}` },
          total: {
            show: true,
            label: 'Total',
            fontSize: '16px',
            color: '#373d3f',
            formatter: function (w) {
              return `₹${w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString()}`
            }
          }
        }
      }
    },
    stroke: { colors: undefined }
  }
})

// Area chart (Daily Visits Insights)
const areaSeries = ref([])
const areaOptions = ref({
  chart: { height: 340, type: 'area', zoom: { enabled: false }, animations: { enabled: true, easing: 'easeinout', speed: 1000 } },
  stroke: { curve: 'smooth', width: 3 },
  colors: colorPalette,
  fill: { opacity: 0.7, type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.8, opacityTo: 0.1 } },
  title: { text: '', align: 'left', style: { fontSize: '18px' } },
  markers: { size: 5, style: 'hollow', hover: { size: 9 } },
  tooltip: { intersect: true, shared: false, theme: 'dark' },
  xaxis: { labels: { show: true }, axisTicks: { show: false } },
  yaxis: { labels: { style: { colors: '#78909c' } }, axisBorder: { show: false }, axisTicks: { show: false }, stepSize: 3 }
})

// Multi-line Customers Chart (New, Returning, Total)
const multiLineSeries = ref([])
const multiLineOptions = ref({
  chart: {
    height: 340,
    type: 'line',
    zoom: { enabled: false },
    animations: { enabled: true, easing: 'easeinout', speed: 1200 }
  },
  stroke: { width: 4, curve: 'smooth' },
  colors: ['#00b894', '#fdcb6e', '#0984e3'],
  title: { text: '', align: 'left', style: { fontSize: '18px' } },
  subtitle: { text: '', align: 'center', offsetY: 24, style: { color: '#222', fontSize: '15px' } },
  markers: { size: 7, hover: { size: 11 } },
  xaxis: {
    categories: [],
    labels: { show: true, style: { fontSize: '13px' } }
  },
  yaxis: {
    labels: { show: true, style: { fontSize: '13px', colors: ['#00b894', '#fdcb6e', '#0984e3'] } },
    min: 0
  },
  legend: { show: false },
  tooltip: {
    enabled: true,
    shared: true,
    theme: 'dark',
    x: { show: true, format: 'yyyy-MM-dd' }
  }
})

// Responsive, Non-overlapping Orders & Users Chart
const chartKey = ref(0)
const chartOptions = ref({
  chart: {
    id: 'vuechart-example',
    toolbar: { show: true },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 1400,
      animateGradually: { enabled: true, delay: 350 },
      dynamicAnimation: { enabled: true, speed: 900 }
    }
  },
  plotOptions: {
    bar: {
      columnWidth: '55%',
      distributed: false
    }
  },
  xaxis: {
    categories: []
  },
  subtitle: {
    text: 'Data for the most recent full month',
    align: 'left',
    style: { fontSize: '14px', color: '#888' }
  },
  legend: { show: true },
  responsive: [
    {
      breakpoint: 900,
      options: {
        chart: { height: 400 },
        plotOptions: { bar: { columnWidth: '70%' } }
      }
    },
    {
      breakpoint: 600,
      options: {
        chart: { height: 350 },
        plotOptions: { bar: { columnWidth: '90%' } }
      }
    }
  ]
})

const series = ref([
  { name: 'Orders', data: [] },
  { name: 'Users', data: [] }
])

// Recent customers
const recentCustomers = ref([])

const fetchChartData = async () => {
  try {
    const res = await fetch('/admin/dashboard/chart-data')
    const data = await res.json()
    chartOptions.value.xaxis.categories = data.labels || []
    series.value = [
      { name: 'Orders', data: data.orders || [] },
      { name: 'Users', data: data.users || [] }
    ]
    chartKey.value++ // triggers fade-in animation
    await nextTick()
  } catch (e) {
    chartOptions.value.xaxis.categories = []
    series.value = [
      { name: 'Orders', data: [] },
      { name: 'Users', data: [] }
    ]
    chartKey.value++
    await nextTick()
  }
}

onMounted(async () => {
  // Fetch stats for cards
  const statsRes = await fetch('/admin/dashboard/stats')
  const statsData = await statsRes.json()
  metrics.value = [
    { title: 'Users', value: statsData.users ?? 0, trend: statsData.userTrend ?? 5, icon: '👤', hint: 'Registered users' },
    { title: 'Products', value: statsData.products ?? 0, trend: statsData.productTrend ?? 2, icon: '📦', hint: 'Total products' },
    { title: 'Categories', value: statsData.categories ?? 0, trend: statsData.categoryTrend ?? 1, icon: '🗂️', hint: 'Product categories' },
    { title: 'Subcategories', value: statsData.subcategories ?? 0, trend: statsData.subcategoryTrend ?? 0, icon: '📁', hint: 'Product subcategories' },
    { title: 'Sales', value: `₹${(statsData.sales ?? 0).toLocaleString()}`, trend: statsData.salesTrend ?? 7, icon: '💰', hint: 'Total sales' }
  ]

  // Fetch bar chart data
  const barRes = await fetch('/admin/dashboard/bar-data')
  const barData = await barRes.json()
  barSeries.value = barData.series || []
  barOptions.value = {
    ...barOptions.value,
    xaxis: {
      ...barOptions.value.xaxis,
      categories: barData.months || []
    }
  }

  // Fetch donut chart data
  const donutRes = await fetch('/admin/dashboard/donut-data')
  const donutData = await donutRes.json()
  donutSeries.value = donutData.series || []
  donutOptions.value.labels = donutData.labels || []

  // Fetch area chart data
  const areaRes = await fetch('/admin/dashboard/area-data')
  const areaData = await areaRes.json()
  areaSeries.value = areaData.series || []

  // Fetch multi-line customers chart data
  const multiLineRes = await fetch('/admin/dashboard/line-data')
  const multiLineData = await multiLineRes.json()
  multiLineSeries.value = multiLineData.series || []
  multiLineOptions.value.xaxis.categories = multiLineData.labels || []
  multiLineOptions.value.subtitle.text = multiLineData.subtitle || ''

  // Fetch orders/users chart data
  await fetchChartData()

  // Fetch recent customers (mock or real endpoint)
  try {
    const custRes = await fetch('/admin/dashboard/recent-customers')
    recentCustomers.value = await custRes.json()
  } catch {
    recentCustomers.value = []
  }
})

// Register ApexCharts for <script setup>
import { useSlots } from 'vue'
import { h } from 'vue'
const slots = useSlots ? useSlots() : null
</script>

<style scoped>
/* ... your existing styles ... */
body {
  background-color: #eff4f7;
  color: #777;
  font-family: 'Titillium Web', Arial, Helvetica, sans-serif
}
body.dark-mode {
  background: #181a1b !important;
  color: #eee !important;
}
.theme-switcher {
  position: fixed; top: 1.5rem; right: 2rem; background: none; border: none; font-size: 2rem; z-index: 99;
}
h1, h2, h3, h4, h5, h6, strong { font-weight: 600; }
.content-area { max-width: 1300px; margin: 0 auto; }
.box {
  max-height: 444px;
  box-shadow: 0px 1px 22px -12px #607D8B;
  background-color: #fff;
  padding: 25px 35px 25px 30px;
  border-radius: 4px;
  margin-bottom: 2rem;
  transition: background 0.3s;
}
body.dark-mode .box {
  background: #23272b;
  color: #eee;
}
.card-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 2rem;
}
.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 22px -12px #607D8B;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 120px;
  transition: transform 0.2s, background 0.3s;
}
body.dark-mode .card {
  background: #23272b;
  color: #eee;
}
.card:hover {
  transform: translateY(-7px) scale(1.04);
  box-shadow: 0 4px 32px -8px #607D8B;
}
.card-title {
  font-size: 1.1rem;
  color: #555;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
body.dark-mode .card-title {
  color: #eee;
}
.card-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: #008FFB;
  min-height: 2.2rem;
  display: flex;
  align-items: center;
}
.trend {
  margin-left: 0.5rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}
.trend.up { color: #00b894; }
.trend.down { color: #d63031; }
.icon-up::before { content: "▲"; }
.icon-down::before { content: "▼"; }
.counter-enter-active, .counter-leave-active {
  transition: transform 0.4s, opacity 0.4s;
}
.counter-enter-from, .counter-leave-to {
  transform: scale(1.2);
  opacity: 0;
}
.chart-subtitle {
  font-size: 1.1rem;
  color: #888;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.table {
  width: 100%;
  margin-top: 1rem;
}
.table tr {
  border-bottom: 1px solid #eee;
  transition: background 0.3s;
}
.table tr:hover {
  background: #f5faff;
}
body.dark-mode .table tr:hover {
  background: #23272b;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.chart-legend {
  margin-top: 0.75rem;
  font-size: 1rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
}
.legend-dot {
  display: inline-block;
  width: 14px; height: 14px;
  border-radius: 50%;
  margin-right: 0.5rem;
}
.legend-dot.new { background: #00b894; }
.legend-dot.returning { background: #fdcb6e; }
.legend-dot.total { background: #0984e3; }
.chart-explanation {
  font-size: 0.95rem;
  color: #888;
  margin-top: 0.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.chart-hint {
  margin-left: 0.5rem;
  cursor: pointer;
  color: #888;
  font-size: 1.1rem;
}
@media (max-width: 900px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
.mt-4 { margin-top: 1.5rem !important; }
.mb-4 { margin-bottom: 1.5rem !important; }
.mt-5 { margin-top: 3rem !important; }
</style>
