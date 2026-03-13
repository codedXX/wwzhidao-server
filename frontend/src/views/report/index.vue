<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getAnalysisReport } from '../../api/interview'

const route = useRoute()
const resultId = route.params.resultId as string

const report = ref<any>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const res: any = await getAnalysisReport(resultId)
    report.value = res.data
  } catch (e: any) {
    error.value = e?.message || '获取报告失败'
  } finally {
    loading.value = false
  }
})

const summaryCards = computed(() => {
  if (!report.value) return []
  return [
    {
      label: '综合得分',
      value: report.value.matchScore ?? report.value.overallScore ?? '-',
      tone: 'text-primary-600',
      bg: 'from-primary-50 to-violet-50',
    },
    {
      label: '题目总数',
      value: report.value.totalQuestions || '-',
      tone: 'text-emerald-600',
      bg: 'from-emerald-50 to-teal-50',
    },
    {
      label: '已作答',
      value: report.value.answeredQuestions || '-',
      tone: 'text-sky-600',
      bg: 'from-sky-50 to-cyan-50',
    },
    {
      label: '面试类型',
      value: report.value.type || report.value.interviewType || '-',
      tone: 'text-amber-600',
      bg: 'from-amber-50 to-orange-50',
    },
  ]
})
</script>

<template>
  <div class="page-shell">
    <section class="page-hero">
      <div class="relative z-10 max-w-3xl">
        <div class="mb-4 flex flex-wrap gap-2 text-primary-100">
          <span class="badge-pill">结果复盘</span>
          <span class="badge-pill">能力总结</span>
          <span class="badge-pill">改进建议</span>
        </div>
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">分析报告</h2>
        <p class="mt-3 text-sm leading-7 text-slate-200">结果 ID：{{ resultId }}</p>
      </div>
    </section>

    <div v-if="loading" class="glass-card p-14 text-center">
      <div class="mb-4 text-4xl animate-pulse-soft">📊</div>
      <p class="text-slate-500">正在加载报告...</p>
    </div>

    <div v-else-if="error" class="glass-card p-10 text-center">
      <div class="mb-4 text-4xl">❌</div>
      <p class="text-red-500">{{ error }}</p>
    </div>

    <template v-else-if="report">
      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="card in summaryCards" :key="card.label" class="metric-card bg-gradient-to-br" :class="card.bg">
          <p class="text-sm text-slate-500">{{ card.label }}</p>
          <p class="mt-3 text-3xl font-bold" :class="card.tone">{{ card.value }}</p>
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div class="space-y-6">
          <div v-if="report.qaList && report.qaList.length" class="glass-card p-6">
            <div class="mb-5">
              <h3 class="section-title">问答详情</h3>
              <p class="section-caption mt-1">回看每一道题目的提问、作答与参考答案。</p>
            </div>
            <div class="space-y-4">
              <article v-for="(qa, idx) in report.qaList" :key="idx" class="surface-card p-5">
                <div class="flex items-start gap-3">
                  <span class="mt-0.5 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700">Q{{ Number(idx) + 1 }}</span>
                  <p class="text-sm font-medium leading-6 text-slate-800 whitespace-pre-wrap">{{ qa.question }}</p>
                </div>
                <div v-if="qa.answer" class="mt-4 rounded-2xl bg-emerald-50/70 p-4">
                  <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">你的回答</p>
                  <p class="text-sm leading-6 text-emerald-900 whitespace-pre-wrap">{{ qa.answer }}</p>
                </div>
                <div v-if="qa.standardAnswer" class="mt-3 rounded-2xl bg-amber-50/80 p-4">
                  <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700">参考答案</p>
                  <p class="text-sm leading-6 text-amber-900 whitespace-pre-wrap">{{ qa.standardAnswer }}</p>
                </div>
              </article>
            </div>
          </div>

          <div v-if="report.suggestions || report.summary" class="glass-card p-6">
            <h3 class="section-title">改进建议</h3>
            <p class="section-caption mt-1">重点关注能显著提升下一次表现的部分。</p>
            <div class="mt-4 rounded-2xl bg-slate-50/80 p-5 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
              {{ report.suggestions || report.summary }}
            </div>
          </div>
        </div>

        <aside class="space-y-6">
          <div v-if="report.matchedSkills?.length" class="surface-card p-5">
            <h3 class="text-base font-semibold text-slate-900">匹配技能</h3>
            <div class="mt-4 flex flex-wrap gap-2">
              <span v-for="skill in report.matchedSkills" :key="skill" class="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">{{ skill }}</span>
            </div>
          </div>

          <div v-if="report.missingSkills?.length" class="surface-card p-5">
            <h3 class="text-base font-semibold text-slate-900">待提升技能</h3>
            <div class="mt-4 flex flex-wrap gap-2">
              <span v-for="skill in report.missingSkills" :key="skill" class="rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-700">{{ skill }}</span>
            </div>
          </div>

          <div class="surface-card p-5">
            <h3 class="text-base font-semibold text-slate-900">如何利用这份报告</h3>
            <ul class="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>• 先看低分项，优先解决最影响面试结果的问题。</li>
              <li>• 把参考答案整理成自己的表达版本，再复述一遍。</li>
              <li>• 针对待提升技能补充项目案例或知识点说明。</li>
            </ul>
          </div>
        </aside>
      </section>
    </template>
  </div>
</template>
