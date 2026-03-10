<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { startMockInterview } from '../api/interview'
import type { MockInterviewType, MockInterviewEvent } from '../api/interview'

const router = useRouter()

const form = ref({
  interviewType: 'special' as MockInterviewType,
  candidateName: '',
  company: '',
  positionName: '',
  minSalary: undefined as number | undefined,
  maxSalary: undefined as number | undefined,
  jd: '',
  resumeContent: '',
})

const loading = ref(false)
const error = ref('')

function handleStart() {
  loading.value = true
  error.value = ''

  startMockInterview(
    form.value,
    (event: MockInterviewEvent) => {
      if (event.type === 'start' && event.sessionId) {
        // 收到 start 事件后跳转到面试房间
        router.push({
          name: 'InterviewRoom',
          params: { sessionId: event.sessionId },
          query: {
            resultId: event.resultId || '',
            interviewerName: event.interviewerName || '',
            content: event.content || '',
            interviewType: form.value.interviewType,
          }
        })
      }
      if (event.type === 'error') {
        error.value = event.error || '启动面试失败'
        loading.value = false
      }
    },
    (err) => {
      error.value = err?.message || '请求失败'
      loading.value = false
    }
  )
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6 animate-fade-in">
    <div>
      <h2 class="text-2xl font-bold text-slate-800">🎤 模拟面试</h2>
      <p class="text-slate-500 mt-1">选择面试类型，填写信息后开始你的 AI 模拟面试之旅</p>
    </div>

    <div class="glass-card p-6 space-y-5">
      <!-- 面试类型 -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-3">面试类型</label>
        <div class="grid grid-cols-2 gap-4">
          <button
            @click="form.interviewType = 'special'"
            class="p-4 rounded-xl border-2 text-left transition-all duration-300"
            :class="form.interviewType === 'special' ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-slate-200 hover:border-slate-300'"
          >
            <div class="text-2xl mb-2">🎯</div>
            <h4 class="font-bold text-slate-800">专项面试</h4>
            <p class="text-xs text-slate-500 mt-1">深度技术面试，约 12 道题</p>
          </button>
          <button
            @click="form.interviewType = 'behavior'"
            class="p-4 rounded-xl border-2 text-left transition-all duration-300"
            :class="form.interviewType === 'behavior' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-200 hover:border-slate-300'"
          >
            <div class="text-2xl mb-2">💼</div>
            <h4 class="font-bold text-slate-800">综合面试</h4>
            <p class="text-xs text-slate-500 mt-1">行为面试 + HR，约 8 道题</p>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">候选人姓名</label>
          <input v-model="form.candidateName" class="input-field" placeholder="你的名字" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">目标公司</label>
          <input v-model="form.company" class="input-field" placeholder="如：字节跳动" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">岗位名称</label>
          <input v-model="form.positionName" class="input-field" placeholder="如：前端工程师" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">最低薪资（K）</label>
          <input v-model.number="form.minSalary" type="number" class="input-field" placeholder="20" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">最高薪资（K）</label>
          <input v-model.number="form.maxSalary" type="number" class="input-field" placeholder="35" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1.5">职位描述（JD）</label>
        <textarea v-model="form.jd" class="input-field min-h-[100px] resize-y" placeholder="粘贴职位描述..."></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1.5">简历内容</label>
        <textarea v-model="form.resumeContent" class="input-field min-h-[100px] resize-y" placeholder="粘贴你的简历内容..."></textarea>
      </div>

      <p v-if="error" class="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{{ error }}</p>

      <button @click="handleStart" class="btn-primary w-full py-3" :disabled="loading">
        <span v-if="loading" class="animate-pulse-soft">⏳ 正在启动面试...</span>
        <span v-else>🚀 开始面试</span>
      </button>
    </div>
  </div>
</template>
