import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as firebase from 'firebase-admin';
import { FirebaseAdminService } from './firebase-admin.service';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import {
  UserInfo,
  UserMetadata,
  UserRecord,
} from 'firebase-admin/lib/auth/user-record';

jest.mock('firebase-admin', () => {
  const getUserByEmail = jest.fn();
  const verifyIdToken = jest.fn();
  const credential = { cert: jest.fn() }; // Mocking the credential method
  const auth = jest.fn(() => ({ getUserByEmail, verifyIdToken }));
  const initializeApp = jest.fn(() => ({
    auth,
  }));

  return {
    __esModule: true,
    initializeApp,
    auth,
    credential,
  };
});

describe('FirebaseAdminService', () => {
  let service: FirebaseAdminService;
  let configServiceMock: Partial<ConfigService>;

  beforeEach(async () => {
    configServiceMock = {
      getOrThrow: jest.fn().mockReturnValue('mock-value'), // Mock values for the Firebase config properties
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAdminService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<FirebaseAdminService>(FirebaseAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkIfEmailExists', () => {
    it('should return true if email exists', async () => {
      const userRecord: UserRecord = {
        uid: '',
        emailVerified: true,
        disabled: false,
        metadata: {} as UserMetadata,
        providerData: [] as UserInfo[],
        toJSON: () => ({}),
      };

      (firebase.auth().getUserByEmail as jest.Mock).mockResolvedValue(
        userRecord,
      );

      const result = await service.checkIfEmailExists('test@example.com');

      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      (firebase.auth().getUserByEmail as jest.Mock).mockResolvedValue(false);

      const result = await service.checkIfEmailExists('test@example.com');

      expect(result).toBe(false);
    });
  });

  describe('verifyToken', () => {
    it('should return decoded token if token is valid', async () => {
      const token: DecodedIdToken = {
        aud: '',
        auth_time: 1,
        exp: 2,
        firebase: {} as any,
        iat: 2,
        iss: '',
        sub: '',
        uid: '',
      };

      (firebase.auth().verifyIdToken as jest.Mock).mockResolvedValue(token);

      const result = await service.verifyToken('mock-token');

      expect(result).toBe(token);
    });

    it('should return false if token is invalid', async () => {
      (firebase.auth().verifyIdToken as jest.Mock).mockRejectedValue(
        new Error('Invalid token'),
      );

      const result = await service.verifyToken('invalid-token');

      expect(result).toBe(false);
    });
  });
});
