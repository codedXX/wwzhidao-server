import request from '../utils/request'

// ===== 类型定义 =====
export interface RegisterParams {
  username: string
  email: string
  password: string
}

export interface LoginParams {
  email: string
  password: string
}

export interface UpdateUserParams {
  nickname?: string
  avatar?: string
  email?: string
  phone?: string
}

export interface UserInfo {
  _id: string
  username: string
  email: string
  nickname?: string
  avatar?: string
  phone?: string
  specialRemainingCount: number
  behaviorRemainingCount: number
  resumeQuizRemainingCount: number
  createdAt: string
}

export interface ConsumptionRecord {
  recordId: string
  type: string
  status: string
  consumedCount: number
  description: string
  createdAt: string
}

// ===== API 请求 =====

/** 用户注册 */
export function registerUser(data: RegisterParams) {
  return request.post('/user/register', data)
}

/** 用户登录 */
export function loginUser(data: LoginParams) {
  return request.post('/user/login', data)
}

/** 获取当前用户信息 */
export function getUserInfo() {
  return request.get('/user/info')
}

/** 更新用户资料 */
export function updateUserProfile(data: UpdateUserParams) {
  return request.put('/user/profile', data)
}

/** 获取消费记录 */
export function getUserConsumptionRecords(skip = 0, limit = 20) {
  return request.get('/user/consumption-records', { params: { skip, limit } })
}
