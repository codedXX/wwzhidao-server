<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getUserConsumptionRecords } from '../../api/user'

interface ConsumptionRecordItem {
  recordId: string
  type: string
  status: string
  consumedCount: number
  description: string
  createdAt: string
}

const records = ref<ConsumptionRecordItem[]>([])
const loading = ref(true)
const total = ref(0)
const page = ref(0)
const limit = 20

const typeLabels: Record<string, string> = {
  resume_quiz: '📝 简历押题',
  special_interview: '🎯 专项面试',
  behavior_interview: '💼 综合面试',
}

const typeTone: Record<string, string> = {
  resume_quiz: 'bg-sky-50 text-sky-700',
  special_interview: 'bg-violet-50 text-violet-700',
  behavior_interview: 'bg-emerald-50 text-emerald-700',
}

const statusLabels: Record<string, { text: string; class: string }> = {
  success: { text: '成功', class: 'bg-emerald-50 text-emerald-700' },
  failed: { text: '失败', class: 'bg-red-50 text-red-700' },
  refunded: { text: '已退款', class: 'bg-amber-50 text-amber-700' },
  pending: { text: '进行中', class: 'bg-blue-50 text-blue-700' },
}

const summary = computed(() => ({
  total: total.value,
  success: records.value.filter((item) => item.status === 'success').length,
  refunded: records.value.filter((item) => item.status === 'refunded').length,
}))

onMounted(() => fetchRecords())

async function fetchRecords() {
  loading.value = true
  try {
    const res: any = await getUserConsumptionRecords(page.value * limit, limit)
    records.value = res.data?.records || res.data || []
    total.value = res.data?.total || records.value.length
  } catch (e) {
    console.error('获取消费记录失败', e)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="page-shell">
    <section class="page-hero">
      <div class="relative z-10 max-w-3xl">
        <div class="mb-4 flex flex-wrap gap-2 text-primary-100">
          <span class="badge-pill">消费明细</span>
          <span class="badge-pill">训练轨迹</span>
          <span class="badge-pill">账户记录</span>
        </div>
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">消费记录</h2>
        <p class="mt-4 text-sm leading-7 text-slate-200 sm:text-base">查看每一次训练能力的消耗情况，快速回看最近的使用历史。</p>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-3">
      <div class="metric-card bg-gradient-to-br from-slate-50 to-slate-100">
        <p class="text-sm text-slate-500">总记录数</p>
        <p class="mt-3 text-3xl font-bold text-slate-900">{{ summary.total }}</p>
      </div>
      <div class="metric-card bg-gradient-to-br from-emerald-50 to-teal-50">
        <p class="text-sm text-slate-500">成功记录</p>
        <p class="mt-3 text-3xl font-bold text-emerald-600">{{ summary.success }}</p>
      </div>
      <div class="metric-card bg-gradient-to-br from-amber-50 to-orange-50">
        <p class="text-sm text-slate-500">退款记录</p>
        <p class="mt-3 text-3xl font-bold text-amber-600">{{ summary.refunded }}</p>
      </div>
    </section>

    <div v-if="loading" class="glass-card p-14 text-center">
      <div class="mb-4 text-4xl animate-pulse-soft">📋</div>
      <p class="text-slate-500">加载中...</p>
    </div>

    <div v-else-if="records.length === 0" class="glass-card p-14 text-center">
      <div class="mb-4 text-4xl">📭</div>
      <p class="text-slate-600">暂无消费记录</p>
      <p class="mt-2 text-sm text-slate-400">开始一次练习后，这里会自动记录你的使用历史。</p>
    </div>

    <section v-else class="glass-card p-4 sm:p-5">
      <div class="mb-4 flex items-center justify-between gap-4 px-2">
        <div>
          <h3 class="section-title text-xl">最近记录</h3>
          <p class="section-caption">按时间倒序展示最近的功能使用明细。</p>
        </div>
      </div>

      <div class="space-y-3">
        <article
          v-for="record in records"
          :key="record.recordId"
          class="surface-card card-hover flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0 flex items-start gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl text-xl" :class="typeTone[record.type] || 'bg-slate-100 text-slate-700'">
              {{ typeLabels[record.type]?.charAt(0) || '📄' }}
            </div>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <p class="truncate text-sm font-semibold text-slate-900">{{ record.description || typeLabels[record.type] || record.type }}</p>
                <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="typeTone[record.type] || 'bg-slate-100 text-slate-700'">
                  {{ typeLabels[record.type] || record.type }}
                </span>
              </div>
              <p class="mt-1 text-sm text-slate-500">{{ formatDate(record.createdAt) }}</p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-3 sm:justify-end">
            <span class="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">-{{ record.consumedCount }} 次</span>
            <span
              class="rounded-full px-3 py-1 text-xs font-medium"
              :class="statusLabels[record.status]?.class || 'bg-slate-100 text-slate-600'"
            >
              {{ statusLabels[record.status]?.text || record.status }}
            </span>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
