<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { answerMockInterview, endMockInterview, pauseMockInterview, resumeMockInterview as resumeInterviewApi } from '../api/interview'
import type { MockInterviewEvent } from '../api/interview'

const route = useRoute()
const router = useRouter()

const sessionId = ref(route.params.sessionId as string)
const resultId = ref((route.query.resultId as string) || '')
const interviewerName = ref((route.query.interviewerName as string) || '面试官')

interface Message {
  role: 'interviewer' | 'candidate'
  content: string
  isStreaming?: boolean
  timestamp: Date
}

const messages = ref<Message[]>([])
const userInput = ref('')
const isThinking = ref(false)
const isWaiting = ref(false)
const isPaused = ref(false)
const isEnded = ref(false)
const questionNumber = ref(0)
const totalQuestions = ref(0)
const elapsedMinutes = ref(0)
const chatContainer = ref<HTMLElement | null>(null)
const referenceAnswer = ref('')
const showReference = ref(false)

let controller: AbortController | null = null

// 初始化 - 添加开场白
onMounted(() => {
  const initialContent = route.query.content as string
  if (initialContent) {
    messages.value.push({
      role: 'interviewer',
      content: initialContent,
      timestamp: new Date(),
    })
    isWaiting.value = true
  }
})

onUnmounted(() => {
  controller?.abort()
})

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

function sendAnswer() {
  if (!userInput.value.trim() || isThinking.value) return

  const answer = userInput.value.trim()
  userInput.value = ''
  isWaiting.value = false
  isThinking.value = true
  referenceAnswer.value = ''
  showReference.value = false

  messages.value.push({
    role: 'candidate',
    content: answer,
    timestamp: new Date(),
  })
  scrollToBottom()

  // 添加一个占位的 interviewer 消息用于流式更新
  const interviewerMsgIndex = messages.value.length
  messages.value.push({
    role: 'interviewer',
    content: '',
    isStreaming: true,
    timestamp: new Date(),
  })

  controller = answerMockInterview(
    { sessionId: sessionId.value, answer },
    (event: MockInterviewEvent) => {
      if (event.type === 'thinking') {
        isThinking.value = true
      }
      if (event.type === 'question') {
        isThinking.value = false
        if (messages.value[interviewerMsgIndex]) {
          messages.value[interviewerMsgIndex]!.content = event.content || ''
          messages.value[interviewerMsgIndex]!.isStreaming = event.isStreaming ?? true
        }
        questionNumber.value = event.questionNumber ?? questionNumber.value
        totalQuestions.value = event.totalQuestions ?? totalQuestions.value
        elapsedMinutes.value = event.elapsedMinutes ?? elapsedMinutes.value
        scrollToBottom()
      }
      if (event.type === 'reference_answer') {
        referenceAnswer.value = event.content || ''
        showReference.value = true
      }
      if (event.type === 'waiting') {
        isWaiting.value = true
        isThinking.value = false
        if (messages.value[interviewerMsgIndex]) {
          messages.value[interviewerMsgIndex]!.isStreaming = false
        }
      }
      if (event.type === 'end') {
        isEnded.value = true
        isThinking.value = false
        isWaiting.value = false
        resultId.value = event.resultId || resultId.value
        if (event.content && messages.value[interviewerMsgIndex]) {
          messages.value[interviewerMsgIndex]!.content = event.content
          messages.value[interviewerMsgIndex]!.isStreaming = false
        }
        scrollToBottom()
      }
      if (event.type === 'error') {
        isThinking.value = false
        if (messages.value[interviewerMsgIndex]) {
          messages.value[interviewerMsgIndex]!.content = `❌ 错误: ${event.error}`
          messages.value[interviewerMsgIndex]!.isStreaming = false
        }
      }
    },
    (err) => {
      isThinking.value = false
      if (messages.value[interviewerMsgIndex]) {
        messages.value[interviewerMsgIndex]!.content = `❌ 请求失败: ${err.message}`
        messages.value[interviewerMsgIndex]!.isStreaming = false
      }
    }
  )
}

