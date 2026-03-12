<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

const canSubmit = computed(() => {
  return Boolean(form.value.email.trim() && form.value.password.trim() && !loading.value)
})

async function handleLogin() {
  if (!form.value.email.trim() || !form.value.password.trim()) {
    error.value = '请填写邮箱和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await userStore.login({
      email: form.value.email.trim(),
      password: form.value.password,
    })
    router.push('/')
  } catch (e: any) {
    error.value = e?.message || '登录失败，请检查邮箱和密码'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_26%)]"></div>
    <div class="absolute left-[-6rem] top-[-5rem] h-72 w-72 rounded-full bg-primary-200/35 blur-3xl"></div>
    <div class="absolute bottom-[-7rem] right-[-4rem] h-80 w-80 rounded-full bg-fuchsia-200/35 blur-3xl"></div>

    <div class="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/60 bg-white/55 shadow-[0_30px_90px_-32px_rgba(15,23,42,0.42)] backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
      <section class="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-primary-900 p-10 text-white lg:block">
        <div class="relative z-10 flex h-full flex-col justify-between">
          <div>
            <div class="mb-5 flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold backdrop-blur-sm">智</div>
              <div>
                <p class="text-lg font-semibold">智导面试</p>
                <p class="text-sm text-slate-300">更像真实面试的 AI 训练场</p>
              </div>
            </div>
            <div class="mt-10 max-w-md">
              <div class="mb-4 flex flex-wrap gap-2 text-primary-100">
                <span class="badge-pill">专项面试</span>
                <span class="badge-pill">简历押题</span>
                <span class="badge-pill">复盘报告</span>
              </div>
              <h1 class="text-4xl font-bold tracking-tight">欢迎回来，继续你的下一轮面试训练。</h1>
              <p class="mt-5 text-sm leading-7 text-slate-300">
                登录后即可继续未完成的练习，查看分析报告，并针对自己的薄弱项做更有针对性的训练。
              </p>
            </div>
          </div>

          <div class="grid gap-3">
            <div class="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
              <p class="text-sm font-medium">更像真实面试现场</p>
              <p class="mt-1 text-sm text-slate-300">流式追问、状态切换和报告反馈都围绕“真实感”设计。</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
              <p class="text-sm font-medium">复盘闭环更清晰</p>
              <p class="mt-1 text-sm text-slate-300">从高频问题预判，到专项模拟，再到报告总结，一次训练完整闭环。</p>
            </div>
          </div>
        </div>
      </section>

      <section class="p-6 sm:p-8 lg:p-10">
        <div class="mx-auto flex max-w-md flex-col justify-center">
          <div class="mb-8 text-center lg:text-left">
            <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-2xl font-bold text-white shadow-[0_18px_40px_-18px_rgba(79,70,229,0.9)] lg:mx-0">智</div>
            <h2 class="text-3xl font-bold tracking-tight text-slate-900">登录账号</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">继续你的 AI 面试训练计划。</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">邮箱</label>
              <input v-model="form.email" type="email" class="input-field" placeholder="请输入邮箱地址" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">密码</label>
              <input v-model="form.password" type="password" class="input-field" placeholder="请输入密码" />
            </div>

            <p v-if="error" class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">{{ error }}</p>

            <button type="submit" class="btn-primary w-full" :disabled="!canSubmit">
              <span v-if="loading" class="animate-pulse-soft">正在登录...</span>
              <span v-else>登 录</span>
            </button>
          </form>

          <div class="mt-8 text-center text-sm text-slate-500">
            还没有账号？
            <router-link to="/register" class="font-semibold text-primary-600 transition-colors hover:text-primary-700">立即注册</router-link>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
