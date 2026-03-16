/**
 * 数据库服务
 * 提供数据库相关的配置和连接管理功能
 * 通过 ConfigService 获取环境变量配置
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 数据库服务类
 * 负责管理数据库连接配置
 */
@Injectable()
export class DatabaseService {
  /**
   * 构造函数
   * @param configService 配置服务实例，由 NestJS 自动注入
   * 由于 ConfigModule 被设置为全局模块，ConfigService 可以直接注入使用
   */
  constructor(private configService: ConfigService) {}

  /**
   * 获取数据库连接字符串
   * @returns MongoDB 连接字符串
   * @throws ConfigKeyNotFoundException 如果 MONGODB_URI 配置不存在
   * 使用 getOrThrow 方法确保配置存在，因为数据库连接是必需的
   */
  getConnectionString(): string {
    return this.configService.getOrThrow<string>('MONGODB_URI');
  }

  /**
   * 获取服务端口号
   * @returns 服务端口号
   * 如果 PORT 配置不存在，返回默认值 3000
   * 使用 get 方法并提供默认值，因为端口号是可选配置
   */
  getPort(): number {
    return this.configService.get<number>('PORT', 3000);
  }
}
