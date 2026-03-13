<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { startMockInterview } from '../../api/interview';
import type {
  MockInterviewType,
  MockInterviewEvent,
} from '../../api/interview';
import { useInterviewStore } from '../../store/interview';

const router = useRouter();
const interviewStore = useInterviewStore();

const form = ref({
  interviewType: 'special' as MockInterviewType,
  candidateName: '得中',
  company: '爱来技术',
  positionName: '前端工程师',
  minSalary: 25 as number | undefined,
  maxSalary: 35 as number | undefined,
  jd: '熟练掌握Vue.js框架及生态（Vue 2、主要Vue3），能独立完成中大型项目前端开发。精通HTML5、CSS3、JavaScript（ES6+），熟悉Flex、Grid等布局方式，了解前端工程化（Webpack、Vite）流程。具备良好的代码规范意识，能解决不同浏览器兼容性问题，有前端性能优化经验者优先',
  resumeContent: 'https://res.lgdsunday.club/sunday-resume.pdf',
});

const loading = ref(false);
const error = ref('');

const canStart = computed(() => {
  if (!form.value.positionName.trim()) return false;
  if (!form.value.jd.trim() && !form.value.resumeContent.trim()) return false;
  if (
    form.value.minSalary !== undefined &&
    form.value.maxSalary !== undefined &&
    form.value.minSalary > form.value.maxSalary
  ) {
    return false;
  }
  return !loading.value;
});

const interviewSummary = computed(() =>
  form.value.interviewType === 'special'
    ? '专项面试会更偏技术深挖，适合前端、后端、算法等岗位。'
    : '综合面试更偏行为表达与 HR 场景，适合练习项目讲述和沟通。',
);

function validateForm() {
  if (!form.value.positionName.trim()) {
    return '请先填写岗位名称';
  }
  if (!form.value.jd.trim() && !form.value.resumeContent.trim()) {
    return '请至少填写职位描述或简历内容中的一项';
  }
  if (
    form.value.minSalary !== undefined &&
    form.value.maxSalary !== undefined &&
    form.value.minSalary > form.value.maxSalary
  ) {
    return '最低薪资不能高于最高薪资';
  }
  return '';
}

function handleStart() {
  const validationError = validateForm();
  if (validationError) {
    error.value = validationError;
    return;
  }

  loading.value = true;
  error.value = '';
  interviewStore.resetOpeningStream();
  let hasNavigated = false;

  startMockInterview(
    {
      ...form.value,
      candidateName: form.value.candidateName.trim() || undefined,
      company: form.value.company.trim() || undefined,
      positionName: form.value.positionName.trim() || undefined,
      jd: form.value.jd.trim() || undefined,
      resumeContent: form.value.resumeContent.trim() || undefined,
    },
    (event: MockInterviewEvent) => {
      if (event.type === 'start' && event.sessionId) {
        interviewStore.updateOpeningStream({
          sessionId: event.sessionId,
          resultId: event.resultId,
          interviewerName: event.interviewerName,
          content: event.content,
          isStreaming: event.isStreaming,
        });

        if (!hasNavigated) {
          hasNavigated = true;
          router.push({
            name: 'InterviewRoom',
            params: { sessionId: event.sessionId },
            query: {
              resultId: event.resultId || '',
              interviewerName: event.interviewerName || '',
              content: event.content || '',
              interviewType: form.value.interviewType,
            },
          });
        }

        return;
      }

      if (event.type === 'waiting' && event.sessionId) {
        interviewStore.markOpeningWaiting(event.sessionId);
      }

      if (event.type === 'error') {
        error.value = event.error || '启动面试失败';
        loading.value = false;
      }
    },
    (err) => {
      error.value = err?.message || '请求失败';
      loading.value = false;
    },
  );
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6 animate-fade-in">
    <div>
      <h2 class="text-2xl font-bold text-slate-800">🎤 模拟面试</h2>
      <p class="mt-1 text-slate-500">
        选择面试类型，补充岗位背景后开始你的 AI 模拟面试。
      </p>
    </div>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div class="glass-card space-y-5 p-6">
        <div>
          <label class="mb-3 block text-sm font-medium text-slate-700"
            >面试类型</label
          >
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              @click="form.interviewType = 'special'"
              class="rounded-xl border-2 p-4 text-left transition-all duration-300"
              :class="
                form.interviewType === 'special'
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              "
            >
              <div class="mb-2 text-2xl">🎯</div>
              <h4 class="font-bold text-slate-800">专项面试</h4>
              <p class="mt-1 text-xs text-slate-500">
                深度技术面试，约 12 道题
              </p>
            </button>
            <button
              @click="form.interviewType = 'behavior'"
              class="rounded-xl border-2 p-4 text-left transition-all duration-300"
              :class="
                form.interviewType === 'behavior'
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              "
            >
              <div class="mb-2 text-2xl">💼</div>
              <h4 class="font-bold text-slate-800">综合面试</h4>
              <p class="mt-1 text-xs text-slate-500">
                行为面试 + HR，约 8 道题
              </p>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700"
              >候选人姓名</label
            >
            <input
              v-model="form.candidateName"
              class="input-field"
              placeholder="你的名字"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700"
              >目标公司</label
            >
            <input
              v-model="form.company"
              class="input-field"
              placeholder="如：字节跳动"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700"
              >岗位名称 <span class="text-rose-500">*</span></label
            >
            <input
              v-model="form.positionName"
              class="input-field"
              placeholder="如：前端工程师"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700"
              >最低薪资（K）</label
            >
            <input
              v-model.number="form.minSalary"
              type="number"
              class="input-field"
              placeholder="20"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700"
              >最高薪资（K）</label
            >
            <input
              v-model.number="form.maxSalary"
              type="number"
              class="input-field"
              placeholder="35"
            />
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700"
            >职位描述（JD）</label
          >
          <textarea
            v-model="form.jd"
            class="input-field min-h-[120px] resize-y"
            placeholder="粘贴职位描述。JD 和简历内容至少填写一项。"
          ></textarea>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700"
            >简历内容</label
          >
          <textarea
            v-model="form.resumeContent"
            class="input-field min-h-[120px] resize-y"
            placeholder="粘贴你的简历内容，AI 会生成更贴近你的问题。"
          ></textarea>
        </div>

        <p
          v-if="error"
          class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-500"
        >
          {{ error }}
        </p>

        <div
          class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-xs text-slate-400">
            开始前建议至少填写：岗位名称 + JD / 简历内容中的一项。
          </p>
          <button
            @click="handleStart"
            class="btn-primary min-w-[180px]"
            :disabled="!canStart"
          >
            <span v-if="loading" class="animate-pulse-soft"
              >⏳ 正在连接面试官...</span
            >
            <span v-else>🚀 开始面试</span>
          </button>
        </div>
      </div>

      <aside class="space-y-4">
        <div class="glass-card p-5">
          <h3 class="text-sm font-semibold text-slate-800">当前模式</h3>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            {{ interviewSummary }}
          </p>
        </div>
        <div class="glass-card p-5">
          <h3 class="text-sm font-semibold text-slate-800">优化建议</h3>
          <ul class="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <li>• 岗位名称越准确，问题越聚焦。</li>
            <li>• 补充 JD 可以让追问更贴近真实招聘场景。</li>
            <li>• 简历内容越完整，AI 越能针对你的项目经历发问。</li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>
