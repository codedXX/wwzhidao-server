/**
 * 全局异常过滤器
 *
 * 捕获应用程序中所有未处理的异常，统一格式化错误响应
 * 确保客户端始终收到一致的错误格式，便于前端处理
 */

// 导入NestJS异常过滤器相关模块
import {
  ExceptionFilter, // 异常过滤器接口
  Catch, // 装饰器，用于指定捕获的异常类型
  ArgumentsHost, // 执行上下文，包含当前请求和响应
  HttpException, // NestJS内置的HTTP异常类
  HttpStatus, // HTTP状态码枚举
  Logger, // 日志记录器
} from '@nestjs/common';
// 导入Express的请求和响应类型
import { Request, Response } from 'express';

/**
 * 所有异常过滤器
 *
 * 使用@Catch()装饰器标记为全局异常过滤器，捕获所有类型的异常
 * 实现ExceptionFilter接口，提供统一的异常处理逻辑
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // 创建日志记录器实例，用于记录异常信息
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * 异常处理方法
   *
   * @param exception 捕获到的异常对象
   * @param host 执行上下文，包含请求和响应信息
   */
  catch(exception: unknown, host: ArgumentsHost) {
    // 获取HTTP上下文，用于访问请求和响应对象
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>(); // 获取响应对象
    const request = ctx.getRequest<Request>(); // 获取请求对象

    // 初始化默认错误状态和消息
    let status = HttpStatus.INTERNAL_SERVER_ERROR; // 默认500错误
    let message = '服务器内部错误'; // 默认错误消息
    let error: any = null; // 可选的错误详情

    // 处理HttpException类型的异常（NestJS内置异常）
    if (exception instanceof HttpException) {
      // 获取异常的HTTP状态码
      status = exception.getStatus();
      // 获取异常的响应内容
      const exceptionResponse = exception.getResponse();
      console.log('exceptionResponse', exceptionResponse);

      // 根据响应内容的类型进行不同处理
      if (typeof exceptionResponse === 'string') {
        // 如果响应是字符串，直接作为错误消息
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        // 如果响应是对象，提取其中的message和error字段
        const responseObj = exceptionResponse as any;
        message = responseObj.message || '请求失败';
        error = responseObj.error || null;
      }
    }
    // 处理其他Error类型的异常
    else if (exception instanceof Error) {
      // 使用异常的message作为错误消息
      message = exception.message || '服务器内部错误';
      // 记录详细的异常信息和堆栈跟踪
      this.logger.error(
        `未处理的异常: ${exception.message}`,
        exception.stack,
        'AllExceptionsFilter',
      );
    }

    // 记录请求相关的错误日志
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
    );

    // 构建统一格式的错误响应
    const errorResponse = {
      code: status, // HTTP状态码
      message: Array.isArray(message) ? message[0] : message, // 错误消息（如果是数组取第一个）
      data: null, // 始终返回null数据
      timestamp: new Date().toISOString(), // 错误发生时间
      path: request.url, // 请求路径
      ...(error && { error }), // 如果有错误详情则添加
    };

    // 返回JSON格式的错误响应
    response.status(status).json(errorResponse);
  }
}
