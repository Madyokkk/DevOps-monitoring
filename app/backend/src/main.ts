import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.setGlobalPrefix(''); // API already has /api in routes

  const config = new DocumentBuilder()
    .setTitle('Гүлдерді онлайн тапсырыс беру API')
    .setDescription('Қазақстан - гүлдерді онлайн тапсырыс беру қызметі')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Backend іске қосылды: http://localhost:${process.env.PORT ?? 3001}`);
  console.log(`Swagger: http://localhost:${process.env.PORT ?? 3001}/api/docs`);
}
bootstrap();
