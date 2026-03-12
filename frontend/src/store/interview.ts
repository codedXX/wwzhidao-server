import { defineStore } from 'pinia'
import { ref } from 'vue'

interface OpeningStreamPayload {
  sessionId: string
  resultId?: string
  interviewerName?: string
  content?: string
  isStreaming?: boolean
}

export const useInterviewStore = defineStore('interview', () => {
  const openingSessionId = ref('')
  const openingResultId = ref('')
  const openingInterviewerName = ref('')
  const openingContent = ref('')
  const openingIsStreaming = ref(false)
  const openingWaiting = ref(false)

  function resetOpeningStream() {
    openingSessionId.value = ''
    openingResultId.value = ''
    openingInterviewerName.value = ''
    openingContent.value = ''
    openingIsStreaming.value = false
    openingWaiting.value = false
  }

  function updateOpeningStream(payload: OpeningStreamPayload) {
    if (!payload.sessionId) return

    openingSessionId.value = payload.sessionId
    openingResultId.value = payload.resultId || openingResultId.value
    openingInterviewerName.value =
      payload.interviewerName || openingInterviewerName.value
    openingContent.value = payload.content || ''
    openingIsStreaming.value = payload.isStreaming ?? false
    openingWaiting.value = false
  }

  function markOpeningWaiting(sessionId: string) {
    if (!sessionId || openingSessionId.value !== sessionId) return
    openingIsStreaming.value = false
    openingWaiting.value = true
  }

  return {
    openingSessionId,
    openingResultId,
    openingInterviewerName,
    openingContent,
    openingIsStreaming,
    openingWaiting,
    resetOpeningStream,
    updateOpeningStream,
    markOpeningWaiting,
  }
})
