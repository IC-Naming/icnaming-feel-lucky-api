import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DomainName, Prisma } from '@prisma/client';
import { LoggerService } from '@nestjs/common';
import { QueryDomainNameByLengthDto } from './domainName.dto';
import { PrismaService as PrismaService2 } from './prisma2.service';

@Injectable()
export class DomainNameService {
  constructor(private prisma: PrismaService, private prisma2: PrismaService2) {}

  //Get DomainNames take(10)
  async getDomainNames(): Promise<DomainName[]> {
    return await this.prisma.domainName.findMany({
      take: 10,
    });
  }

  //Get DomainName by id
  async getDomainName(id: number): Promise<DomainName> {
    return await this.prisma.domainName.findUnique({
      where: {
        id,
      },
    });
  }

  //Get DomainNames by domain string length and not include domain list
  async getDomainNamesByLengthAndDomainList(
    length: number,
    domainList: string[],
  ): Promise<DomainName[]> {
    return await this.prisma.domainName.findMany({
      where: {
        domain: {
          notIn: domainList,
        },
        domainLength: length,
      },
    });
  }

  //Get DomainNames by domain length eq input length
  async getDomainNamesByLength(length: number): Promise<DomainName[]> {
    console.log(length);
    console.log(typeof length);
    return await this.prisma.domainName.findMany({
      where: {
        domainLength: Number(length),
      },
    });
  }

  //random get DomainNames take 5 by length
  async getRandomDomainNamesByLength(length: number): Promise<DomainName[]> {
    return await this.prisma.$queryRaw<
      DomainName[]
    >`SELECT * FROM DomainName WHERE domainLength = ${Number(
      length,
    )} ORDER BY random() LIMIT 5`;
  }

  //random get DomainNames take 5 by length
  async getRandomDomainNamesByLengthAndExcludeDomain(
    input: QueryDomainNameByLengthDto,
  ): Promise<DomainName[]> {
    console.log(input);
    const firstId = await this.prisma.domainName.findFirst({
      where: {
        domainLength: Number(input.length),
      },
      select: {
        id: true,
      },
    });
    const lastId = await this.prisma.domainName.findFirst({
      where: {
        domainLength: Number(input.length),
      },
      orderBy: {
        id: 'desc',
      },
      select: {
        id: true,
      },
    });
    let excludeDomainIds: number[] = [];
    if (input.excludeDomain != null && input.excludeDomain.length > 0) {
      excludeDomainIds = (
        await this.prisma.domainName.findMany({
          where: {
            domain: {
              in: input.excludeDomain,
            },
          },
          select: {
            id: true,
          },
        })
      ).map((item) => item.id);
    }

    //generate random id 5 array between firstId and lastId exclude excludeDomainIds
    const randomIds: number[] = [];
    for (let i = 0; i < 5; i++) {
      const randomId = Math.floor(
        Math.random() * (lastId.id - firstId.id + 1) + firstId.id,
      );
      if (excludeDomainIds.find((id) => id === randomId)) {
        i--;
      } else {
        randomIds.push(randomId);
      }
    }

    console.log(randomIds);
    return await this.prisma.domainName.findMany({
      where: {
        id: {
          in: randomIds,
        },
      },
    });
  }

  //Get DomainNames count by domainLength
  async getDomainNamesCountByLength(length: number): Promise<number> {
    return await this.prisma.domainName.count({
      where: {
        domainLength: Number(length),
      },
    });
  }

  async getDomainNamesPageByLength(
    length: number,
    page: number,
    pageSize: number,
  ): Promise<string[]> {
    const excludeDomainNames = (
      await this.prisma2.blackDomainName.findMany()
    ).map((item) => item.domain);
    const domainNames = await this.prisma.domainName.findMany({
      where: {
        OR: [
          {
            domainLength: Number(length),
          },
        ],
        NOT: {
          domain: {
            in: excludeDomainNames,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
      select: {
        domain: true,
      },
      skip: page * pageSize,
      take: pageSize,
    });
    return domainNames.map((item) => item.domain);
  }
}
