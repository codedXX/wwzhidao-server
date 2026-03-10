import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue'),
        },
        {
          path: 'resume-quiz',
          name: 'ResumeQuiz',
          component: () => import('../views/ResumeQuiz.vue'),
        },
        {
          path: 'mock-interview',
          name: 'MockInterview',
          component: () => import('../views/MockInterview.vue'),
        },
        {
          path: 'interview-room/:sessionId',
          name: 'InterviewRoom',
          component: () => import('../views/InterviewRoom.vue'),
          props: true,
        },
        {
          path: 'report/:resultId',
          name: 'Report',
          component: () => import('../views/Report.vue'),
          props: true,
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('../views/Profile.vue'),
        },
        {
          path: 'records',
          name: 'Records',
          component: () => import('../views/Records.vue'),
        },
      ],
    },
  ],
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  } else if ((to.name === 'Login' || to.name === 'Register') && token) {
    next('/')
  } else {
    next()
  }
})

export default router
