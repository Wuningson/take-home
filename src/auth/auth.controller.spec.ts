import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dtos/user-login.dto';
import { StrategyUser } from './strategy/firebase-strategy.guard';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Role } from '../users/schemas/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: jest.Mocked<AuthService>;

  beforeEach(async () => {
    authServiceMock = {
      userLogin: jest.fn(),
      getUser: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const dto: UserLoginDto = {
      email: 'test@example.com',
      password: 'password',
    };

    it('should login user successfully', async () => {
      const token = 'token';

      const expectedResult = {
        data: {
          token,
        },
        message: 'authentication successful',
      };

      jest
        .spyOn(authServiceMock, 'userLogin')
        .mockResolvedValueOnce(expectedResult);

      const result = await controller.login(dto);

      expect(authServiceMock.userLogin).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException if login credentials are incorrect', async () => {
      jest
        .spyOn(authServiceMock, 'userLogin')
        .mockRejectedValueOnce(
          new BadRequestException('incorrect login details'),
        );

      await expect(controller.login(dto)).rejects.toThrow(BadRequestException);
      expect(authServiceMock.userLogin).toHaveBeenCalledWith(dto);
    });
  });

  describe('getUser', () => {
    const user: StrategyUser = { email: 'test@example.com', role: Role.USER };
    it('should get user successfully', async () => {
      const expectedResult = {
        data: user,
        message: 'user fetched successfully',
      };

      jest
        .spyOn(authServiceMock, 'getUser')
        .mockResolvedValueOnce(expectedResult);

      const result = await controller.getUser(user);

      expect(authServiceMock.getUser).toHaveBeenCalledWith(user);
      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      jest
        .spyOn(authServiceMock, 'getUser')
        .mockRejectedValueOnce(new UnauthorizedException('unauthenticated'));

      await expect(controller.getUser(user)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authServiceMock.getUser).toHaveBeenCalledWith(user);
    });
  });
});
