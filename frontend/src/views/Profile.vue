<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../store/user'
import { updateUserProfile } from '../api/user'

const userStore = useUserStore()

const form = ref({
  nickname: '',
  email: '',
  phone: '',
})

const loading = ref(false)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  await userStore.fetchUserInfo()
  if (userStore.user) {
    form.value.nickname = userStore.user.nickname || ''
    form.value.email = userStore.user.email || ''
    form.value.phone = userStore.user.phone || ''
  }
})

async function handleSave() {
  loading.value = true
  error.value = ''
  success.value = false
  try {
    await updateUserProfile(form.value)
    await userStore.fetchUserInfo()
    success.value = true
    setTimeout(() => (success.value = false), 3000)
  } catch (e: any) {
    error.value = e?.message || '更新失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
    <div>
      <h2 class="text-2xl font-bold text-slate-800">👤 个人中心</h2>
      <p class="text-slate-500 mt-1">管理你的个人信息</p>
    </div>

    <!-- 用户卡片 -->
    <div class="glass-card p-6">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {{ userStore.user?.username?.charAt(0)?.toUpperCase() || 'U' }}
        </div>
        <div>
          <h3 class="text-lg font-bold text-slate-800">{{ userStore.user?.username || '用户' }}</h3>
          <p class="text-sm text-slate-500">{{ userStore.user?.email }}</p>
        </div>
      </div>

      <!-- 剩余次数 -->
      <div class="grid grid-cols-3 gap-3 mb-6">
        <div class="text-center p-3 bg-blue-50 rounded-xl">
          <p class="text-xl font-bold text-blue-600">{{ userStore.user?.resumeQuizRemainingCount || 0 }}</p>
          <p class="text-xs text-slate-500">简历押题</p>
        </div>
        <div class="text-center p-3 bg-primary-50 rounded-xl">
          <p class="text-xl font-bold text-primary-600">{{ userStore.user?.specialRemainingCount || 0 }}</p>
          <p class="text-xs text-slate-500">专项面试</p>
        </div>
        <div class="text-center p-3 bg-emerald-50 rounded-xl">
          <p class="text-xl font-bold text-emerald-600">{{ userStore.user?.behaviorRemainingCount || 0 }}</p>
          <p class="text-xs text-slate-500">综合面试</p>
        </div>
      </div>

      <!-- 编辑表单 -->
      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">昵称</label>
          <input v-model="form.nickname" class="input-field" placeholder="设置昵称" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">邮箱</label>
          <input v-model="form.email" type="email" class="input-field" placeholder="邮箱地址" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">手机号</label>
          <input v-model="form.phone" class="input-field" placeholder="手机号码" />
        </div>

        <p v-if="error" class="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{{ error }}</p>
        <p v-if="success" class="text-emerald-500 text-sm bg-emerald-50 px-4 py-2 rounded-lg">✅ 更新成功</p>

        <button type="submit" class="btn-primary w-full" :disabled="loading">
          {{ loading ? '保存中...' : '保存修改' }}
        </button>
      </form>
    </div>
  </div>
</template>
