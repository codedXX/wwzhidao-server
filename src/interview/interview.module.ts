import { Module } from '@nestjs/common';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule], //导入用户模块，可以使用UserService
  controllers: [InterviewController],
  providers: [InterviewService],
})
export class InterviewModule {}
