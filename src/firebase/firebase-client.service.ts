// Import the functions you need from the SDKs you need
import { Injectable, Logger, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  Auth,
} from 'firebase/auth';

@Injectable({ scope: Scope.DEFAULT })
export class FirebaseClientService {
  private auth: Auth;
  private readonly logger = new Logger(FirebaseClientService.name);
  private app: FirebaseApp;

  constructor(config: ConfigService) {
    const firebaseConfig = {
      apiKey: config.getOrThrow('FIREBASE_CLIENT_API_KEY'),
      authDomain: 'take-home-fd756.firebaseapp.com',
      projectId: 'take-home-fd756',
      storageBucket: 'take-home-fd756.appspot.com',
      messagingSenderId: config.getOrThrow('FIREBASE_CLIENT_MESSAGING_ID'),
      appId: config.getOrThrow('FIREBASE_CLIENT_APP_ID'),
    };

    this.app = initializeApp(firebaseConfig, 'client');
    this.auth = getAuth(this.app);
  }

  async login(email: string, password: string) {
    try {
      const signin = await signInWithEmailAndPassword(
        this.auth,
        email,
        password,
      );

      return await signin.user.getIdToken();
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }

  async createUser(email: string, password: string) {
    try {
      const signUp = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password,
      );

      return await signUp.user.getIdToken();
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }
}
