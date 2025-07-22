import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: '../backend/dist',      // Output directory for built files
    assetsDir: '.',                 // Place assets directly inside dist
    manifest: true,                 // Generate manifest.json
    manifestFileName: 'manifest.json',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Use relative paths for clean manifest keys!
        'vue-adminLogin': 'src/vue-adminLogin.js',
        'vue-dashboard': 'src/vue-dashboard.js',
        'vue-products': 'src/vue-products.js',
        'vue-orders': 'src/vue-orders.js',
        'vue-categories': 'src/vue-categories.js',
        'vue-subcategories': 'src/vue-subcategories.js',
        'vue-users': 'src/vue-users.js'
        
        // Add more entries as needed
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
