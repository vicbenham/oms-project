import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Active la validation globale des DTOs via class-validator
  // whitelist: true → supprime les champs inconnus automatiquement
  // forbidNonWhitelisted: true → lève une erreur si un champ inconnu est envoyé
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // convertit automatiquement les types (string → number, etc.)
    }),
  );

  await app.listen(3000);
}
bootstrap();
