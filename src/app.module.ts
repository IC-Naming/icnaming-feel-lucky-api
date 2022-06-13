import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DomainNameService } from './domainName.service';
import { PrismaService } from './prisma.service';
import { TasksService } from './task.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService as PrismaService2 } from './prisma2.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [
    AppService,
    DomainNameService,
    PrismaService,
    PrismaService2,
    TasksService,
    Logger,
  ],
})
export class AppModule {}
