const fs = require('fs');
const path = require('path');

let counter = 0;

function nextId(prefix = 'id') {
  counter += 1;
  return `${prefix}-${counter}`;
}

function topic(title, children = []) {
  const node = {
    id: nextId('topic'),
    class: 'topic',
    title,
  };

  if (children.length > 0) {
    node.children = {
      attached: children,
    };
  }

  return node;
}

function fieldTopic(name, type, description, children = []) {
  return topic(name, [
    topic(`类型：${type}`),
    topic(`说明：${description}`),
    ...children,
  ]);
}

const data = [
  {
    name: 'User',
    summary: '用户主档，保存账号、身份、额度、会员和微信绑定信息。',
    source: 'src/user/schemas/user.schema.ts',
    note: '代码里未显式指定 collection 名，MongoDB 实际集合名由 Mongoose 默认推导。',
    fields: [
      fieldTopic('_id', 'ObjectId', 'MongoDB 文档主键，自动生成。'),
      fieldTopic('username', 'string', '用户名，注册登录的基础身份字段。'),
      fieldTopic('wechatId', 'string', '微信登录标识，代码注释描述为“微信登录的唯一标识”。'),
      fieldTopic('email', 'string', '邮箱，可用于注册、登录和找回账号。'),
      fieldTopic('phone', 'string', '手机号。'),
      fieldTopic('avatar', 'string', '用户头像地址。'),
      fieldTopic('roles', 'string[]', '角色数组，默认包含 user，可扩展为多角色权限控制。'),
      fieldTopic('isActive', 'boolean', '账号是否已激活。'),
      fieldTopic('password', 'string', '登录密码；保存前会在 schema pre(save) 中做 bcrypt 哈希，不是明文。'),
      fieldTopic('realName', 'string', '真实姓名。'),
      fieldTopic('gender', "'male' | 'female' | 'other'", '性别，默认 other。'),
      fieldTopic('idCard', 'string', '身份证号。'),
      fieldTopic('isVerified', 'boolean', '是否完成实名认证。'),
      fieldTopic('birthDate', 'Date', '出生日期。'),
      fieldTopic('isVip', 'boolean', '是否为会员。'),
      fieldTopic('vipExpireTime', 'Date', '会员过期时间。'),
      fieldTopic('aiInterviewRemainingCount', 'number', 'AI 模拟面试剩余次数。'),
      fieldTopic('aiInterviewRemainingMinutes', 'number', 'AI 模拟面试剩余时长，单位分钟。'),
      fieldTopic('wwCoinBalance', 'number', '旺旺币余额。'),
      fieldTopic('resumeRemainingCount', 'number', '简历押题剩余次数；生成简历押题前会先扣减，失败时回滚。'),
      fieldTopic('specialRemainingCount', 'number', '专项面试剩余次数。'),
      fieldTopic('behaviorRemainingCount', 'number', '综合面试剩余次数。'),
      fieldTopic('lastLoginTime', 'Date', '最近登录时间。'),
      fieldTopic('lastLoginLocation', 'string', '最近登录地点。'),
      fieldTopic('openid', 'string', '微信小程序 openid，唯一且 sparse。'),
      fieldTopic('unionid', 'string', '微信开放平台 unionid，唯一且 sparse。'),
      fieldTopic('wechatNickname', 'string', '微信昵称。'),
      fieldTopic('wechatAvatar', 'string', '微信头像地址。'),
      fieldTopic('isWechatBound', 'boolean', '是否已绑定微信。'),
      fieldTopic('wechatBoundTime', 'Date', '微信绑定时间。'),
      fieldTopic('createdAt', 'Date', '文档创建时间，来自 timestamps: true。'),
      fieldTopic('updatedAt', 'Date', '文档最后更新时间，来自 timestamps: true。'),
    ],
  },
  {
    name: 'UserConsumption',
    summary: '轻量级用户消费记录，挂在 user 模块下，主要记录次数/来源级别的消费流水。',
    source: 'src/user/schemas/consumption-record.schema.ts',
    note: '这是一个独立 schema，和 interview 模块里的 ConsumptionRecord 不是同一个集合。',
    fields: [
      fieldTopic('_id', 'ObjectId', 'MongoDB 文档主键，自动生成。'),
      fieldTopic('userId', 'ObjectId(string)', '关联用户 ID，ref 到 User。'),
      fieldTopic('type', "'interview' | 'quiz' | 'other'", '消费类型，默认 interview。'),
      fieldTopic('quantity', 'number', '消费数量，既可表示次数，也可表示金额。'),
      fieldTopic('source', "'free' | 'paid'", '消费来源，表示来自免费额度还是付费购买。'),
      fieldTopic('relatedId', 'string', '关联业务 ID，例如某次面试或某次押题结果。'),
      fieldTopic('description', 'string', '消费说明。'),
      fieldTopic('success', 'boolean', '消费是否成功。'),
      fieldTopic('createdAt', 'Date', '文档创建时间，来自 timestamps: true。'),
      fieldTopic('updatedAt', 'Date', '文档最后更新时间，来自 timestamps: true。'),
    ],
  },
  {
    name: 'ConsumptionRecord',
    summary: '面试/押题业务的正式消费流水，记录扣费、AI 输入输出、状态、失败与退款信息。',
    source: 'src/interview/schemas/consumption-record.schema.ts',
    note: '用于简历押题、专项面试、综合面试等场景，是用户消费统计接口实际查询的主流水集合。',
    fields: [
      fieldTopic('_id', 'ObjectId', 'MongoDB 文档主键，自动生成。'),
      fieldTopic('recordId', 'string', '业务层消费记录唯一 ID；代码中用 uuid 生成，且 unique。'),
      fieldTopic('user', 'ObjectId', '关联 User 文档的 ObjectId，带索引。'),
      fieldTopic('userId', 'string', '用户 ID 的字符串形式，便于查询、聚合和接口筛选。'),
      fieldTopic('type', "'resume_quiz' | 'special_interview' | 'behavior_interview' | 'ai_interview'", '消费类型。'),
      fieldTopic('status', "'pending' | 'success' | 'failed' | 'cancelled'", '消费状态：处理中、成功、失败、已取消。'),
      fieldTopic('consumedCount', 'number', '本次实际消耗的次数，通常为 1。'),
      fieldTopic('description', 'string', '消费描述，例如“简历押题 - 公司 岗位”或“模拟面试 - 专项面试”。'),
      fieldTopic('createdAt', 'Date', '文档创建时间；schema 使用 timestamps，并在类里也声明了该字段。'),
      fieldTopic('inputData', 'Record<string, any>', '业务入参快照，便于排查问题和复现请求。', [
        topic('常见子字段（简历押题）', [
          fieldTopic('company', 'string', '目标公司。'),
          fieldTopic('positionName', 'string', '岗位名称。'),
          fieldTopic('minSalary', 'number', '最低薪资。'),
          fieldTopic('maxSalary', 'number', '最高薪资。'),
          fieldTopic('jd', 'string', '职位描述。'),
          fieldTopic('resumeId', 'string', '简历 ID。'),
        ]),
        topic('常见子字段（模拟面试）', [
          fieldTopic('company', 'string', '目标公司。'),
          fieldTopic('position', 'string', '岗位名称。'),
          fieldTopic('interviewType', 'string', '面试类型。'),
        ]),
      ]),
      fieldTopic('outputData', 'Record<string, any>', '业务产出摘要。', [
        topic('常见子字段（简历押题）', [
          fieldTopic('resultId', 'string', '生成结果 ID。'),
          fieldTopic('questionCount', 'number', '生成的题目数量。'),
        ]),
        topic('常见子字段（模拟面试）', [
          fieldTopic('resultId', 'string', '面试结果 ID。'),
          fieldTopic('sessionId', 'string', '会话 ID。'),
        ]),
      ]),
      fieldTopic('resultId', 'string', '关联结果 ID，例如 ResumeQuizResult.resultId 或 AIInterviewResult.resultId。'),
      fieldTopic('aiModel', 'string', '本次调用使用的 AI 模型名。'),
      fieldTopic('promptTokens', 'number', '输入 token 数。'),
      fieldTopic('completionTokens', 'number', '输出 token 数。'),
      fieldTopic('totalTokens', 'number', '总 token 数。'),
      fieldTopic('estimatedCost', 'number', '预估成本。'),
      fieldTopic('aiResponseTime', 'number', 'AI 响应耗时。'),
      fieldTopic('startedAt', 'Date', '业务处理开始时间。'),
      fieldTopic('completedAt', 'Date', '业务处理完成时间。'),
      fieldTopic('failedAt', 'Date', '业务处理失败时间。'),
      fieldTopic('errorMessage', 'string', '失败原因摘要。'),
      fieldTopic('errorStack', 'string', '错误堆栈，通常只在开发环境记录。'),
      fieldTopic('isRefunded', 'boolean', '失败后是否已退款；简历押题失败时会置为 true。'),
      fieldTopic('refundedAt', 'Date', '退款时间。'),
      fieldTopic('metadata', 'Record<string, any>', '补充元数据。', [
        fieldTopic('requestId', 'string', '幂等请求 ID；代码通过 metadata.requestId 防止重复生成。'),
        fieldTopic('promptVersion', 'string', 'Prompt 版本。'),
      ]),
      fieldTopic('requestId', 'string', '额外的请求 ID 字段；schema 预留了索引，但当前业务主要把 requestId 放在 metadata.requestId。'),
      fieldTopic('userAgent', 'string', '客户端 UA。'),
      fieldTopic('ipAddress', 'string', '客户端 IP。'),
      fieldTopic('updatedAt', 'Date', '文档最后更新时间，来自 timestamps: true。'),
    ],
  },
  {
    name: 'ResumeQuizResult',
    summary: '简历押题结果，包含题目、匹配度分析、能力雷达图、用户交互状态等。',
    source: 'src/interview/schemas/interview-quiz-result.schema.ts',
    note: '这是简历押题的核心结果集合，服务会通过 resultId 与 ConsumptionRecord 互相关联。',
    fields: [
      fieldTopic('_id', 'ObjectId', 'MongoDB 文档主键，自动生成。'),
      fieldTopic('resultId', 'string', '业务结果唯一 ID；代码里用 uuid 生成，且 unique。'),
      fieldTopic('user', 'ObjectId', '关联 User 文档的 ObjectId。'),
      fieldTopic('userId', 'string', '用户 ID 的字符串形式。'),
      fieldTopic('resumeId', 'string', '关联的简历 ID。'),
      fieldTopic('company', 'string', '目标公司名称。'),
      fieldTopic('position', 'string', '目标岗位名称。'),
      fieldTopic('salaryRange', 'string', '格式化后的薪资范围，例如 20K-35K。'),
      fieldTopic('jobDescription', 'string', '岗位 JD 文本。'),
      fieldTopic('resumeSnapshot', 'string', '脱敏后的简历快照文本。'),
      fieldTopic('questions[]', 'InterviewQuestion[]', 'AI 生成的押题题目列表。', [
        fieldTopic('question', 'string', '题目内容。'),
        fieldTopic('answer', 'string', '参考答案。'),
        fieldTopic('category', "'technical' | 'project' | 'problem-solving' | 'soft-skill' | 'behavioral' | 'scenario'", '题目类别。'),
        fieldTopic('difficulty', "'easy' | 'medium' | 'hard'", '题目难度。'),
        fieldTopic('tips', 'string', '答题提示。'),
        fieldTopic('keywords', 'string[]', '关键词。'),
        fieldTopic('reasoning', 'string', '为什么会出这道题。'),
        fieldTopic('isFavorite', 'boolean', '用户是否收藏。'),
        fieldTopic('isPracticed', 'boolean', '用户是否已练习。'),
        fieldTopic('practicedAt', 'Date', '练习时间。'),
        fieldTopic('userNote', 'string', '用户备注。'),
        topic('说明：该子文档使用 @Schema({ _id: false })，不会单独生成子文档 _id。'),
      ]),
      fieldTopic('totalQuestions', 'number', '题目总数。'),
      fieldTopic('summary', 'string', 'AI 生成的整体总结和建议。'),
      fieldTopic('matchScore', 'number', '简历与岗位的匹配度得分，范围 0-100。'),
      fieldTopic('matchLevel', 'string', '匹配度等级，例如优秀/良好/中等/较差。'),
      fieldTopic('matchedSkills[]', 'SkillMatch[]', '匹配到的技能列表。', [
        fieldTopic('skill', 'string', '技能名称。'),
        fieldTopic('matched', 'boolean', '该技能是否匹配。'),
        fieldTopic('proficiency', 'string', '熟练度说明。'),
        topic('说明：该子文档使用 @Schema({ _id: false })。'),
      ]),
      fieldTopic('missingSkills', 'string[]', '当前简历里缺失的技能点。'),
      fieldTopic('knowledgeGaps', 'string[]', '需要补足的知识盲区。'),
      fieldTopic('learningPriorities[]', 'LearningPriority[]', '学习优先级建议。', [
        fieldTopic('topic', 'string', '学习主题。'),
        fieldTopic('priority', "'high' | 'medium' | 'low'", '优先级。'),
        fieldTopic('reason', 'string', '为什么要优先补这块。'),
        topic('说明：该子文档使用 @Schema({ _id: false })。'),
      ]),
      fieldTopic('radarData[]', 'RadarDimension[]', '能力雷达图维度数据。', [
        fieldTopic('dimension', 'string', '维度名称。'),
        fieldTopic('score', 'number', '维度得分，0-100。'),
        fieldTopic('description', 'string', '维度说明。'),
        topic('说明：该子文档使用 @Schema({ _id: false })。'),
      ]),
      fieldTopic('strengths', 'string[]', '优势项。'),
      fieldTopic('weaknesses', 'string[]', '薄弱项。'),
      fieldTopic('interviewTips', 'string[]', '面试准备建议。'),
      fieldTopic('questionDistribution', 'Record<string, number>', '题目类别分布，例如 technical: 3。'),
      fieldTopic('viewCount', 'number', '查看次数；获取分析报告时会自动累加。'),
      fieldTopic('lastViewedAt', 'Date', '最近查看时间。'),
      fieldTopic('rating', 'number', '用户评分，1-5 星。'),
      fieldTopic('feedback', 'string', '用户反馈。'),
      fieldTopic('ratedAt', 'Date', '评分时间。'),
      fieldTopic('isArchived', 'boolean', '是否归档。'),
      fieldTopic('archivedAt', 'Date', '归档时间。'),
      fieldTopic('isShared', 'boolean', '是否分享。'),
      fieldTopic('sharedAt', 'Date', '分享时间。'),
      fieldTopic('shareUrl', 'string', '分享链接。'),
      fieldTopic('consumptionRecordId', 'string', '关联的消费记录 recordId。'),
      fieldTopic('metadata', 'Record<string, any>', '扩展元数据，schema 预留字段。'),
      fieldTopic('aiModel', 'string', '生成本结果使用的 AI 模型。'),
      fieldTopic('promptVersion', 'string', 'Prompt 版本，用于追踪生成策略。'),
      fieldTopic('createdAt', 'Date', '文档创建时间，来自 timestamps: true。'),
      fieldTopic('updatedAt', 'Date', '文档最后更新时间，来自 timestamps: true。'),
    ],
  },
  {
    name: 'AIInterviewResult',
    summary: '模拟面试结果，既保存完整问答过程，也保存恢复会话所需状态和最终评估报告。',
    source: 'src/interview/schemas/ai-interview-result.schema.ts',
    note: '同时覆盖专项面试和综合面试；面试进行中、暂停、恢复、生成报告都围绕这个集合更新。',
    fields: [
      fieldTopic('_id', 'ObjectId', 'MongoDB 文档主键，自动生成。'),
      fieldTopic('resultId', 'string', '业务结果唯一 ID；代码里用 uuid 生成，且 unique。'),
      fieldTopic('user', 'ObjectId', '关联 User 文档的 ObjectId。'),
      fieldTopic('userId', 'string', '用户 ID 的字符串形式。'),
      fieldTopic('interviewType', "'special' | 'behavior'", '面试类型：专项面试或综合面试。'),
      fieldTopic('company', 'string', '目标公司。'),
      fieldTopic('position', 'string', '目标岗位。'),
      fieldTopic('salaryRange', 'string', '薪资范围。'),
      fieldTopic('jobDescription', 'string', '岗位 JD。'),
      fieldTopic('interviewDuration', 'number', '面试总时长，单位分钟。'),
      fieldTopic('interviewMode', 'string', '面试模式，如 text / voice / video；当前代码创建记录时使用 text。'),
      fieldTopic('qaList[]', 'InterviewQA[]', '问答明细列表。', [
        fieldTopic('question', 'string', '面试官问题。'),
        fieldTopic('answer', 'string', '候选人回答。'),
        fieldTopic('standardAnswer', 'string', '标准答案或参考答案。'),
        fieldTopic('answerDuration', 'number', '回答耗时。'),
        fieldTopic('audioUrl', 'string', '录音地址。'),
        fieldTopic('videoUrl', 'string', '视频地址。'),
        fieldTopic('score', 'number', '单题得分，0-100。'),
        fieldTopic('starAnalysis', 'STARAnalysis', '按 STAR 模型拆分的单题分析。', [
          fieldTopic('situation', 'number', 'Situation 维度得分。'),
          fieldTopic('task', 'number', 'Task 维度得分。'),
          fieldTopic('action', 'number', 'Action 维度得分。'),
          fieldTopic('result', 'number', 'Result 维度得分。'),
          fieldTopic('overallScore', 'number', 'STAR 总分。'),
          fieldTopic('feedback', 'string', 'STAR 反馈建议。'),
          topic('说明：该子文档使用 @Schema({ _id: false })。'),
        ]),
        fieldTopic('aiComment', 'string', 'AI 对这一题的点评。'),
        fieldTopic('highlights', 'string[]', '本题亮点。'),
        fieldTopic('improvements', 'string[]', '本题待改进点。'),
        fieldTopic('askedAt', 'Date', '提问时间。'),
        fieldTopic('answeredAt', 'Date', '回答时间。'),
        fieldTopic('savedAt', 'Date', '中途保存时间。'),
        topic('说明：该子文档使用 @Schema({ _id: false })。'),
      ]),
      fieldTopic('totalQuestions', 'number', '总题数。'),
      fieldTopic('answeredQuestions', 'number', '已回答题数。'),
      fieldTopic('overallScore', 'number', '整体得分，0-100。'),
      fieldTopic('overallLevel', 'string', '整体等级，例如优秀/良好/中等/需提升。'),
      fieldTopic('overallComment', 'string', '整体评价。'),
      fieldTopic('radarData[]', 'RadarDimension[]', '整体能力雷达图。', [
        fieldTopic('dimension', 'string', '维度名称。'),
        fieldTopic('score', 'number', '维度得分，0-100。'),
        fieldTopic('description', 'string', '维度说明。'),
        topic('说明：该子文档使用 @Schema({ _id: false })。'),
      ]),
      fieldTopic('improvements[]', 'ImprovementSuggestion[]', '整体改进建议。', [
        fieldTopic('category', 'string', '建议分类，例如技术深度、表达能力。'),
        fieldTopic('suggestion', 'string', '具体建议内容。'),
        fieldTopic('priority', "'high' | 'medium' | 'low'", '优先级。'),
        topic('说明：该子文档使用 @Schema({ _id: false })。'),
      ]),
      fieldTopic('strengths', 'string[]', '整体优势。'),
      fieldTopic('weaknesses', 'string[]', '整体薄弱项。'),
      fieldTopic('avgResponseTime', 'number', '平均回答时长。'),
      fieldTopic('maxResponseTime', 'number', '最长回答时长。'),
      fieldTopic('minResponseTime', 'number', '最短回答时长。'),
      fieldTopic('fluencyScore', 'number', '表达流畅度分数。'),
      fieldTopic('logicScore', 'number', '逻辑性分数。'),
      fieldTopic('professionalScore', 'number', '专业性分数。'),
      fieldTopic('viewCount', 'number', '查看次数。'),
      fieldTopic('lastViewedAt', 'Date', '最近查看时间。'),
      fieldTopic('rating', 'number', '用户评分，1-5 星。'),
      fieldTopic('feedback', 'string', '用户反馈。'),
      fieldTopic('ratedAt', 'Date', '评分时间。'),
      fieldTopic('status', "'in_progress' | 'paused' | 'completed' | 'abandoned'", '面试状态：进行中、暂停、已完成、已放弃。'),
      fieldTopic('pausedAt', 'Date', '暂停时间。'),
      fieldTopic('resumedAt', 'Date', '恢复时间。'),
      fieldTopic('completedAt', 'Date', '完成时间。'),
      fieldTopic('sessionState', 'any', '完整会话状态快照，用于暂停后恢复面试。', [
        fieldTopic('sessionId', 'string', '当前面试会话 ID。'),
        fieldTopic('resultId', 'string', '当前面试结果 ID。'),
        fieldTopic('consumptionRecordId', 'string', '关联消费记录 ID。'),
        fieldTopic('userId', 'string', '用户 ID。'),
        fieldTopic('interviewType', 'string', '面试类型。'),
        fieldTopic('interviewerName', 'string', '面试官名称。'),
        fieldTopic('candidateName', 'string', '候选人名称。'),
        fieldTopic('company', 'string', '目标公司。'),
        fieldTopic('positionName', 'string', '岗位名称。'),
        fieldTopic('salaryRange', 'string', '薪资范围。'),
        fieldTopic('jd', 'string', '岗位描述。'),
        fieldTopic('resumeContent', 'string', '简历内容快照，后续生成问题和报告会继续使用。'),
        fieldTopic('conversationHistory[]', 'Array', '会话历史。', [
          fieldTopic('role', "'interviewer' | 'candidate'", '消息角色。'),
          fieldTopic('content', 'string', '消息内容。'),
          fieldTopic('timestamp', 'Date', '消息时间。'),
          fieldTopic('standardAnswer', 'string', '标准答案，仅面试官问题侧可能带上。'),
        ]),
        fieldTopic('questionCount', 'number', '当前已提问数量。'),
        fieldTopic('startTime', 'Date', '会话开始时间。'),
        fieldTopic('targetDuration', 'number', '目标时长，单位分钟。'),
        fieldTopic('isActive', 'boolean', '会话当前是否激活。'),
      ]),
      fieldTopic('reportStatus', "'pending' | 'generating' | 'completed' | 'failed'", '评估报告生成状态。'),
      fieldTopic('reportGeneratedAt', 'Date', '报告生成完成时间。'),
      fieldTopic('reportError', 'string', '报告生成失败原因。'),
      fieldTopic('isArchived', 'boolean', '是否归档。'),
      fieldTopic('archivedAt', 'Date', '归档时间。'),
      fieldTopic('isShared', 'boolean', '是否分享。'),
      fieldTopic('sharedAt', 'Date', '分享时间。'),
      fieldTopic('shareUrl', 'string', '分享链接。'),
      fieldTopic('consumptionRecordId', 'string', '关联的消费记录 recordId。'),
      fieldTopic('metadata', 'Record<string, any>', '额外元数据。', [
        fieldTopic('interviewerName', 'string', '面试官名称。'),
        fieldTopic('candidateName', 'string', '候选人名称。'),
        fieldTopic('sessionId', 'string', '会话 ID。'),
      ]),
      fieldTopic('aiModel', 'string', '使用的 AI 模型。'),
      fieldTopic('promptVersion', 'string', 'Prompt 版本。'),
      fieldTopic('createdAt', 'Date', '文档创建时间，来自 timestamps: true。'),
      fieldTopic('updatedAt', 'Date', '文档最后更新时间，来自 timestamps: true。'),
    ],
  },
];

