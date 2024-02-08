import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as firebase from 'firebase-admin';

@Injectable()
export class FirebaseAdminService {
  private app: firebase.app.App;
  private readonly logger = new Logger(FirebaseAdminService.name);
  constructor(config: ConfigService) {
    const credential = {
      type: config.getOrThrow('FIREBASE_ACCOUNT_TYPE'),
      projectId: config.getOrThrow('FIREBASE_PROJECT_ID'),
      privatekeyId: config.getOrThrow('FIREBASE_PRIVATE_KEY_ID'),
      privateKey: config.getOrThrow('FIREBASE_PRIVATE_KEY'),
      clientEmail: config.getOrThrow('FIREBASE_CLIENT_EMAIL'),
      clientId: config.getOrThrow('FIREBASE_CLIENT_ID'),
      authuri: config.getOrThrow('FIREBASE_AUTH_URI'),
      tokenUri: config.getOrThrow('FIREBASE_TOKEN_URI'),
      authProviderX509CertUrl: config.getOrThrow('FIREBASE_AUTH_CERT_URL'),
      clientc509certUrl: config.getOrThrow('FIREBASE_CLIENT_CERT_URL'),
    };

    this.app = firebase.initializeApp({
      credential: firebase.credential.cert(credential),
    });
  }

  async checkIfEmailExists(email: string) {
    try {
      const user = await this.app.auth().getUserByEmail(email);
      return !!user;
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }

  async verifyToken(token: string) {
    try {
      const check = await this.app.auth().verifyIdToken(token, true);
      return check;
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }
}
