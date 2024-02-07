import { BadRequestException, Injectable } from '@nestjs/common';
import { FirebaseClientService } from '../firebase/firebase-client.service';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private firebaseClientService: FirebaseClientService,
    private firebaseAdminService: FirebaseAdminService,
  ) {}

  async createUser(dto: CreateUserDto) {
    const { email, password } = dto;
    const check = await this.firebaseAdminService.checkIfEmailExists(email);
    if (check) {
      throw new BadRequestException('account with this email exists already');
    }

    const token = await this.firebaseClientService.createUser(email, password);

    return {
      data: {
        token,
      },
      message: 'user account created successfully',
    };
  }
}
