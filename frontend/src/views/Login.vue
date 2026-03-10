<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!form.value.email || !form.value.password) {
    error.value = '请填写邮箱和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await userStore.login(form.value)
    router.push('/')
  } catch (e: any) {
    error.value = e?.message || '登录失败，请检查邮箱和密码'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
    <!-- 装饰背景 -->
    <div class="absolute top-0 left-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

    <div class="relative z-10 w-full max-w-md px-6 animate-fade-in">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/25">
          <span class="text-white text-2xl font-bold">智</span>
        </div>
        <h1 class="text-3xl font-bold text-slate-800">欢迎回来</h1>
        <p class="text-slate-500 mt-2">登录你的智导面试账号</p>
      </div>

      <!-- 登录表单 -->
      <div class="glass-card p-8">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">邮箱</label>
            <input v-model="form.email" type="email" class="input-field" placeholder="请输入邮箱地址" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">密码</label>
            <input v-model="form.password" type="password" class="input-field" placeholder="请输入密码" />
          </div>

          <p v-if="error" class="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{{ error }}</p>

          <button type="submit" class="btn-primary w-full py-3" :disabled="loading">
            <span v-if="loading" class="animate-pulse-soft">登录中...</span>
            <span v-else>登 录</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-slate-500">
            还没有账号？
            <router-link to="/register" class="text-primary-600 hover:text-primary-700 font-medium">立即注册</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
