import { createApp } from 'vue'
import SubcategoryManager from './components/SubcategoryManager.vue'

const subcategories = window.__INITIAL_SUBCATEGORIES__ || []
const categories = window.__INITIAL_CATEGORIES__ || []

createApp(SubcategoryManager, {
  initialSubcategories: subcategories,
  initialCategories: categories
}).mount('#vue-subcategories-app')
