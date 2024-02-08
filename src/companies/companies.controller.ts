import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { FirebaseAuthGuard } from '../auth/guard/firebase-auth.guard';
import RoleGuard from '../auth/guard/role.guard';
import { Role } from '../users/schemas/user.entity';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { GetUser } from '../auth/decorator/get-user';
import { StrategyUser } from '../auth/strategy/firebase-strategy.guard';
import { FetchCompaniesDto } from './dtos/fetch-companies.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}
  @Post()
  @UseGuards(RoleGuard(Role.USER))
  @UseGuards(FirebaseAuthGuard)
  createCompany(@Body() dto: CreateCompanyDto, @GetUser() user: StrategyUser) {
    return this.companiesService.createCompany(dto, user);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  fetchCompanies(
    @Query() dto: FetchCompaniesDto,
    @GetUser() user: StrategyUser,
  ) {
    return this.companiesService.fetchCompanies(dto, user);
  }
}
