// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Charge les variables d'environnement depuis .env globalement
    // isGlobal: true → pas besoin de réimporter ConfigModule dans chaque module
    ConfigModule.forRoot({ isGlobal: true }),

    // EventEmitterModule permet d'émettre et d'écouter des événements métier
    // (user.registered, order.created, etc.) de façon découplée
    EventEmitterModule.forRoot(),
    PrismaModule,
  ],
})
export class AppModule {}