import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * JwtStrategy构造函数
   * @param configService 配置服务，用于获取JWT密钥
   *
   * 配置JWT认证策略：
   * - jwtFromRequest: 指定从请求头的Authorization字段提取Bearer Token
   * - ignoreExpiration: 设置为false，表示验证Token的过期时间
   * - secretOrKey: 从配置中获取JWT_SECRET，如果不存在则使用默认密钥
   */
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'sunday-secret-key',
    });
  }

  /**
   * 验证JWT Token的payload并返回用户信息
   *
   * 此方法在Passport JWT认证成功后被调用，用于：
   * 1. 验证payload中是否包含必要的用户信息
   * 2. 构建并返回用户对象，该对象将被添加到请求对象中
   *
   * @param payload JWT Token解码后的负载对象
   * @returns 返回用户信息对象，包含userId、username和roles
   * @throws UnauthorizedException 如果payload中不包含userId，则抛出未授权异常
   */
  async validate(payload: any) {
    // 检查payload中是否包含userId，这是验证用户身份的必要字段
    if (!payload.userId) {
      throw new UnauthorizedException('Token 无效');
    }

    // 返回用户信息对象，该对象将被Passport添加到请求对象中
    // 可以在后续的请求处理中通过req.user访问
    return {
      userId: payload.userId,
      username: payload.username,
      roles: payload.roles || ['user'], // 如果没有指定角色，默认设置为普通用户
    };
  }
}
