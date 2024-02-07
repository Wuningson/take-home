// Import the functions you need from the SDKs you need
import { Logger } from '@nestjs/common';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  Auth,
} from 'firebase/auth';

export class FirebaseClientService {
  private auth: Auth;
  private readonly logger = new Logger(FirebaseClientService.name);

  constructor() {
    const firebaseConfig = {
      apiKey: 'AIzaSyD4vwi-DiRBex1M0hYouREB07CA8PBReqs',
      authDomain: 'take-home-fd756.firebaseapp.com',
      projectId: 'take-home-fd756',
      storageBucket: 'take-home-fd756.appspot.com',
      messagingSenderId: '642626517482',
      appId: '1:642626517482:web:cf8cc4663f20cb97f1da93',
    };

    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
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