<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0 text-primary">
        <i class="bi bi-box-seam me-2"></i> Manage Products
      </h2>
    </div>

    <!-- Add Product Form -->
    <div v-if="!loading" class="card shadow-sm mb-4 border-0">
      <div class="card-body">
        <form class="row g-3 align-items-center" @submit.prevent="addProduct">
          <div class="col-md-3">
            <label class="form-label fw-semibold">Product Name</label>
            <input v-model="add.name" type="text" class="form-control" required :disabled="add.loading"/>
          </div>
          <div class="col-md-2">
            <label class="form-label fw-semibold">Price</label>
            <input v-model.number="add.price" type="number" class="form-control" required min="0" step="0.01" :disabled="add.loading"/>
          </div>
          <div class="col-md-2">
            <label class="form-label fw-semibold">Stock</label>
            <input v-model.number="add.stock" type="number" class="form-control" required min="0" :disabled="add.loading"/>
          </div>
          <div class="col-md-2">
            <label class="form-label fw-semibold">Category</label>
            <select v-model="add.categoryId" class="form-select" required :disabled="add.loading">
              <option value="">Select</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label fw-semibold">Subcategory</label>
            <select v-model="add.subCategoryId" class="form-select" required :disabled="add.loading">
              <option value="">Select</option>
              <option v-for="scat in subcategories" :key="scat.id" :value="scat.id">{{ scat.name }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label fw-semibold">Image</label>
            <input
              ref="addFileInput"
              type="file"
              class="form-control"
              accept="image/*"
              @change="e => add.file = e.target.files?.[0] || null"
              :disabled="add.loading"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label fw-semibold">Image URL</label>
            <input
              v-model="add.imageUrl"
              type="url"
              class="form-control"
              placeholder="https://example.com/image.jpg"
              :disabled="add.loading"
            />
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-success w-100" :disabled="add.loading">
              <i class="bi bi-plus-circle me-2"></i>
              {{ add.loading ? 'Saving...' : 'Add' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Feedback -->
    <div v-if="loading" class="text-center py-5">
      <span class="spinner-border text-primary"></span>
    </div>
    <div v-if="error" class="alert alert-danger text-center my-4">{{ error }}</div>

    <!-- Products Table -->
    <div v-if="!loading" class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover table-bordered align-middle text-center mb-0 products-table">
            <thead class="table-light">
              <tr>
                <th style="width: 56px;">#</th>
                <th style="min-width:180px">Name</th>
                <th style="width:100px">Price</th>
                <th style="width:90px">Stock</th>
                <th style="width:120px">Category</th>
                <th style="width:140px">Subcategory</th>
                <th style="width:80px">Image📷</th>
                <th style="width:120px">Created</th>
                <th style="width:120px">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prod in paginatedProducts" :key="prod.id">
                <td>{{ prod.id }}</td>
                <td class="fw-semibold text-start prod-name-col" :title="prod.name">{{ prod.name }}</td>
                <td>₹{{ prod.price }}</td>
                <td>{{ prod.stock }}</td>
                <td>{{ prod.category?.name || '-' }}</td>
                <td>{{ prod.subCategory?.name || '-' }}</td>
                <td>
                  <img
                    v-if="prod.imageUrl"
                    :src="prod.imageUrl"
                    class="img-thumbnail prod-thumb"
                    alt="Image"
                    @error="e => (e.target.src = noImage)"
                  />
                </td>
                <td>{{ formatDate(prod.createdAt) }}</td>
                <td>
                  <button class="btn btn-outline-secondary btn-sm me-2" @click="openEdit(prod)">
                    <i class="bi bi-pencil"></i> Edit
                  </button>
                  <button class="btn btn-outline-danger btn-sm" @click="deleteProduct(prod.id)" :disabled="deletingIds.includes(prod.id)">
                    <i class="bi bi-trash"></i> Delete
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedProducts.length === 0">
                <td colspan="9" class="text-center text-muted py-4">
                  <i class="bi bi-inbox fs-3"></i><br /> No products available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination Controls -->
        <div class="d-flex justify-content-between align-items-center px-3 pb-3 pt-2">
          <span class="text-muted small">Page {{ page }} of {{ totalPages }}</span>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{disabled: page === 1}">
                <button class="page-link" @click="setPage(1)" :disabled="page === 1">First</button>
              </li>
              <li class="page-item" :class="{disabled: page === 1}">
                <button class="page-link" @click="setPage(page - 1)" :disabled="page === 1">‹</button>
              </li>
              <li
                class="page-item"
                v-for="p in visiblePages"
                :key="p"
                :class="{active: page === p}"
              >
                <button class="page-link" @click="setPage(p)">{{ p }}</button>
              </li>
              <li class="page-item" :class="{disabled: page === totalPages}">
                <button class="page-link" @click="setPage(page + 1)" :disabled="page === totalPages">›</button>
              </li>
              <li class="page-item" :class="{disabled: page === totalPages}">
                <button class="page-link" @click="setPage(totalPages)" :disabled="page === totalPages">Last</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="edit.show" class="modal-backdrop fade show"></div>
    <div v-if="edit.show" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title"><i class="bi bi-pencil-square me-2"></i>Edit Product #{{ edit.data.id }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeEdit"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateProduct">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Name</label>
                  <input v-model="edit.data.name" type="text" class="form-control" required :disabled="edit.loading"/>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Price</label>
                  <input v-model.number="edit.data.price" type="number" class="form-control" required min="0" step="0.01" :disabled="edit.loading"/>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Stock</label>
                  <input v-model.number="edit.data.stock" type="number" class="form-control" required min="0" :disabled="edit.loading"/>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Category</label>
                  <select v-model="edit.data.categoryId" class="form-select" required :disabled="edit.loading">
                    <option value="">Select</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Subcategory</label>
                  <select v-model="edit.data.subCategoryId" class="form-select" required :disabled="edit.loading">
                    <option value="">Select</option>
                    <option v-for="scat in subcategories" :key="scat.id" :value="scat.id">{{ scat.name }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Image</label>
                  <input type="file" class="form-control" @change="onEditFileChange" :disabled="edit.loading"/>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Or Image URL</label>
                  <input v-model="edit.urlInput" type="url" class="form-control" placeholder="https://example.com/image.jpg" :disabled="edit.loading"/>
                </div>
                <div class="col-md-4" v-if="edit.data.imageUrl || edit.preview">
                  <label class="form-label">Preview</label><br />
                  <img
                    :src="edit.preview || edit.data.imageUrl"
                    class="prod-thumb"
                    style="width: 60px; height: 60px"
                    alt="Preview"
                  />
                </div>
                <div class="col-12 d-flex justify-content-end mt-3">
                  <button class="btn btn-secondary me-2" type="button" @click="closeEdit" :disabled="edit.loading">Cancel</button>
                  <button class="btn btn-primary" :disabled="edit.loading">
                    {{ edit.loading ? "Updating..." : "Update" }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
const API_BASE = '/products/api'
const loading = ref(false)
const error = ref('')
const products = ref([])
const categories = ref([])
const subcategories = ref([])
const deletingIds = ref([])

// Pagination state
const PAGE_SIZE = 10
const page = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(products.value.length / PAGE_SIZE)))
const paginatedProducts = computed(() =>
  products.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
)
const visiblePages = computed(() => {
  const total = totalPages.value, max = 5
  if (total <= max) return Array.from({length: total}, (_,i) => i+1)
  let start = Math.max(1, page.value - 2),
      end = Math.min(total, start + max - 1)
  if (end - start < max - 1) start = Math.max(1, end - max + 1)
  return Array.from({length: end - start + 1}, (_,i) => start + i)
})
function setPage(n) { if (n >= 1 && n <= totalPages.value) page.value = n }

const add = ref({ name: '', price: '', stock: 0, categoryId:'', subCategoryId:'', file: null, imageUrl: '', loading: false })
const addFileInput = ref(null)
const edit = ref({
  show: false, data: {}, file: null, urlInput: '', preview: null, loading: false
})
const noImage = 'https://cdn-icons-png.flaticon.com/512/2331/2331949.png'
const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'

onMounted(fetchAll)

async function fetchAll() {
  loading.value = true
  error.value = ''
  try {
    const [prod, cats, subs] = await Promise.all([
      fetch(API_BASE).then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/subcategories').then(r => r.json())
    ])
    products.value = Array.isArray(prod) ? prod : (prod.products ?? [])
    categories.value = Array.isArray(cats) ? cats : (cats.categories ?? [])
    subcategories.value = Array.isArray(subs) ? subs : (subs.subcategories ?? [])
    page.value = 1
  } catch (e) { error.value = e.message || 'Failed to load products data' }
  loading.value = false
}

async function addProduct() {
  if (!add.value.name || add.value.price === '' || add.value.stock === '' || !add.value.categoryId) {
    alert('Name/Price/Stock/Category required'); return
  }
  add.value.loading = true
  const formData = new FormData()
  formData.append('name', add.value.name)
  formData.append('price', add.value.price)
  formData.append('stock', add.value.stock) // always a number from v-model.number
  formData.append('categoryId', add.value.categoryId)
  formData.append('subCategoryId', add.value.subCategoryId)
  if (add.value.file) formData.append('image', add.value.file)
  else if (add.value.imageUrl) formData.append('imageUrl', add.value.imageUrl)
  try {
    const res = await fetch(API_BASE, { method: 'POST', body: formData })
    if (!res.ok) throw new Error(await res.text())
    const saved = await res.json()
    products.value.unshift(saved)
    Object.assign(add.value, { name:'', price:'', stock:0, categoryId:'', subCategoryId:'', file:null, imageUrl:'', loading: false })
    if (addFileInput.value) addFileInput.value.value = null
    page.value = 1
  } catch (err) {
    alert(err.message || 'Error creating product')
    add.value.loading = false
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure?')) return
  deletingIds.value.push(id)
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete')
    products.value = products.value.filter(p => p.id !== id)
    if ((page.value - 1) * PAGE_SIZE >= products.value.length && page.value > 1)
      page.value -= 1
  } catch (err) { alert(err.message) }
  deletingIds.value = deletingIds.value.filter(i => i !== id)
}

function openEdit(prod) {
  // Ensure stock, price are always numbers!
  edit.value.show = true
  edit.value.data = {
    ...prod,
    price: Number(prod.price),
    stock: Number(prod.stock),
    categoryId: prod.categoryId || '',
    subCategoryId: prod.subCategoryId || ''
  }
  edit.value.file = null
  edit.value.urlInput = ''
  edit.value.preview = null
}
function closeEdit() {
  edit.value.show = false
  edit.value.data = {}
  edit.value.file = null
  edit.value.urlInput = ''
  edit.value.preview = null
}
function onEditFileChange(e) {
  const file = e.target.files?.[0] || null
  edit.value.file = file
  if (file) {
    const reader = new FileReader()
    reader.onload = e => (edit.value.preview = e.target.result)
    reader.readAsDataURL(file)
  } else {
    edit.value.preview = null
  }
}

async function updateProduct() {
  edit.value.loading = true
  const id = edit.value.data.id
  // Use always the correct values
  const formData = new FormData()
  formData.append('name', edit.value.data.name)
  formData.append('price', edit.value.data.price)
  formData.append('stock', edit.value.data.stock) // always number from v-model.number
  formData.append('categoryId', edit.value.data.categoryId)
  formData.append('subCategoryId', edit.value.data.subCategoryId)
  if (edit.value.file) formData.append('image', edit.value.file)
  else if (edit.value.urlInput) formData.append('imageUrl', edit.value.urlInput)
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'PUT', body: formData })
    if (!res.ok) throw new Error(await res.text())
    const updated = await res.json()
    const idx = products.value.findIndex(p => p.id === id)
    if (idx !== -1) products.value[idx] = updated
    closeEdit()
  } catch (err) {
    alert(err.message || 'Error updating product')
  }
  edit.value.loading = false
}
</script>

<style scoped>
.table-responsive {
  width: 100%;
  overflow-x: auto;
}
.products-table {
  table-layout: auto;
  min-width: 1060px;
}
.products-table th, .products-table td {
  vertical-align: middle !important;
  padding: 0.45rem .6rem !important;
  white-space: nowrap;
  border: 1px solid #dee2e6 !important;
  background: #fff;
  font-size: 0.99rem;
}
.prod-name-col {
  max-width: 240px;
  min-width: 160px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.prod-thumb, .force-thumb {
  width: 60px !important;
  height: 60px !important;
  object-fit: cover !important;
  border-radius: 8px !important;
  border: 1px solid #eee !important;
  display: block !important;
  background: none !important;
  margin: 0 auto !important;
  padding: 0 !important;
}
</style>
