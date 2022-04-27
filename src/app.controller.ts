import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { DomainNameService } from './domainName.service';
import { DomainName } from '@prisma/client';
import { QueryDomainNameByLengthDto } from './domainName.dto';

@Controller()
export class AppController {
  constructor(
    private readonly domainNameService: DomainNameService,
    private readonly appService: AppService,
  ) {}

  @Get('getDomainNames')
  async domainNameTake10(): Promise<DomainName[]> {
    return await this.domainNameService.getDomainNames();
  }

  @Post('domainName')
  async getDomainNamesByLengthAndDomainList(
    @Body() body: { length: number; domainList: string[] },
  ): Promise<DomainName[]> {
    return this.domainNameService.getDomainNamesByLengthAndDomainList(
      body.length,
      body.domainList,
    );
  }
  //getDomainNamesByLength
  @Get('getDomainNamesByLength?')
  async getDomainNamesByLength(
    @Query('length') length: number,
  ): Promise<DomainName[]> {
    return this.domainNameService.getDomainNamesByLength(length);
  }

  @Get('getDomainNameCountByLength?')
  async getDomainNamesCountByLength(
    @Query('length') length: number,
  ): Promise<number> {
    return this.domainNameService.getDomainNamesCountByLength(length);
  }
  @Get('getRandomDomainNamesByLength?')
  async getRandomDomainNamesByLength(
    @Query('length') length: number,
  ): Promise<DomainName[]> {
    return this.domainNameService.getRandomDomainNamesByLength(length);
  }

  @Post('getRandomDomainNamesByLengthV2')
  async getRandomDomainNamesByLengthV2(
    @Body() input: QueryDomainNameByLengthDto,
  ): Promise<DomainName[]> {
    return this.domainNameService.getRandomDomainNamesByLengthAndExcludeDomain(
      input,
    );
  }
}
