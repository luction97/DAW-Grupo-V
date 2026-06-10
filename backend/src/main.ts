import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  const globalPrefix = 'v1';

  app.setGlobalPrefix(globalPrefix);

  // Versionado integrado en el global prefix

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  if (process.env.SWAGGER_HABILITADO === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Plataforma de Gestión de Proyectos')
      .setDescription(
        'Documentación oficial de los servicios core para gestión de clientes, proyectos y tareas.',
      )
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
