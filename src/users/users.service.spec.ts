import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { FirebaseClientService } from '../firebase/firebase-client.service';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role, User } from './schemas/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let firebaseClientServiceMock: jest.Mocked<FirebaseClientService>;
  let firebaseAdminServiceMock: jest.Mocked<FirebaseAdminService>;
  let userRepositoryMock: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    firebaseClientServiceMock = {
      createUser: jest.fn(),
    } as unknown as jest.Mocked<FirebaseClientService>;

    firebaseAdminServiceMock = {
      checkIfEmailExists: jest.fn(),
    } as unknown as jest.Mocked<FirebaseAdminService>;

    userRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
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

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      firebaseAdminServiceMock.checkIfEmailExists.mockResolvedValue(false);
      firebaseClientServiceMock.createUser.mockResolvedValue('token');

      const user = new User();
      user.email = dto.email;
      user.role = Role.ADMIN;

      userRepositoryMock.create.mockReturnValue(user);
      userRepositoryMock.save.mockResolvedValue(user);

      const result = await service.createUser(dto);

      expect(result).toEqual({
        data: { token: 'token' },
        message: 'user account created successfully',
      });
    });

    it('should throw BadRequestException if email already exists', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      firebaseAdminServiceMock.checkIfEmailExists.mockResolvedValue(true);

      await expect(service.createUser(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('uploadUserImage', () => {
    it('should upload user image successfully', async () => {
      const id = 1;
      const file = { buffer: Buffer.from('image data') } as Express.Multer.File;

      const user = new User();
      user.id = id;

      userRepositoryMock.findOne.mockResolvedValue(user);
      userRepositoryMock.save.mockResolvedValue(user);

      const result = await service.uploadUserImage(id, file);

      expect(result).toEqual({ message: 'user image uploaded successfully' });
      expect(user.image).toEqual(file.buffer);
      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(userRepositoryMock.save).toHaveBeenCalledWith(user);
    });

    it('should throw BadRequestException if user is not found', async () => {
      const id = 1;
      const file = { buffer: Buffer.from('image data') } as Express.Multer.File;

      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.uploadUserImage(id, file)).rejects.toThrow(
        BadRequestException,
      );

      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });
});
