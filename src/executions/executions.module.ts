import { Module } from '@nestjs/common';
import { ExecutionsController } from './executions.controller';
import { EngineModule } from '../engine/engine.module';

@Module({
  imports: [EngineModule],
  controllers: [ExecutionsController],
})
export class ExecutionsModule {}