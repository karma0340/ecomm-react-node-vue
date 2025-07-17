<template>
  <div class="user-manager container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="fw-bold">👥 Users</h2>
      <button class="btn btn-success" @click="openCreateForm">➕ Add User</button>
    </div>

    <div v-if="users.length === 0" class="alert alert-info text-center">
      No users found.
    </div>

    <transition-group
      name="fade-slide"
      tag="table"
      class="table table-hover table-bordered align-middle"
    >
      <thead>
        <tr class="table-dark">
          <th>#</th>
          <th>Avatar📷</th>
          <th>Name</th>
          <th>Username</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in users" :key="user.id">
          <td>{{ index + 1 }}</td>
          <td>
            <img
              v-if="user.avatar"
              :src="user.avatar"
              alt="avatar"
              class="rounded-circle"
              style="width: 45px; height: 45px; border: 2px solid #ccc;"
            />
          </td>
          <td>{{ user.name }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>
            <select v-model="user.role" @change="updateUser(user)" class="form-select">
              <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
            </select>
          </td>
          <td>
            <button class="btn btn-warning btn-sm me-2" @click="editUser(user)">✏️</button>
            <button class="btn btn-danger btn-sm" @click="deleteUser(user.id)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </transition-group>

    <!-- Modal -->
    <transition name="fade-slide">
      <div v-if="showForm" class="modal-overlay">
        <div class="modal-box shadow p-4">
          <h4 class="mb-3 fw-bold">{{ selectedUser ? 'Update User' : 'Add New User' }}</h4>
          <form @submit.prevent="submitForm">
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input v-model="form.name" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Username</label>
              <input v-model="form.username" class="form-control" :required="!selectedUser"/>
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" v-model="form.email" class="form-control" required />
            </div>
            <div class="mb-3" v-if="!selectedUser">
              <label class="form-label">Password</label>
              <input type="password" v-model="form.password" class="form-control" required />
            </div>
            <div class="mb-3" v-else>
              <label class="form-label">Password (leave blank to keep unchanged)</label>
              <input type="password" v-model="form.password" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Role</label>
              <select v-model="form.role" class="form-select">
                <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Avatar</label>
              <input ref="avatarRef" type="file" accept="image/*" class="form-control" />
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="submit" class="btn btn-primary">{{ selectedUser ? 'Update' : 'Create' }}</button>
              <button type="button" class="btn btn-secondary" @click="closeForm">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'

const roles = ref(window.__INITIAL_ROLES__ || ['admin', 'user'])
const users = ref(window.__INITIAL_USERS__ || [])

const showForm = ref(false)
const selectedUser = ref(null)
const avatarRef = ref()

const form = reactive({
  name: '',
  username: '',
  email: '',
  password: '',
  role: roles.value[0] || 'user'
})

const fetchUsers = async () => {
  try {
    const res = await axios.get('/users/list/json')
    users.value = res.data
  } catch (err) {
    console.error('❌ Failed to fetch users:', err)
    alert('Failed to load users.')
  }
}

onMounted(fetchUsers)

function openCreateForm() {
  resetForm()
  showForm.value = true
}

function resetForm() {
  form.name = ''
  form.username = ''
  form.email = ''
  form.password = ''
  form.role = roles.value[0] || 'user'
  if (avatarRef.value) avatarRef.value.value = ''
  selectedUser.value = null
}

function editUser(user) {
  selectedUser.value = user
  form.name = user.name
  form.username = user.username
  form.email = user.email
  form.role = user.role
  form.password = ''
  if (avatarRef.value) avatarRef.value.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  resetForm()
}

// Create or Update user
async function submitForm() {
  try {
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('username', form.username)
    formData.append('email', form.email)
    formData.append('role', form.role)
    if (!selectedUser.value || form.password) {
      formData.append('password', form.password)
    }
    const avatar = avatarRef.value?.files?.[0]
    if (avatar) formData.append('avatar', avatar)

    if (selectedUser.value) {
      await axios.put(`/users/${selectedUser.value.id}`, formData)
    } else {
      await axios.post('/users', formData)
    }

    closeForm()
    await fetchUsers()
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || 'Failed to submit user')
  }
}

// Inline role change
async function updateUser(user) {
  try {
    await axios.put(`/users/${user.id}`, {
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role
    })
    await fetchUsers()
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || 'Failed to update user')
  }
}

// Delete user
async function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this user?')) return
  try {
    await axios.delete(`/users/${id}`)
    await fetchUsers()
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.error || 'Failed to delete user')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.modal-box {
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  background: #fff;
  animation: fadeIn 0.35s ease;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
