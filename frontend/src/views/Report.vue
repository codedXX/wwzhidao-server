<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getAnalysisReport } from '../api/interview'

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
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 animate-fade-in">
    <div>
      <h2 class="text-2xl font-bold text-slate-800">📊 分析报告</h2>
      <p class="text-slate-500 mt-1">结果 ID: {{ resultId }}</p>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="glass-card p-12 text-center">
      <div class="animate-pulse-soft text-4xl mb-4">📊</div>
      <p class="text-slate-500">正在加载报告...</p>
    </div>

    <!-- 错误 -->
    <div v-else-if="error" class="glass-card p-8 text-center">
      <div class="text-4xl mb-4">❌</div>
      <p class="text-red-500">{{ error }}</p>
    </div>

    <!-- 报告内容 -->
    <template v-else-if="report">
      <!-- 总览 -->
      <div class="glass-card p-6">
        <h3 class="text-lg font-bold text-slate-800 mb-4">📋 面试总览</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-primary-50 rounded-xl">
            <p class="text-2xl font-bold text-primary-600">{{ report.matchScore ?? report.overallScore ?? '-' }}</p>
            <p class="text-xs text-slate-500 mt-1">综合得分</p>
          </div>
          <div class="text-center p-4 bg-emerald-50 rounded-xl">
            <p class="text-2xl font-bold text-emerald-600">{{ report.totalQuestions || '-' }}</p>
            <p class="text-xs text-slate-500 mt-1">题目总数</p>
          </div>
          <div class="text-center p-4 bg-blue-50 rounded-xl">
            <p class="text-2xl font-bold text-blue-600">{{ report.answeredQuestions || '-' }}</p>
            <p class="text-xs text-slate-500 mt-1">已作答</p>
          </div>
          <div class="text-center p-4 bg-amber-50 rounded-xl">
            <p class="text-2xl font-bold text-amber-600">{{ report.type || report.interviewType || '-' }}</p>
            <p class="text-xs text-slate-500 mt-1">面试类型</p>
          </div>
        </div>
      </div>

      <!-- 匹配技能 -->
      <div v-if="report.matchedSkills" class="glass-card p-6">
        <h3 class="text-lg font-bold text-slate-800 mb-3">✅ 匹配技能</h3>
        <div class="flex flex-wrap gap-2">
          <span v-for="skill in report.matchedSkills" :key="skill" class="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">{{ skill }}</span>
        </div>
      </div>

      <!-- 缺失技能 -->
      <div v-if="report.missingSkills" class="glass-card p-6">
        <h3 class="text-lg font-bold text-slate-800 mb-3">⚠️ 待提升技能</h3>
        <div class="flex flex-wrap gap-2">
          <span v-for="skill in report.missingSkills" :key="skill" class="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm">{{ skill }}</span>
        </div>
      </div>

      <!-- 问答列表 -->
      <div v-if="report.qaList && report.qaList.length" class="glass-card p-6">
        <h3 class="text-lg font-bold text-slate-800 mb-4">📝 问答详情</h3>
        <div class="space-y-4">
          <div v-for="(qa, idx) in report.qaList" :key="idx" class="p-4 bg-slate-50 rounded-xl space-y-2">
            <div class="flex items-start gap-2">
              <span class="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium">Q{{ Number(idx) + 1 }}</span>
              <p class="text-sm text-slate-700 font-medium">{{ qa.question }}</p>
            </div>
            <div v-if="qa.answer" class="flex items-start gap-2 ml-6">
              <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">A</span>
              <p class="text-sm text-slate-600">{{ qa.answer }}</p>
            </div>
            <div v-if="qa.standardAnswer" class="flex items-start gap-2 ml-6">
              <span class="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">参考</span>
              <p class="text-sm text-amber-700">{{ qa.standardAnswer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 建议 -->
      <div v-if="report.suggestions || report.summary" class="glass-card p-6">
        <h3 class="text-lg font-bold text-slate-800 mb-3">💡 改进建议</h3>
        <p class="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{{ report.suggestions || report.summary }}</p>
      </div>
    </template>
  </div>
</template>
