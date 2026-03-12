<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({ username: '', email: '', password: '', confirmPassword: '' })
const loading = ref(false)
const error = ref('')

const canSubmit = computed(() => {
  return Boolean(
    form.value.username.trim() &&
    form.value.email.trim() &&
    form.value.password &&
    form.value.confirmPassword &&
    !loading.value,
  )
})

async function handleRegister() {
  if (!form.value.username.trim() || !form.value.email.trim() || !form.value.password) {
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
      username: form.value.username.trim(),
      email: form.value.email.trim(),
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
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.14),transparent_30%)]"></div>
    <div class="absolute right-[-5rem] top-[-4rem] h-72 w-72 rounded-full bg-emerald-200/35 blur-3xl"></div>
    <div class="absolute bottom-[-7rem] left-[-3rem] h-80 w-80 rounded-full bg-indigo-200/35 blur-3xl"></div>

    <div class="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/60 bg-white/55 shadow-[0_30px_90px_-32px_rgba(15,23,42,0.42)] backdrop-blur-2xl lg:grid-cols-[0.98fr_1.02fr]">
      <section class="relative hidden overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-primary-800 p-10 text-white lg:block">
        <div class="relative z-10 flex h-full flex-col justify-between">
          <div>
            <div class="mb-5 flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-2xl font-bold backdrop-blur-sm">智</div>
              <div>
                <p class="text-lg font-semibold">智导面试</p>
                <p class="text-sm text-emerald-50/85">开始建立你的专属面试训练空间</p>
              </div>
            </div>
            <div class="mt-10 max-w-md">
              <div class="mb-4 flex flex-wrap gap-2">
                <span class="badge-pill">快速开始</span>
                <span class="badge-pill">智能提问</span>
                <span class="badge-pill">多维报告</span>
              </div>
              <h1 class="text-4xl font-bold tracking-tight">创建账号，开始更高质量的面试练习。</h1>
              <p class="mt-5 text-sm leading-7 text-emerald-50/85">
                建立个人练习档案后，你可以持续积累报告、消费记录和面试训练数据，逐步形成自己的表达优势。
              </p>
            </div>
          </div>

          <div class="grid gap-3">
            <div class="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur-sm">
              <p class="text-sm font-medium">一站式练习路径</p>
              <p class="mt-1 text-sm text-emerald-50/85">从题目预测、模拟面试到结果复盘，注册后即可完整体验。</p>
            </div>
            <div class="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur-sm">
              <p class="text-sm font-medium">训练数据持续沉淀</p>
              <p class="mt-1 text-sm text-emerald-50/85">每次练习都会汇总到个人中心，方便长期跟踪提升轨迹。</p>
            </div>
          </div>
        </div>
      </section>

      <section class="p-6 sm:p-8 lg:p-10">
        <div class="mx-auto flex max-w-md flex-col justify-center">
          <div class="mb-8 text-center lg:text-left">
            <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-2xl font-bold text-white shadow-[0_18px_40px_-18px_rgba(79,70,229,0.9)] lg:mx-0">智</div>
            <h2 class="text-3xl font-bold tracking-tight text-slate-900">创建账号</h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">加入智导面试，开启更系统的求职训练。</p>
          </div>

          <form @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">用户名</label>
              <input v-model="form.username" type="text" class="input-field" placeholder="至少 3 个字符" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">邮箱</label>
              <input v-model="form.email" type="email" class="input-field" placeholder="请输入邮箱地址" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">密码</label>
              <input v-model="form.password" type="password" class="input-field" placeholder="至少 6 个字符" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">确认密码</label>
              <input v-model="form.confirmPassword" type="password" class="input-field" placeholder="请再次输入密码" />
            </div>

            <p v-if="error" class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">{{ error }}</p>

            <button type="submit" class="btn-primary w-full" :disabled="!canSubmit">
              <span v-if="loading" class="animate-pulse-soft">正在创建账号...</span>
              <span v-else>注 册</span>
            </button>
          </form>

          <div class="mt-8 text-center text-sm text-slate-500">
            已有账号？
            <router-link to="/login" class="font-semibold text-primary-600 transition-colors hover:text-primary-700">去登录</router-link>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
