import { Injectable, Logger } from '@nestjs/common';
import { DomainNameService } from './domainName.service';
import * as fs from 'fs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ShutdownService } from './shutdown.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly domainNameService: DomainNameService,
    private logger: Logger,
    private readonly shutdownService: ShutdownService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCronJob() {
    this.logger.debug('job start');
    await this.tryCreateFolder(process.env.JSON_FOLDER);
    const indexInfos: IndexInfo[] = [];
    for (let i = 1; i < 64; i++) {
      const domainCount =
        await this.domainNameService.getDomainNamesCountByLength(i);
      const pageSize = 5000;
      const pageCount = Math.ceil(domainCount / pageSize);
      const indexInfo: IndexInfo = {
        domainLength: i,
        domainCount,
        pageSize,
        pageCount,
      };
      indexInfos.push(indexInfo);
      for (let j = 0; j <= pageCount; j++) {
        const domainNames =
          await this.domainNameService.getDomainNamesPageByLength(
            i,
            j,
            pageSize,
          );
        await this.trySaveAsJsonFile(domainNames, `${i}`, `${j}`);
      }
    }
    await this.trySaveIndexInfosAsJsonFile(indexInfos, `index`);

    this.logger.debug('shutdown service');
    this.shutdownService.shutdown();
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

  async trySaveIndexInfosAsJsonFile(content: IndexInfo[], fileName: string) {
    const folderRoot = process.env.JSON_FOLDER;
    const filePath = `${folderRoot}/${fileName}.json`;
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(content));
    }
  }
}

interface IndexInfo {
  domainLength: number;
  domainCount: number;
  pageSize: number;
  pageCount: number;
}
