import {
  Controller,
  Post,
  UseGuards,
  Body,
  Request,
  Res,
} from '@nestjs/common';
import { InterviewAIService } from './services/interview-ai.service';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewAIService: InterviewAIService) {}
  @Post('/analyze-resume')
  async analyzeResume(
    @Body() body: { resume: string; jobDescription: string },
  ) {
    const result = await this.interviewAIService.analyzeResume(
      body.resume,
      body.jobDescription,
    );
    return {
      code: 200,
      data: result,
    };
  }
}
