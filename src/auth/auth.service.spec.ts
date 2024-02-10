import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { FirebaseClientService } from '../firebase/firebase-client.service';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UserLoginDto } from './dtos/user-login.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role, User } from '../users/schemas/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { StrategyUser } from './strategy/firebase-strategy.guard';

describe('AuthService', () => {
  let service: AuthService;
  let firebaseClientServiceMock: jest.Mocked<FirebaseClientService>;
  let firebaseAdminServiceMock: jest.Mocked<FirebaseAdminService>;
  let userRepositoryMock: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    firebaseClientServiceMock = {
      login: jest.fn(),
    } as unknown as jest.Mocked<FirebaseClientService>;

    firebaseAdminServiceMock = {
      checkIfEmailExists: jest.fn(),
    } as unknown as jest.Mocked<FirebaseAdminService>;

    userRepositoryMock = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FirebaseClientService,
          useValue: firebaseClientServiceMock,
        },
        {
          provide: FirebaseAdminService,
          useValue: firebaseAdminServiceMock,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('userLogin', () => {
    it('should authenticate user successfully', async () => {
      const dto: UserLoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const user = new User();
      user.email = dto.email;

      userRepositoryMock.findOne.mockResolvedValue(user);
      firebaseAdminServiceMock.checkIfEmailExists.mockResolvedValue(true);
      firebaseClientServiceMock.login.mockResolvedValue('token');

      const result = await service.userLogin(dto);

      expect(result).toEqual({
        data: { token: 'token' },
        message: 'authentication successful',
      });
    });

    it('should throw BadRequestException if account with email does not exist', async () => {
      const dto: UserLoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      userRepositoryMock.findOne.mockResolvedValue(null);
      firebaseAdminServiceMock.checkIfEmailExists.mockResolvedValue(false);

      await expect(service.userLogin(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if login details are incorrect', async () => {
      const dto: UserLoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const user = new User();
      user.email = dto.email;

      userRepositoryMock.findOne.mockResolvedValue(user);
      firebaseAdminServiceMock.checkIfEmailExists.mockResolvedValue(true);
      firebaseClientServiceMock.login.mockResolvedValue(false);

      await expect(service.userLogin(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUser', () => {
    it('should fetch user successfully', async () => {
      const user: StrategyUser = {
        email: 'test@example.com',
        role: Role.USER,
      };

      const result = await service.getUser(user);

      expect(result).toEqual({
        data: user,
        message: 'user fetched successfully',
      });
    });
  });
});
