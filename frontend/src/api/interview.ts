import request from '../utils/request'
import { fetchSSE } from '../utils/request'

// ===== 类型定义 =====

export type MockInterviewType = 'special' | 'behavior'

export interface ResumeQuizParams {
  company?: string
  positionName: string
  minSalary?: number
  maxSalary?: number
  jd: string
  resumeId?: string
  resumeContent?: string
  resumeURL?: string
  requestId?: string
  promptVersion?: string
}

export interface StartMockInterviewParams {
  interviewType: MockInterviewType
  candidateName?: string
  company?: string
  positionName?: string
  minSalary?: number | string
  maxSalary?: number | string
  jd?: string
  resumeId?: string
  resumeContent?: string
}

export interface AnswerMockInterviewParams {
  sessionId: string
  answer: string
}

export interface AnalyzeResumeParams {
  position: string
  resume: string
  jobDescription: string
}

export interface ContinueConversationParams {
  sessionId: string
  question: string
}

// SSE 事件类型
export type MockInterviewEventType = 'start' | 'question' | 'waiting' | 'reference_answer' | 'thinking' | 'end' | 'error'

export interface MockInterviewEvent {
  type: MockInterviewEventType
  sessionId?: string
  interviewerName?: string
  content?: string
  questionNumber?: number
  totalQuestions?: number
  elapsedMinutes?: number
  error?: string
  resultId?: string
  isStreaming?: boolean
  metadata?: Record<string, any>
}

export interface ProgressEvent {
  type: 'progress' | 'complete' | 'error'
  step?: number
  label?: string
  progress?: number
  message?: string
  data?: any
  error?: string
}

// ===== API 请求 =====

/** 分析简历（普通请求） */
export function analyzeResume(data: AnalyzeResumeParams) {
  return request.post('/interview/analyze-resume', data)
}

/** 继续对话 */
export function continueConversation(data: ContinueConversationParams) {
  return request.post('/interview/continue-conversation', data)
}

/** 简历押题（流式） */
export function resumeQuizStream(
  data: ResumeQuizParams,
  onMessage: (event: ProgressEvent) => void,
  onError?: (error: any) => void,
  onComplete?: () => void
) {
  return fetchSSE('/interview/resume/quiz/stream', data, onMessage, onError, onComplete)
}

/** 开始模拟面试（流式） */
export function startMockInterview(
  data: StartMockInterviewParams,
  onMessage: (event: MockInterviewEvent) => void,
  onError?: (error: any) => void,
  onComplete?: () => void
) {
  return fetchSSE('/interview/mock/start', data, onMessage, onError, onComplete)
}

/** 回答面试问题（流式） */
export function answerMockInterview(
  data: AnswerMockInterviewParams,
  onMessage: (event: MockInterviewEvent) => void,
  onError?: (error: any) => void,
  onComplete?: () => void
) {
  return fetchSSE('/interview/mock/answer', data, onMessage, onError, onComplete)
}

/** 结束面试 */
export function endMockInterview(resultId: string) {
  return request.post(`/interview/mock/end/${resultId}`)
}

/** 暂停面试 */
export function pauseMockInterview(resultId: string) {
  return request.post(`/interview/mock/pause/${resultId}`)
}

/** 恢复面试 */
export function resumeMockInterview(resultId: string) {
  return request.post(`/interview/mock/resume/${resultId}`)
}

/** 获取面试分析报告 */
export function getAnalysisReport(resultId: string) {
  return request.get(`/interview/analysis/report/${resultId}`)
}
