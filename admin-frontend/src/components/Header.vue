<template>
  <header class="header header-sticky mb-4 shadow-sm" :style="headerStyle">
    <div class="container-fluid d-flex align-items-center" style="min-height:64px;">
      <!-- Sidebar Open Button -->
      <button class="btn rounded-circle d-flex align-items-center justify-content-center me-3"
        type="button" aria-label="Open Sidebar Sections"
        :style="sidebarBtnStyle" @click="sidebarOpen = true">
        <i class="icon cil-apps fs-4"></i>
      </button>

      <!-- Main Dashboard Button -->
      <a href="/admin"
         class="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 fw-semibold shadow-sm"
         @mouseover="isDashboardHover = true" @mouseleave="isDashboardHover = false"
         :style="dashboardBtnComputedStyle">
        <i class="icon cil-speedometer" style="font-size:1.25em;"></i>
        <span class="dashboard-btn-text">hey, {{ userName }}</span>
      </a>

      <!-- Search Box -->
      <form class="d-none d-md-flex ms-3 flex-grow-1" role="search" action="/search" method="GET">
        <input class="form-control border-0 rounded-pill px-4" type="search" name="q"
               placeholder="Search..." aria-label="Search" style="max-width:250px;">
      </form>

      <!-- Right Side: Theme, Notifications, User -->
      <ul class="nav align-items-center ms-auto">
        <!-- Theme Switcher -->
        <li class="nav-item me-2">
          <button class="btn rounded-circle d-flex align-items-center justify-content-center"
                  title="Toggle theme" aria-label="Toggle theme" style="width:40px;height:40px;"
                  @click="toggleTheme">
            <i :class="themeIcon + ' fs-5'"></i>
          </button>
        </li>
        <!-- Notifications -->
        <li class="nav-item dropdown me-2" @keydown.esc="notifDropdown = false">
          <a class="btn rounded-circle position-relative d-flex align-items-center justify-content-center"
             href="#" style="width:40px;height:40px;"
             @click.prevent.stop="toggleNotifDropdown">
            <i class="icon cil-bell fs-5"></i>
            <span v-if="notifCount > 0"
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style="font-size:0.7rem;">{{ notifCount }}</span>
          </a>
          <transition name="dropdown-fade">
            <div v-show="notifDropdown" class="dropdown-menu dropdown-menu-end shadow show"
                 style="min-width: 18rem;">
              <div class="dropdown-header fw-semibold">Notifications</div>
              <template v-if="!notifications">
                <div class="dropdown-item text-muted">Loading...</div>
              </template>
              <template v-else-if="notifications.length">
                <div v-for="n in notifications" :key="n.id || n.time" class="dropdown-item small">
                  <div class="fw-semibold">{{ n.title || 'Update' }}</div>
                  <div class="text-muted small">{{ n.message }}</div>
                  <div class="text-secondary small">{{ n.time || '' }}</div>
                </div>
              </template>
              <template v-else>
                <div class="dropdown-item text-muted">No new notifications</div>
              </template>
            </div>
          </transition>
        </li>
        <!-- User -->
        <li class="nav-item dropdown" @keydown.esc="userDropdown = false">
          <a class="btn rounded-pill d-flex align-items-center" href="#"
             @click.prevent.stop="userDropdown = !userDropdown">
            <div class="avatar avatar-md bg-primary text-white fw-bold me-2">{{ userInitial }}</div>
            <span class="d-none d-md-inline fw-semibold">{{ userName }}</span>
            <i class="icon cil-caret-bottom ms-1"></i>
          </a>
          <transition name="dropdown-fade">
            <ul v-show="userDropdown" class="dropdown-menu dropdown-menu-end shadow show">
              <li><h6 class="dropdown-header">Account</h6></li>
              <li>
                <a class="dropdown-item d-flex align-items-center gap-2 py-2" href="/profile">
                  <i class="icon cil-user fs-5"></i>
                  <span>Profile</span>
                </a>
              </li>
              <li>
                <a class="dropdown-item d-flex align-items-center gap-2 py-2" href="/settings">
                  <i class="icon cil-settings fs-5"></i>
                  <span>Settings</span>
                </a>
              </li>
              <li><hr class="dropdown-divider bg-secondary"></li>
              <li>
                <form action="/logout" method="POST" style="margin:0;">
                  <button type="submit" class="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                          style="width:100%;background:none;border:none;">
                    <i class="icon cil-account-logout fs-5"></i>
                    <span>Logout</span>
                  </button>
                </form>
              </li>
            </ul>
          </transition>
        </li>
      </ul>
    </div>

    <!-- Sidebar (slide-in) -->
    <transition name="sidebar-slide">
      <div v-if="sidebarOpen" class="sidebar-sections-menu" @click.self="sidebarOpen = false">
        <div class="w-100">
          <h6 class="dropdown-header mb-2">Dashboard Sections</h6>
          <a class="dropdown-item d-flex align-items-center gap-2 py-2" href="/admin/products">
            <i class="icon cil-box text-info fs-5"></i>
            <span>Products</span>
          </a>
          <a class="dropdown-item d-flex align-items-center gap-2 py-2" href="/admin/orders">
            <i class="icon cil-cart text-warning fs-5"></i>
            <span>Orders</span>
          </a>
          <a class="dropdown-item d-flex align-items-center gap-2 py-2" href="/admin/categories">
            <i class="icon cil-layers text-success fs-5"></i>
            <span>Categories</span>
          </a>
          <a class="dropdown-item d-flex align-items-center gap-2 py-2" href="/admin/subcategories">
            <i class="icon cil-list-rich text-primary fs-5"></i>
            <span>Subcategories</span>
          </a>
          <a class="dropdown-item d-flex align-items-center gap-2 py-2" href="/admin/users">
            <i class="icon cil-people text-danger fs-5"></i>
            <span>Users</span>
          </a>
          <a class="dropdown-item d-flex align-items-center gap-2 py-2" href="/logout">
            <i class="icon cil-account-logout text-secondary fs-5"></i>
            <span>Logout</span>
          </a>
        </div>
      </div>
    </transition>
    <transition name="sidebar-overlay-fade">
      <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  user: { type: Object, default: null }
});

