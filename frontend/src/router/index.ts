import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/login/index.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/register/index.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/dashboard/index.vue'),
        },
        {
          path: 'resumeQuiz',
          name: 'ResumeQuiz',
          component: () => import('../views/resumeQuiz/index.vue'),
        },
        {
          path: 'mockInterview',
          name: 'MockInterview',
          component: () => import('../views/mockInterview/index.vue'),
        },
        {
          path: 'interviewRoom/:sessionId',
          name: 'InterviewRoom',
          component: () => import('../views/interviewRoom/index.vue'),
          props: true,
        },
        {
          path: 'report/:resultId',
          name: 'Report',
          component: () => import('../views/report/index.vue'),
          props: true,
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('../views/profile/index.vue'),
        },
        {
          path: 'records',
          name: 'Records',
          component: () => import('../views/records/index.vue'),
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
    next('/dashboard')
  } else {
    next()
  }
})

export default router
