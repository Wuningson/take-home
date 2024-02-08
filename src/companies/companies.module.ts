import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './schemas/company.entity';
import { User } from '../users/schemas/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, User])],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