const sidebarOpen    = ref(false)
const notifDropdown  = ref(false)
const userDropdown   = ref(false)
const isDashboardHover = ref(false)
const notifications  = ref(null)
const notifCount     = ref(0)

const userName   = computed(() => props.user?.name || 'Admin')
const userInitial = computed(() =>
  (props.user && props.user.name ? props.user.name[0].toUpperCase() : 'A')
)

const theme = ref(localStorage.getItem('coreui-theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
const themeIcon = computed(() =>
  theme.value === 'light' ? 'icon cil-sun' : 'icon cil-moon'
);
function setTheme(t) {
  theme.value = t
  document.body.classList.toggle('light-theme', t === 'light');
  document.body.classList.toggle('dark-theme', t === 'dark');
  localStorage.setItem('coreui-theme', t)
}
onMounted(() => setTheme(theme.value));
function toggleTheme() { setTheme(theme.value === 'light' ? 'dark' : 'light'); }

const dashboardBtnComputedStyle = computed(() => ({
  fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  fontSize: '1.15rem',
  letterSpacing: '0.03em',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  transition: 'background 0.15s, box-shadow 0.15s, transform 0.12s',
  lineHeight: '1.1',
  height: '44px',
  marginRight: '1.5rem',
  marginLeft: '1.5rem',
  background: isDashboardHover.value
    ? 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%)'
    : 'linear-gradient(90deg, #2563eb 0%, #4f8cff 100%)',
  border: 'none',
  transform: isDashboardHover.value ? "scale(1.045)" : ""
}));
const headerStyle = { background: 'var(--cui-header-bg, var(--cui-body-bg))' };
const sidebarBtnStyle = { width: '44px', height: '44px' };

function handleClick(e) {
  if (!e.target.closest('.dropdown-menu') && !e.target.closest('.nav-item.dropdown')) {
    notifDropdown.value = false; userDropdown.value = false;
  }
  if (sidebarOpen.value && !e.target.closest('.sidebar-sections-menu')) sidebarOpen.value = false;
}
onMounted(() => document.addEventListener('click', handleClick));
onBeforeUnmount(() => document.removeEventListener('click', handleClick));

function toggleNotifDropdown() {
  notifDropdown.value = !notifDropdown.value;
  if (notifDropdown.value && notifications.value == null) {
    loadNotifications();
  }
}

async function loadNotifications() {
  notifications.value = null;
  notifCount.value = 0;
  try {
    const res = await fetch('/api/notifications')
    if (!res.ok) throw new Error('Fetch error')
    const data = await res.json()
    notifications.value = Array.isArray(data) ? data : []
    notifCount.value = notifications.value.length
  } catch (err) {
    notifications.value = []
    notifCount.value = 0
  }
}
</script>

<style scoped>
.header {
  z-index: 1100;
}
.dashboard-btn-text {
  font-weight: 600; letter-spacing: .04em; font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
}
.sidebar-sections-menu {
  position: fixed; top: 0; left: 0; height: 100%; width: 260px;
  background: var(--cui-body-bg, #fff);
  border-radius: 0 12px 12px 0;
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
  z-index: 2000; min-width: 200px;
  transform: translateX(-110%);
  transition: transform .35s cubic-bezier(.77,0,.18,1);
  padding-top: 64px;
  display: flex; flex-direction: column; align-items: flex-start;
  color: var(--cui-body-color, #212529);
}
.sidebar-sections-menu.sidebar-slide-enter-active,
.sidebar-sections-menu.sidebar-slide-leave-active {
  transition: transform .33s cubic-bezier(.77,0,.18,1);
}
.sidebar-sections-menu.sidebar-slide-enter-from,
.sidebar-sections-menu:not(.show) {
  transform: translateX(-110%);
}
.sidebar-sections-menu.sidebar-slide-enter-to,
.sidebar-sections-menu.show {
  transform: translateX(0);
}
.sidebar-overlay {
  position: fixed; inset: 0; z-index: 1910;
  background: rgba(60,65,85,0.12);
  backdrop-filter: blur(1px);
}
.dropdown-fade-enter-active, .dropdown-fade-leave-active {
  transition: opacity .23s cubic-bezier(.40,0,.2,1), transform .18s;
}
.dropdown-fade-enter-from, .dropdown-fade-leave-to { opacity:0; transform:translateY(8px);}
.dropdown-fade-enter-to, .dropdown-fade-leave-from { opacity:1; transform:translateY(0);}
.sidebar-slide-enter-active, .sidebar-slide-leave-active { transition: transform .35s cubic-bezier(.77,0,.18,1);}
.sidebar-slide-enter-from, .sidebar-slide-leave-to { transform: translateX(-110%);}
.sidebar-slide-enter-to, .sidebar-slide-leave-from { transform: translateX(0);}
.sidebar-overlay-fade-enter-active, .sidebar-overlay-fade-leave-active { transition: opacity .23s;}
.sidebar-overlay-fade-enter-from, .sidebar-overlay-fade-leave-to { opacity:0; }
.sidebar-overlay-fade-enter-to, .sidebar-overlay-fade-leave-from { opacity:1; }
.dropdown-menu { display: block; opacity: 1; pointer-events: auto; min-width: 18rem; }
.dropdown-menu[style*="display: none"] { display: none !important; opacity: 0; pointer-events: none; }
.avatar.avatar-md { width:36px; height:36px; font-size:1.16rem; display:flex; align-items:center; justify-content:center; border-radius:50%;}
@media (max-width:992px) { .sidebar-sections-menu { width:85vw !important; } .dashboard-btn { font-size:1em; padding-left:1.2rem; } }
</style>
