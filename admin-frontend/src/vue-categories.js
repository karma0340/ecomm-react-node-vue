// admin-frontend/src/vue-categories.js
import { createApp } from 'vue'
import CategoryManager from './components/CategoryManager.vue'

const initialCategories = window.__INITIAL_CATEGORIES__ || []

createApp(CategoryManager, {
  initialCategories
}).mount('#vue-categories-app')
