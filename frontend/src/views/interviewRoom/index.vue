<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { answerMockInterview, endMockInterview, pauseMockInterview, resumeMockInterview as resumeInterviewApi } from '../../api/interview'
import type { MockInterviewEvent } from '../../api/interview'
import { useInterviewStore } from '../../store/interview'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()

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
const openingMessageIndex = ref<number | null>(null)

const interviewStatus = computed(() => {
  if (isEnded.value) return { text: '已结束', classes: 'bg-primary-50 text-primary-600' }
  if (isPaused.value) return { text: '已暂停', classes: 'bg-amber-50 text-amber-600' }
  if (isThinking.value) return { text: '正在思考', classes: 'bg-violet-50 text-violet-600' }
  if (isWaiting.value) return { text: '等待作答', classes: 'bg-emerald-50 text-emerald-600' }
  return { text: '连接中', classes: 'bg-slate-100 text-slate-600' }
})

let controller: AbortController | null = null

onMounted(() => {
  const initialContent = route.query.content as string

  if (interviewStore.openingSessionId === sessionId.value) {
    syncOpeningMessage()
    isWaiting.value = interviewStore.openingWaiting
    return
  }

  if (initialContent) {
    messages.value.push({
      role: 'interviewer',
      content: initialContent,
      isStreaming: false,
      timestamp: new Date(),
    })
    openingMessageIndex.value = 0
    isWaiting.value = true
  }
})

onUnmounted(() => {
  controller?.abort()
})

watch(
  () => [
    interviewStore.openingSessionId,
    interviewStore.openingContent,
    interviewStore.openingIsStreaming,
    interviewStore.openingWaiting,
  ],
  () => {
    if (interviewStore.openingSessionId !== sessionId.value) return
    syncOpeningMessage()
    isWaiting.value = interviewStore.openingWaiting
  },
  { immediate: true },
)

function syncOpeningMessage() {
  const content = interviewStore.openingContent
  if (!content) return

  if (openingMessageIndex.value === null) {
    messages.value.push({
      role: 'interviewer',
      content,
      isStreaming: interviewStore.openingIsStreaming,
      timestamp: new Date(),
    })
    openingMessageIndex.value = messages.value.length - 1
  } else if (messages.value[openingMessageIndex.value]) {
    messages.value[openingMessageIndex.value]!.content = content
    messages.value[openingMessageIndex.value]!.isStreaming = interviewStore.openingIsStreaming
  }

  if (interviewStore.openingResultId) {
    resultId.value = interviewStore.openingResultId
  }

  if (interviewStore.openingInterviewerName) {
    interviewerName.value = interviewStore.openingInterviewerName
  }

  scrollToBottom()
}

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
  <div class="flex h-[calc(100vh-8rem)] min-h-0 flex-col animate-fade-in">
    <div class="mb-4 flex shrink-0 flex-wrap items-start justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 font-bold text-white shadow-lg">
          面
        </div>
        <div>
          <h3 class="font-bold text-slate-800">{{ interviewerName }}</h3>
          <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>第 {{ questionNumber }} 题 / 约 {{ totalQuestions }} 题</span>
            <span v-if="elapsedMinutes">· 已用 {{ elapsedMinutes }} 分钟</span>
            <span class="rounded-full px-2 py-0.5 font-medium" :class="interviewStatus.classes">{{ interviewStatus.text }}</span>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <button v-if="!isEnded && !isPaused" @click="handlePause" class="btn-secondary px-3 py-1.5 text-xs">⏸ 暂停</button>
        <button v-if="isPaused" @click="handleResume" class="btn-primary px-3 py-1.5 text-xs">▶️ 继续</button>
        <button v-if="!isEnded" @click="handleEnd" class="rounded-lg px-3 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-50">结束面试</button>
        <button v-if="isEnded && resultId" @click="viewReport" class="btn-primary px-3 py-1.5 text-xs">📊 查看报告</button>
      </div>
    </div>

    <div class="grid flex-1 min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div ref="chatContainer" class="min-h-0 overflow-y-auto rounded-2xl border border-slate-200/70 bg-white/70 px-2 py-2 shadow-sm backdrop-blur-sm">
        <div class="space-y-4 px-2 pb-4">
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            class="flex animate-slide-up"
            :class="msg.role === 'candidate' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm sm:max-w-[75%]"
              :class="msg.role === 'candidate'
                ? 'rounded-br-md bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                : 'rounded-bl-md border border-slate-100 bg-white text-slate-800'"
            >
              <div class="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{{ msg.content }}<span v-if="msg.isStreaming" class="typing-cursor"></span></div>
            </div>
          </div>

          <div v-if="isThinking" class="flex justify-start animate-slide-up">
            <div class="rounded-2xl rounded-bl-md border border-slate-100 bg-white px-5 py-3.5 shadow-sm">
              <div class="flex items-center gap-2 text-slate-500">
                <span class="animate-pulse-soft">🤔</span>
                <span class="text-sm">面试官正在思考...</span>
              </div>
            </div>
          </div>

          <div v-if="isPaused" class="py-4 text-center">
            <span class="rounded-full bg-amber-50 px-4 py-2 text-sm text-amber-600">⏸ 面试已暂停，进度已保存</span>
          </div>

          <div v-if="isEnded" class="py-4 text-center">
            <span class="rounded-full bg-primary-50 px-4 py-2 text-sm text-primary-600">✅ 面试已结束</span>
          </div>
        </div>
      </div>

      <aside v-if="showReference && referenceAnswer" class="min-h-0">
        <div class="flex h-full min-h-[180px] max-h-full flex-col rounded-xl border border-amber-200/50 bg-amber-50/80 p-4 shadow-sm">
          <div class="mb-2 flex items-center gap-2">
            <span class="text-sm">💡</span>
            <span class="text-xs font-medium text-amber-700">参考答案</span>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto pr-1 text-xs leading-relaxed text-amber-800 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
            {{ referenceAnswer }}
          </div>
        </div>
      </aside>
    </div>

    <div v-if="!isEnded && !isPaused" class="mt-4 shrink-0 border-t border-slate-100 pt-4">
      <div class="flex gap-3">
        <textarea
          v-model="userInput"
          @keydown.enter.exact.prevent="sendAnswer"
          class="input-field min-h-[48px] max-h-32 flex-1 resize-none"
          :placeholder="isWaiting ? '请输入你的回答（Enter 发送）...' : '等待面试官提问...'"
          :disabled="isThinking || !isWaiting"
        ></textarea>
        <button
          @click="sendAnswer"
          class="btn-primary self-end px-6"
          :disabled="isThinking || !isWaiting || !userInput.trim()"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>