const rootTopic = topic('wwzhidao-server MongoDB 5个集合字段说明', [
  topic('说明', [
    topic('本脑图按代码里的 5 个顶层 Mongoose schema / model 整理。'),
    topic('代码没有显式配置 collection 名时，MongoDB 实际集合名由 Mongoose 默认推导。'),
    topic('所有顶层文档默认包含 _id；使用 @Schema({ _id: false }) 的子文档不会单独生成 _id。'),
  ]),
  ...data.map((collection) =>
    topic(collection.name, [
      topic(`定位：${collection.source}`),
      topic(`用途：${collection.summary}`),
      topic(`备注：${collection.note}`),
      topic('字段', collection.fields),
    ]),
  ),
]);

const content = [
  {
    id: nextId('sheet'),
    class: 'sheet',
    title: 'MongoDB集合字段说明',
    rootTopic,
  },
];

const metadata = {
  creator: {
    name: 'Codex',
    version: '1.0',
  },
  activeSheetId: content[0].id,
};

const manifest = {
  'file-entries': {
    'content.json': {},
    'metadata.json': {},
  },
};

const outputDir = path.resolve(__dirname, '..', 'docs', 'mongodb-collections-xmind');
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, 'content.json'),
  JSON.stringify(content, null, 2),
  'utf8',
);
fs.writeFileSync(
  path.join(outputDir, 'metadata.json'),
  JSON.stringify(metadata, null, 2),
  'utf8',
);
fs.writeFileSync(
  path.join(outputDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
  'utf8',
);

console.log(`XMind package files written to ${outputDir}`);
