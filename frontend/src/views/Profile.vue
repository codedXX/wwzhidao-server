<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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

const usageCards = computed(() => [
  {
    label: '简历押题',
    value: userStore.user?.resumeQuizRemainingCount || 0,
    tone: 'text-sky-600',
    bg: 'from-sky-50 to-cyan-50',
  },
  {
    label: '专项面试',
    value: userStore.user?.specialRemainingCount || 0,
    tone: 'text-violet-600',
    bg: 'from-violet-50 to-fuchsia-50',
  },
  {
    label: '综合面试',
    value: userStore.user?.behaviorRemainingCount || 0,
    tone: 'text-emerald-600',
    bg: 'from-emerald-50 to-teal-50',
  },
])

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
    await updateUserProfile({
      nickname: form.value.nickname.trim(),
      email: form.value.email.trim(),
      phone: form.value.phone.trim(),
    })
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
  <div class="page-shell">
    <section class="page-hero">
      <div class="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div class="max-w-2xl">
          <div class="mb-4 flex flex-wrap gap-2 text-primary-100">
            <span class="badge-pill">个人档案</span>
            <span class="badge-pill">剩余次数</span>
            <span class="badge-pill">账户设置</span>
          </div>
          <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">个人中心</h2>
          <p class="mt-4 text-sm leading-7 text-slate-200 sm:text-base">维护你的基本信息，并随时查看当前可用的训练次数。</p>
        </div>
        <div class="flex items-center gap-4 rounded-3xl border border-white/12 bg-white/8 px-5 py-4 backdrop-blur-sm">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/12 text-2xl font-bold text-white">
            {{ userStore.user?.username?.charAt(0)?.toUpperCase() || 'U' }}
          </div>
          <div>
            <p class="text-lg font-semibold">{{ userStore.user?.username || '用户' }}</p>
            <p class="text-sm text-slate-300">{{ userStore.user?.email || '暂未设置邮箱' }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-3">
      <div v-for="item in usageCards" :key="item.label" class="metric-card bg-gradient-to-br" :class="item.bg">
        <p class="text-sm text-slate-500">{{ item.label }}</p>
        <p class="mt-3 text-3xl font-bold" :class="item.tone">{{ item.value }}</p>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div class="glass-card p-6">
        <div class="mb-5">
          <h3 class="section-title">编辑资料</h3>
          <p class="section-caption mt-1">更新昵称、邮箱和手机号，让你的账号信息保持最新。</p>
        </div>

        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">昵称</label>
            <input v-model="form.nickname" class="input-field" placeholder="设置昵称" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">邮箱</label>
            <input v-model="form.email" type="email" class="input-field" placeholder="邮箱地址" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">手机号</label>
            <input v-model="form.phone" class="input-field" placeholder="手机号码" />
          </div>

          <p v-if="error" class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">{{ error }}</p>
          <p v-if="success" class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">✅ 更新成功</p>

          <button type="submit" class="btn-primary w-full sm:w-auto" :disabled="loading">
            {{ loading ? '保存中...' : '保存修改' }}
          </button>
        </form>
      </div>

      <aside class="space-y-4">
        <div class="surface-card p-5">
          <h3 class="text-base font-semibold text-slate-900">账号概览</h3>
          <div class="mt-4 space-y-3 text-sm text-slate-600">
            <div class="flex items-center justify-between rounded-2xl bg-slate-50/80 px-4 py-3">
              <span>用户名</span>
              <span class="font-medium text-slate-800">{{ userStore.user?.username || '-' }}</span>
            </div>
            <div class="flex items-center justify-between rounded-2xl bg-slate-50/80 px-4 py-3">
              <span>昵称</span>
              <span class="font-medium text-slate-800">{{ userStore.user?.nickname || '未设置' }}</span>
            </div>
            <div class="flex items-center justify-between rounded-2xl bg-slate-50/80 px-4 py-3">
              <span>手机号</span>
              <span class="font-medium text-slate-800">{{ userStore.user?.phone || '未设置' }}</span>
            </div>
          </div>
        </div>

        <div class="surface-card p-5">
          <h3 class="text-base font-semibold text-slate-900">使用建议</h3>
          <ul class="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>• 保持昵称和邮箱准确，便于后续识别和通知。</li>
            <li>• 建议定期查看剩余次数，合理规划练习节奏。</li>
            <li>• 每次训练结束后，记得回到报告页整理改进点。</li>
          </ul>
        </div>
      </aside>
    </section>
  </div>
</template>
