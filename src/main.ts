import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: 'http://localhost:5173' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuration du document Swagger
  const config = new DocumentBuilder()
    .setTitle('OMS Project (coucou Francesco)')
    .setDescription('Order Management System avec moteur de workflow')
    .setVersion('1.0')
    // Ajoute le support du Bearer token JWT dans l'UI Swagger
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Entre ton JWT ici',
      },
      'JWT', // nom de la sécurité, référencé dans les décorateurs @ApiBearerAuth('JWT')
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('Running');
  console.log('Swagger : http://localhost:3000/api');
}
bootstrap();