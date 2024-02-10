import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import { FirebaseClientService } from './firebase-client.service';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
}));

describe('FirebaseClientService', () => {
  let service: FirebaseClientService;
  let configServiceMock: Partial<ConfigService>;

  beforeEach(async () => {
    configServiceMock = {
      getOrThrow: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseClientService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<FirebaseClientService>(FirebaseClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return token if login is successful', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: { getIdToken: jest.fn().mockResolvedValue('token') },
      });

      const result = await service.login('test@example.com', 'password');

      expect(result).toBe('token');
      expect(signInWithEmailAndPassword).toBeCalled();
    });

    it('should return false if login fails', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
        new Error('Login failed'),
      );

      const result = await service.login('test@example.com', 'password');

      expect(result).toBe(false);
      expect(signInWithEmailAndPassword).toBeCalled();
    });
  });

  describe('createUser', () => {
    it('should return token if user creation is successful', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
        user: { getIdToken: jest.fn().mockResolvedValue('token') },
      });
      const result = await service.createUser('test@example.com', 'password');
      expect(result).toBe('token');
      expect(createUserWithEmailAndPassword).toBeCalled();
    });

    it('should return false if user creation fails', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(
        new Error('User creation failed'),
      );
      const result = await service.createUser('test@example.com', 'password');
      expect(result).toBe(false);
      expect(createUserWithEmailAndPassword).toBeCalled();
    });
  });
});
