import { Injectable, Logger } from '@nestjs/common';
import { DomainNameService } from './domainName.service';
import * as fs from 'fs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ShutdownService } from './shutdown.service';
import { TableClient } from '@azure/data-tables';


interface NameRecord {
  name: string
  owner: string
}

@Injectable()
export class TasksService {
  constructor(
    private readonly domainNameService: DomainNameService,
    private logger: Logger,
    private readonly shutdownService: ShutdownService,
  ) { }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleCronJob() {
    this.logger.debug('job start');
    this.logger.debug(process.env.NODE_ENV);
    await this.tryCreateFolder(process.env.JSON_FOLDER);
    const indexInfos: IndexInfo[] = [];

    const registeredName = await this.getRegisterredNames();
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
            registeredName,
          );
        await this.trySaveAsJsonFile(domainNames, `${i}`, `${j}`);
      }
    }
    await this.trySaveIndexInfosAsJsonFile(indexInfos, `index`);

    if (process.env.NODE_ENV == 'action') {
      this.logger.debug('shutdown service');
      this.shutdownService.shutdown();
    }
  }

  async getRegisterredNames() {
    const connectionString = process.env.REGISTERRED_NAME_CONNECTIONSTRING;
    const tableName = process.env.REGISTERRED_NAME_TABLENAME;
    const subffix = process.env.REGISTERRED_NAME_NAMESUBFFIX;
    const tableClient = TableClient.fromConnectionString(connectionString, tableName);
    let result = new Set<string>();
    for await (const item of tableClient.listEntities<NameRecord>()) {
      result.add(item.name.replace(subffix, ""))
    }
    this.logger.debug(`there is ${result.size} names registered`);
    return Array.from(result);
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
