<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()

onMounted(() => {
  userStore.fetchUserInfo()
})

const features = [
  {
    icon: '📝',
    title: '简历押题',
    desc: '基于简历和 JD 生成高频题，适合面前快速热身。',
    path: '/resumeQuiz',
    gradient: 'from-sky-500 via-cyan-500 to-blue-600',
    remaining: () => userStore.user?.resumeQuizRemainingCount || 0,
    accent: 'bg-sky-50 text-sky-700',
  },
  {
    icon: '🎯',
    title: '专项面试',
    desc: '围绕目标岗位深挖技术细节，适合系统性训练。',
    path: '/mockInterview',
    gradient: 'from-primary-500 via-violet-500 to-fuchsia-600',
    remaining: () => userStore.user?.specialRemainingCount || 0,
    accent: 'bg-violet-50 text-violet-700',
  },
  {
    icon: '💼',
    title: '综合面试',
    desc: '聚焦项目表达、行为面和 HR 提问，提升表达与临场感。',
    path: '/mockInterview',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    remaining: () => userStore.user?.behaviorRemainingCount || 0,
    accent: 'bg-emerald-50 text-emerald-700',
  },
]

const stats = computed(() => [
  {
    label: '押题次数',
    value: userStore.user?.resumeQuizRemainingCount || 0,
    tone: 'text-sky-600',
  },
  {
    label: '专项面试',
    value: userStore.user?.specialRemainingCount || 0,
    tone: 'text-violet-600',
  },
  {
    label: '综合面试',
    value: userStore.user?.behaviorRemainingCount || 0,
    tone: 'text-emerald-600',
  },
])
</script>

<template>
  <div class="page-shell">
    <section class="page-hero">
      <div class="relative z-10 max-w-3xl">
        <div class="mb-4 flex flex-wrap gap-2 text-primary-100">
          <span class="badge-pill">AI 面试助手</span>
          <span class="badge-pill">个性化提问</span>
          <span class="badge-pill">实时反馈</span>
        </div>
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">你好，{{ userStore.user?.username || '同学' }}，今天准备攻克哪一类面试？</h2>
        <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
          用一套更接近真实面试现场的练习流程，快速进入状态：先热身、再专项、最后复盘。
        </p>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-3">
      <div v-for="item in stats" :key="item.label" class="metric-card">
        <p class="text-sm text-slate-500">{{ item.label }}</p>
        <p class="mt-3 text-3xl font-bold" :class="item.tone">{{ item.value }}</p>
      </div>
    </section>

    <section>
      <div class="mb-4 flex items-end justify-between gap-4">
        <div>
          <h3 class="section-title">开始训练</h3>
          <p class="section-caption">三种练习模式覆盖热身、深挖和综合表达。</p>
        </div>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <router-link
          v-for="feature in features"
          :key="feature.title"
          :to="feature.path"
          class="glass-card card-hover group block overflow-hidden p-6"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg" :class="feature.gradient">
              <span class="brightness-0 invert">{{ feature.icon }}</span>
            </div>
            <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="feature.accent">剩余 {{ feature.remaining() }} 次</span>
          </div>
          <h4 class="mt-6 text-xl font-semibold text-slate-900">{{ feature.title }}</h4>
          <p class="mt-2 text-sm leading-6 text-slate-500">{{ feature.desc }}</p>
          <div class="mt-6 flex items-center gap-2 text-sm font-medium text-primary-600">
            <span>立即进入</span>
            <span class="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </div>
        </router-link>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div class="surface-card p-6">
        <h3 class="section-title">推荐练习路径</h3>
        <p class="section-caption mt-2">按照这条路径练习，体验会更接近真实求职节奏。</p>
        <div class="mt-6 space-y-4">
          <div class="flex items-start gap-4 rounded-2xl bg-slate-50/80 p-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">1</div>
            <div>
              <p class="font-semibold text-slate-800">先做简历押题</p>
              <p class="mt-1 text-sm leading-6 text-slate-500">快速摸清高频问题和知识盲点，建立提问预期。</p>
            </div>
          </div>
          <div class="flex items-start gap-4 rounded-2xl bg-slate-50/80 p-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">2</div>
            <div>
              <p class="font-semibold text-slate-800">再做专项深挖</p>
              <p class="mt-1 text-sm leading-6 text-slate-500">围绕岗位核心能力做系统化追问，更适合冲刺准备。</p>
            </div>
          </div>
          <div class="flex items-start gap-4 rounded-2xl bg-slate-50/80 p-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">3</div>
            <div>
              <p class="font-semibold text-slate-800">最后看报告复盘</p>
              <p class="mt-1 text-sm leading-6 text-slate-500">从回答完整度、表达逻辑和岗位匹配度三个维度回看表现。</p>
            </div>
          </div>
        </div>
      </div>

      <div class="surface-card p-6">
        <h3 class="section-title">练习建议</h3>
        <div class="mt-5 space-y-4 text-sm leading-6 text-slate-600">
          <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
            <p class="font-medium text-slate-800">用具体项目讲故事</p>
            <p class="mt-1">回答时尽量带上项目背景、目标、你的动作和最终结果。</p>
          </div>
          <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
            <p class="font-medium text-slate-800">控制回答节奏</p>
            <p class="mt-1">先给结论，再补细节，会让整体表达更有层次。</p>
          </div>
          <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
            <p class="font-medium text-slate-800">把弱项留到复盘解决</p>
            <p class="mt-1">碰到不会的问题先组织思路，报告页再专门回看和整理。</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
