<template>
  <div class="admin-login-container">
    <form class="admin-login-form" @submit.prevent="handleLogin">
      <h2>Admin Login</h2>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div class="form-group">
        <input v-model="username" type="text" placeholder="Username" autocomplete="username" required />
      </div>
      <div class="form-group">
        <input v-model="password" type="password" placeholder="Password" autocomplete="current-password" required />
      </div>
      <button type="submit" :disabled="loading">
        <span v-if="loading">Logging in...</span>
        <span v-else>Login</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const error = ref(window.__LOGIN_ERROR__ || '')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const resp = await fetch('/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        username: username.value,
        password: password.value
      }),
      credentials: 'same-origin'
    })
    if (resp.redirected) {
      // If login is successful, Express will redirect to /admin
      window.location.href = resp.url
      return
    }
    // If not redirected, show error (shouldn't happen in normal flow)
    error.value = 'Login failed. Please try again.'
  } catch (e) {
    error.value = 'Network error. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%);
}

.admin-login-form {
  width: 100%;
  max-width: 380px;
  padding: 2.5rem 2rem 2rem 2rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 8px 32px rgba(30, 64, 175, 0.12), 0 1.5px 8px rgba(30, 64, 175, 0.07);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(30, 64, 175, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.admin-login-form h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 700;
  letter-spacing: 1px;
  color: #2a3576;
  font-size: 2rem;
}

.form-group {
  margin-bottom: 0.5rem;
}

input[type="text"], input[type="password"] {
  width: 100%;
  padding: 0.9rem 1rem;
  border-radius: 8px;
  border: 1.5px solid #b6c4e0;
  background: rgba(255,255,255,0.7);
  font-size: 1.05rem;
  outline: none;
  transition: border 0.18s, box-shadow 0.18s;
  box-shadow: 0 0 0 0 rgba(42, 114, 229, 0);
}
input[type="text"]:focus, input[type="password"]:focus {
  border: 1.5px solid #2a72e5;
  box-shadow: 0 0 0 2px rgba(42, 114, 229, 0.12);
  background: #fff;
}

button[type="submit"] {
  width: 100%;
  background: linear-gradient(90deg, #2a72e5 0%, #4f8cff 100%);
  color: #fff;
  border: none;
  padding: 0.95rem 0;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s;
  box-shadow: 0 2px 8px rgba(42, 114, 229, 0.06);
  letter-spacing: 0.5px;
}
button[type="submit"]:hover:not(:disabled) {
  background: linear-gradient(90deg, #1a4ea0 0%, #2a72e5 100%);
  box-shadow: 0 4px 12px rgba(42, 114, 229, 0.10);
}
button[type="submit"]:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #c00;
  background: #ffeaea;
  border: 1px solid #fbb;
  border-radius: 6px;
  padding: 0.7rem 1rem;
  margin-bottom: 0.5rem;
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.2px;
}

@media (max-width: 600px) {
  .admin-login-form {
    max-width: 98vw;
    padding: 1.5rem 0.5rem 1.5rem 0.5rem;
  }
}

</style>