async function handleEnd() {
  if (!resultId.value) return
  try {
    await endMockInterview(resultId.value)
    isEnded.value = true
  } catch (e: any) {
    console.error('结束面试失败', e)
  }
}

async function handlePause() {
  if (!resultId.value) return
  try {
    await pauseMockInterview(resultId.value)
    isPaused.value = true
  } catch (e: any) {
    console.error('暂停失败', e)
  }
}

async function handleResume() {
  if (!resultId.value) return
  try {
    await resumeInterviewApi(resultId.value)
    isPaused.value = false
  } catch (e: any) {
    console.error('恢复失败', e)
  }
}

function viewReport() {
  if (resultId.value) {
    router.push(`/report/${resultId.value}`)
  }
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
    <!-- 顶栏信息 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-lg">
          面
        </div>
        <div>
          <h3 class="font-bold text-slate-800">{{ interviewerName }}</h3>
          <p class="text-xs text-slate-500">
            第 {{ questionNumber }} 题 / 约 {{ totalQuestions }} 题
            <span v-if="elapsedMinutes"> · 已用 {{ elapsedMinutes }} 分钟</span>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button v-if="!isEnded && !isPaused" @click="handlePause" class="btn-secondary text-xs py-1.5 px-3">⏸ 暂停</button>
        <button v-if="isPaused" @click="handleResume" class="btn-primary text-xs py-1.5 px-3">▶️ 继续</button>
        <button v-if="!isEnded" @click="handleEnd" class="text-xs py-1.5 px-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors">结束面试</button>
        <button v-if="isEnded && resultId" @click="viewReport" class="btn-primary text-xs py-1.5 px-3">📊 查看报告</button>
      </div>
    </div>

    <!-- 聊天区域 -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto space-y-4 px-2 pb-4">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="flex animate-slide-up"
        :class="msg.role === 'candidate' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm"
          :class="msg.role === 'candidate'
            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-md'
            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-md'"
        >
          <div class="whitespace-pre-wrap">{{ msg.content }}<span v-if="msg.isStreaming" class="typing-cursor"></span></div>
        </div>
      </div>

      <!-- 思考中 -->
      <div v-if="isThinking" class="flex justify-start animate-slide-up">
        <div class="bg-white border border-slate-100 px-5 py-3.5 rounded-2xl rounded-bl-md shadow-sm">
          <div class="flex items-center gap-2 text-slate-500">
            <span class="animate-pulse-soft">🤔</span>
            <span class="text-sm">面试官正在思考...</span>
          </div>
        </div>
      </div>

      <!-- 暂停提示 -->
      <div v-if="isPaused" class="text-center py-4">
        <span class="px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-sm">⏸ 面试已暂停，进度已保存</span>
      </div>

      <!-- 面试结束 -->
      <div v-if="isEnded" class="text-center py-4">
        <span class="px-4 py-2 bg-primary-50 text-primary-600 rounded-full text-sm">✅ 面试已结束</span>
      </div>
    </div>

    <!-- 参考答案 -->
    <div v-if="showReference && referenceAnswer" class="mb-3 mx-2">
      <div class="bg-amber-50/80 border border-amber-200/50 rounded-xl p-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-sm">💡</span>
          <span class="text-xs font-medium text-amber-700">参考答案</span>
        </div>
        <p class="text-xs text-amber-800 leading-relaxed whitespace-pre-wrap">{{ referenceAnswer }}</p>
      </div>
    </div>

    <!-- 输入区域 -->
    <div v-if="!isEnded && !isPaused" class="border-t border-slate-100 pt-4">
      <div class="flex gap-3">
        <textarea
          v-model="userInput"
          @keydown.enter.exact.prevent="sendAnswer"
          class="input-field flex-1 min-h-[48px] max-h-32 resize-none"
          :placeholder="isWaiting ? '请输入你的回答...' : '等待面试官提问...'"
          :disabled="isThinking || !isWaiting"
        ></textarea>
        <button
          @click="sendAnswer"
          class="btn-primary px-6 self-end"
          :disabled="isThinking || !isWaiting || !userInput.trim()"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>
