<template>
  <Header :user="user" />
  <router-view />
</template>

<script setup>
import { ref } from 'vue'
import Header from './components/Header.vue'

// Use injected user (via SSR/global), fallback if needed
const user = ref(window.__USER__ || { name: 'Admin' })
</script>
