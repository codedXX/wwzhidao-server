import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * 身份验证守卫
 *
 * 实现NestJS的CanActivate接口，用于控制对受保护路由的访问权限。
 * 该守卫在请求处理管道中执行，可以用于实现身份验证、授权等功能。
 *
 * 注意：当前实现是一个基础版本，始终允许所有请求通过。
 *      在实际应用中，应该扩展该类或修改其实现，添加具体的身份验证逻辑。
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
