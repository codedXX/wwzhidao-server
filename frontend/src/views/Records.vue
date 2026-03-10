<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserConsumptionRecords } from '../api/user'

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

const statusLabels: Record<string, { text: string; class: string }> = {
  success: { text: '成功', class: 'bg-emerald-50 text-emerald-700' },
  failed: { text: '失败', class: 'bg-red-50 text-red-700' },
  refunded: { text: '已退款', class: 'bg-amber-50 text-amber-700' },
  pending: { text: '进行中', class: 'bg-blue-50 text-blue-700' },
}

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
  <div class="max-w-4xl mx-auto space-y-6 animate-fade-in">
    <div>
      <h2 class="text-2xl font-bold text-slate-800">📋 消费记录</h2>
      <p class="text-slate-500 mt-1">查看你的功能使用历史</p>
    </div>

    <div v-if="loading" class="glass-card p-12 text-center">
      <div class="animate-pulse-soft text-4xl mb-4">📋</div>
      <p class="text-slate-500">加载中...</p>
    </div>

    <div v-else-if="records.length === 0" class="glass-card p-12 text-center">
      <div class="text-4xl mb-4">📭</div>
      <p class="text-slate-500">暂无消费记录</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="record in records" :key="record.recordId" class="glass-card p-4 flex items-center justify-between card-hover">
        <div class="flex items-center gap-4">
          <div class="text-2xl">{{ typeLabels[record.type]?.charAt(0) || '📄' }}</div>
          <div>
            <p class="font-medium text-slate-800 text-sm">{{ record.description || typeLabels[record.type] || record.type }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ formatDate(record.createdAt) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-slate-600">-{{ record.consumedCount }} 次</span>
          <span
            class="px-2 py-0.5 rounded-full text-xs font-medium"
            :class="statusLabels[record.status]?.class || 'bg-slate-100 text-slate-600'"
          >
            {{ statusLabels[record.status]?.text || record.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
