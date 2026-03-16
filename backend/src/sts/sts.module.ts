import { Module } from '@nestjs/common';
import { StsService } from './sts.service';

@Module({
  providers: [StsService]
})
export class StsModule {}
