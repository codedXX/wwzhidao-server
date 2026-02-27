import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { WechatModule } from './wechat/wechat.module';
import { ControllerService } from './controller/controller.service';
import { StsModule } from './sts/sts.module';
import { PaymentModule } from './payment/payment.module';
import { PaymentService } from './payment/payment.service';
import { PaymentController } from './payment/payment.controller';
import { InterviewModule } from './interview/interview.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtStrategy } from './auth/jwt.strategy';
import { getTokenExpirationSeconds } from './common/utils/jwt.util';
import { WechatController } from './wechat/wechat.controller';
import { WechatService } from './wechat/wechat.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.development',
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/wwzhidao',
    ),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expirationSeconds = getTokenExpirationSeconds();
        return {
          secret: configService.get<string>('JWT_SECRET') || 'wwzhidao-secret',
          signOptions: {
            expiresIn: expirationSeconds,
          },
        };
      },
      inject: [ConfigService],
      global: true,
    }),
    UserModule,
    WechatModule,
    PaymentModule,
    StsModule,
    InterviewModule,
  ],
  controllers: [AppController, WechatController, PaymentController],
  providers: [
    AppService,
    JwtStrategy,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    WechatService,
    PaymentService,
    ControllerService,
  ],
})
export class AppModule {}
