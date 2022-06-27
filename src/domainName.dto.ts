import { ApiProperty } from '@nestjs/swagger';

export class QueryDomainNameByLengthDto {
  @ApiProperty()
  length: number;

  @ApiProperty()
  excludeDomain: string[];
}

export class AddBlackDomainNameDto {
  @ApiProperty()
  domain: string;
}

export class AddBlackDomainNameListDto {
  @ApiProperty()
  domains: string[];
}

export class RemoveBlackDomainNameListDto {
  @ApiProperty()
  domains: string[];
}
