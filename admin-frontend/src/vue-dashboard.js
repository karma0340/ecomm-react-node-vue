// src/vue-adminDashboard.js (or src/vue-dashboard.js)

import '@/assets/css/global.css'                  // <-- Import your global theme CSS
import 'bootstrap/dist/css/bootstrap.min.css'     // <-- Optional: Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css' // <-- Optional: Bootstrap Icons

import { createApp } from 'vue'
import AdminDashboard from './components/AdminDashboard.vue'
import VueApexCharts from 'vue3-apexcharts'

// Initial props from server-rendered HTML
const stats = window.__DASHBOARD_STATS__ || {};
const recentUsers = window.__DASHBOARD_USERS__ || [];

// Create Vue app and register ApexCharts globally
const app = createApp(AdminDashboard, { stats, recentUsers })
app.component('apexchart', VueApexCharts)

// Mount the Vue application
app.mount('#dashboard-app')
