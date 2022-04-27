import { ApiProperty } from '@nestjs/swagger';

export class QueryDomainNameByLengthDto {
  @ApiProperty()
  length: number;

  @ApiProperty()
  excludeDomain: string[];
}
