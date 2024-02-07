import { BadRequestException, Injectable } from '@nestjs/common';
import { FirebaseClientService } from '../firebase/firebase-client.service';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UserLoginDto } from './dtos/user-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private firebaseClientService: FirebaseClientService,
    private firebaseAdminService: FirebaseAdminService,
  ) {}

  async userLogin(dto: UserLoginDto) {
    const { email, password } = dto;
    const check = await this.firebaseAdminService.checkIfEmailExists(email);
    if (!check) {
      throw new BadRequestException('account with this email does not exist');
    }

    const token = await this.firebaseClientService.login(email, password);
    if (token === false) {
      throw new BadRequestException('incorrrect login details');
    }

    return {
      data: {
        token,
      },
      message: 'authentication successful',
    };
  }
}
