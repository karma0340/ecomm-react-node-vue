<template>
  <div class="container py-4">
    <h2 class="mb-4 text-info">
      <i class="bi bi-diagram-3"></i> Manage Subcategories
    </h2>

    <!-- Add Subcategory Form -->
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body">
        <form class="row g-3 align-items-end" @submit.prevent="addSubcategory">
          <div class="col-md-3">
            <label class="form-label">Name</label>
            <input
              v-model="newSubcat"
              type="text"
              class="form-control"
              placeholder="Subcategory name"
              required
            />
          </div>

          <div class="col-md-3">
            <label class="form-label">Category</label>
            <select v-model="newCatId" class="form-select" required>
              <option value="" disabled>Select category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Image Source</label>
            <select v-model="newInputType" class="form-select">
              <option value="file">Upload File</option>
              <option value="url">Paste Image URL</option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">
              {{ newInputType === 'file' ? 'Upload Image' : 'Image URL' }}
            </label>
            <input
              v-if="newInputType === 'file'"
              type="file"
              class="form-control"
              accept="image/*"
              @change="onFileChange"
            />
            <input
              v-else
              type="url"
              v-model="imageUrlInput"
              class="form-control"
              placeholder="https://example.com/image.png"
            />
          </div>

          <div class="col-12">
            <button class="btn btn-success" :disabled="submitting">
              <i class="bi bi-plus-circle me-1"></i>
              {{ submitting ? 'Adding...' : 'Add Subcategory' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Subcategories Table -->
    <div class="card shadow-sm border-0 mb-3">
      <div class="card-body p-0">
        <table class="table table-hover align-middle mb-0 text-center">
          <thead class="table-light">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Image📷</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sub in subcategories" :key="sub.id">
              <td>{{ sub.id }}</td>
              <td>{{ sub.name }}</td>
              <td>
                <span class="badge bg-primary">
                  {{ sub.Category?.name || getCategoryName(sub.categoryId) }}
                </span>
              </td>
              <td>
                <img
                  v-if="sub.imageUrl"
                  :src="sub.imageUrl"
                  alt="subcategory"
                  class="rounded shadow-sm"
                  style="width: 45px; height: 45px; object-fit: cover"
                />
              </td>
              <td>{{ formatDate(sub.createdAt) }}</td>
              <td class="d-flex justify-content-center gap-2">
                <button @click="openEditModal(sub)" class="btn btn-outline-secondary btn-sm">
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  @click="deleteSubcategory(sub.id)"
                  class="btn btn-outline-danger btn-sm"
                  :disabled="deletingId === sub.id"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="!subcategories.length">
              <td colspan="6" class="text-center py-4 text-muted">
                <i class="bi bi-inbox fs-3"></i><br />No subcategories available
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-backdrop fade show"></div>
    <div v-if="showEditModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-secondary text-white">
            <h5 class="modal-title"><i class="bi bi-pencil"></i> Edit Subcategory</h5>
            <button class="btn-close btn-close-white" @click="closeEditModal"></button>
          </div>
          <div class="modal-body">
            <form class="row g-3 align-items-end" @submit.prevent="updateSubcategory">
              <div class="col-md-4">
                <label class="form-label">Name</label>
                <input v-model="editForm.name" type="text" class="form-control" required />
              </div>

              <div class="col-md-4">
                <label class="form-label">Category</label>
                <select v-model="editForm.categoryId" class="form-select" required>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label">Image Source</label>
                <select v-model="editInputType" class="form-select">
                  <option value="file">Upload File</option>
                  <option value="url">Paste Image📷 URL</option>
                </select>
              </div>

              <div class="col-md-6" v-if="editInputType === 'file'">
                <label class="form-label">Upload Image</label>
                <input type="file" class="form-control" @change="onEditFileChange" accept="image/*" />
              </div>

              <div class="col-md-6" v-else>
                <label class="form-label">Image URL</label>
                <input
                  v-model="editUrlInput"
                  type="url"
                  class="form-control"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Preview</label><br />
                <img
                  v-if="editForm.imageUrl || editPreview"
                  :src="editPreview || editForm.imageUrl"
                  class="rounded shadow-sm"
                  style="width: 80px; height: 80px; object-fit: cover"
                />
              </div>

              <div class="col-12 d-flex justify-content-end">
                <button class="btn btn-secondary me-2" @click="closeEditModal">Cancel</button>
                <button class="btn btn-success" type="submit" :disabled="updating">
                  {{ updating ? 'Updating...' : 'Update' }}
                </button>
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

const props = defineProps({
  initialSubcategories: Array,
  initialCategories: Array,
})

const subcategories = ref([...props.initialSubcategories])
const categories = ref([...props.initialCategories])

const newSubcat = ref('')
const newCatId = ref('')
const newInputType = ref('file')
const imageUrlInput = ref('')
const file = ref(null)
const fileInput = ref(null)

const submitting = ref(false)
const deletingId = ref(null)

const showEditModal = ref(false)
const editForm = ref({})
const editFile = ref(null)
const editInputType = ref('file')
const editUrlInput = ref('')
const editPreview = ref(null)
const updating = ref(false)

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const getCategoryName = (id) => {
  const c = categories.value.find((c) => c.id === id)
  return c ? c.name : '(Unknown)'
}

function onFileChange(e) {
  file.value = e.target?.files?.[0] || null
}

function onEditFileChange(e) {
  const selected = e.target?.files?.[0]
  editFile.value = selected

  if (selected) {
    const reader = new FileReader()
    reader.onload = (e) => (editPreview.value = e.target.result)
    reader.readAsDataURL(selected)
  } else {
    editPreview.value = null
  }
}

async function addSubcategory() {
  if (!newSubcat.value.trim() || !newCatId.value) {
    alert('Please fill in all fields.')
    return
  }

  submitting.value = true
  const formData = new FormData()
  formData.append('name', newSubcat.value.trim())
  formData.append('categoryId', newCatId.value)
  if (newInputType.value === 'file' && file.value) {
    formData.append('image', file.value)
  } else if (newInputType.value === 'url' && imageUrlInput.value) {
    formData.append('imageUrl', imageUrlInput.value.trim())
  }

  try {
    const res = await fetch('/api/subcategories', {
      method: 'POST',
      body: formData,
    })
    const created = await res.json()
    const cat = categories.value.find((c) => c.id === created.categoryId)
    subcategories.value.unshift({ ...created, Category: cat })

    newSubcat.value = ''
    newCatId.value = ''
    imageUrlInput.value = ''
    file.value = null
    fileInput.value && (fileInput.value.value = null)
  } catch {
    alert('Failed to add subcategory')
  } finally {
    submitting.value = false
  }
}

async function deleteSubcategory(id) {
  if (!confirm('Are you sure you want to delete this subcategory?')) return

  deletingId.value = id
  try {
    const res = await fetch(`/api/subcategories/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error()
    subcategories.value = subcategories.value.filter((s) => s.id !== id)
  } catch {
    alert('Failed to delete subcategory')
  } finally {
    deletingId.value = null
  }
}

function openEditModal(sub) {
  editForm.value = { ...sub }
  editFile.value = null
  editUrlInput.value = ''
  editInputType.value = 'file'
  editPreview.value = null
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editForm.value = {}
  editFile.value = null
  editUrlInput.value = ''
  editPreview.value = null
}

async function updateSubcategory() {
  if (!editForm.value.name || !editForm.value.categoryId) return

  updating.value = true
  const id = editForm.value.id
  const formData = new FormData()
  formData.append('name', editForm.value.name)
  formData.append('categoryId', editForm.value.categoryId)

  if (editInputType.value === 'file' && editFile.value) {
    formData.append('image', editFile.value)
  } else if (editInputType.value === 'url' && editUrlInput.value) {
    formData.append('imageUrl', editUrlInput.value.trim())
  }

  try {
    const res = await fetch(`/api/subcategories/${id}`, {
      method: 'PUT',
      body: formData,
    })
    const updated = await res.json()
    const cat = categories.value.find((c) => c.id === updated.categoryId)

    const index = subcategories.value.findIndex((s) => s.id === id)
    if (index >= 0) {
      updated.imageUrl = `${updated.imageUrl}?t=${Date.now()}`
      subcategories.value[index] = { ...updated, Category: cat }
    }
    closeEditModal()
  } catch {
    alert('Failed to update subcategory')
  } finally {
    updating.value = false
  }
}
</script>

