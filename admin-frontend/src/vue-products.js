import { createApp } from 'vue'
import ProductsTable from './components/ProductsTable.vue'

const products = window.__INITIAL_PRODUCTS__ || []
const categories = window.__INITIAL_CATEGORIES__ || []
const subcategories = window.__INITIAL_SUBCATEGORIES__ || []
createApp(ProductsTable, { products, categories, subcategories }).mount('#vue-products')
