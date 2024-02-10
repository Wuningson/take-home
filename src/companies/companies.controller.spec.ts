import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { FetchCompaniesDto } from './dtos/fetch-companies.dto';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { StrategyUser } from '../auth/strategy/firebase-strategy.guard';
import { Company } from './schemas/company.entity';
import { Role } from '../users/schemas/user.entity';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let companiesServiceMock: jest.Mocked<CompaniesService>;

  beforeEach(async () => {
    companiesServiceMock = {
      createCompany: jest.fn(),
      fetchCompanies: jest.fn(),
    } as unknown as jest.Mocked<CompaniesService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: companiesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCompany', () => {
    const dto: CreateCompanyDto = {
      name: 'Company ABC',
      products: 10,
      users: 100,
    };
    const user: StrategyUser = { email: 'test@example.com', role: Role.USER };

    it('should create a new company', async () => {
      const expectedResult = {
        data: new Company(),
        message: 'company created successfully',
      };

      jest
        .spyOn(companiesServiceMock, 'createCompany')
        .mockResolvedValue(expectedResult);

      const result = await controller.createCompany(dto, user);

      expect(companiesServiceMock.createCompany).toHaveBeenCalledWith(
        dto,
        user,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      jest
        .spyOn(companiesServiceMock, 'createCompany')
        .mockRejectedValueOnce(new UnauthorizedException('user not found'));

      await expect(controller.createCompany(dto, user)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(companiesServiceMock.createCompany).toHaveBeenCalledWith(
        dto,
        user,
      );
    });

    it('should throw ForbiddenException if user is not authenticated', async () => {
      jest
        .spyOn(companiesServiceMock, 'createCompany')
        .mockRejectedValueOnce(new ForbiddenException('not a user'));

      await expect(
        controller.createCompany(dto, { ...user, role: Role.ADMIN }),
      ).rejects.toThrow(ForbiddenException);
      expect(companiesServiceMock.createCompany).toHaveBeenCalledWith(dto, {
        ...user,
        role: Role.ADMIN,
      });
    });
  });

  describe('fetchCompanies', () => {
    it('should fetch companies successfully', async () => {
      const dto: FetchCompaniesDto = { user: 1 };
      const user = { email: 'test@example.com' } as StrategyUser;

      const expectedResult = {
        data: [new Company(), new Company()],
        message: 'companies fetched successfully',
      };

      jest
        .spyOn(companiesServiceMock, 'fetchCompanies')
        .mockResolvedValue(expectedResult);

      const result = await controller.fetchCompanies(dto, user);

      expect(companiesServiceMock.fetchCompanies).toHaveBeenCalledWith(
        dto,
        user,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const dto: FetchCompaniesDto = { user: 1 };
      const user: StrategyUser = { email: 'next', role: Role.USER };

      jest
        .spyOn(companiesServiceMock, 'fetchCompanies')
        .mockRejectedValueOnce(new UnauthorizedException('user not found'));

      await expect(controller.fetchCompanies(dto, user)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(companiesServiceMock.fetchCompanies).toHaveBeenCalledWith(
        dto,
        user,
      );
    });
  });
});
