import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company } from './schemas/company.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { StrategyUser } from '../auth/strategy/firebase-strategy.guard';
import { Role, User } from '../users/schemas/user.entity';
import { FetchCompaniesDto } from './dtos/fetch-companies.dto';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let companyRepositoryMock: jest.Mocked<Repository<Company>>;
  let userRepositoryMock: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    companyRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Company>>;

    userRepositoryMock = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: getRepositoryToken(Company),
          useValue: companyRepositoryMock,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCompany', () => {
    const dto: CreateCompanyDto = {
      name: 'Test Company',
      products: 10,
      users: 5,
    };
    const user: StrategyUser = {
      email: 'test@example.com',
      role: Role.USER,
    };

    it('should create a new company successfully for a user', async () => {
      const userData = new User();
      userData.id = 1;
      userData.role = Role.USER;

      userRepositoryMock.findOne.mockResolvedValue(userData);

      const company = new Company();
      company.id = 1;
      company.name = dto.name;
      company.products = dto.products;
      company.users = dto.users;
      company.createdBy = userData;

      companyRepositoryMock.create.mockReturnValue(company);
      companyRepositoryMock.save.mockResolvedValue(company);

      const result = await service.createCompany(dto, user);

      expect(result).toEqual({
        data: company,
        message: 'company created successfully',
      });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.createCompany(dto, user)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException if user is not of role USER', async () => {
      const user: StrategyUser = {
        email: 'test@example.com',
        role: Role.ADMIN,
      };

      const userData = new User();
      userData.id = 1;
      userData.role = Role.ADMIN;

      userRepositoryMock.findOne.mockResolvedValue(userData);

      await expect(service.createCompany(dto, user)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('fetchCompanies', () => {
    it('should fetch companies for a USER role user successfully', async () => {
      const dto: FetchCompaniesDto = {};

      const user: StrategyUser = {
        email: 'test@example.com',
        role: Role.USER,
      };

      const userData = new User();
      userData.id = 1;

      userRepositoryMock.findOne.mockResolvedValue(userData);

      const companies = [new Company(), new Company()];

      companyRepositoryMock.find.mockResolvedValue(companies);

      const result = await service.fetchCompanies(dto, user);

      expect(result).toEqual({
        data: companies,
        message: 'companies fetched successfully',
      });
    });

    it('should fetch companies for an ADMIN role user successfully', async () => {
      const dto: FetchCompaniesDto = { user: 2 };

      const user: StrategyUser = {
        email: 'test@example.com',
        role: Role.ADMIN,
      };

      const userData = new User();
      userData.id = 1;

      userRepositoryMock.findOne.mockResolvedValue(userData);

      const companies = [new Company(), new Company()];

      companyRepositoryMock.find.mockResolvedValue(companies);

      const result = await service.fetchCompanies(dto, user);

      expect(result).toEqual({
        data: companies,
        message: 'companies fetched successfully',
      });
    });

    it('should throw UnauthorizedException if user is not found for USER role', async () => {
      const dto: FetchCompaniesDto = {};

      const user: StrategyUser = {
        email: 'test@example.com',
        role: Role.USER,
      };

      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.fetchCompanies(dto, user)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw BadRequestException if user is not found with dto user option', async () => {
      const dto: FetchCompaniesDto = { user: 1 };

      const user: StrategyUser = {
        email: 'test@example.com',
        role: Role.ADMIN,
      };

      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.fetchCompanies(dto, user)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
