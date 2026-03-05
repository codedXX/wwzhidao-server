// src/interview/services/interview.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionManager } from '../../ai/services/session.manager';
import { ResumeAnalysisService } from './resume-analysis.service';
import { ConversationContinuationService } from './conversation-continuation.service';
import { RESUME_ANALYSIS_SYSTEM_MESSAGE } from '../prompts/resume-analysis.prompts';
import { Subject } from 'rxjs';
import { ResumeQuizDto } from '../dto/resume-quiz.dto';
import { v4 as uuidv4 } from 'uuid';
import { ConsumptionStatus } from '../schemas/consumption-record.schema';
import { BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { Model, Types } from 'mongoose';
import {
  ConsumptionRecord,
  ConsumptionRecordDocument,
} from '../schemas/consumption-record.schema';
import {
  ResumeQuizResult,
  ResumeQuizResultDocument,
} from '../schemas/interview-quiz-result.schema';

/**
 * 进度事件
 */
export interface ProgressEvent {
  type: 'progress' | 'complete' | 'error' | 'timeout';
  step?: number;
  label?: string;
  progress: number; // 0-100
  message?: string;
  data?: any;
  error?: string;
  stage?: 'prepare' | 'generating' | 'saving' | 'done'; // 当前阶段
}

/**
 * 消费类型枚举
 */
export enum ConsumptionType {
  RESUME_QUIZ = 'resume_quiz', // 简历押题
  SPECIAL_INTERVIEW = 'special_interview', // 专项面试
  BEHAVIOR_INTERVIEW = 'behavior_interview', // 行测+HR面试
  AI_INTERVIEW = 'ai_interview', // AI模拟面试（如果使用次数计费）
}

/**
 * 面试服务
 *
 * 这个服务只关心业务逻辑和流程编排：
 * 1. 创建会话
 * 2. 调用具体的分析服务（简历分析、对话继续等）
 * 3. 管理会话历史
 *
 * 不关心具体的 AI 实现细节，那些交给专门的分析服务。
 */
@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);

  constructor(
    private configService: ConfigService,
    private sessionManager: SessionManager,
    private resumeAnalysisService: ResumeAnalysisService,
    private conversationContinuationService: ConversationContinuationService,
    @InjectModel(ConsumptionRecord.name)
    private consumptionRecordModel: Model<ConsumptionRecordDocument>,
    @InjectModel(ResumeQuizResult.name)
    private resumeQuizResultModel: Model<ResumeQuizResultDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  /**
   * 分析简历（首轮，创建会话）
   *
   * @param userId 用户 ID
   * @param position 职位名称
   * @param resumeContent 简历内容
   * @param jobDescription 岗位要求
   * @returns 分析结果和 sessionId
   */
  async analyzeResume(
    userId: string,
    position: string,
    resumeContent: string,
    jobDescription: string,
  ) {
    try {
      // 第一步：创建新会话
      const systemMessage = RESUME_ANALYSIS_SYSTEM_MESSAGE(position);
      const sessionId = this.sessionManager.createSession(
        userId,
        position,
        systemMessage,
      );

      this.logger.log(`创建会话: ${sessionId}`);

      // 第二步：调用专门的简历分析服务
      const result = await this.resumeAnalysisService.analyze(
        resumeContent,
        jobDescription,
      );

      // 第三步：保存用户输入到会话历史
      this.sessionManager.addMessage(
        sessionId,
        'user',
        `简历内容：${resumeContent}`,
      );

      // 第四步：保存 AI 的回答到会话历史
      this.sessionManager.addMessage(
        sessionId,
        'assistant',
        JSON.stringify(result),
      );

      this.logger.log(`简历分析完成，sessionId: ${sessionId}`);

      return {
        sessionId,
        analysis: result,
      };
    } catch (error) {
      this.logger.error(`分析简历失败: ${error}`);
      throw error;
    }
  }

  /**
   * 继续对话（多轮，基于现有会话）
   *
   * @param sessionId 会话 ID
   * @param userQuestion 用户问题
   * @returns AI 的回答
   */
  async continueConversation(
    sessionId: string,
    userQuestion: string,
  ): Promise<string> {
    try {
      // 第一步：添加用户问题到会话历史
      this.sessionManager.addMessage(sessionId, 'user', userQuestion);

      // 第二步：获取对话历史
      const history = this.sessionManager.getRecentMessages(sessionId, 10);

      this.logger.log(
        `继续对话，sessionId: ${sessionId}，历史消息数: ${history.length}`,
      );

      // 第三步：调用专门的对话继续服务
      const aiResponse =
        await this.conversationContinuationService.continue(history);

      // 第四步：保存 AI 的回答到会话历史
      this.sessionManager.addMessage(sessionId, 'assistant', aiResponse);

      this.logger.log(`对话继续完成，sessionId: ${sessionId}`);

      return aiResponse;
    } catch (error) {
      this.logger.error(`继续对话失败: ${error}`);
      throw error;
    }
  }

  /**
   * 生成简历押题（带流式进度）
   * @param userId 用户ID
   * @param dto 请求参数
   * @returns Subject 流式事件
   */
  generateResumeQuizWithProgress(
    userId: string,
    dto: ResumeQuizDto,
  ): Subject<ProgressEvent> {
    const subject = new Subject<ProgressEvent>();

    // 异步执行，通过 Subject 发送进度
    this.executeResumeQuiz(userId, dto, subject).catch((error) => {
      subject.error(error);
    });

    return subject;
  }

  /**
   * 执行简历押题（核心业务逻辑）
   */
  private async executeResumeQuiz(
    userId: string,
    dto: ResumeQuizDto,
    progressSubject?: Subject<ProgressEvent>,
  ): Promise<any> {
    let consumptionRecord: any = null;
    const recordId = uuidv4();
    const resultId = uuidv4();
    console.log('recordId', recordId);

    // 处理错误
    try {
      // ========== 步骤 0: 幂等性检查 ==========
      // ⚠️ 这是最关键的一步：防止重复生成
      if (dto.requestId) {
        // 在数据库中查询是否存在这个 requestId 的记录
        const existingRecord = await this.consumptionRecordModel.findOne({
          userId,
          'metadata.requestId': dto.requestId,
          status: {
            $in: [ConsumptionStatus.SUCCESS, ConsumptionStatus.PENDING],
          },
        });

        if (existingRecord) {
          // 找到了相同 requestId 的记录！

          if (existingRecord.status === ConsumptionStatus.SUCCESS) {
            // 之前已经成功生成过，直接返回已有的结果
            this.logger.log(
              `重复请求，返回已有结果: requestId=${dto.requestId}`,
            );

            // 查询之前生成的结果
            const existingResult = await this.resumeQuizResultModel.findOne({
              resultId: existingRecord.resultId,
            });

            if (!existingResult) {
              throw new BadRequestException('结果不存在');
            }

            // ✅ 直接返回，不再执行后续步骤，不再扣费
            return {
              resultId: existingResult.resultId,
              questions: existingResult.questions,
              summary: existingResult.summary,
              remainingCount: await this.getRemainingCount(userId, 'resume'),
              consumptionRecordId: existingRecord.recordId,
              // ⭐ 重要：标记这是从缓存返回的结果
              isFromCache: true,
            };
          }

          if (existingRecord.status === ConsumptionStatus.PENDING) {
            // 同一个请求还在处理中，告诉用户稍后查询
            throw new BadRequestException('请求正在处理中，请稍后查询结果');
          }
        }
      }

      // ========== 步骤 1: 检查并扣除次数（原子操作）==========
      // ⚠️ 注意：扣费后如果后续步骤失败，会在 catch 块中自动退款
      // TODO：后续实现
      this.logger.log(`✅ 用户扣费成功～～`);

      // ========== 步骤 2: 创建消费记录（pending）==========
      consumptionRecord = await this.consumptionRecordModel.create({
        recordId,
        user: new Types.ObjectId(userId),
        userId,
        type: ConsumptionType.RESUME_QUIZ,
        status: ConsumptionStatus.PENDING,
        consumedCount: 1,
        description: `简历押题 - ${dto?.company} ${dto.positionName}`,
        inputData: {
          company: dto?.company || '',
          positionName: dto.positionName,
          minSalary: dto.minSalary,
          maxSalary: dto.maxSalary,
          jd: dto.jd,
          resumeId: dto.resumeId,
        },
        resultId,
        metadata: {
          requestId: dto.requestId,
          promptVersion: dto.promptVersion,
        },
        startedAt: new Date(),
      });

      // 定义不同阶段的提示信息
      const progressMessages = [
        // 0-20%: 理解阶段
        { progress: 0.05, message: '🤖 AI 正在深度理解您的简历内容...' },
        { progress: 0.1, message: '📊 AI 正在分析您的技术栈和项目经验...' },
        { progress: 0.15, message: '🔍 AI 正在识别您的核心竞争力...' },
        { progress: 0.2, message: '📋 AI 正在对比岗位要求与您的背景...' },

        // 20-50%: 设计问题阶段
        { progress: 0.25, message: '💡 AI 正在设计针对性的技术问题...' },
        { progress: 0.3, message: '🎯 AI 正在挖掘您简历中的项目亮点...' },
        { progress: 0.35, message: '🧠 AI 正在构思场景化的面试问题...' },
        { progress: 0.4, message: '⚡ AI 正在设计不同难度的问题组合...' },
        { progress: 0.45, message: '🔬 AI 正在分析您的技术深度和广度...' },
        { progress: 0.5, message: '📝 AI 正在生成基于 STAR 法则的答案...' },

        // 50-70%: 优化阶段
        { progress: 0.55, message: '✨ AI 正在优化问题的表达方式...' },
        { progress: 0.6, message: '🎨 AI 正在为您准备回答要点和技巧...' },
        { progress: 0.65, message: '💎 AI 正在提炼您的项目成果和亮点...' },
        { progress: 0.7, message: '🔧 AI 正在调整问题难度分布...' },

        // 70-85%: 完善阶段
        { progress: 0.75, message: '📚 AI 正在补充技术关键词和考察点...' },
        { progress: 0.8, message: '🎓 AI 正在完善综合评估建议...' },
        { progress: 0.85, message: '🚀 AI 正在做最后的质量检查...' },
        { progress: 0.9, message: '✅ AI 即将完成问题生成...' },
      ];

      // 模拟一个定时器：每间隔一秒，响应一次数据
      let progress = 0;
      let currentMessage = progressMessages[0];
      const interval = setInterval(() => {
        progress += 1;
        currentMessage = progressMessages[progress];
        // 发送进度事件
        this.emitProgress(
          progressSubject,
          progress,
          currentMessage.message,
          'generating',
        );
        // 简单处理，到了 progressMessages 的 length 就结束了
        if (progress === progressMessages.length - 1) {
          clearInterval(interval);
          this.emitProgress(progressSubject, 100, 'AI 已完成问题生成', 'done');

          if (progressSubject && !progressSubject.closed) {
            progressSubject.complete(); // 完成 Subject
          }

          return {
            questions: [],
            analysis: [],
          };
        }
      }, 1000);
    } catch (error) {
      if (progressSubject && !progressSubject.closed) {
        progressSubject.next({
          type: 'error',
          progress: 0,
          label: '❌ 生成失败',
          error: error,
        });
        progressSubject.complete();
      }
      throw error;
    }
  }

  /**
   * 发送进度事件
   * @param subject 进度 Subject
   * @param progress 进度百分比 (0-100)
   * @param label 进度提示文本
   * @param stage 当前阶段
   */
  private emitProgress(
    subject: Subject<ProgressEvent> | undefined,
    progress: number,
    label: string,
    stage?: 'prepare' | 'generating' | 'saving' | 'done',
  ): void {
    if (subject && !subject.closed) {
      subject.next({
        type: 'progress',
        progress: Math.min(Math.max(progress, 0), 100), // 确保在 0-100 范围内
        label,
        message: label,
        stage,
      });
    }
  }

  /**
   * 获取剩余次数
   * resume： 简历押题
   * special：专项面试
   * behavior：HR + 行测面试
   */
  private async getRemainingCount(
    userId: string,
    type: 'resume' | 'special' | 'behavior',
  ): Promise<number> {
    const user = await this.userModel.findById(userId);
    if (!user) return 0;

    switch (type) {
      case 'resume':
        return user.resumeRemainingCount;
      case 'special':
        return user.specialRemainingCount;
      case 'behavior':
        return user.behaviorRemainingCount;
      default:
        return 0;
    }
  }
}
