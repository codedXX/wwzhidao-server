import * as Joi from 'joi';

/**
 * 配置验证模式
 * 用于验证应用程序的环境变量配置，确保所有必要的配置项都存在且格式正确
 * 在 NestJS 项目中与 ConfigModule 配合使用
 */
export const configValidationSchema = Joi.object({
  /**
   * 应用程序运行环境
   * - development: 开发环境，启用详细日志和错误信息
   * - production: 生产环境，优化性能，减少日志输出
   * - test: 测试环境，用于自动化测试
   */
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test') // 仅允许指定的三个环境值
    .default('development'), // 默认值为开发环境

  /**
   * 应用程序监听的端口号
   * 默认值为 3000
   */
  PORT: Joi.number().default(3000),

  /**
   * MongoDB 数据库连接字符串
   * 必须配置，否则应用程序无法连接数据库
   */
  MONGODB_URI: Joi.string().required(), // 必填项

  /**
   * JWT 令牌签名密钥
   * 用于用户认证和授权，必须至少 12 个字符
   */
  JWT_SECRET: Joi.string()
    .required() // 必填项
    .min(12), // 最小长度为 12 个字符

  /**
   * DeepSeek API 访问密钥
   * 用于调用 DeepSeek AI 服务，必须配置
   */
  DEEPSEEK_API_KEY: Joi.string().required(), // 必填项

  /**
   * DeepSeek 模型名称
   * 指定使用的 AI 模型，默认为 'deepseek-chat'
   */
  DEEPSEEK_MODEL: Joi.string().default('deepseek-chat'),

  /**
   * AI 模型生成文本的最大令牌数
   * 限制生成内容的长度，默认为 4000
   */
  MAX_TOKENS: Joi.number().default(4000),
});
