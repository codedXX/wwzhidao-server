<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()
const sidebarOpen = ref(true)

onMounted(async () => {
  if (userStore.token) {
    await userStore.fetchUserInfo()
  }
})

function handleLogout() {
  userStore.logout()
  router.push('/login')
}

const navItems = [
  { name: '控制台', path: '/', icon: '📊' },
  { name: '简历押题', path: '/resume-quiz', icon: '📝' },
  { name: '模拟面试', path: '/mock-interview', icon: '🎤' },
  { name: '消费记录', path: '/records', icon: '📋' },
  { name: '个人中心', path: '/profile', icon: '👤' },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex">
    <!-- 侧边栏 -->
    <aside
      class="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 flex flex-col transition-all duration-300 shadow-sm"
      :class="{ '-ml-64': !sidebarOpen }"
    >
      <!-- Logo -->
      <div class="p-6 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
            <span class="text-white text-lg font-bold">智</span>
          </div>
          <div>
            <h1 class="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">智导面试</h1>
            <p class="text-xs text-slate-400">AI 智能面试助手</p>
          </div>
        </div>
      </div>

      <!-- 导航 -->
      <nav class="flex-1 p-4 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200 group"
          active-class="!bg-primary-50 !text-primary-600 shadow-sm"
        >
          <span class="text-lg">{{ item.icon }}</span>
          <span class="font-medium text-sm">{{ item.name }}</span>
        </router-link>
      </nav>

      <!-- 用户信息 -->
      <div class="p-4 border-t border-slate-100">
        <div class="flex items-center gap-3 px-3 py-2">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow">
            {{ userStore.user?.username?.charAt(0)?.toUpperCase() || 'U' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-700 truncate">{{ userStore.user?.username || '用户' }}</p>
            <p class="text-xs text-slate-400 truncate">{{ userStore.user?.email || '' }}</p>
          </div>
          <button @click="handleLogout" class="text-slate-400 hover:text-red-500 transition-colors text-sm" title="退出登录">
            🚪
          </button>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="flex-1 overflow-auto">
      <!-- 顶栏 -->
      <header class="sticky top-0 z-10 bg-white/70 backdrop-blur-lg border-b border-slate-200/60 px-8 py-4 flex items-center justify-between">
        <button @click="sidebarOpen = !sidebarOpen" class="text-slate-500 hover:text-slate-700 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="flex items-center gap-4">
          <div v-if="userStore.user" class="flex items-center gap-2 text-sm text-slate-500">
            <span class="px-2 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-medium">押题 {{ userStore.user.resumeQuizRemainingCount || 0 }} 次</span>
            <span class="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium">面试 {{ (userStore.user.specialRemainingCount || 0) + (userStore.user.behaviorRemainingCount || 0) }} 次</span>
          </div>
        </div>
      </header>
      <!-- 页面内容 -->
      <div class="p-8">
        <router-view />
      </div>
    </main>
  </div>
</template>
