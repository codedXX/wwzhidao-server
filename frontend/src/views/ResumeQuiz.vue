<script setup lang="ts">
import { ref } from 'vue'
import { resumeQuizStream } from '../api/interview'
import type { ProgressEvent } from '../api/interview'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  company: '',
  positionName: '',
  minSalary: undefined as number | undefined,
  maxSalary: undefined as number | undefined,
  jd: '',
  resumeContent: '',
})

const loading = ref(false)
const progress = ref(0)
const progressLabel = ref('')
const progressStep = ref(0)
const resultId = ref('')
const error = ref('')
let controller: AbortController | null = null

function handleSubmit() {
  if (!form.value.positionName || !form.value.jd) {
    error.value = '请填写岗位名称和职位描述'
    return
  }
  if (form.value.jd.length < 50) {
    error.value = '职位描述至少需要 50 个字符'
    return
  }

  loading.value = true
  error.value = ''
  progress.value = 0
  progressLabel.value = '正在准备...'

  controller = resumeQuizStream(
    {
      company: form.value.company,
      positionName: form.value.positionName,
      minSalary: form.value.minSalary,
      maxSalary: form.value.maxSalary,
      jd: form.value.jd,
      resumeContent: form.value.resumeContent || undefined,
    },
    (event: ProgressEvent) => {
      if (event.type === 'progress') {
        progress.value = event.progress || 0
        progressLabel.value = event.label || ''
        progressStep.value = event.step || 0
      } else if (event.type === 'complete') {
        resultId.value = event.data?.resultId || ''
        loading.value = false
        progress.value = 100
        progressLabel.value = '生成完成！'
      } else if (event.type === 'error') {
        error.value = event.error || '生成失败'
        loading.value = false
      }
    },
    (err) => {
      error.value = err?.message || '请求失败'
      loading.value = false
    },
    () => {
      loading.value = false
    }
  )
}

function handleCancel() {
  controller?.abort()
  loading.value = false
}

function viewReport() {
  if (resultId.value) {
    router.push(`/report/${resultId.value}`)
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6 animate-fade-in">
    <div>
      <h2 class="text-2xl font-bold text-slate-800">📝 简历押题</h2>
      <p class="text-slate-500 mt-1">基于你的简历和目标职位，AI 智能生成高概率面试题</p>
    </div>

    <!-- 表单 -->
    <div class="glass-card p-6 space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">公司名称（选填）</label>
          <input v-model="form.company" class="input-field" placeholder="如：字节跳动" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">岗位名称 *</label>
          <input v-model="form.positionName" class="input-field" placeholder="如：前端开发工程师" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">最低薪资（K）</label>
          <input v-model.number="form.minSalary" type="number" class="input-field" placeholder="如：20" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">最高薪资（K）</label>
          <input v-model.number="form.maxSalary" type="number" class="input-field" placeholder="如：35" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1.5">职位描述（JD）*</label>
        <textarea v-model="form.jd" class="input-field min-h-[120px] resize-y" placeholder="请粘贴完整的职位描述，至少 50 个字符..."></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1.5">简历内容（选填）</label>
        <textarea v-model="form.resumeContent" class="input-field min-h-[100px] resize-y" placeholder="粘贴你的简历内容，AI 会据此生成更个性化的面试题"></textarea>
      </div>

      <p v-if="error" class="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{{ error }}</p>

      <!-- 进度条 -->
      <div v-if="loading" class="space-y-3">
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-600">{{ progressLabel }}</span>
          <span class="font-medium text-primary-600">{{ progress }}%</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div class="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-500" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <div class="flex gap-3">
        <button v-if="!loading" @click="handleSubmit" class="btn-primary flex-1">
          🚀 开始生成面试题
        </button>
        <button v-if="loading" @click="handleCancel" class="btn-secondary flex-1">
          取消
        </button>
        <button v-if="resultId" @click="viewReport" class="btn-secondary">
          📊 查看报告
        </button>
      </div>
    </div>
  </div>
</template>
