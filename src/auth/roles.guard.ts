import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * 角色装饰器
 *
 * 用于为路由处理程序设置所需的角色权限
 *
 * @param roles 允许访问路由的角色列表
 * @returns 返回一个装饰器函数，用于设置元数据
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * 角色守卫
 *
 * 实现NestJS的CanActivate接口，用于基于用户角色控制对路由的访问权限
 * 结合@Roles装饰器使用，验证请求用户是否具有访问路由所需的角色
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * 验证用户是否具有访问路由所需的角色
   *
   * 该方法在请求到达路由处理程序之前被调用，用于：
   * 1. 获取路由处理程序上通过@Roles装饰器设置的所需角色
   * 2. 从请求中获取当前用户信息
   * 3. 验证用户是否具有至少一个所需角色
   *
   * @param context 执行上下文，包含当前请求的所有信息
   * @returns 返回布尔值，表示用户是否具有访问权限
   */
  canActivate(context: ExecutionContext): boolean {
    // 获取路由处理程序上设置的所需角色
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // 如果没有设置所需角色，则允许所有请求访问
    if (!requiredRoles) {
      return true;
    }

    // 从HTTP请求中获取用户信息
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 如果没有用户信息，则拒绝访问
    if (!user) {
      return false;
    }

    // 检查用户是否具有至少一个所需角色
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
