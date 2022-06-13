import { Injectable, Logger } from '@nestjs/common';
import { DomainNameService } from './domainName.service';
import * as fs from 'fs';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  constructor(
    private readonly domainNameService: DomainNameService,
    private logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCronJob() {
    this.logger.debug(`path: ${process.env.JSON_FOLDER}`);
    await this.tryCreateFolder();
    for (let i = 1; i < 64; i++) {
      const groupIds =
        await this.domainNameService.getRandomDomainNamesGroupByLength(i, 10);
      await this.trySaveAsJsonFile(groupIds, `groupIds_${i}`);
    }
  }

  //try create folder process.env.DATABASE_HOST
  async tryCreateFolder() {
    const folder = process.env.JSON_FOLDER;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
  }

  //try save as json file in process.env.JSON_FOLDER, input number[][], fileName
  async trySaveAsJsonFile(number: number[][], fileName: string) {
    const folder = process.env.JSON_FOLDER;
    const filePath = `${folder}/${fileName}.json`;
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(number));
    }
  }
}
