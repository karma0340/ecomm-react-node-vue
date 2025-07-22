<template>
  <div id="wrapper">
<button
  @click="onThemeClick"
  class="theme-switcher"
  :class="[{ 'theme-switcher--scrolled': isScrolled }, { 'theme-switcher--active': themeJustChanged }]"
  aria-label="Switch theme"
>
  <span class="theme-icon">
    {{ isDark ? '🌙' : '☀️' }}
  </span>
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

            </div>
            <button @click="fetchChartData" class="btn btn-primary mt-3">Refresh Chart Data</button>
          </div>

<!-- Recent Customers Table -->
<div class="card box shadow-sm p-3 mt-4">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <span class="h6 mb-0 fw-bold text-primary">Recent Customers</span>
  </div>
  <div class="table-responsive">
    <transition-group name="table-fade" tag="table" class="table table-hover table-borderless align-middle theme-table mb-0">
      <thead v-if="recentCustomers.length">
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Signup Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in recentCustomers" :key="c.id">
          <td>{{ c.username }}</td>
          <td class="text-secondary">{{ c.email }}</td>
          <td>{{ new Date(c.createdAt).toLocaleDateString() }}</td>
        </tr>
        <tr v-if="recentCustomers.length === 0" key="empty">
          <td colspan="3" class="text-center text-muted">No customers found.</td>
        </tr>
      </tbody>
    </transition-group>
  </div>
</div>

          <!-- End of Recent Customers Table -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

// Register ApexCharts for <script setup>
defineProps()
defineEmits()
const apexchart = VueApexCharts

// --- THEME SWITCHER ---
const isDark = ref(false)
const isScrolled = ref(false)
const animatingTheme = ref(false)

function applyThemeClasses() {
  if (isDark.value) {
    document.body.classList.add('dark-mode')
    document.body.classList.remove('light-mode')
  } else {
    document.body.classList.add('light-mode')
    document.body.classList.remove('dark-mode')
  }
}

// On load, restore last selected theme from localStorage, if any
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('DASHBOARD_THEME')
  if (stored === 'dark') {
    isDark.value = true
  } else {
    isDark.value = false
  }
  applyThemeClasses()
}

function onThemeClick() {
  isDark.value = !isDark.value
  localStorage.setItem('DASHBOARD_THEME', isDark.value ? 'dark' : 'light')
  applyThemeClasses()

  // Animate icon and whole page
  animatingTheme.value = true
  document.body.classList.add('theme-animate')
  setTimeout(() => {
    animatingTheme.value = false
    document.body.classList.remove('theme-animate')
  }, 700) // should match animation duration in CSS
}

// Header-aware floating theme-switcher
function handleScroll() {
  isScrolled.value = window.scrollY > 64 // update 64 if your header is taller/shorter
}
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

// --- YOUR DASHBOARD/ANIMATION LOGIC (unchanged) ---
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

const animatedValues = ref({
  Users: 0,
  Products: 0,
  Categories: 0,
  Subcategories: 0,
  Sales: '₹0'
})

function animateValue(title, start, end, duration = 900) {
  if (typeof end === 'string' && end.startsWith('₹')) {
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

// --- DONUT, AREA, MULTILINE, ETC. (unchanged) ---

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
  xaxis: { categories: [], labels: { show: true, style: { fontSize: '13px' } } },
  yaxis: { labels: { show: true, style: { fontSize: '13px', colors: ['#00b894', '#fdcb6e', '#0984e3'] } }, min: 0 },
  legend: { show: false },
  tooltip: { enabled: true, shared: true, theme: 'dark', x: { show: true, format: 'yyyy-MM-dd' } }
})

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
  plotOptions: { bar: { columnWidth: '55%', distributed: false } },
  xaxis: { categories: [] },
  subtitle: { text: 'Data for the most recent full month', align: 'left', style: { fontSize: '14px', color: '#888' } },
  legend: { show: true },
  responsive: [
    { breakpoint: 900, options: { chart: { height: 400 }, plotOptions: { bar: { columnWidth: '70%' } } } },
    { breakpoint: 600, options: { chart: { height: 350 }, plotOptions: { bar: { columnWidth: '90%' } } } }
  ]
})

const series = ref([
  { name: 'Orders', data: [] },
  { name: 'Users', data: [] }
])

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
/* ... This code is in src/assets/css/global.css ... */

</style>
