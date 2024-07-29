import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppExceptionsFilter } from './filters/http-exception.filter';
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.setGlobalPrefix('v1');
  const config = new DocumentBuilder()
    .setTitle('True Trade')
    .setDescription('True Trade API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  const httpAdapter = app.get(HttpAdapterHost, { strict: true });
  app.useGlobalFilters(new AppExceptionsFilter(httpAdapter));
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    enableDebugMessages: true,
    stopAtFirstError: true,
    forbidUnknownValues: false,
    exceptionFactory: (error: ValidationError[]) => {
      const _error = error[0].children[0]?.children[0] || error[0];
      return new BadRequestException(Object.values(_error?.constraints)[0]);
    }
  }));
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
