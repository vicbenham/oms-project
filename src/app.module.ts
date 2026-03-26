// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { EngineModule } from './engine/engine.module';
import { ExecutionsController } from './executions/executions.controller';
import { ExecutionsModule } from './executions/executions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    OrdersModule,
    WorkflowsModule,
    EngineModule,
    ExecutionsModule,
  ],
  controllers: [ExecutionsController],
})
export class AppModule {}