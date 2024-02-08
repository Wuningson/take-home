import { BadRequestException, Injectable } from '@nestjs/common';
import { FirebaseClientService } from '../firebase/firebase-client.service';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UserLoginDto } from './dtos/user-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/schemas/user.entity';
import { Repository } from 'typeorm';
import { StrategyUser } from './strategy/firebase-strategy.guard';

@Injectable()
export class AuthService {
  constructor(
    private firebaseClientService: FirebaseClientService,
    private firebaseAdminService: FirebaseAdminService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async userLogin(dto: UserLoginDto) {
    const { email, password } = dto;
    const dbCheck = await this.userRepository.findOne({ where: { email } });
    if (!dbCheck) {
      throw new BadRequestException('account with this email does not exist');
    }

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

  async getUser(user: StrategyUser) {
    return {
      data: user,
      message: 'user fetched successfully',
    };
  }
}
