import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DomainName } from '@prisma/client';
import { QueryDomainNameByLengthDto } from './domainName.dto';
import { PrismaService as PrismaService2 } from './prisma2.service';
import { BlackDomainName, Prisma as Prisma2 } from '@internal/prisma/client';

@Injectable()
export class DomainNameService {
  constructor(
    private prisma: PrismaService,
    private prisma2: PrismaService2,
    private logger: Logger,
  ) {}

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
    excludeSet: string[],
  ): Promise<string[]> {
    const domainNames = await this.prisma.domainName.findMany({
      where: {
        OR: [
          {
            domainLength: Number(length),
          },
        ],
        NOT: {
          domain: {
            in: excludeSet,
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

  async addBlackDomainName(domain: string): Promise<BlackDomainName> {
    return await this.prisma2.blackDomainName.create({
      data: {
        domain: domain,
        domainLength: domain.length,
      },
    });
  }

  async addBlackDomainNames(
    domains: string[],
  ): Promise<BlackDomainName[] | any> {
    const result = [];
    for (const i in domains) {
      try {
        const res = await this.prisma2.blackDomainName.create({
          data: {
            domain: domains[i],
            domainLength: domains[i].length,
          },
        });
        result.push(res);
      } catch (e) {
        if (e instanceof Prisma2.PrismaClientKnownRequestError) {
          // The .code property can be accessed in a type-safe manner
          if (e.code === 'P2002') {
            throw new HttpException(
              {
                status: HttpStatus.FORBIDDEN,
                error: `"${domains[i]}" already exists`,
              },
              HttpStatus.FORBIDDEN,
            );
          }
        }
        throw e;
      }
    }
    return result;
  }

  async removeBlackDomainNames(domains: string[]): Promise<BlackDomainName[]> {
    const result = [];
    for (const i in domains) {
      try {
        const res = await this.prisma2.blackDomainName.delete({
          where: {
            domain: domains[i],
          },
        });
        result.push(res);
      } catch (e) {
        if (e instanceof Prisma2.PrismaClientKnownRequestError) {
          // The .code property can be accessed in a type-safe manner
          throw new HttpException(
            {
              status: HttpStatus.FORBIDDEN,
              error: `Error deleting "${domains[i]}"`,
            },
            HttpStatus.FORBIDDEN,
          );
        }
        throw e;
      }
    }
    return result;
  }
}
