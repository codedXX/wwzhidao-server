<script setup lang="ts">
import { computed, ref } from 'vue'
import { resumeQuizStream } from '../../api/interview'
import type { ProgressEvent } from '../../api/interview'
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

const canSubmit = computed(() => {
  if (!form.value.positionName.trim()) return false
  if (!form.value.jd.trim()) return false
  if (form.value.jd.trim().length < 50) return false
  if (
    form.value.minSalary !== undefined &&
    form.value.maxSalary !== undefined &&
    form.value.minSalary > form.value.maxSalary
  ) {
    return false
  }
  return !loading.value
})

function handleSubmit() {
  if (!form.value.positionName.trim() || !form.value.jd.trim()) {
    error.value = '请填写岗位名称和职位描述'
    return
  }
  if (form.value.jd.trim().length < 50) {
    error.value = '职位描述至少需要 50 个字符'
    return
  }
  if (
    form.value.minSalary !== undefined &&
    form.value.maxSalary !== undefined &&
    form.value.minSalary > form.value.maxSalary
  ) {
    error.value = '最低薪资不能高于最高薪资'
    return
  }

  loading.value = true
  error.value = ''
  progress.value = 0
  progressLabel.value = '正在准备题目...'

  controller = resumeQuizStream(
    {
      company: form.value.company.trim() || undefined,
      positionName: form.value.positionName.trim(),
      minSalary: form.value.minSalary,
      maxSalary: form.value.maxSalary,
      jd: form.value.jd.trim(),
      resumeContent: form.value.resumeContent.trim() || undefined,
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
        progressLabel.value = '生成完成，准备查看报告'
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
  <div class="page-shell">
    <section class="page-hero">
      <div class="relative z-10 max-w-3xl">
        <div class="mb-4 flex flex-wrap gap-2 text-primary-100">
          <span class="badge-pill">高频问题预测</span>
          <span class="badge-pill">贴合 JD</span>
          <span class="badge-pill">简历定制</span>
        </div>
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">简历押题</h2>
        <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
          把职位描述和简历交给 AI，它会帮你提前预判更可能出现的面试题与考点。
        </p>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div class="glass-card space-y-5 p-6">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">公司名称（选填）</label>
            <input v-model="form.company" class="input-field" placeholder="如：字节跳动" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">岗位名称 <span class="text-rose-500">*</span></label>
            <input v-model="form.positionName" class="input-field" placeholder="如：前端开发工程师" />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">最低薪资（K）</label>
            <input v-model.number="form.minSalary" type="number" class="input-field" placeholder="20" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">最高薪资（K）</label>
            <input v-model.number="form.maxSalary" type="number" class="input-field" placeholder="35" />
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">职位描述（JD） <span class="text-rose-500">*</span></label>
          <textarea v-model="form.jd" class="input-field min-h-[150px] resize-y" placeholder="请尽量粘贴完整 JD，至少 50 个字符。"></textarea>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">简历内容（选填）</label>
          <textarea v-model="form.resumeContent" class="input-field min-h-[130px] resize-y" placeholder="补充简历内容后，生成的问题会更贴近你的真实项目经历。"></textarea>
        </div>

        <p v-if="error" class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">{{ error }}</p>

        <div v-if="loading" class="surface-card space-y-3 p-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-600">{{ progressLabel }}</span>
            <span class="font-semibold text-primary-600">{{ progress }}%</span>
          </div>
          <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div class="h-full rounded-full bg-gradient-to-r from-primary-500 via-violet-500 to-sky-500 transition-all duration-500" :style="{ width: progress + '%' }"></div>
          </div>
          <p class="text-xs text-slate-400">当前步骤：{{ progressStep || 1 }}</p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row">
          <button v-if="!loading" @click="handleSubmit" class="btn-primary flex-1" :disabled="!canSubmit">🚀 开始生成面试题</button>
          <button v-if="loading" @click="handleCancel" class="btn-secondary flex-1">取消生成</button>
          <button v-if="resultId" @click="viewReport" class="btn-secondary">📊 查看报告</button>
        </div>
      </div>

      <aside class="space-y-4">
        <div class="surface-card p-5">
          <h3 class="text-base font-semibold text-slate-900">填写建议</h3>
          <ul class="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>• 岗位名称和 JD 越具体，题目越不泛泛而谈。</li>
            <li>• 如果你投的是细分方向，建议在 JD 中保留技术栈要求。</li>
            <li>• 简历内容建议保留项目经历和关键技术关键词。</li>
          </ul>
        </div>
        <div class="surface-card p-5">
          <h3 class="text-base font-semibold text-slate-900">生成结果</h3>
          <p class="mt-3 text-sm leading-6 text-slate-600">完成后你可以直接进入报告页，查看题目列表、答案建议和改进方向。</p>
        </div>
      </aside>
    </section>
  </div>
</template>
