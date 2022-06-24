import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TasksService } from './task.service';
import { ShutdownService } from './shutdown.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService);
  const tasksService = app.get(TasksService);
  const shutdownService = app.get(ShutdownService);
  const config = new DocumentBuilder()
    .setTitle('DomainNames example')
    .setDescription('The DomainNames API description')
    .setVersion('1.0')
    .addTag('domain')
    .build();

  await prismaService.enableShutdownHooks(app);

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(3002);
  app.get(ShutdownService).subscribeToShutdown(() => app.close());

  await tasksService.handleCronJob();
}

bootstrap();
