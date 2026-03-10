<script setup lang="ts">
import { useUserStore } from '../store/user'
import { onMounted } from 'vue'

const userStore = useUserStore()

onMounted(() => {
  userStore.fetchUserInfo()
})

const features = [
  {
    icon: '📝',
    title: '简历押题',
    desc: '基于你的简历和 JD 智能生成面试题',
    path: '/resume-quiz',
    gradient: 'from-blue-500 to-cyan-500',
    remaining: () => userStore.user?.resumeQuizRemainingCount || 0,
  },
  {
    icon: '🎯',
    title: '专项面试',
    desc: '深度技术面试模拟，AI 面试官一对一',
    path: '/mock-interview',
    gradient: 'from-primary-500 to-purple-500',
    remaining: () => userStore.user?.specialRemainingCount || 0,
  },
  {
    icon: '💼',
    title: '综合面试',
    desc: '行为面试 + HR 面试全流程模拟',
    path: '/mock-interview',
    gradient: 'from-emerald-500 to-teal-500',
    remaining: () => userStore.user?.behaviorRemainingCount || 0,
  },
]
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- 欢迎横幅 -->
    <div class="bg-gradient-to-r from-primary-500 via-primary-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3"></div>
      <div class="relative z-10">
        <h2 class="text-2xl font-bold">你好，{{ userStore.user?.username || '同学' }} 👋</h2>
        <p class="text-primary-100 mt-2 text-lg">准备好今天的面试练习了吗？让 AI 助你一臂之力！</p>
      </div>
    </div>

    <!-- 功能卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <router-link
        v-for="feature in features"
        :key="feature.title"
        :to="feature.path"
        class="glass-card p-6 card-hover group cursor-pointer block"
      >
        <div
          class="w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-2xl bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:scale-110"
          :class="feature.gradient"
        >
          <span class="brightness-0 invert">{{ feature.icon }}</span>
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-1">{{ feature.title }}</h3>
        <p class="text-sm text-slate-500 mb-3">{{ feature.desc }}</p>
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-400">剩余次数</span>
          <span class="text-lg font-bold text-primary-600">{{ feature.remaining() }}</span>
        </div>
      </router-link>
    </div>

    <!-- 快速提示 -->
    <div class="glass-card p-6">
      <h3 class="text-lg font-bold text-slate-800 mb-4">💡 使用技巧</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50">
          <span class="text-xl">📄</span>
          <div>
            <p class="text-sm font-medium text-slate-700">准备好简历</p>
            <p class="text-xs text-slate-500">上传你的简历，AI 会根据简历内容生成定制化面试题</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50">
          <span class="text-xl">🎯</span>
          <div>
            <p class="text-sm font-medium text-slate-700">填写职位信息</p>
            <p class="text-xs text-slate-500">提供公司名称和 JD，获得更精准的面试模拟</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 rounded-xl bg-green-50/50">
          <span class="text-xl">⏱</span>
          <div>
            <p class="text-sm font-medium text-slate-700">模拟真实面试环境</p>
            <p class="text-xs text-slate-500">专项面试约 2 小时，综合面试约 2 小时</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50">
          <span class="text-xl">📊</span>
          <div>
            <p class="text-sm font-medium text-slate-700">查看分析报告</p>
            <p class="text-xs text-slate-500">面试结束后获取 AI 多维评估和改进建议</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
