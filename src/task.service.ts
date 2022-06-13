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

  @Cron(CronExpression.EVERY_HOUR)
  async handleCronJob() {
    this.logger.debug('job start');
    await this.tryCreateFolder(process.env.JSON_FOLDER);
    for (let i = 1; i < 64; i++) {
      const domainCount =
        await this.domainNameService.getDomainNamesCountByLength(i);
      const pageSize = 1000;
      const pageCount = Math.ceil(domainCount / pageSize);
      const indexInfo: IndexInfo = {
        domainCount,
        pageSize,
        pageCount,
      };
      await this.trySaveIndexInfoAsJsonFile(indexInfo, `${i}`, `index`);

      for (let j = 1; j <= pageCount; j++) {
        const domainNames =
          await this.domainNameService.getDomainNamesPageByLength(
            i,
            j,
            pageSize,
          );
        await this.trySaveAsJsonFile(domainNames, `${i}`, `${j}`);
      }
    }
  }

  //try create folder process.env.DATABASE_HOST
  async tryCreateFolder(pathFolder: string) {
    if (!fs.existsSync(pathFolder)) {
      fs.mkdirSync(pathFolder);
    }
  }

  //try save as json file in process.env.JSON_FOLDER, input number[][], fileName
  async trySaveAsJsonFile(
    content: string[],
    folderName: string,
    fileName: string,
  ) {
    const folderRoot = process.env.JSON_FOLDER;
    const filePath = `${folderRoot}/${folderName}/${fileName}.json`;
    this.tryCreateFolder(`${folderRoot}/${folderName}`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(content));
    }
  }

  async trySaveIndexInfoAsJsonFile(
    content: IndexInfo,
    folderName: string,
    fileName: string,
  ) {
    const folderRoot = process.env.JSON_FOLDER;
    const filePath = `${folderRoot}/${folderName}/${fileName}.json`;
    this.tryCreateFolder(`${folderRoot}/${folderName}`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(content));
    }
  }
}

interface IndexInfo {
  domainCount: number;
  pageSize: number;
  pageCount: number;
}
