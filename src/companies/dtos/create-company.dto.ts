import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  users: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  products: number;
}
