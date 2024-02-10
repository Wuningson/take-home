import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { BadRequestException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let userServiceMock: jest.Mocked<UsersService>;

  beforeEach(async () => {
    userServiceMock = {
      createUser: jest.fn(),
      uploadUserImage: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const response = {
        data: {
          token: 'nice',
        },
        message: 'user account created successfully',
      };

      jest.spyOn(userServiceMock, 'createUser').mockResolvedValue(response);

      const result = await controller.createUser(dto);

      expect(userServiceMock.createUser).toBeCalled();
      expect(userServiceMock.createUser).toBeCalledWith(dto);

      expect(result).toEqual(response);
    });

    it('should throw BadRequestException if email already exists', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      jest
        .spyOn(userServiceMock, 'createUser')
        .mockRejectedValueOnce(
          new BadRequestException('account with this email exists already'),
        );

      await expect(controller.createUser(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userServiceMock.createUser).toBeCalledWith(dto);
    });

    it('should throw BadRequestException if createUser fails for any other reason', async () => {
      // Arrange
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      jest
        .spyOn(userServiceMock, 'createUser')
        .mockRejectedValueOnce(
          new BadRequestException('could not create user account at this time'),
        );

      // Act & Assert
      await expect(controller.createUser(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userServiceMock.createUser).toBeCalledWith(dto);
    });
  });

  describe('uploadUserImage', () => {
    it('should upload user image successfully', async () => {
      const id = 1;
      const file = { buffer: Buffer.from('image data') } as Express.Multer.File;
      const expectedResult = { message: 'user image uploaded successfully' };

      jest
        .spyOn(userServiceMock, 'uploadUserImage')
        .mockResolvedValueOnce(expectedResult);

      const result = await controller.uploadUserImage(file, id);

      expect(userServiceMock.uploadUserImage).toHaveBeenCalledWith(id, file);
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException if user is not found', async () => {
      const id = 1;
      const file = { buffer: Buffer.from('image data') } as Express.Multer.File;
      jest
        .spyOn(userServiceMock, 'uploadUserImage')
        .mockRejectedValueOnce(new BadRequestException('user not found'));

      await expect(controller.uploadUserImage(file, id)).rejects.toThrow(
        BadRequestException,
      );
      expect(userServiceMock.uploadUserImage).toHaveBeenCalledWith(id, file);
    });
  });
});
