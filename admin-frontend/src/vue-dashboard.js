// src/vue-adminDashboard.js

import { createApp } from 'vue'
import AdminDashboard from './components/AdminDashboard.vue'

// Get initial props injected by Handlebars (from window globals)
const stats = window.__DASHBOARD_STATS__ || {}
const recentUsers = window.__DASHBOARD_USERS__ || []

// Mount the Vue app to the dashboard-app div
createApp(AdminDashboard, { stats, recentUsers }).mount('#dashboard-app')
