import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfo, loginUser, registerUser } from '../api/user'
import type { LoginParams, RegisterParams, UserInfo } from '../api/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserInfo | null>(null)
  const token = ref<string>(localStorage.getItem('token') || '')

  async function login(params: LoginParams) {
    const res: any = await loginUser(params)
    token.value = res.data.token
    localStorage.setItem('token', token.value)
    await fetchUserInfo()
    return res
  }

  async function register(params: RegisterParams) {
    const res: any = await registerUser(params)
    return res
  }

  async function fetchUserInfo() {
    try {
      const res: any = await getUserInfo()
      user.value = res.data
    } catch {
      user.value = null
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  return { user, token, login, register, fetchUserInfo, logout }
})
