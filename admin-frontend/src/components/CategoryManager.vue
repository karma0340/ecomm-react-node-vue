<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0 text-primary">📂 Manage Categories</h2>
    </div>

    <!-- Add Category Form -->
    <div class="card shadow-sm mb-4 border-0">
      <div class="card-body">
        <form class="row g-3 align-items-center" @submit.prevent="addCategory">
          <div class="col-md-4">
            <label class="form-label fw-semibold">Category Name</label>
            <input
              v-model="newCategory"
              type="text"
              class="form-control"
              placeholder="Enter new category"
              required
            />
          </div>

          <div class="col-md-3">
            <label class="form-label fw-semibold">Image Input Type</label>
            <select v-model="newInputType" class="form-select">
              <option value="file">Upload File</option>
              <option value="url">Paste Image URL</option>
            </select>
          </div>

          <div class="col-md-4">
            <label class="form-label fw-semibold">
              {{ newInputType === 'file' ? 'Upload Image' : 'Image URL' }}
            </label>

            <input
              v-if="newInputType === 'file'"
              ref="fileInput"
              type="file"
              class="form-control"
              accept="image/*"
              @change="onFileChange"
            />

            <input
              v-else
              v-model="imageUrlInput"
              type="url"
              class="form-control"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div class="col-md-1 d-flex align-items-end">
            <button class="btn btn-success w-100" :disabled="submitting">
              <i class="bi bi-plus-circle me-2"></i>
              {{ submitting ? '...' : 'Add' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Categories Table -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <table class="table table-hover align-middle text-center mb-0">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Image📷</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category.id">
              <td>{{ category.id }}</td>
              <td class="fw-semibold">{{ category.name }}</td>
              <td>
                <img
                  v-if="category.imageUrl"
                  :src="category.imageUrl"
                  class="img-thumbnail"
                  style="object-fit: cover; width: 60px; height: 60px"
                  alt="Image"
                />
              </td>
              <td>{{ formatDate(category.createdAt) }}</td>
              <td>
                <button class="btn btn-outline-secondary btn-sm me-2" @click="openEdit(category)">
                  <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-outline-danger btn-sm" @click="deleteCategory(category.id)">
                  <i class="bi bi-trash"></i> Delete
                </button>
              </td>
            </tr>
            <tr v-if="!categories.length">
              <td colspan="5" class="text-center text-muted py-4">
                <i class="bi bi-inbox fs-3"></i><br /> No categories available
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editing.show" class="modal-backdrop fade show"></div>
    <div v-if="editing.show" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title"><i class="bi bi-pencil-square me-2"></i>Edit Category #{{ editing.data.id }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeEdit"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateCategory">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">Name</label>
                  <input v-model="editing.data.name" type="text" class="form-control" required />
                </div>

                <div class="col-md-4">
                  <label class="form-label">Image Input Type</label>
                  <select v-model="editing.inputType" class="form-select">
                    <option value="file">Upload File</option>
                    <option value="url">Paste Image URL</option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label">
                    {{ editing.inputType === 'file' ? 'Upload Image' : 'Image URL' }}
                  </label>

                  <input
                    v-if="editing.inputType === 'file'"
                    type="file"
                    class="form-control"
                    @change="onEditFileChange"
                  />

                  <input
                    v-else
                    v-model="editing.urlInput"
                    type="url"
                    class="form-control"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div class="col-md-6" v-if="editing.data.imageUrl || editing.preview">
                  <label class="form-label">Preview</label><br />
                  <img
                    :src="editing.preview || editing.data.imageUrl"
                    class="img-thumbnail"
                    style="width: 80px; height: 80px; object-fit: cover"
                  />
                </div>

                <div class="col-12 d-flex justify-content-end mt-3">
                  <button class="btn btn-secondary me-2" @click="closeEdit">Cancel</button>
                  <button class="btn btn-primary" :disabled="editing.updating">
                    {{ editing.updating ? "Updating..." : "Update" }}
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
import { ref } from 'vue'

const { initialCategories } = defineProps({
  initialCategories: {
    type: Array,
    default: () => []
  }
})

const categories = ref([...initialCategories])
const newCategory = ref('')
const file = ref(null)
const fileInput = ref(null)
const imageUrlInput = ref('')
const newInputType = ref('file')
const submitting = ref(false)

const editing = ref({
  show: false,
  data: {},
  file: null,
  preview: null,
  urlInput: '',
  inputType: 'file',
  updating: false
})

const formatDate = date =>
  new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })

const onFileChange = e => {
  file.value = e.target?.files?.[0] || null
}

// ------ CREATE ------
const addCategory = async () => {
  if (!newCategory.value.trim()) {
    alert('Please enter a category name')
    return
  }

  submitting.value = true
  const formData = new FormData()
  formData.append('name', newCategory.value.trim())

  if (newInputType.value === 'file' && file.value) {
    formData.append('image', file.value)
  } else if (newInputType.value === 'url' && imageUrlInput.value.trim()) {
    formData.append('imageUrl', imageUrlInput.value.trim())
  }

  try {
    const res = await fetch('/api/categories', {
      method: 'POST',
      body: formData
    })
    if (!res.ok) throw new Error('Failed to create category')

    const saved = await res.json()
    categories.value.unshift(saved)

    // Reset
    file.value = null
    imageUrlInput.value = ''
    newCategory.value = ''
    if (fileInput.value) fileInput.value.value = null
  } catch (err) {
    alert(err.message || 'Error')
  } finally {
    submitting.value = false
  }
}

// ------ DELETE ------
const deleteCategory = async id => {
  if (!confirm('Are you sure?')) return
  try {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete')
    categories.value = categories.value.filter(c => c.id !== id)
  } catch (err) {
    alert(err.message)
  }
}

// ------ EDIT ------
const onEditFileChange = (e) => {
  const file = e.target?.files?.[0] || null
  editing.value.file = file

  if (file) {
    const reader = new FileReader()
    reader.onload = e => editing.value.preview = e.target.result
    reader.readAsDataURL(file)
  } else {
    editing.value.preview = null
  }
}

const openEdit = (cat) => {
  editing.value.show = true
  editing.value.data = { ...cat }
  editing.value.file = null
  editing.value.preview = null
  editing.value.urlInput = ''
  editing.value.inputType = 'file'
}

const closeEdit = () => {
  editing.value.show = false
  editing.value.data = {}
  editing.value.file = null
  editing.value.preview = null
  editing.value.urlInput = ''
}

const updateCategory = async () => {
  const id = editing.value.data.id
  const formData = new FormData()
  formData.append('name', editing.value.data.name)

  if (editing.value.inputType === 'file' && editing.value.file) {
    formData.append('image', editing.value.file)
  } else if (editing.value.inputType === 'url' && editing.value.urlInput.trim()) {
    formData.append('imageUrl', editing.value.urlInput.trim())
  }

  editing.value.updating = true
  try {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      body: formData
    })

    if (!res.ok) throw new Error('Update failed')
    const updated = await res.json()

    const index = categories.value.findIndex(c => c.id === id)
    if (index !== -1) {
      updated.imageUrl = updated.imageUrl ? `${updated.imageUrl}?t=${Date.now()}` : null
      categories.value[index] = updated
    }

    closeEdit()
  } catch (err) {
    alert(err.message || 'Error updating category')
  } finally {
    editing.value.updating = false
  }
}
</script>

<style scoped>
table img {
  object-fit: cover;
}
.modal-backdrop {
  z-index: 1040;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
}
.modal {
  z-index: 1050;
}
</style>
