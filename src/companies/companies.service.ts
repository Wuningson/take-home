import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './schemas/company.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { StrategyUser } from '../auth/strategy/firebase-strategy.guard';
import { Role, User } from '../users/schemas/user.entity';
import { FetchCompaniesDto } from './dtos/fetch-companies.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createCompany(dto: CreateCompanyDto, user: StrategyUser) {
    const { name, products, users } = dto;

    const userData = await this.userRepository.findOne({
      where: { email: user.email },
    });
    if (!userData) {
      throw new UnauthorizedException('user not found');
    }

    if (userData.role !== Role.USER) {
      throw new ForbiddenException('not a user');
    }

    const company = this.companyRepository.create({
      name,
      products,
      users,
      createdBy: userData,
    });

    await this.companyRepository.save(company);

    return {
      data: company,
      message: 'company created successfully',
    };
  }

  async fetchCompanies(dto: FetchCompaniesDto, user: StrategyUser) {
    let companies: Company[];

    if (user.role === Role.USER) {
      const userData = await this.userRepository.findOne({
        where: { email: user.email },
      });
      if (!userData) {
        throw new UnauthorizedException('user not found');
      }

      companies = await this.companyRepository.find({
        relations: {
          createdBy: true,
        },
        where: {
          createdBy: {
            id: userData.id,
          },
        },
      });
    } else {
      let userData: User | null = null;
      if (dto.user) {
        userData = await this.userRepository.findOne({
          where: { email: user.email },
        });
        if (!userData) {
          throw new BadRequestException('user not found');
        }
      }

      companies = await this.companyRepository.find({
        relations: {
          createdBy: true,
        },
        where: {
          createdBy: {
            id: userData.id,
          },
        },
      });
    }

    return {
      data: companies,
      message: 'companies fetched successfully',
    };
  }
}
