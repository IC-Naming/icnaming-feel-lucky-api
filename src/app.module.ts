import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DomainNameService } from './domainName.service';
import { PrismaService } from './prisma.service';
import { TasksService } from './task.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [
    AppService,
    DomainNameService,
    PrismaService,
    TasksService,
    Logger,
  ],
})
export class AppModule {}
