<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({ username: '', email: '', password: '', confirmPassword: '' })
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  if (!form.value.username || !form.value.email || !form.value.password) {
    error.value = '请填写所有必填项'
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }
  if (form.value.password.length < 6) {
    error.value = '密码至少需要 6 个字符'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await userStore.register({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
    })
    router.push('/login')
  } catch (e: any) {
    error.value = e?.message || '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-indigo-50 relative overflow-hidden">
    <div class="absolute top-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

    <div class="relative z-10 w-full max-w-md px-6 animate-fade-in">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/25">
          <span class="text-white text-2xl font-bold">智</span>
        </div>
        <h1 class="text-3xl font-bold text-slate-800">创建账号</h1>
        <p class="text-slate-500 mt-2">开启你的 AI 面试之旅</p>
      </div>

      <div class="glass-card p-8">
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">用户名</label>
            <input v-model="form.username" type="text" class="input-field" placeholder="至少 3 个字符" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">邮箱</label>
            <input v-model="form.email" type="email" class="input-field" placeholder="请输入邮箱地址" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">密码</label>
            <input v-model="form.password" type="password" class="input-field" placeholder="至少 6 个字符" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">确认密码</label>
            <input v-model="form.confirmPassword" type="password" class="input-field" placeholder="请再次输入密码" />
          </div>

          <p v-if="error" class="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{{ error }}</p>

          <button type="submit" class="btn-primary w-full py-3" :disabled="loading">
            <span v-if="loading" class="animate-pulse-soft">注册中...</span>
            <span v-else>注 册</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-slate-500">
            已有账号？
            <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium">去登录</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
