import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { InterviewModule } from './interview/interview.module';

/**
 * 注入的意思是！！！！
 * 1.注入 = 别自己 new，对象由框架帮你创建并塞给你用。 *
 */

@Module({
  imports: [
    ConfigModule.forRoot({
      /**
       * 不加isGlobal: true的话，imports: [ConfigModule]每个模块都要写一次，
       * 加了后全局可用，自动注入
       */
      isGlobal: true, //全局模块，可以在任何地方使用
    }),
    /**
     * 异步方式连接 MongoDB 数据库
     */
    MongooseModule.forRootAsync({
      imports: [ConfigModule], //把 ConfigModule“拉进”这个动态模块的作用域里，让它的服务（ConfigService）能被注入使用。
      /**
       * useFactory:这是一个工厂函数，专门用来生成数据库配置。
       * 意思是：
       * 1.先从 .env 读取 MONGODB_URI
       * 2.如果没有，就用默认本地数据库
       */
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://localhost:27017/wwzhidao',
      }),
      inject: [ConfigService], //告诉Nest:这个工厂函数需要 ConfigService，帮我注入
    }),
    UserModule,
    InterviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
