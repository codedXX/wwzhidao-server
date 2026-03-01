import { Module } from '@nestjs/common';
import { InterviewController } from './interview.controller';
import { InterviewService } from './services/interview.service';
import { InterviewAIService } from './services/interview-ai.service';
import { DocumentParserService } from './services/document-parser.service';
import { UserModule } from 'src/user/user.module';
import { AIModule } from 'src/ai/ai.module';

@Module({
  imports: [UserModule, AIModule], //导入用户模块，可以使用UserService
  controllers: [InterviewController],
  providers: [InterviewService, InterviewAIService, DocumentParserService],
  exports: [InterviewService, InterviewAIService, DocumentParserService],
})
export class InterviewModule {}
