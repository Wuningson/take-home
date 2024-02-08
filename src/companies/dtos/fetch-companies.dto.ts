import { IsNumber, IsOptional } from 'class-validator';

export class FetchCompaniesDto {
  @IsNumber()
  @IsOptional()
  user?: number;
}
