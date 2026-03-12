<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const sidebarOpen = ref(false)
const isMobile = ref(false)

function updateViewportState() {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) {
    sidebarOpen.value = true
  }
}

onMounted(async () => {
  updateViewportState()
  window.addEventListener('resize', updateViewportState)

  if (userStore.token) {
    await userStore.fetchUserInfo()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportState)
})

watch(
  () => route.fullPath,
  () => {
    if (isMobile.value) {
      sidebarOpen.value = false
    }
  },
)

function handleLogout() {
  userStore.logout()
  router.push('/login')
}

const navItems = [
  {
    name: '控制台',
    path: '/',
    icon: '📊',
    isActive: () => route.name === 'Dashboard',
  },
  {
    name: '简历押题',
    path: '/resume-quiz',
    icon: '📝',
    isActive: () => route.name === 'ResumeQuiz',
  },
  {
    name: '模拟面试',
    path: '/mock-interview',
    icon: '🎤',
    isActive: () => ['MockInterview', 'InterviewRoom'].includes(String(route.name || '')),
  },
  {
    name: '消费记录',
    path: '/records',
    icon: '📋',
    isActive: () => route.name === 'Records',
  },
  {
    name: '个人中心',
    path: '/profile',
    icon: '👤',
    isActive: () => route.name === 'Profile',
  },
]
</script>

<template>
  <div class="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
    <div
      v-if="sidebarOpen && isMobile"
      class="fixed inset-0 z-20 bg-slate-900/35 backdrop-blur-[1px] lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <aside
      class="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200/60 bg-white/90 shadow-xl backdrop-blur-xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 lg:shadow-sm"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <div class="border-b border-slate-100 p-6">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25">
            <span class="text-lg font-bold text-white">智</span>
          </div>
          <div>
            <h1 class="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-lg font-bold text-transparent">智导面试</h1>
            <p class="text-xs text-slate-400">AI 智能面试助手</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 space-y-1 p-4">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="group flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-all duration-200 hover:bg-primary-50/50 hover:text-primary-600"
          :class="item.isActive() ? 'bg-primary-50 text-primary-600 shadow-sm ring-1 ring-primary-100' : ''"
        >
          <span class="text-lg">{{ item.icon }}</span>
          <div class="min-w-0 flex-1">
            <span class="block text-sm font-medium">{{ item.name }}</span>
          </div>
          <span v-if="item.isActive()" class="h-2 w-2 rounded-full bg-primary-500"></span>
        </router-link>
      </nav>

      <div class="border-t border-slate-100 p-4">
        <div class="flex items-center gap-3 rounded-xl px-3 py-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-semibold text-white shadow">
            {{ userStore.user?.username?.charAt(0)?.toUpperCase() || 'U' }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-700">{{ userStore.user?.username || '用户' }}</p>
            <p class="truncate text-xs text-slate-400">{{ userStore.user?.email || '' }}</p>
          </div>
          <button @click="handleLogout" class="text-sm text-slate-400 transition-colors hover:text-red-500" title="退出登录">
            🚪
          </button>
        </div>
      </div>
    </aside>

    <main class="min-w-0 flex-1 overflow-auto">
      <header class="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 bg-white/80 px-4 py-4 backdrop-blur-lg sm:px-6 lg:px-8">
        <button @click="sidebarOpen = !sidebarOpen" class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div v-if="userStore.user" class="flex flex-wrap items-center justify-end gap-2 text-sm text-slate-500">
          <span class="rounded-lg bg-primary-50 px-2 py-1 text-xs font-medium text-primary-600">押题 {{ userStore.user.resumeQuizRemainingCount || 0 }} 次</span>
          <span class="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">面试 {{ (userStore.user.specialRemainingCount || 0) + (userStore.user.behaviorRemainingCount || 0) }} 次</span>
        </div>
      </header>

      <div class="p-4 sm:p-6 lg:p-8">
        <router-view />
      </div>
    </main>
  </div>
</template>
