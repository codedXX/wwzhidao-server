# `POST /interview/mock/start` 后续逻辑梳理

## 1. 入口与相关代码
- 控制器入口: `src/interview/interview.controller.ts:122`
- 服务入口: `src/interview/services/interview.service.ts:853`
- 核心执行: `src/interview/services/interview.service.ts:891`
- 简历提取: `src/interview/services/interview.service.ts:760`
- 次数回退: `src/interview/services/interview.service.ts:610`
- 全局参数校验: `src/main.ts:6`

## 2. 请求进入前的判断
1. `JwtAuthGuard` 生效，未登录直接拦截（`interview.controller.ts:123`）。
2. `StartMockInterviewDto` 做参数校验（`interview.controller.ts:125`）。
3. 全局 `ValidationPipe` 开启了 `whitelist + forbidNonWhitelisted`（`main.ts:6-14`）。
4. 这意味着:
- DTO 未声明字段会报错。
- `mock/start` 的 DTO 未声明 `resumeURL`，传了会被拦截。

## 3. 控制器层逻辑（SSE）
1. 设置 SSE 响应头并立即写入 `: connected` 保活（`interview.controller.ts:131-144`）。
2. 调用 `startMockInterviewWithStream(userId, dto)` 并订阅（`interview.controller.ts:147-172`）。
3. `next` 分支: 每条事件都 `res.write(data: ...)`，并尝试 `flush`（`interview.controller.ts:150-156`）。
4. `error` 分支: 输出 `{ type: 'error', error: error.message }` 后 `res.end()`（`interview.controller.ts:157-168`）。
5. `complete` 分支: `res.end()`（`interview.controller.ts:169-171`）。
6. 客户端断开连接时，取消订阅（`interview.controller.ts:175-176`）。

## 4. Service 主流程（`executeStartMockInterview`）
### 4.1 扣减面试次数
1. 根据 `interviewType` 选择计数字段:
- `special` -> `specialRemainingCount`
- `behavior` -> `behaviorRemainingCount`
2. 用 `findOneAndUpdate` 原子扣减，条件是对应次数 `> 0`（`interview.service.ts:899-914`）。
3. 如果没更新到用户（次数不足或用户不存在），抛 `BadRequestException`（`interview.service.ts:917-920`）。

### 4.2 简历内容提取判断
1. 调用 `extractResumeContent`（`interview.service.ts:929-932`）。
2. 提取逻辑（`interview.service.ts:765-845`）:
- 有 `resumeContent` -> 直接使用。
- 否则有 `resumeURL` -> 解析 URL 文档、清洗、校验、必要时截断。
- 两者都无 -> 抛 `BadRequestException`。

`mock/start` 的实际效果:
- 当前 `StartMockInterviewDto` 没有 `resumeURL` 字段。
- 且全局禁止未声明字段。
- 所以这个接口实际可行路径基本只剩“传 `resumeContent`”。
- 只传 `resumeId` 目前不会被使用到该提取逻辑中。

### 4.3 创建会话与持久化基础记录
1. 生成 `sessionId/resultId/recordId`（`interview.service.ts:936-979`）。
2. 组装内存会话 `InterviewSession` 并 `Map.set(sessionId, session)`（`interview.service.ts:955-974`）。
3. 先写 `AIInterviewResult`:
- `status: 'in_progress'`
- `qaList: []`
- `sessionState: session`
- `metadata` 包含 `sessionId` 等（`interview.service.ts:985-1009`）。
4. 再写消费记录 `ConsumptionRecord`，状态直接为 `SUCCESS`（`interview.service.ts:1012-1034`）。

### 4.4 开场白流式生成与事件发送
1. 调 `aiService.generateOpeningStatementStream(...)`（`interview.service.ts:1044-1048`）。
2. 每收到一段 chunk:
- 拼接到 `fullOpeningStatement`
- 发送 `START` 事件，`isStreaming: true`（`interview.service.ts:1051-1067`）。
3. 流结束后:
- 将完整开场白写入 `session.conversationHistory`（`interview.service.ts:1073-1077`）。
- 同步写入数据库 `qaList` 第一条（问题已写入，答案为空）（`interview.service.ts:1080-1096`）。
4. 再发送一次最终 `START` 事件，`isStreaming: false`（`interview.service.ts:1101-1112`）。
5. 紧接着发送 `WAITING` 事件，表示等待用户回答（`interview.service.ts:1115-1118`）。
6. `progressSubject.complete()` 结束本次 `mock/start` SSE（`interview.service.ts:1120`）。

## 5. 失败分支与回滚
1. `executeStartMockInterview` 内任意异常都会进入 `catch`（`interview.service.ts:1121-1129`）。
2. 在 `catch` 中执行 `refundCount` 回退次数（`interview.service.ts:1123-1127`，实现见 `610-638`）。
3. 异常继续上抛，外层 `startMockInterviewWithStream` 捕获后发 `ERROR` 事件并 `complete`（`interview.service.ts:860-868`）。
4. 控制器拿到错误事件后会写回 SSE 并关闭响应（`interview.controller.ts:157-168`）。

## 6. 条件判断一览表
| 判断点 | 条件 | 结果 |
| --- | --- | --- |
| 次数是否足够 | `specialRemainingCount/behaviorRemainingCount > 0` | 否则直接失败 |
| 简历文本来源 | `resumeContent` 是否存在 | 存在则直接用 |
| 简历 URL 来源 | `resumeURL` 是否存在 | 存在则走解析/清洗/校验 |
| 简历输入缺失 | 上述两者都无 | 抛 `BadRequestException` |
| 开场白流式状态 | 是否仍在 chunk 迭代中 | `START + isStreaming:true` |
| 开场白结束 | chunk 迭代完成 | `START + isStreaming:false` 后 `WAITING` |
| 流程异常 | 任意步骤抛错 | 回退次数 + 发送 `ERROR` |

## 7. 前端可观测到的典型事件顺序
1. 多次 `start`（逐字增长，`isStreaming: true`）
2. 1 次 `start`（完整开场白，`isStreaming: false`）
3. 1 次 `waiting`
4. SSE 连接结束（等待前端调用 `mock/answer`）

## 8. 当前实现的关键注意点
1. `mock/start` 基本要求必须带 `resumeContent`，否则很容易失败。
2. `resumeId` 在 `start` 路径里当前未直接参与提取逻辑。
3. 开场白阶段会发多条同类型 `start` 事件，前端应按 `isStreaming` 区分“打字中/完成态”。
4. 本接口结束时只是“进入等待回答”，并未生成下一道正式问题；后续问题在 `mock/answer` 里推进。
