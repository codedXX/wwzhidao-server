/**
 * JWT认证守卫
 *
 * 该守卫用于保护需要认证的路由，确保只有携带有效JWT Token的请求才能访问
 * 继承自NestJS Passport模块的AuthGuard，并指定使用'jwt'策略
 */

// 导入NestJS的Injectable装饰器，用于将类标记为可注入的服务
import { Injectable } from '@nestjs/common';
// 导入NestJS Passport模块的AuthGuard类，提供基础的认证功能
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard类
 *
 * 使用@Injectable()装饰器标记为可注入的服务
 * 继承自AuthGuard('jwt')，自动关联到JwtStrategy策略
 *
 * 功能：
 * 1. 自动从请求头中提取Bearer Token
 * 2. 使用JwtStrategy验证Token的有效性和完整性
 * 3. 将验证后的用户信息添加到请求对象中（req.user）
 * 4. 拒绝未携带有效Token的请求
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
